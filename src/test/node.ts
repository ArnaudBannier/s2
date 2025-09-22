import './style.css';
import { S2Vec2 } from '../core/math/s2-vec2.ts';
import { S2Camera } from '../core/math/s2-camera.ts';
import { MTL } from '../utils/mtl-colors.ts';
import { S2Circle } from '../core/element/s2-circle.ts';
import { S2Path } from '../core/element/s2-path.ts';
import { S2Scene } from '../core/s2-scene.ts';
import { S2StepAnimator } from '../core/animation/s2-step-animator.ts';
import { S2LerpAnim } from '../core/animation/s2-lerp-anim.ts';
import { ease } from '../core/animation/s2-easing.ts';
import { S2MathUtils } from '../core/math/s2-utils.ts';
import { S2DataSetter } from '../core/element/base/s2-data-setter.ts';
import { S2PlainNode } from '../core/element/node/s2-plain-node.ts';

const viewportScale = 1.5;
const viewport = new S2Vec2(640.0, 360.0).scale(viewportScale);
const camera = new S2Camera(new S2Vec2(0.0, 0.0), new S2Vec2(8.0, 4.5), viewport, 1.0);

class SceneFigure extends S2Scene {
    public animator: S2StepAnimator;
    protected node1: S2PlainNode;
    protected node2: S2PlainNode;

    setNodeDefaultStyle(node: S2PlainNode): void {
        const data = node.data;
        data.background.fill.color.copy(MTL.GREY_9);
        data.background.stroke.color.copy(MTL.GREY_5);
        data.background.stroke.width.set(2, 'view');
        data.text.fill.color.copy(MTL.WHITE);
        data.text.horizontalAlign.set('center');
        data.text.verticalAlign.set('middle');
        data.text.font.weight.set(700);
        data.padding.set(10, 5, 'view');
        data.minExtents.set(1, 0.5, 'world');
        data.background.cornerRadius.set(10, 'view');
    }

    constructor(svgElement: SVGSVGElement) {
        super(svgElement, camera);
        this.animator = new S2StepAnimator(this);

        const fillRect = this.addFillRect();
        S2DataSetter.addTarget(fillRect.data).setColor(MTL.GREY_8);

        const grid = this.addWorldGrid();
        S2DataSetter.addTarget(grid.data).setStrokeColor(MTL.GREY_6);

        this.node1 = new S2PlainNode(this);
        this.node1.setParent(this.getSVG());
        this.setNodeDefaultStyle(this.node1);
        this.node1.setContent('Node 1');
        this.node1.createRectBackground();
        this.node1.data.anchor.set('north');

        this.node2 = new S2PlainNode(this);
        this.node2.setParent(this.getSVG());
        this.setNodeDefaultStyle(this.node2);
        this.node2.setContent('Node 2');
        this.node2.createRectBackground();

        this.node1.data.position.set(-2, 0, 'world');
        this.node2.data.position.set(+2, 0, 'world');

        this.update();

        this.createAnimation();
    }

    createAnimation(): void {
        let anim = new S2LerpAnim(this)
            .addUpdateTarget(this.getSVG())
            .bind(this.node1.data.position)
            .setCycleDuration(1000)
            .setEasing(ease.inOut);

        this.node1.data.position.set(-5, 3, 'world');
        this.animator.addAnimation(anim.commitFinalStates());
        this.animator.makeStep();

        anim = new S2LerpAnim(this)
            .addUpdateTarget(this.getSVG())
            .bind(this.node2.data.position)
            .setCycleDuration(1000)
            .setEasing(ease.inOut);

        this.node2.data.position.set(+5, -3, 'world');
        this.animator.addAnimation(anim.commitFinalStates());
        this.animator.makeStep();

        anim = new S2LerpAnim(this)
            .addUpdateTarget(this.getSVG())
            .bind(this.node1.data.position)
            .bind(this.node1.data.background.cornerRadius)
            .bind(this.node1.data.background.fill.color)
            .bind(this.node1.data.text.fill.color)
            .bind(this.node2.data.position)
            .setCycleDuration(1000)
            .setEasing(ease.inOut);

        this.node1.data.position.set(-2, 0, 'world');
        this.node1.data.background.cornerRadius.set(0.5, 'world');
        this.node1.data.background.fill.color.copy(MTL.GREY_5);
        this.node1.data.text.fill.color.copy(MTL.BLACK);
        this.node2.data.position.set(+2, 0, 'world');
        this.animator.addAnimation(anim.commitFinalStates());
        this.animator.makeStep();
    }
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
    });
}
