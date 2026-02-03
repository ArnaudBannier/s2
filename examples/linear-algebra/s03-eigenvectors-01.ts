import { S2Vec2 } from '../../src/core/math/s2-vec2.ts';
import { S2Circle } from '../../src/core/element/s2-circle.ts';
import { S2Scene } from '../../src/core/scene/s2-scene.ts';
import { S2LerpAnim, S2LerpAnimFactory } from '../../src/core/animation/s2-lerp-anim.ts';
import { ease } from '../../src/core/animation/s2-easing.ts';
import { S2MathUtils } from '../../src/core/math/s2-math-utils.ts';
import { S2DraggableCircle } from '../../src/core/element/draggable/s2-draggable-circle.ts';
import type { S2BaseDraggable } from '../../src/core/element/draggable/s2-draggable.ts';
import { S2Playable } from '../../src/core/animation/s2-playable.ts';
import { S2DraggableContainerBox } from '../../src/core/element/draggable/s2-draggable-container-box.ts';
import { S2Line } from '../../src/core/element/s2-line.ts';
import { S2Mat2 } from '../../src/core/math/s2-mat2.ts';
import { S2PlainText } from '../../src/core/element/text/s2-plain-text.ts';

import { S2ColorTheme, type S2Palette } from '../../src/core/shared/s2-color-theme.ts';
import * as radixDark from '../../src/utils/radix-colors-dark.ts';
import * as radixLight from '../../src/utils/radix-colors-light.ts';

const mode = 0; // 0 = dark, 1 = light
let palette: S2Palette;
if (mode === 0) {
    palette = {
        back: radixDark.slateDark,
        main: radixDark.cyanDark,
        valid: radixDark.grassDark,
        invalid: radixDark.redDark,
        lines: radixDark.cyanDark,
    };
} else {
    palette = {
        back: radixLight.slate,
        main: radixLight.cyan,
        valid: radixLight.grass,
        invalid: radixLight.red,
        lines: radixLight.cyan,
    };
}
const colorTheme = new S2ColorTheme(palette);

