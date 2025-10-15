import { S2Vec2 } from '../../src/core/math/s2-vec2.ts';
import { S2Camera } from '../../src/core/math/s2-camera.ts';
import { MTL } from '../../src/utils/mtl-colors.ts';
import { S2Circle } from '../../src/core/element/s2-circle.ts';
import { S2Scene } from '../../src/core/scene/s2-scene.ts';
import { S2LerpAnim, S2LerpAnimFactory } from '../../src/core/animation/s2-lerp-anim.ts';
import { ease } from '../../src/core/animation/s2-easing.ts';
import { S2MathUtils } from '../../src/core/math/s2-math-utils.ts';
import { S2DataSetter } from '../../src/core/element/base/s2-data-setter.ts';
import { S2DraggableCircle } from '../../src/core/element/draggable/s2-draggable-circle.ts';
import type { S2BaseDraggable } from '../../src/core/element/draggable/s2-draggable.ts';
import { S2Playable } from '../../src/core/animation/s2-playable.ts';
import { S2DraggableContainerBox } from '../../src/core/element/draggable/s2-draggable-container-box.ts';
import { S2Line } from '../../src/core/element/s2-line.ts';
import { S2Mat2 } from '../../src/core/math/s2-mat2.ts';

declare global {
    interface Window {
        katex: {
            renderToString: (formula: string, options?: any) => string;
            render: (formula: string, element: HTMLElement, options?: any) => void;
        };
    }
}

const viewportScale = 1.5;
const viewport = new S2Vec2(640.0, 360.0).scale(viewportScale);
const camera = new S2Camera(new S2Vec2(0.0, 0.0), new S2Vec2(8.0, 4.5), viewport);

class SceneFigure extends S2Scene {
    protected vecU: S2Line;
    protected vecV: S2Line;
    protected matrix: S2Mat2;
    protected lerpAnimU: S2LerpAnim;
    protected lerpAnimV: S2LerpAnim;
    protected colorAnim: S2LerpAnim;
    protected playableU: S2Playable;
    protected playableV: S2Playable;
    protected playableColor: S2Playable;

    protected htmlEq: HTMLSpanElement;
    protected htmlEqMatrix: HTMLSpanElement;
    protected htmlFinalText: HTMLSpanElement;

    protected circleEigen1: S2Circle;
    protected circleEigen2: S2Circle;
    protected precision: number = 0.1;
    protected draggable: S2DraggableCircle;

    setCircleDefaultStyle(circle: S2Circle): void {
        S2DataSetter.setTargets(circle.data)
            .setFillColor(MTL.GREY_6)
            .setStrokeColor(MTL.GREY_4)
            .setStrokeWidth(4, 'view')
            .setFillOpacity(1.0)
            .setRadius(5, 'view');
    }

