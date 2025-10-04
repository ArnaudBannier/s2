import './s2-example-style.css';
import { S2Vec2 } from '../core/math/s2-vec2.ts';
import { S2Camera } from '../core/math/s2-camera.ts';
import { MTL } from '../utils/mtl-colors.ts';
import { S2Scene } from '../core/scene/s2-scene.ts';
import { S2StepAnimator } from '../core/animation/s2-step-animator.ts';
import { S2MathUtils } from '../core/math/s2-utils.ts';
import { S2DataSetter } from '../core/element/base/s2-data-setter.ts';
import { S2Memory } from '../extension/s2-memory.ts';
import { S2FontData } from '../core/element/base/s2-base-data.ts';

const viewportScale = 1.5;
const viewport = new S2Vec2(640.0, 360.0).scale(viewportScale);
const camera = new S2Camera(new S2Vec2(0.0, 0.0), new S2Vec2(8.0, 4.5), viewport, 1.0);

class SceneFigure extends S2Scene {
    public animator: S2StepAnimator;
    public font: S2FontData;
    public memory: S2Memory;

    constructor(svgElement: SVGSVGElement) {
        super(svgElement, camera);
        this.animator = new S2StepAnimator(this);

        this.font = new S2FontData();
        this.font.family.set('monospace');
        this.font.size.set(16, 'view');
        this.font.relativeAscenderHeight.set(0.7);
        this.font.relativeLineHeight.set(1.3);

        const fillRect = this.addFillRect();
        S2DataSetter.setTargets(fillRect.data).setColor(MTL.GREY_8);

        const grid = this.addWorldGrid();
        S2DataSetter.setTargets(grid.data).setStrokeColor(MTL.GREY_9);

        const addressCount = 16;
        const isStacked = true;
        const memory = new S2Memory(this, addressCount, isStacked);
        this.memory = memory;
        memory.setParent(this.getSVG());
        memory.data.extents.set(2.5, 4.0, 'world');

        memory.data.text.fill.color.copyIfUnlocked(MTL.WHITE);
        memory.data.text.font.copyIfUnlocked(this.font);
        memory.data.background.fill.color.copyIfUnlocked(MTL.GREY_9);
        memory.data.background.stroke.color.copyIfUnlocked(MTL.GREY_7);
        memory.data.background.stroke.width.set(2, 'view');
        memory.data.background.cornerRadius.set(10, 'view');

        memory.addVariable('i', '42');
        memory.addVariable('sum', '0');
        memory.addVariable('value', '1234');

        this.update();

        this.createAnimation();
    }

    createAnimation(): void {
        this.animator.makeStep();
        const row = this.memory.getRow(0);
        this.update();
        row.animateSetValue('100', this.animator);
        this.animator.makeStep();
        this.update();
        row.animateSetValue('73', this.animator);
        this.animator.makeStep();
    }
}

const appDiv = document.querySelector<HTMLDivElement>('#app');
if (appDiv) {
    appDiv.innerHTML = `
        <div>
            <h1>Etat de la mémoire</h1>
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
        slider.value = '0';
    });
    document.querySelector<HTMLButtonElement>('#prev-button')?.addEventListener('click', () => {
        index = S2MathUtils.clamp(index - 1, 0, scene.animator.getStepCount() - 1);
        scene.animator.resetStep(index);
        scene.update();
        const stepStart = scene.animator.getStepStartTime(index);
        const ratio = stepStart / scene.animator.getMasterDuration();
        slider.value = (ratio * 100).toString();
    });
    document.querySelector<HTMLButtonElement>('#next-button')?.addEventListener('click', () => {
        index = S2MathUtils.clamp(index + 1, 0, scene.animator.getStepCount() - 1);
        scene.animator.playStep(index);
        const stepStart = scene.animator.getStepStartTime(index);
        const ratio = stepStart / scene.animator.getMasterDuration();
        slider.value = (ratio * 100).toString();
    });
    document.querySelector<HTMLButtonElement>('#play-button')?.addEventListener('click', () => {
        scene.animator.playStep(index);
    });
    document.querySelector<HTMLButtonElement>('#full-button')?.addEventListener('click', () => {
        scene.animator.playMaster();
        slider.value = '0';
    });

    slider.addEventListener('input', () => {
        const ratio = slider.valueAsNumber / 100;
        const elapsed = ratio * scene.animator.getMasterDuration();
        scene.animator.stop();
        scene.animator.setMasterElapsed(elapsed);
        index = scene.animator.getStepIndexFromElapsed(elapsed);
        scene.getSVG().update();
    });
}
