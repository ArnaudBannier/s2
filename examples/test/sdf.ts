import type { S2Space } from '../../src/core/math/s2-space.ts';
import { MTL } from '../../src/utils/mtl-colors.ts';
import { S2Scene } from '../../src/core/scene/s2-scene.ts';
import { S2Grid } from '../../src/core/element/s2-grid.ts';
import { S2Line } from '../../src/core/element/s2-line.ts';
import { S2Color } from '../../src/core/shared/s2-color.ts';
import { S2Circle } from '../../src/core/element/s2-circle.ts';
import { S2PathNew } from '../../src/core/element/s2-path-new.ts';
import { S2SDFUtils } from '../../src/core/math/curve/s2-sdf.ts';
import { S2Vec2 } from '../../src/core/math/s2-vec2.ts';
import { S2PathRect } from '../../src/core/element/s2-path-rect.ts';
import { S2Mat2x3 } from '../../src/core/math/s2-mat2x3.ts';
import { S2PathCircle } from '../../src/core/element/s2-path-circle.ts';
import { S2PlainNode } from '../../src/core/element/node/s2-plain-node.ts';
import { S2CubicEdge } from '../../src/core/element/node/s2-cubic-edge.ts';

class SceneFigure extends S2Scene {
    public curve: S2PathNew;

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

        const curve = new S2PathNew(this);
        this.curve = curve;
        curve.setParent(this.getSVG());
        curve.data.space.set(worldSpace);
        curve.data.stroke.width.set(6, this.getViewSpace());
        curve.data.stroke.color.copy(MTL.YELLOW);
        const cubic = curve.data.polyCurve;
        cubic.setControlPoints(0, 1, -2, 0, 0, -4, -2, -4);

        const spaceA = this.createSpace();
        spaceA.setSpaceToParent(1, -1, -3, 1, 1, 0);
        this.showSpace(spaceA, 2, MTL.ORANGE);

        const rect = new S2PathRect(this);
        rect.setParent(this.getSVG());
        rect.data.space.set(spaceA);
        rect.data.stroke.color.copy(MTL.LIME_5);
        rect.data.stroke.width.set(4, this.getViewSpace());
        rect.data.fill.opacity.set(0.0);
        rect.data.position.set(2, -1, spaceA);
        rect.data.extents.set(2, 1, worldSpace);
        rect.data.cornerRadius.set(0.5, this.worldSpace);
        //rect.data.anchor.set(0, -1);

        const nodes: S2PlainNode[] = [];
        for (let i = 0; i < 2; i++) {
            const node = new S2PlainNode(this);
            node.setParent(this.getSVG());
            node.data.space.set(this.viewSpace);
            node.data.padding.set(5, 5, this.viewSpace);
            node.data.anchor.set(0, 0);
            node.data.background.fill.color.copy(MTL.BLUE_5);
            node.data.background.fill.opacity.set(0.5);
            node.data.minExtents.set(1, 0.5, worldSpace);
            node.data.text.horizontalAlign.set(0);
            node.data.text.verticalAlign.set(0);
            node.data.text.stroke.color.copy(MTL.BLACK);
            node.data.text.stroke.width.set(3, this.viewSpace);
            node.data.text.font.size.set(24, this.getViewSpace());
            node.data.background.cornerRadius.set(0.5, worldSpace);
            node.data.background.shape.set('rectangle');
            node.setContent('plain');
            nodes.push(node);
        }
        nodes[0].data.position.set(0, 1, worldSpace);
        nodes[1].data.position.set(5, 0, worldSpace);
        nodes[0].setContent('plain 1');
        nodes[1].setContent('plain 2');
        this.update();

        const xf = new S2Mat2x3();
        worldSpace.getThisToSpaceInto(xf, nodes[0].data.space.get());
        let d = this.viewSpace.convertLength(20, nodes[0].data.space.get());
        const t = S2SDFUtils.findPointAtDistance(nodes[0].getSDF(), cubic, xf, d, 0, 1, 1e-3);
        console.log('Point on curve1 from t=0:', t);

        if (t >= 0) {
            const point = new S2Vec2();
            cubic.getPointInto(point, t);
            const circle = new S2Circle(this);
            circle.setParent(this.getSVG());
            circle.data.stroke.color.copy(MTL.WHITE);
            circle.data.stroke.width.set(2, this.getViewSpace());
            circle.data.fill.opacity.set(0.0);
            circle.data.position.set(point.x, point.y, worldSpace);
            circle.data.radius.set(20, this.getViewSpace());
        }

        const pathCircle = new S2PathCircle(this);
        pathCircle.setParent(this.getSVG());
        pathCircle.data.space.set(worldSpace);
        pathCircle.data.position.set(-2, -4, worldSpace);
        pathCircle.data.radius.set(1, worldSpace);
        pathCircle.data.stroke.color.copy(MTL.CYAN);
        pathCircle.data.stroke.width.set(4, this.getViewSpace());
        pathCircle.data.fill.opacity.set(0.0);
        this.update();

        d = this.viewSpace.convertLength(20, pathCircle.data.space.get());
        worldSpace.getThisToSpaceInto(xf, pathCircle.data.space.get());
        const s = S2SDFUtils.findPointAtDistance(pathCircle, cubic, xf, d, 0, 1);
        console.log('Point on curve', s);

        if (s >= 0) {
            const point = new S2Vec2();
            cubic.getPointInto(point, s);
            const circle = new S2Circle(this);
            circle.setParent(this.getSVG());
            circle.data.stroke.color.copy(MTL.PINK);
            circle.data.stroke.width.set(2, this.getViewSpace());
            circle.data.fill.opacity.set(0.0);
            circle.data.position.set(point.x, point.y, worldSpace);
            circle.data.radius.set(20, this.getViewSpace());
        }

        nodes[1].data.background.shape.set('rectangle');
        nodes[0].data.space.set(this.getWorldSpace());

        // const edge = new S2LineEdge(this, nodes[0], nodes[1]);
        const edge = new S2CubicEdge(this, nodes[0], nodes[1]);
        edge.setParent(this.getSVG());
        edge.data.stroke.color.copy(MTL.CYAN);
        edge.data.stroke.width.set(4, this.getViewSpace());
        edge.data.startDistance.set(10, this.viewSpace);
        edge.data.endDistance.set(10, this.viewSpace);
        edge.data.pathFrom.set(0);
        edge.data.bendAngle.set(-45);
        // edge.data.startAngle.set(90);
        // edge.data.endAngle.set(-90);
        // edge.data.startTension.set(0.5);
        // edge.data.endTension.set(0.5);
        //edge.createArrowTip();

        this.update();
    }

    computeIntersections() {
        // const cubic1 = this.curve1.data.polyCurve;
        // const cubic2 = this.curve2.data.polyCurve;
        // this.interUtils.setTolerance(1e-2).setMaxDepth(20);
        // const points: CurveIntersection[] = [];
        // let start = performance.now();
        // for (let i = 0; i < 1000; i++) {
        //     this.interUtils.intersectCubicCubic(cubic1, cubic2, points);
        // }
        // let end = performance.now();
        // console.log(`Inter computed ${points.length} intersections in ${end - start} ms`);
        // const ts = [];
        // start = performance.now();
        // // for (let i = 0; i < 1000; i++) {
        // //     ts.push(this.sdfUtils.findPointAtDistance(0, 0, 1));
        // // }
        // end = performance.now();
        // console.log(`SDF computed ${ts.length} points in ${end - start} ms`);
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