    constructor(
        svgElement: SVGSVGElement,
        htmlEq: HTMLSpanElement,
        htmlEqMatrix: HTMLSpanElement,
        finalText: HTMLSpanElement,
    ) {
        super(svgElement, camera);
        this.htmlEq = htmlEq;
        this.htmlEqMatrix = htmlEqMatrix;
        this.htmlFinalText = finalText;

        const fillRect = this.addFillRect();
        S2DataSetter.setTargets(fillRect.data).setColor(MTL.GREY_9);

        const gridHalf = this.addWorldGrid();
        gridHalf.data.geometry.space.set('world');
        gridHalf.data.geometry.steps.set(0.5, 0.5, 'world');
        gridHalf.data.stroke.color.copy(MTL.GREY_6);
        gridHalf.data.stroke.width.set(1, 'view');
        gridHalf.data.opacity.set(0.3);

        const grid = this.addWorldGrid();
        S2DataSetter.setTargets(grid.data).setStrokeColor(MTL.GREY_6);

        this.matrix = new S2Mat2(1, 0, 0, 1);

        this.vecU = this.addLine();
        this.vecU.data.startPosition.set(0, 0, 'world');
        this.vecU.data.endPosition.set(0, 0, 'world');
        this.vecU.data.stroke.color.copy(MTL.LIGHT_BLUE_5);
        this.vecU.data.stroke.width.set(4, 'view');
        this.vecU.data.endPadding.set(10, 'view');
        this.vecU.data.layer.set(1);

        this.vecV = this.addLine();
        this.vecV.data.startPosition.set(0, 0, 'world');
        this.vecV.data.endPosition.set(0, 0, 'world');
        this.vecV.data.stroke.color.copy(MTL.RED_5);
        this.vecV.data.stroke.width.set(6, 'view');
        this.vecV.data.endPadding.set(10, 'view');
        this.vecV.data.layer.set(2);

        this.circleEigen1 = this.addCircle();
        this.circleEigen2 = this.addCircle();
        this.setCircleDefaultStyle(this.circleEigen1);
        this.setCircleDefaultStyle(this.circleEigen2);

        const tipU = this.vecU.createArrowTip();
        tipU.setAnchorAlignment(-1);
        tipU.data.layer.set(1);
        const tipV = this.vecV.createArrowTip();
        tipV.setAnchorAlignment(-1);
        tipV.data.layer.set(2);

        const lineX = this.addLine();
        lineX.data.startPosition.set(-8, 0, 'world');
        lineX.data.endPosition.set(7.5, 0, 'world');
        lineX.data.stroke.color.copy(MTL.GREY_5);
        lineX.data.stroke.width.set(4, 'view');
        lineX.createArrowTip();

        const lineY = this.addLine();
        lineY.data.startPosition.set(0, -5, 'world');
        lineY.data.endPosition.set(0, 4, 'world');
        lineY.data.stroke.color.copy(MTL.GREY_5);
        lineY.data.stroke.width.set(4, 'view');
        lineY.createArrowTip();

        this.draggable = new S2DraggableCircle(this);
        this.draggable.setParent(this.getSVG());
        this.draggable.data.position.copy(this.vecU.data.endPosition);
        this.draggable.data.radius.set(30, 'view');

        const container = new S2DraggableContainerBox(this);
        container.data.space.set('view');
        container.data.boundA.set(-7, -4, 'world');
        container.data.boundB.set(+7, +4, 'world');
        this.draggable.setContainer(container);

        this.lerpAnimU = S2LerpAnimFactory.create(this, this.vecU.data.endPosition);
        this.lerpAnimV = S2LerpAnimFactory.create(this, this.vecV.data.endPosition);
        this.colorAnim = S2LerpAnimFactory.create(this, this.vecV.data.stroke.color);
        for (const anim of [this.lerpAnimU, this.lerpAnimV, this.colorAnim]) {
            anim.setCycleDuration(300).setEasing(ease.outExpo).commitFinalState();
        }
        this.playableU = new S2Playable(this.lerpAnimU);
        this.playableV = new S2Playable(this.lerpAnimV);
        this.playableColor = new S2Playable(this.colorAnim);

        this.draggable.setOnDrag((draggable: S2BaseDraggable, event: PointerEvent) => {
            void event;
            this.precision = 0.0;
            this.setPosition(draggable.getPosition('world'));
        });

        this.draggable.setOnRelease((draggable: S2BaseDraggable, event: PointerEvent) => {
            void event;
            this.precision = 0.5;
            const u = this.setPosition(draggable.getPosition('world'));
            draggable.data.position.setV(u, 'world');
        });

        this.setMatrix(0);

        this.update();
    }

    setMatrix(id: number): void {
        switch (id) {
            case 0:
                this.matrix = new S2Mat2(0.5, 3, 0.75, 0.5);
                this.circleEigen1.data.position.set(2, 1, 'world');
                this.circleEigen2.data.position.set(-2, 1, 'world');
                break;
            case 1:
                this.matrix = new S2Mat2(2, 1, 1, 2);
                this.circleEigen1.data.position.set(1, 1, 'world');
                this.circleEigen2.data.position.set(1, -1, 'world');
                break;
            case 2:
                this.matrix = new S2Mat2(2, -0.5, 1, 0.5);
                this.circleEigen1.data.position.set(1, 1, 'world');
                this.circleEigen2.data.position.set(1, 2, 'world');
                break;
            case 3:
                this.matrix = new S2Mat2(1, 0, 2, -2);
                this.circleEigen1.data.position.set(3, 2, 'world');
                this.circleEigen2.data.position.set(0, 1, 'world');
                break;
            default:
                this.matrix = new S2Mat2(1, -1, -1, 1);
                this.circleEigen1.data.position.set(1, 1, 'world');
                this.circleEigen2.data.position.set(1, 1, 'world');
        }
        this.setPosition(new S2Vec2(1, 0));
        this.draggable.data.position.set(1, 0, 'world');
    }

