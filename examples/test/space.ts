import type { S2Space } from '../../src/core/math/s2-space.ts';
import { MTL } from '../../src/utils/mtl-colors.ts';
import { S2Scene } from '../../src/core/scene/s2-scene.ts';
import { S2StepAnimator } from '../../src/core/animation/s2-step-animator.ts';
import { S2MathUtils } from '../../src/core/math/s2-math-utils.ts';
import { S2Grid } from '../../src/core/element/s2-grid.ts';
import { S2Line } from '../../src/core/element/s2-line.ts';
import { S2Color } from '../../src/core/shared/s2-color.ts';
import { S2Circle } from '../../src/core/element/s2-circle.ts';
import { S2Mat2x3 } from '../../src/core/math/s2-mat2x3.ts';
import { S2PathNew } from '../../src/core/element/s2-path-new.ts';
import {
    S2BezierIntersection,
    S2CurveLinearMapping,
    type CurveIntersection,
} from '../../src/core/math/curve/s2-cubic-curve.ts';

class SceneFigure extends S2Scene {
    public animator: S2StepAnimator;
    public curve1: S2PathNew;
    public curve2: S2PathNew;
    public interUtils: S2BezierIntersection = new S2BezierIntersection();

    constructor(svgElement: SVGSVGElement) {
        super(svgElement);
        this.camera.setExtents(8.0, 4.5);
        this.camera.setRotationDeg(0);
        this.camera.setZoom(1);
        this.setViewportSize(640.0 * 1.5, 360.0 * 1.5);

        this.animator = new S2StepAnimator(this);

        //const viewSpace = this.getViewSpace();
        const worldSpace = this.getWorldSpace();

        const fillRect = this.addFillRect();
        fillRect.data.color.copy(S2Color.lerp(MTL.GREY_8, MTL.GREY_9, 0.7));

        this.showSpace(worldSpace, 8, MTL.BLACK);

        const spaceA = this.createSpace();
        spaceA.setSpaceToParent(2, 0, 3, 0, -1, -2);
        this.showSpace(spaceA, 1, MTL.BLUE);

        const spaceB = this.createSpace();
        spaceB.setSpaceToParent(1, -1, -3, 1, 1, 0);
        this.showSpace(spaceB, 2, MTL.ORANGE);

        const spaceC = this.createSpace();
        spaceC.setSpaceToParent(0, -0.5, 4, 1, 1, 2);
        this.showSpace(spaceC, 2, MTL.PINK);

        for (const space of [worldSpace, spaceA, spaceB, spaceC]) {
            const circle = new S2Circle(this);
            circle.setParent(this.getSVG());
            circle.data.fill.color.copy(MTL.CYAN);
            circle.data.position.set(1, 1, space);
            circle.data.radius.set(0.5, space);
            //circle.data.radius.set(0.5, worldSpace);

            const res = new S2Mat2x3();

            res.multiplyMatrices(this.viewSpace.getWorldToSpace(), space.getSpaceToWorld());
            res.multiplyMatrices(res, this.viewSpace.getSpaceToWorld());
            const canvasCircle = new S2Circle(this);
            canvasCircle.setParent(this.getSVG());
            canvasCircle.data.stroke.color.copy(MTL.CYAN_1);
            canvasCircle.data.stroke.width.set(4, this.getViewSpace());
            canvasCircle.data.fill.opacity.set(0.0);
            canvasCircle.data.position.set(1, 1, worldSpace);
            canvasCircle.data.radius.set(0.5, worldSpace);
            canvasCircle.data.transform.set(res);
            //canvasCircle.getSVGElement().setAttribute('vector-effect', 'non-scaling-stroke');
        }

        const curve1 = new S2PathNew(this);
        this.curve1 = curve1;
        curve1.setParent(this.getSVG());
        curve1.data.space.set(worldSpace);
        curve1.data.stroke.width.set(6, this.getViewSpace());
        curve1.data.stroke.color.copy(MTL.YELLOW);
        const cubic1 = curve1.data.polyCurve;
        cubic1.setControlPoints(-7, -4, 0, -4, -10, -1, -3, 0);

        const mapping = new S2CurveLinearMapping(cubic1, 8);
        console.log('Cubic length:', mapping.getLength());

        for (let i = 0; i <= 10; i++) {
            const circle = new S2Circle(this);
            circle.setParent(this.getSVG());
            circle.data.fill.color.copy(MTL.DEEP_ORANGE);
            const t = mapping.getTFromU(i / 10);
            cubic1.getPointAtInto(circle.data.position.value, t);
            circle.data.position.space = worldSpace;
            circle.data.radius.set(6, this.getViewSpace());
        }

        const curve2 = new S2PathNew(this);
        this.curve2 = curve2;
        curve2.setParent(this.getSVG());
        curve2.data.space.set(worldSpace);
        curve2.data.stroke.width.set(6, this.getViewSpace());
        curve2.data.stroke.color.copy(MTL.YELLOW);
        const cubic2 = curve2.data.polyCurve;
        cubic2.setControlPoints(-7, 1, 0, -2, -8, -4, -3, -4);
        cubic2.setControlPoints(-7, 1, -6, -2, -2, -2, -2, 4);

        this.update();
    }

    computeIntersections() {
        const cubic1 = this.curve1.data.polyCurve;
        const cubic2 = this.curve2.data.polyCurve;
        this.interUtils.setTolerance(1e-2).setMaxDepth(20);
        const points: CurveIntersection[] = [];
        const start = performance.now();
        for (let i = 0; i < 1000; i++) {
            this.interUtils.intersectCubicCubic(cubic1, cubic2, points);
        }
        const end = performance.now();
        console.log(`Computed ${points.length} intersections in ${end - start} ms`);
    }

    showSpace(space: S2Space, gridSize: number, gridColor: S2Color): void {
        const grid = new S2Grid(this);
        grid.setParent(this.getSVG());
        grid.data.stroke.color.copy(gridColor);
        grid.data.geometry.boundA.set(-gridSize, -gridSize, space);
        grid.data.geometry.boundB.set(+gridSize, +gridSize, space);
        grid.data.geometry.steps.set(1, 1, space);
        grid.data.geometry.referencePoint.set(0, 0, space);
        grid.data.geometry.space.set(space);

        const e0 = new S2Line(this);
        e0.setParent(this.getSVG());
        e0.data.stroke.color.copy(MTL.RED);
        e0.data.stroke.width.set(4, this.getViewSpace());
        e0.data.startPosition.set(0, 0, space);
        e0.data.endPosition.set(1, 0, space);
        e0.data.endPadding.set(5, this.getViewSpace());
        e0.createArrowTip().setAnchorAlignment(-1);

        const e1 = new S2Line(this);
        e1.setParent(this.getSVG());
        e1.data.stroke.color.copy(MTL.GREEN);
        e1.data.stroke.width.set(4, this.getViewSpace());
        e1.data.startPosition.set(0, 0, space);
        e1.data.endPosition.set(0, 1, space);
        e1.data.endPadding.set(5, this.getViewSpace());
        e1.createArrowTip().setAnchorAlignment(-1);

        const origin = new S2Circle(this);
        origin.setParent(this.getSVG());
        origin.data.fill.color.copy(MTL.WHITE);
        origin.data.position.set(0, 0, space);
        origin.data.radius.set(5, this.getViewSpace());
    }
}

const appDiv = document.querySelector<HTMLDivElement>('#app');
if (appDiv) {
    appDiv.innerHTML = `
        <div>
            <h1>Changement d'espaces</h1>
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
        //scene.animator.playMaster();
        scene.computeIntersections();
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