declare global {
    interface Window {
        katex: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            renderToString: (formula: string, options?: any) => string;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            render: (formula: string, element: HTMLElement, options?: any) => void;
        };
    }
}

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

    protected circleU: S2Circle;
    protected circleEigen1: S2Circle;
    protected circleEigen2: S2Circle;
    protected precision: number = 0.5;
    protected draggable: S2DraggableCircle;

    constructor(
        svgElement: SVGSVGElement,
        htmlEq: HTMLSpanElement,
        htmlEqMatrix: HTMLSpanElement,
        finalText: HTMLSpanElement,
    ) {
        super(svgElement);
        this.htmlEq = htmlEq;
        this.htmlEqMatrix = htmlEqMatrix;
        this.htmlFinalText = finalText;

        this.camera.setExtents(6.0, 6.0 / (16 / 9));
        this.setViewportSize(640.0 * 1.5, 360.0 * 1.5);

        const worldSpace = this.getWorldSpace();
        const viewSpace = this.getViewSpace();

        const fillRect = this.addFillRect();
        fillRect.data.color.setFromTheme(colorTheme, 'back', 2);

        const gridHalf = this.addWorldGrid();
        gridHalf.data.geometry.space.set(worldSpace);
        gridHalf.data.geometry.steps.set(1, 1, worldSpace);
        gridHalf.data.geometry.referencePoint.set(0.5, 0.5, worldSpace);
        gridHalf.data.stroke.color.setFromTheme(colorTheme, 'lines', 5);
        gridHalf.data.stroke.width.set(1, viewSpace);

        const grid = this.addWorldGrid();
        grid.data.stroke.color.setFromTheme(colorTheme, 'lines', 7);

        for (let i = -5; i <= 5; i++) {
            const text = new S2PlainText(this);
            text.data.position.set(i - 0.1, -0.25, worldSpace);
            text.data.font.size.set(12, viewSpace);
            text.data.fill.color.setFromTheme(colorTheme, 'back', 11);
            text.data.layer.set(10);
            text.data.textAnchor.set(1);
            text.setParent(this.getSVG());
            text.setContent(i.toString());
        }
        for (let j = -3; j <= 3; j++) {
            if (j === 0) continue;
            const text = new S2PlainText(this);
            text.data.position.set(-0.1, j - 0.25, worldSpace);
            text.data.font.size.set(12, viewSpace);
            text.data.fill.color.setFromTheme(colorTheme, 'back', 11);
            text.data.layer.set(10);
            text.data.textAnchor.set(1);
            text.setParent(this.getSVG());
            text.setContent(j.toString());
        }

        this.matrix = new S2Mat2(1, 0, 0, 1);

        this.circleU = this.addCircle();
        this.circleU.data.fill.color.setFromTheme(colorTheme, 'main', 7);
        this.circleU.data.radius.set(0.15, worldSpace);
        //this.circleU.data.opacity.set(0.5);
        this.circleU.data.layer.set(1);

        this.vecU = this.addLine();
        this.vecU.data.startPosition.set(0, 0, worldSpace);
        this.vecU.data.endPosition.set(0, 0, worldSpace);
        this.vecU.data.stroke.color.setFromTheme(colorTheme, 'main', 9);
        this.vecU.data.stroke.width.set(6, viewSpace);
        this.vecU.data.endPadding.set(10, viewSpace);
        this.vecU.data.layer.set(1);

        this.vecV = this.addLine();
        this.vecV.data.startPosition.set(0, 0, worldSpace);
        this.vecV.data.endPosition.set(0, 0, worldSpace);
        this.vecV.data.stroke.color.setFromTheme(colorTheme, 'invalid', 9);
        this.vecV.data.stroke.width.set(6, viewSpace);
        this.vecV.data.endPadding.set(10, viewSpace);
        this.vecV.data.layer.set(2);

        this.circleEigen1 = this.addCircle();
        this.circleEigen2 = this.addCircle();
        for (const data of [this.circleEigen1.data, this.circleEigen2.data]) {
            data.stroke.color.setFromTheme(colorTheme, 'back', 11);
            data.stroke.width.set(2, viewSpace);
            data.fill.opacity.set(0);
            data.radius.set(0.15, worldSpace);
        }

        const tipU = this.vecU.createArrowTip();
        tipU.setAnchorAlignment(-1);
        tipU.data.layer.set(1);
        const tipV = this.vecV.createArrowTip();
        tipV.setAnchorAlignment(-1);
        tipV.data.layer.set(2);

        const lower = this.getCamera().getLower();
        const upper = this.getCamera().getUpper();

        const lineX = this.addLine();
        lineX.data.startPosition.set(lower.x, 0, worldSpace);
        lineX.data.endPosition.set(upper.x - 0.25, 0, worldSpace);
        lineX.data.stroke.color.setFromTheme(colorTheme, 'back', 12);
        lineX.data.stroke.width.set(4, viewSpace);
        lineX.createArrowTip();

        const lineY = this.addLine();
        lineY.data.startPosition.set(0, lower.y, worldSpace);
        lineY.data.endPosition.set(0, upper.y - 0.25, worldSpace);
        lineY.data.stroke.color.setFromTheme(colorTheme, 'back', 12);
        lineY.data.stroke.width.set(4, viewSpace);
        lineY.createArrowTip();

        this.draggable = new S2DraggableCircle(this);
        this.draggable.setParent(this.getSVG());
        this.draggable.data.position.copy(this.vecU.data.endPosition);
        this.draggable.data.radius.set(30, viewSpace);
        this.draggable.data.layer.set(0);

        const container = new S2DraggableContainerBox(this);
        container.data.space.set(viewSpace);
        container.data.boundA.set(Math.ceil(lower.x), Math.ceil(lower.y), worldSpace);
        container.data.boundB.set(Math.floor(upper.x), Math.floor(upper.y), worldSpace);
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
            const position = this.acquireVec2();
            draggable.data.position.getInto(position, worldSpace);
            this.setPosition(position, 'free');
            this.releaseVec2(position);
        });

        this.draggable.setOnRelease((draggable: S2BaseDraggable, event: PointerEvent) => {
            void event;
            const position = this.acquireVec2();
            draggable.data.position.getInto(position, worldSpace);
            const u = this.setPosition(position, 'snap');
            draggable.data.position.setV(u, worldSpace);
            this.releaseVec2(position);
        });

        this.setMatrix(0);

        this.update();
    }

    setMatrix(id: number): void {
        const worldSpace = this.getWorldSpace();
        switch (id) {
            case 0:
                this.matrix = new S2Mat2(0.5, 3, 0.75, 0.5);
                this.circleEigen1.data.position.set(2, 1, worldSpace);
                this.circleEigen2.data.position.set(-2, 1, worldSpace);
                break;
            case 1:
                this.matrix = new S2Mat2(2, 1, 1, 2);
                this.circleEigen1.data.position.set(1, 1, worldSpace);
                this.circleEigen2.data.position.set(1, -1, worldSpace);
                break;
            case 2:
                this.matrix = new S2Mat2(2, -0.5, 1, 0.5);
                this.circleEigen1.data.position.set(1, 1, worldSpace);
                this.circleEigen2.data.position.set(1, 2, worldSpace);
                break;
            case 3:
                this.matrix = new S2Mat2(1, 0, 2, -2);
                this.circleEigen1.data.position.set(3, 2, worldSpace);
                this.circleEigen2.data.position.set(0, 1, worldSpace);
                break;
            default:
                this.matrix = new S2Mat2(1, -1, -1, 1);
                this.circleEigen1.data.position.set(1, 1, worldSpace);
                this.circleEigen2.data.position.set(1, -1, worldSpace);
        }
        this.setPosition(new S2Vec2(1, 0), 'snap');
        this.draggable.data.position.set(1, 0, worldSpace);

        this.htmlEqMatrix.innerHTML = window.katex.renderToString(
            `M = \\begin{pmatrix}
            ${this.matrix.elements[0]} & ${this.matrix.elements[2]} \\\\
            ${this.matrix.elements[1]} & ${this.matrix.elements[3]}
        \\end{pmatrix}`,
            {
                throwOnError: false,
            },
        );
    }

    setPosition(position: S2Vec2, snap: 'snap' | 'free'): S2Vec2 {
        const worldSpace = this.getWorldSpace();
        const snappedPosition = new S2Vec2(
            S2MathUtils.snap(position.x, this.precision),
            S2MathUtils.snap(position.y, this.precision),
        );
        const u = snap === 'snap' ? snappedPosition : position;
        this.lerpAnimU.commitInitialState();
        this.vecU.data.endPosition.setV(u, worldSpace);
        this.lerpAnimU.commitFinalState();
        this.playableU.play();

        const v = u.clone().apply2x2(this.matrix);
        this.lerpAnimV.commitInitialState();
        this.vecV.data.endPosition.setV(v, worldSpace);
        this.lerpAnimV.commitFinalState();
        this.playableV.play();

        this.circleU.data.position.setV(snappedPosition, worldSpace);

        this.colorAnim.commitInitialState();
        const isEigenvector =
            S2Vec2.isZeroV(u) === false && (S2Vec2.isZeroV(v) || Math.abs(u.det(v)) < 1e-2 * u.length() * v.length());
        if (isEigenvector) {
            this.vecV.data.stroke.color.setFromTheme(colorTheme, 'valid', 9);
        } else {
            this.vecV.data.stroke.color.setFromTheme(colorTheme, 'invalid', 9);
        }
        this.colorAnim.commitFinalState();
        this.playableColor.play();

        if (snap === 'snap') {
            this.htmlEq.innerHTML = window.katex.renderToString(
                `\\begin{aligned}
            u &= (${u.x.toFixed(1)}, ${u.y.toFixed(1)}) \\\\
            Mu &= (${v.x.toFixed(1)}, ${v.y.toFixed(1)})
        \\end{aligned}`,
                {
                    throwOnError: false,
                },
            );

            if (S2Vec2.isZeroV(u)) {
                this.htmlFinalText.innerHTML = "Le vecteur nul n'est pas un vecteur propre par définition.";
                return u;
            } else {
                const eigenValue = Math.abs(u.x) > 1e-6 ? v.x / u.x : v.y / u.y;
                this.htmlFinalText.innerHTML = isEigenvector
                    ? `Le vecteur est un vecteur propre de valeur propre ${eigenValue.toFixed(1)}.`
                    : "Le vecteur n'est pas un vecteur propre.";
            }
        }
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
            <div>
            Choix de la matrice :
            <select id="matrix-select">
                <option value="0">M = [[0.5, 3], [0.75, 0.5]]</option>
                <option value="1">M = [[2, 1], [1, 2]]</option>
                <option value="2">M = [[2, -0.5], [1, 0.5]]</option>
                <option value="3">M = [[1, 0], [2, -2]]</option>
                <option value="4">M = [[1, -1], [-1, 1]]</option>
            </select>
            </div>
            <p>Vous pouvez déplacer le vecteur $u$ (en bleu) avec la souris. Le vecteur $v = Mu$ (en rouge ou vert) est calculé en fonction de la matrice $M$.<br>
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

    const selectElement = document.getElementById('matrix-select') as HTMLSelectElement;

    selectElement.addEventListener('change', (event) => {
        const target = event.target as HTMLSelectElement;
        scene.setMatrix(parseInt(target.value, 10));
    });
}
