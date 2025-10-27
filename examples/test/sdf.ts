import type { S2Space } from '../../src/core/math/s2-space.ts';
import { MTL } from '../../src/utils/mtl-colors.ts';
import { S2Scene } from '../../src/core/scene/s2-scene.ts';
import { S2Grid } from '../../src/core/element/s2-grid.ts';
import { S2Line } from '../../src/core/element/s2-line.ts';
import { S2Color } from '../../src/core/shared/s2-color.ts';
import { S2Circle } from '../../src/core/element/s2-circle.ts';
import { S2PathNew } from '../../src/core/element/s2-path-new.ts';
import {
    S2BezierIntersection,
    S2CurveLinearMapping,
    type CurveIntersection,
} from '../../src/core/math/curve/s2-curve-opt.ts';
import { S2RoundedRectSDF, S2SDFUtils, type S2SDF } from '../../src/core/math/curve/s2-sdf.ts';
import { S2Rect } from '../../src/core/element/s2-rect.ts';
import { S2Vec2 } from '../../src/core/math/s2-vec2.ts';
import { S2PathRect } from '../../src/core/element/s2-path-rect.ts';

class SceneFigure extends S2Scene {
    public curve1: S2PathNew;
    public curve2: S2PathNew;
    public interUtils: S2BezierIntersection = new S2BezierIntersection();
    public sdf: S2SDF;
    public sdfUtils: S2SDFUtils;

    constructor(svgElement: SVGSVGElement) {
        super(svgElement);
        this.camera.setExtents(8.0, 4.5);
        this.camera.setRotationDeg(0);
        this.camera.setZoom(1);
        this.setViewportSize(640.0 * 1.5, 360.0 * 1.5);

        //const viewSpace = this.getViewSpace();
        const worldSpace = this.getWorldSpace();

        const fillRect = this.addFillRect();
        fillRect.data.color.copy(S2Color.lerp(MTL.GREY_8, MTL.GREY_9, 0.7));

        this.showSpace(worldSpace, 8, MTL.BLACK);

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

        const curve2 = new S2PathNew(this);
        this.curve2 = curve2;
        curve2.setParent(this.getSVG());
        curve2.data.space.set(worldSpace);
        curve2.data.stroke.width.set(6, this.getViewSpace());
        curve2.data.stroke.color.copy(MTL.YELLOW);
        const cubic2 = curve2.data.polyCurve;
        cubic2.setControlPoints(-7, 1, 0, -2, -8, -4, -3, -4);
        cubic2.setControlPoints(-7, 1, -6, -2, -2, -2, -2, 4);

        this.sdf = new S2RoundedRectSDF(-3, -3, 2, 1, 1);

        const spaceA = this.createSpace();
        spaceA.setSpaceToParent(1, -1, -3, 1, 1, 0);
        this.showSpace(spaceA, 2, MTL.ORANGE);

        const rect = new S2PathRect(this);
        rect.setParent(this.getSVG());
        rect.data.space.set(spaceA);
        rect.data.stroke.color.copy(MTL.LIME_5);
        rect.data.stroke.width.set(4, this.getViewSpace());
        rect.data.fill.opacity.set(0.0);
        rect.data.position.set(2, -2, spaceA);
        rect.data.extents.set(2, 1, spaceA);
        rect.data.cornerRadius.set(0.5, worldSpace);
        rect.data.anchor.set(0, -1);

        const sdfUtils = new S2SDFUtils(this.sdf, cubic1);
        this.sdfUtils = sdfUtils;
        const d = 1;
        const t = sdfUtils.findPointAtDistance(d, 0.3, 1, 1e-3);
        console.log('Point on curve1 from t=0:', t);

        const circle = new S2Circle(this);
        circle.setParent(this.getSVG());
        circle.data.fill.opacity.set(0.0);
        circle.data.stroke.color.copy(MTL.CYAN);
        circle.data.stroke.width.set(4, this.getViewSpace());
        circle.data.position.set(-4, -3, worldSpace);
        circle.data.radius.set(2, worldSpace);

        if (t >= 0) {
            const point = new S2Vec2();
            cubic1.getPointAtCasteljauInto(point, t);
            const circle = new S2Circle(this);
            circle.setParent(this.getSVG());
            circle.data.fill.color.copy(MTL.CYAN);
            circle.data.position.set(point.x, point.y, worldSpace);
            circle.data.radius.set(10, this.getViewSpace());
        }
        this.update();
    }

    computeIntersections() {
        const cubic1 = this.curve1.data.polyCurve;
        const cubic2 = this.curve2.data.polyCurve;
        this.interUtils.setTolerance(1e-2).setMaxDepth(20);
        const points: CurveIntersection[] = [];
        let start = performance.now();
        for (let i = 0; i < 1000; i++) {
            this.interUtils.intersectCubicCubic(cubic1, cubic2, points);
        }
        let end = performance.now();
        console.log(`Inter computed ${points.length} intersections in ${end - start} ms`);

        const ts = [];
        start = performance.now();
        for (let i = 0; i < 1000; i++) {
            ts.push(this.sdfUtils.findPointAtDistance(0.5, 0, 0.3));
        }
        end = performance.now();
        console.log(`SDF computed ${ts.length} points in ${end - start} ms`);
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
                <button id="full-button"><i class="fa-solid fa-play"></i></button>
            </div>
        </div>`;
}

const svgElement = appDiv?.querySelector<SVGSVGElement>('#test-svg');

if (svgElement) {
    const scene = new SceneFigure(svgElement);
    void scene;

    document.querySelector<HTMLButtonElement>('#full-button')?.addEventListener('click', () => {
        //scene.animator.playMaster();
        scene.computeIntersections();
    });
}
