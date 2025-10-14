import { S2Vec2 } from '../../src/core/math/s2-vec2.ts';
import { S2Camera } from '../../src/core/math/s2-camera.ts';
import { MTL } from '../../src/utils/mtl-colors.ts';
import { S2Circle } from '../../src/core/element/s2-circle.ts';
import { S2Path } from '../../src/core/element/s2-path.ts';
import { S2Scene } from '../../src/core/scene/s2-scene.ts';
import { S2StepAnimator } from '../../src/core/animation/s2-step-animator.ts';
import { S2LerpAnimFactory } from '../../src/core/animation/s2-lerp-anim.ts';
import { ease } from '../../src/core/animation/s2-easing.ts';
import { S2MathUtils } from '../../src/core/math/s2-math-utils.ts';
import { S2DataSetter } from '../../src/core/element/base/s2-data-setter.ts';
import { S2AnimGroup } from '../../src/core/animation/s2-anim-group.ts';
import { S2DraggableCircle } from '../../src/core/element/s2-draggable-circle.ts';
import type { S2BaseDraggable } from '../../src/core/element/s2-draggable.ts';
import { S2Playable } from '../../src/core/animation/s2-playable.ts';

const viewportScale = 1.5;
const viewport = new S2Vec2(640.0, 360.0).scale(viewportScale);
const camera = new S2Camera(new S2Vec2(0.0, 0.0), new S2Vec2(8.0, 4.5), viewport, 1.0);

class SceneFigure extends S2Scene {
    protected circle: S2Circle;
    protected path: S2Path;
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
        S2DataSetter.setTargets(fillRect.data).setColor(MTL.GREY_8);

        const grid = this.addWorldGrid();
        S2DataSetter.setTargets(grid.data).setStrokeColor(MTL.GREY_6);
        grid.data.geometry.boundA.set(-7, -4, 'world');
        grid.data.geometry.boundB.set(+7, +4, 'world');
        grid.data.geometry.space.set('world');

        const draggable = new S2DraggableCircle(this);
        draggable.setParent(this.getSVG());
        draggable.data.space.set('world');
        draggable.data.position.set(-3, 0, 'world');
        draggable.data.radius.set(1, 'world');
        draggable.data.xEnabled.set(true);
        draggable.data.yEnabled.set(false);
        draggable.data.containerBoundA.set(-7, -4, 'world');
        draggable.data.containerBoundB.set(+7, +4, 'world');

        const path = this.addPath();
        path.moveTo(-7, -4).lineTo(-7, +4).lineTo(+7, +4).lineTo(+7, -4).close();
        path.data.stroke.width.set(4, 'view');

        // const svg = this.getSVG();
        // svg.getSVGElement().addEventListener('mouseover', (event: MouseEvent) => {
        //     const point = svg.convertDOMPoint(event.clientX, event.clientY, 'view');
        //     console.log(`Mouse at: ${point.x.toFixed(2)}, ${point.y.toFixed(2)}`);
        // });

        this.path = this.addPath();
        this.path.moveTo(-5, 0).cubicTo(0, -4, 0, -4, +5, 0).cubicTo(0, +4, 0, +4, -5, 0);
        S2DataSetter.setTargets(this.path.data)
            .setStrokeColor(MTL.CYAN_5)
            .setStrokeWidth(6, 'view')
            .setStrokeLineCap('round')
            .setSpace('world')
            .setPathFrom(0.0)
            .setPathTo(0.0);

        this.circle = this.addCircle();
        this.setCircleDefaultStyle(this.circle);
        this.circle.data.position.set(0, 0, 'world');
        this.circle.data.opacity.set(0.0);

        // this.circle.getSVGElement().addEventListener('mouseover', (event: MouseEvent) => {
        //     console.log('Circle mouse enter');
        //     this.circle.data.stroke.width.set(8, 'view');
        //     this.update();
        // });

        // const svg = this.getSVG();
        // svg.getSVGElement().addEventListener('mousemove', (event: MouseEvent) => {
        //     const point = svg.convertDOMPoint(event.clientX, event.clientY, 'world');
        //     console.log(`Mouse at: ${point.x.toFixed(2)}, ${point.y.toFixed(2)}`);
        //     if (this.circle.isEnabled() && point.distanceSq(this.circle.getCenter('world')) < 1) {
        //         this.circle.data.stroke.width.set(8, 'view');
        //         this.update();
        //     }
        // });

        const line = this.addLine();
        line.data.startPosition.set(0, 0, 'world');
        line.data.endPosition.copy(draggable.data.position);
        line.data.stroke.color.copy(MTL.LIGHT_BLUE_5);
        line.data.stroke.width.set(2, 'view');
        line.data.pointerEvents.set('none');

        const circle = this.addCircle();
        circle.data.radius.set(0.3, 'world');
        circle.data.fill.color.copy(MTL.LIGHT_BLUE_5);

        const lerpAnim = S2LerpAnimFactory.create(this, circle.data.position)
            .setCycleDuration(500)
            .setEasing(ease.outExpo);
        lerpAnim.commitFinalState();
        const playable = new S2Playable(lerpAnim);

        draggable.setOnDrag((handle: S2BaseDraggable, event: PointerEvent) => {
            void event;
            const pos = handle.getPosition('world');
            line.data.endPosition.set(S2MathUtils.snap(pos.x, 1), S2MathUtils.snap(pos.y, 1), 'world');

            lerpAnim.commitInitialState();
            circle.data.position.setV(pos, 'world');
            lerpAnim.commitFinalState();
            playable.play();
        });

        // handle.setOnRelease((handle: S2BaseDraggable, event: PointerEvent) => {
        //     void event;
        //     handle.data.position.copy(line.data.endPosition);
        // });

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
        S2DataSetter.setTargets(this.circle.data)
            .setPosition(-2, 0, 'world')
            .setFillColor(MTL.LIGHT_GREEN_9)
            .setStrokeColor(MTL.LIGHT_GREEN_5)
            .setRadius(20, 'view');
        S2DataSetter.setTargets(this.path.data).setStrokeColor(MTL.LIGHT_GREEN_5);

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
        scene.getSVG().update();
    });
}
