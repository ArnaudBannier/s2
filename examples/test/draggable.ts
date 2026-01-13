import type { S2Space } from '../../src/core/math/s2-space.ts';
import { MTL } from '../../src/utils/mtl-colors.ts';
import { S2Scene } from '../../src/core/scene/s2-scene.ts';
import { S2Grid } from '../../src/core/element/s2-grid.ts';
import { S2Line } from '../../src/core/element/s2-line.ts';
import { S2Color } from '../../src/core/shared/s2-color.ts';
import { S2Circle } from '../../src/core/element/s2-circle.ts';
import { S2PlainNode } from '../../src/core/element/node/s2-plain-node.ts';
import { S2CubicEdge } from '../../src/core/element/node/s2-cubic-edge.ts';
import { S2DraggableCircle } from '../../src/core/element/draggable/s2-draggable-circle.ts';
import { S2DraggableContainerBox } from '../../src/core/element/draggable/s2-draggable-container-box.ts';

class SceneFigure extends S2Scene {
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

        const nodeCount = 6;
        const nodes: S2PlainNode[] = [];
        for (let i = 0; i < nodeCount; i++) {
            const node = new S2PlainNode(this);
            node.setParent(this.getSVG());
            node.data.layer.set(1);
            node.data.position.set(0, 0, worldSpace);
            node.data.position.value.setPolar((i / nodeCount) * Math.PI * 2, 3);
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
            node.setContent('node ' + (i + 1));
            nodes.push(node);
        }
        this.update();

        for (let i = 0; i < nodeCount; i++) {
            for (let j = 0; j < nodeCount; j++) {
                if (i === j) continue;
                if (Math.random() > 0.5) continue;
                const edge = new S2CubicEdge(this, nodes[i], nodes[j]);
                edge.setParent(this.getSVG());
                edge.data.stroke.color.copy(MTL.CYAN);
                edge.data.stroke.width.set(4, this.getViewSpace());
                edge.data.startDistance.set(0, this.viewSpace);
                edge.data.endDistance.set(10, this.viewSpace);
                edge.data.pathFrom.set(0);
                edge.data.bendAngle.set(15);
                edge.createArrowTip();
            }
        }

        const draggableContainer = new S2DraggableContainerBox(this);
        draggableContainer.data.boundA.set(-6, -4, worldSpace);
        draggableContainer.data.boundB.set(+6, +4, worldSpace);
        draggableContainer.data.space.set(worldSpace);

        for (let i = 0; i < nodeCount; i++) {
            const draggable = new S2DraggableCircle(this);
            draggable.setSnapMode('none');
            draggable.setContainer(draggableContainer);
            draggable.setParent(this.getSVG());
            draggable.data.radius.set(1, worldSpace);
            const target = draggable.attachTarget(nodes[i].data.position);
            target.setSnapMode('none');
            target.animatable.setDuration(500);
        }

        this.update();
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
    });
}
