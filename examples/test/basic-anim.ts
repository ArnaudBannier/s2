import { S2Circle } from '../../src/core/element/s2-circle.ts';
import { S2Path } from '../../src/core/element/s2-path.ts';
import { S2Scene } from '../../src/core/scene/s2-scene.ts';
import { S2StepAnimator } from '../../src/core/animation/s2-step-animator.ts';
import { S2LerpAnimFactory } from '../../src/core/animation/s2-lerp-anim.ts';
import { ease } from '../../src/core/animation/s2-easing.ts';
import { S2MathUtils } from '../../src/core/math/s2-math-utils.ts';
import { S2AnimGroup } from '../../src/core/animation/s2-anim-group.ts';

import { S2ColorTheme, type S2Palette } from '../../src/core/shared/s2-color-theme.ts';
import { slateDark, cyanDark, rubyDark } from '../../src/utils/radix-colors-dark.ts';
import { slate, cyan, ruby } from '../../src/utils/radix-colors-light.ts';

const titleString = 'Animation simple';

const mode = 0; // 0 = dark, 1 = light
let palette: S2Palette;
if (mode === 0) {
    palette = {
        back: slateDark,
        primary: cyanDark,
        secondary: rubyDark,
    };
} else {
    palette = {
        back: slate,
        primary: cyan,
        secondary: ruby,
    };
}
const colorTheme = new S2ColorTheme(palette);

class SceneFigure extends S2Scene {
    protected circle: S2Circle;
    protected path: S2Path;
    public animator: S2StepAnimator;

    setCircleDefaultStyle(circle: S2Circle): void {
        const data = circle.data;
        data.fill.color.setFromTheme(colorTheme, 'primary', 5);
        data.stroke.color.setFromTheme(colorTheme, 'primary', 7);
        data.stroke.width.set(4, this.getViewSpace());
        data.fill.opacity.set(1.0);
        data.radius.set(1, this.getWorldSpace());
    }

    setPathDefaultStyle(path: S2Path): void {
        const data = path.data;
        data.space.set(this.getWorldSpace());
        data.stroke.lineCap.set('round');
        data.stroke.width.set(6, this.getViewSpace());
        data.stroke.color.setFromTheme(colorTheme, 'primary', 9);
    }

    constructor(svgElement: SVGSVGElement) {
        super(svgElement);
        this.camera.setExtents(8.0, 4.5);
        // this.camera.setRotationDeg(30);
        // this.camera.setZoom(0.8);
        this.setViewportSize(640.0 * 1.5, 360.0 * 1.5);

        this.animator = new S2StepAnimator(this);

        const viewSpace = this.getViewSpace();
        const worldSpace = this.getWorldSpace();

        const fillRect = this.addFillRect();
        fillRect.data.color.setFromTheme(colorTheme, 'back', 2);

        const helperGrid = this.addWorldGrid();
        helperGrid.data.stroke.color.setFromTheme(colorTheme, 'back', 4);
        helperGrid.data.geometry.boundA.set(-7, -4, worldSpace);
        helperGrid.data.geometry.boundB.set(+7, +4, worldSpace);
        helperGrid.data.geometry.space.set(worldSpace);
        helperGrid.data.stroke.width.set(2, viewSpace);

        this.path = this.addPath();
        this.setPathDefaultStyle(this.path);
        this.path.moveTo(-5, 0).cubicTo(0, -4, 0, -4, +5, 0).cubicTo(0, +4, 0, +4, -5, 0);
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
        this.circle.data.fill.color.setFromTheme(colorTheme, 'secondary', 5);
        this.circle.data.stroke.color.setFromTheme(colorTheme, 'secondary', 7);
        this.circle.data.radius.set(20, this.getViewSpace());
        this.path.data.stroke.color.setFromTheme(colorTheme, 'secondary', 9);

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
