import { S2Vec2 } from '../../src/core/math/s2-vec2.ts';
import { MTL } from '../../src/utils/mtl-colors.ts';
import { S2Scene } from '../../src/core/scene/s2-scene.ts';
import { S2StepAnimator } from '../../src/core/animation/s2-step-animator.ts';
import { S2MathUtils } from '../../src/core/math/s2-math-utils.ts';
import { S2Color } from '../../src/core/shared/s2-color.ts';
import { S2CurvePlot } from '../../src/core/element/plot/s2-curve-plot.ts';
import { S2LerpAnimFactory } from '../../src/core/animation/s2-lerp-anim.ts';
import { ease } from '../../src/core/animation/s2-easing.ts';
import { S2CoordinateSystem } from '../../src/core/element/plot/s2-coordinate-system.ts';
import { S2Space } from '../../src/core/math/s2-space.ts';

class SceneFigure extends S2Scene {
    public animator: S2StepAnimator;

    protected plot: S2CurvePlot;
    protected coordSystem: S2CoordinateSystem;

    constructor(svgElement: SVGSVGElement) {
        super(svgElement);
        this.camera.setExtents(8.0, 4.5);
        this.setViewportSize(640.0 * 1.5, 360.0 * 1.5);

        this.animator = new S2StepAnimator(this);

        const fillRect = this.addFillRect();
        fillRect.data.color.copy(S2Color.lerp(MTL.GREY_8, MTL.GREY_9, 0.7));

        const grid = this.addWorldGrid();
        grid.data.stroke.color.copy(MTL.GREY_7);

        console.log(this.getViewSpace());

        const worldSpace = this.getWorldSpace();
        const viewSpace = this.getViewSpace();
        const newSpace = new S2Space(this.getWorldSpace());
        newSpace.setFromSpace(this.getWorldSpace(), new S2Vec2(-3, -3), new S2Vec2(-2, 0), new S2Vec2(0, 2));

        const circle = this.addCircle();
        circle.data.position.set(1, 0.5, newSpace);
        circle.data.radius.set(1, worldSpace);
        circle.data.fill.color.copy(MTL.YELLOW_5);
        circle.data.stroke.color.copy(MTL.RED);
        circle.data.stroke.width.set(2, viewSpace);

        this.coordSystem = new S2CoordinateSystem(this);
        this.coordSystem.setParent(this.getSVG());
        this.coordSystem.data.extents.set(2.0, 2.0, worldSpace);
        this.coordSystem.data.axisX.min.set(-1.0);
        this.coordSystem.data.axisX.max.set(1.0);
        this.coordSystem.data.axisX.majorStep.set(0.5);
        this.coordSystem.data.axisY.min.set(-1.0);
        this.coordSystem.data.axisY.max.set(1.0);
        this.coordSystem.data.axisY.majorStep.set(0.3);
        this.coordSystem.data.position.set(0.0, 0.0, worldSpace);
        this.coordSystem.data.anchor.set('west');

        const majorGrid = this.coordSystem.createMajorGrid();
        majorGrid.data.stroke.color.copy(MTL.RED);

        const curvePlot = new S2CurvePlot(this);
        curvePlot.setParent(this.coordSystem);
        curvePlot.data.stroke.color.copy(MTL.CYAN_5);
        curvePlot.data.stroke.width.set(4, viewSpace);
        curvePlot.data.step.set(0.2, worldSpace);
        curvePlot.data.derivativeEpsilon.set(1e-6, worldSpace);
        curvePlot.data.useSmoothing.set(true);
        curvePlot.data.paramCurve.set((t: number, out: S2Vec2) => {
            out.set(Math.sin(6 * t), Math.sin(5 * t));
        });
        curvePlot.setRanges([[0, 2 * Math.PI]]);
        this.plot = curvePlot;

        this.update();

        this.createAnimation();
    }

    createAnimation(): void {
        this.plot.data.pathTo.set(1.0);
        const anim = S2LerpAnimFactory.create(this, this.plot.data.pathTo)
            .setCycleDuration(10000)
            .setEasing(ease.inOut);
        this.plot.data.pathTo.set(0.0);
        anim.commitFinalState();
        this.animator.addAnimation(anim);

        const posAnim = S2LerpAnimFactory.create(this, this.coordSystem.data.position)
            .setCycleDuration(5000)
            .setEasing(ease.inOut);
        this.coordSystem.data.position.set(-2.0, 0.0, this.getWorldSpace());
        posAnim.commitFinalState();
        this.animator.addAnimation(posAnim, 'previous-start');
    }
}

const appDiv = document.querySelector<HTMLDivElement>('#app');
if (appDiv) {
    appDiv.innerHTML = `
        <div>
            <h1>Animation simple</h1>
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
        scene.update();
    });
}