    setPosition(position: S2Vec2): S2Vec2 {
        const u = new S2Vec2(
            S2MathUtils.snap(position.x, this.precision),
            S2MathUtils.snap(position.y, this.precision),
        );
        this.lerpAnimU.commitInitialState();
        this.vecU.data.endPosition.setV(u, 'world');
        this.lerpAnimU.commitFinalState();
        this.playableU.play();

        const v = u.clone().apply2x2(this.matrix);
        this.lerpAnimV.commitInitialState();
        this.vecV.data.endPosition.setV(v, 'world');
        this.lerpAnimV.commitFinalState();
        this.playableV.play();

        this.colorAnim.commitInitialState();
        const isEigenvector = Math.abs(u.det(v)) < 1e-1 && S2Vec2.isZeroV(u) === false;
        const eigenValue = u.length() < 1e-6 ? 0 : v.length() / u.length();
        if (isEigenvector) {
            this.vecV.data.stroke.color.copy(MTL.LIGHT_GREEN_5);
        } else {
            this.vecV.data.stroke.color.copy(MTL.RED_5);
        }
        this.colorAnim.commitFinalState();
        this.playableColor.play();

        this.htmlEq.innerHTML = window.katex.renderToString(
            `\\begin{aligned}
            u &= (${u.x.toFixed(1)}, ${u.y.toFixed(1)}) \\\\
            Mu &= (${v.x.toFixed(1)}, ${v.y.toFixed(1)})
        \\end{aligned}`,
            {
                throwOnError: false,
            },
        );
        this.htmlEqMatrix.innerHTML = window.katex.renderToString(
            `M = \\begin{pmatrix}
            ${this.matrix.elements[0]} & ${this.matrix.elements[2]} \\\\
            ${this.matrix.elements[1]} & ${this.matrix.elements[3]}
        \\end{pmatrix}`,
            {
                throwOnError: false,
            },
        );

        this.htmlFinalText.innerHTML = isEigenvector
            ? `Le vecteur est un vecteur propre de valeur propre ${eigenValue.toFixed(1)}.`
            : "Le vecteur n'est pas un vecteur propre.";
        return u;
    }

    setPrecision(precision: number): void {
        this.precision = precision;
    }
}

const appDiv = document.querySelector<HTMLDivElement>('#app');
if (appDiv) {
    appDiv.innerHTML = `
        <div>
            <h1>Vecteurs propres</h1>
            <p>Vous pouvez déplacer le vecteur $u$ (en bleu) avec la souris. Le vecteur $v = Mu$ est calculé en fonction de la matrice $M$.<br>
            Lorsque les deux vecteurs sont colinéaires, le vecteur $u$ est un vecteur propre de la matrice $M$.</p>
            </p>
            <p>
                <span id="eq-u" style="display:inline-flex;min-width:25ch;align-items: baseline"></span>
                <span id="eq-matrix"></span>
            </p>
            <p><span id="final-text"></span></p>
            <svg xmlns="http://www.w3.org/2000/svg" id=test-svg class="responsive-svg" preserveAspectRatio="xMidYMid meet"></svg>
            <p></p>
        </div>`;
}

const eqU = document.querySelector<HTMLSpanElement>('#eq-u');
const eqMatrix = document.querySelector<HTMLSpanElement>('#eq-matrix');
const finalText = document.querySelector<HTMLSpanElement>('#final-text');

const svgElement = appDiv?.querySelector<SVGSVGElement>('#test-svg');

if (svgElement && eqU && eqMatrix && finalText) {
    const scene = new SceneFigure(svgElement, eqU, eqMatrix, finalText);
    void scene;

    // let index = -1;
    // scene.animator.reset();

    // document.querySelector<HTMLButtonElement>('#reset-button')?.addEventListener('click', () => {
    //     index = -1;
    //     scene.animator.stop();
    //     scene.animator.reset();
    //     slider.value = '0';
    // });
    // document.querySelector<HTMLButtonElement>('#prev-button')?.addEventListener('click', () => {
    //     index = S2MathUtils.clamp(index - 1, 0, scene.animator.getStepCount() - 1);
    //     scene.animator.resetStep(index);
    //     scene.update();
    //     const stepStart = scene.animator.getStepStartTime(index);
    //     const ratio = stepStart / scene.animator.getMasterDuration();
    //     slider.value = (ratio * 100).toString();
    // });
    // document.querySelector<HTMLButtonElement>('#next-button')?.addEventListener('click', () => {
    //     index = S2MathUtils.clamp(index + 1, 0, scene.animator.getStepCount() - 1);
    //     scene.animator.playStep(index);
    //     const stepStart = scene.animator.getStepStartTime(index);
    //     const ratio = stepStart / scene.animator.getMasterDuration();
    //     slider.value = (ratio * 100).toString();
    // });
    // document.querySelector<HTMLButtonElement>('#play-button')?.addEventListener('click', () => {
    //     scene.animator.playStep(index);
    // });
    // document.querySelector<HTMLButtonElement>('#full-button')?.addEventListener('click', () => {
    //     scene.animator.playMaster();
    //     slider.value = '0';
    // });

    // slider.addEventListener('input', () => {
    //     const ratio = slider.valueAsNumber / 100;
    //     const elapsed = ratio * scene.animator.getMasterDuration();
    //     scene.animator.stop();
    //     scene.animator.setMasterElapsed(elapsed);
    //     index = scene.animator.getStepIndexFromElapsed(elapsed);
    //     scene.getSVG().update();
    // });
}
