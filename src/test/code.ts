import './style.css';
import { S2Vec2 } from '../core/math/s2-vec2.ts';
import { S2Camera } from '../core/math/s2-camera.ts';
import { MTL } from '../utils/mtl-colors.ts';
import { S2Circle } from '../core/element/s2-circle.ts';
import { S2Scene } from '../core/s2-scene.ts';
import { S2StepAnimator } from '../core/animation/s2-step-animator.ts';
import { S2MathUtils } from '../core/math/s2-utils.ts';
import { S2DataSetter } from '../core/element/base/s2-data-setter.ts';
import { S2FontData } from '../core/element/base/s2-base-data.ts';
import { S2Code, tokenizeAlgorithm } from '../core/element/s2-code.ts';
import { S2LerpAnimFactory } from '../core/animation/s2-lerp-anim.ts';
import { ease } from '../core/animation/s2-easing.ts';
import { S2AnimGroup } from '../core/animation/s2-anim-group.ts';

const algorithm =
    '**kw:Tant que** **var:file** non vide **kw:faire**\n' +
    '    **type:Noeud** **var:n** = **fn:Défiler**()\n' +
    '    **fn:Traiter**(**var:n**)\n' +
    '    **fn:Enfiler**(fils gauche de **var:n**)\n' +
    '    **fn:Enfiler**(fils droit de **var:n**)';

const viewportScale = 1.5;
const viewport = new S2Vec2(640.0, 360.0).scale(viewportScale);
const camera = new S2Camera(new S2Vec2(0.0, 0.0), new S2Vec2(8.0, 4.5), viewport, 1.0);

class SceneFigure extends S2Scene {
    public animator: S2StepAnimator;

    setCircleDefaultStyle(circle: S2Circle): void {
        S2DataSetter.setTargets(circle.data)
            .setFillColor(MTL.GREY_6)
            .setStrokeColor(MTL.GREY_4)
            .setStrokeWidth(4, 'view')
            .setFillOpacity(1.0)
            .setRadius(1, 'world');
    }

    constructor(svgElement: SVGSVGElement) {
        super(svgElement, camera);
        this.animator = new S2StepAnimator(this);

        const fillRect = this.addFillRect();
        S2DataSetter.setTargets(fillRect.data).setColor(MTL.GREY_5);

        const grid = this.addWorldGrid();
        S2DataSetter.setTargets(grid.data).setStrokeColor(MTL.GREY_6);

        const font = new S2FontData();
        font.family.set('monospace');
        font.size.set(20, 'view');
        font.relativeLineHeight.set(1.3);

        const code = new S2Code(this);
        code.setParent(this.getSVG());

        code.data.text.font.copy(font);
        code.data.text.fill.color.copy(MTL.WHITE);
        code.data.anchor.set('west');
        code.data.position.set(-5, 0, 'world');
        code.data.padding.set(20, 5, 'view');
        code.data.background.fill.color.copy(MTL.GREY_9);
        code.data.currentLine.opacity.set(1);
        code.data.currentLine.fill.color.copy(MTL.BLACK);
        code.data.currentLine.fill.opacity.set(0.5);
        code.data.currentLine.stroke.color.copy(MTL.WHITE);
        code.data.currentLine.stroke.width.set(1, 'view');
        code.data.currentLine.stroke.opacity.set(0.2);
        code.data.currentLine.padding.set(-0.5, 2, 'view');
        code.data.currentLine.index.set(0);
        code.setContent(tokenizeAlgorithm(algorithm));
        //code.update();

        this.update();

        let anim = S2LerpAnimFactory.create(this, code.data.currentLine.index)
            .setCycleDuration(500)
            .setEasing(ease.inOut);
        code.data.currentLine.index.set(1);

        this.animator.addAnimation(anim.commitFinalState());
        this.animator.makeStep();

        let animGroup = new S2AnimGroup(this).addLerpProperties(
            [code.data.currentLine.index, code.data.position],
            500,
            ease.inOut,
        );

        code.data.currentLine.index.set(2);
        code.data.position.set(-2, -0.5, 'world');

        this.animator.addAnimation(animGroup.commitLerpFinalStates());
        this.animator.makeStep();

        const emph = code.createEmphasisForToken(2, { category: 'fn', content: 'Traiter' });
        if (!emph) return;

        emph.data.opacity.set(0.0);
        animGroup = new S2AnimGroup(this).addLerpProperties([emph.data.opacity, code.data.position], 500, ease.inOut);
        emph.data.opacity.set(1.0);
        code.data.position.set(-2, 0.5, 'world');

        this.animator.addAnimation(animGroup.commitLerpFinalStates());
        this.animator.makeStep();
    }

    createAnimation(): void {}
}

const appDiv = document.querySelector<HTMLDivElement>('#app');
if (appDiv) {
    appDiv.innerHTML = `
        <div>
            <h1>My first SVG</h1>
            <svg xmlns="http://www.w3.org/2000/svg" id=test-svg class="responsive-svg" preserveAspectRatio="xMidYMid meet"></svg>
            <div class="figure-nav">
                <div>Animation : <input type="range" id="slider" min="0" max="100" step="1" value="0" style="width:50%"></div>
                <button id="reset-button"><i class="fa-solid fa-backward-fast"></i></button>
                <button id="prev-button"><i class="fa-solid fa-step-backward"></i></button>
                <button id="play-button"><i class="fa-solid fa-redo"></i></button>
                <button id="next-button"><i class="fa-solid fa-step-forward"></i></button>
                <button id="full-button"><i class="fa-solid fa-play"></i></button>
            </div>
        </div>`;
}

const svgElement = appDiv?.querySelector<SVGSVGElement>('#test-svg');
const slider = document.querySelector<HTMLInputElement>('#slider');

if (svgElement && slider) {
    const scene = new SceneFigure(svgElement);
    void scene;

    let index = -1;
    scene.animator.reset();

    document.querySelector<HTMLButtonElement>('#reset-button')?.addEventListener('click', () => {
        index = -1;
        scene.animator.stop();
        scene.animator.reset();
    });
    document.querySelector<HTMLButtonElement>('#prev-button')?.addEventListener('click', () => {
        index = S2MathUtils.clamp(index - 1, 0, scene.animator.getStepCount() - 1);
        scene.animator.playStep(index);
    });
    document.querySelector<HTMLButtonElement>('#next-button')?.addEventListener('click', () => {
        index = S2MathUtils.clamp(index + 1, 0, scene.animator.getStepCount() - 1);
        scene.animator.playStep(index);
    });
    document.querySelector<HTMLButtonElement>('#play-button')?.addEventListener('click', () => {
        scene.animator.playStep(index);
    });
    document.querySelector<HTMLButtonElement>('#full-button')?.addEventListener('click', () => {
        scene.animator.playMaster();
    });

    slider.addEventListener('input', () => {
        const ratio = slider.valueAsNumber / 100;
        scene.animator.stop();
        scene.animator.setMasterElapsed(ratio * scene.animator.getMasterDuration());
        scene.getSVG().update();
    });
}
