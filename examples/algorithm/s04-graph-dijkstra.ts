import { MTL } from '../../src/utils/mtl-colors.ts';
import { S2Circle } from '../../src/core/element/s2-circle.ts';
import { S2Path } from '../../src/core/element/s2-path.ts';
import { S2Scene } from '../../src/core/scene/s2-scene.ts';
import { S2StepAnimator } from '../../src/core/animation/s2-step-animator.ts';
import { S2LerpAnimFactory } from '../../src/core/animation/s2-lerp-anim.ts';
import { ease } from '../../src/core/animation/s2-easing.ts';
import { S2MathUtils } from '../../src/core/math/s2-math-utils.ts';
import { S2AnimGroup } from '../../src/core/animation/s2-anim-group.ts';
import { S2DraggableCircle } from '../../src/core/element/draggable/s2-draggable-circle.ts';
import { S2DraggableContainerLine } from '../../src/core/element/draggable/s2-draggable-container-line.ts';

const titleString = 'Algorithme de Dijkstra';

class SceneFigure extends S2Scene {
    protected circle: S2Circle;
    protected path: S2Path;
    public animator: S2StepAnimator;

    setCircleDefaultStyle(circle: S2Circle): void {
        const data = circle.data;
        data.fill.color.copy(MTL.GREY_6);
        data.stroke.color.copy(MTL.GREY_4);
        data.stroke.width.set(4, this.getViewSpace());
        data.fill.opacity.set(1.0);
        data.radius.set(1, this.getWorldSpace());
    }

    constructor(svgElement: SVGSVGElement) {
        super(svgElement);
        this.camera.setExtents(8.0, 4.5);
        this.camera.setRotationDeg(30);
        this.camera.setZoom(0.8);
        this.setViewportSize(640.0 * 1.5, 360.0 * 1.5);

        this.animator = new S2StepAnimator(this);

        const viewSpace = this.getViewSpace();
        const worldSpace = this.getWorldSpace();

        console.log('view', viewSpace);
        console.log('world', worldSpace);

        const fillRect = this.addFillRect();
        fillRect.data.color.copy(MTL.GREY_8);

        const grid = this.addWorldGrid();
        grid.data.stroke.color.copy(MTL.GREY_6);
        grid.data.geometry.boundA.set(-7, -4, worldSpace);
        grid.data.geometry.boundB.set(+7, +4, worldSpace);
        grid.data.geometry.space.set(worldSpace);

        const draggable = new S2DraggableCircle(this);
        draggable.setParent(this.getSVG());
        draggable.data.position.set(-3, 0, worldSpace);
        draggable.data.radius.set(1, worldSpace);

        // const container = new S2DraggableContainerBox(this);
        // container.data.space.set('view');
        // container.data.boundA.set(-7, -4, 'world');
        // container.data.boundB.set(+7, +4, 'world');
        // draggable.setContainer(container);

        const container = new S2DraggableContainerLine(this);
        container.data.space.set(worldSpace);
        container.data.boundA.set(-3, 3, worldSpace);
        //container.data.boundA.set(0, 0, 'view');
        container.data.boundB.set(+3, -3, worldSpace);
        draggable.setContainer(container);

        const path = this.addPath();
        path.moveTo(-7, -4).lineTo(-7, +4).lineTo(+7, +4).lineTo(+7, -4).close();
        path.data.space.set(worldSpace);
        path.data.stroke.width.set(4, viewSpace);

        this.path = this.addPath();
        this.path.moveTo(-5, 0).cubicTo(0, -4, 0, -4, +5, 0).cubicTo(0, +4, 0, +4, -5, 0);
        this.path.data.space.set(worldSpace);
        this.path.data.stroke.lineCap.set('round');
        this.path.data.stroke.width.set(6, viewSpace);
        this.path.data.stroke.color.copy(MTL.CYAN_5);
        this.path.data.pathFrom.set(0.0);
        this.path.data.pathTo.set(0.0);

        this.circle = this.addCircle();
        this.setCircleDefaultStyle(this.circle);
        this.circle.data.position.set(0, 0, worldSpace);
        this.circle.data.opacity.set(0.0);

        const tip = this.path.createArrowTip();
        tip.setParent(this.getSVG());
        tip.setTipInset(0.25).setReversed(false).setAnchorAlignment(0);

        this.update();

        this.createAnimation();
    }

    createAnimation(): void {
        let anim = S2LerpAnimFactory.create(this, this.path.data.pathTo).setCycleDuration(2000).setEasing(ease.inOut);

        this.path.data.pathTo.set(1.0);
        anim.commitFinalState();
        this.animator.addAnimation(anim);

        anim = S2LerpAnimFactory.create(this, this.path.data.pathFrom).setCycleDuration(1000).setEasing(ease.inOut);

        this.path.data.pathFrom.set(0.8);

        this.animator.addAnimation(anim.commitFinalState(), 'previous-start', 1000);

        this.animator.makeStep();

        this.animator.enableElement(this.circle, true);
        anim = S2LerpAnimFactory.create(this, this.circle.data.opacity).setCycleDuration(500).setEasing(ease.inOut);

        this.circle.data.opacity.set(1.0);
        this.animator.addAnimation(anim.commitFinalState());

        this.animator.makeStep();

        const animGroup = new S2AnimGroup(this)
            .addLerpProperties(
                [
                    this.circle.data.position,
                    this.circle.data.fill.color,
                    this.circle.data.stroke.color,
                    this.circle.data.stroke.color,
                    this.path.data.stroke.color,
                ],
                600,
                ease.inOut,
            )
            .setCycleCount(3)
            .setAlternate(true);

        anim = S2LerpAnimFactory.create(this, this.circle.data.radius).setCycleDuration(1800).setEasing(ease.inOut);

        this.circle.data.position.set(-2, 0, this.getWorldSpace());
        this.circle.data.fill.color.copy(MTL.LIGHT_GREEN_9);
        this.circle.data.stroke.color.copy(MTL.LIGHT_GREEN_5);
        this.circle.data.radius.set(20, this.getViewSpace());
        this.path.data.stroke.color.copy(MTL.LIGHT_GREEN_5);

        this.animator.addAnimation(animGroup.commitLerpFinalStates());
        this.animator.addAnimation(anim.commitFinalState(), 'previous-start', 0);
        this.animator.makeStep();
        this.animator.finalize();
    }
}

const appDiv = document.querySelector<HTMLDivElement>('#app');
if (appDiv) {
    appDiv.innerHTML = `
        <div>
            <h1>${titleString}</h1>
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
