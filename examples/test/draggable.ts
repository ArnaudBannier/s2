import type { S2Space } from '../../src/core/math/s2-space.ts';
import { S2Scene } from '../../src/core/scene/s2-scene.ts';
import { S2Grid } from '../../src/core/element/s2-grid.ts';
import { S2Line } from '../../src/core/element/s2-line.ts';
import { S2PlainNode } from '../../src/core/element/node/s2-plain-node.ts';
import { S2CubicEdge } from '../../src/core/element/node/s2-cubic-edge.ts';
//import { S2DraggableCircle } from '../../src/core/element/draggable/s2-draggable-circle.ts';
import { S2DraggableContainerBox } from '../../src/core/element/draggable/s2-draggable-container-box.ts';
import { S2DraggableRect } from '../../src/core/element/draggable/s2-draggable-rect.ts';

import { S2ColorTheme, type S2HexColor, type S2Palette } from '../../src/core/shared/s2-color-theme.ts';
import { slateDark, cyanDark, rubyDark, redDark, grassDark } from '../../src/utils/radix-colors-dark.ts';
import { slate, cyan, ruby, red, grass } from '../../src/utils/radix-colors-light.ts';

const titleString = 'Test des éléments déplaçables';

const mode = 0; // 0 = dark, 1 = light
let palette: S2Palette;
if (mode === 0) {
    palette = {
        text: slateDark,
        back: slateDark,
        primary: cyanDark,
        secondary: rubyDark,
        vecX: redDark,
        vecY: grassDark,
    };
} else {
    palette = {
        text: slate,
        back: slate,
        primary: cyan,
        secondary: ruby,
        vecX: red,
        vecY: grass,
    };
}
const colorTheme = new S2ColorTheme(palette);

class SceneFigure extends S2Scene {
    setNodeDefaultStyle(node: S2PlainNode): void {
        const viewSpace = this.getViewSpace();
        const worldSpace = this.getWorldSpace();
        const data = node.data;
        data.layer.set(1);
        data.space.set(viewSpace);
        data.padding.set(5, 5, viewSpace);
        data.anchor.set(0, 0);
        data.background.fill.color.setFromTheme(colorTheme, 'primary', 6);
        //data.background.fill.opacity.set(0.5);
        data.minExtents.set(1, 0.5, worldSpace);
        data.text.horizontalAlign.set(0);
        data.text.verticalAlign.set(0);
        data.text.fill.color.setFromTheme(colorTheme, 'text', 12);
        data.text.font.size.set(24, viewSpace);
        data.background.cornerRadius.set(0.5, worldSpace);
        data.background.shape.set('rectangle');
    }

    setEdgeDefaultStyle(edge: S2CubicEdge): void {
        const viewSpace = this.getViewSpace();
        const data = edge.data;
        data.stroke.color.setFromTheme(colorTheme, 'primary', 10);
        data.stroke.width.set(4, viewSpace);
        data.startDistance.set(0, viewSpace);
        data.endDistance.set(10, viewSpace);
        data.pathFrom.set(0);
        data.bendAngle.set(15);
    }

    constructor(svgElement: SVGSVGElement) {
        super(svgElement);
        const worldSpace = this.getWorldSpace();
        this.camera.setExtents(8.0, 4.5);
        this.camera.setRotationDeg(0);
        this.camera.setZoom(1);
        this.setViewportSize(640.0 * 1.5, 360.0 * 1.5);

        const fillRect = this.addFillRect();
        fillRect.data.color.setFromTheme(colorTheme, 'back', 2);

        this.showSpace(
            worldSpace,
            8,
            colorTheme.color('back', 4),
            colorTheme.color('vecX', 9),
            colorTheme.color('vecY', 9),
        );

        const nodeCount = 6;
        const nodes: S2PlainNode[] = [];
        for (let i = 0; i < nodeCount; i++) {
            const node = new S2PlainNode(this);
            node.setParent(this.getSVG());
            this.setNodeDefaultStyle(node);
            node.data.position.value.setPolar((i / nodeCount) * Math.PI * 2, 3);
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
                this.setEdgeDefaultStyle(edge);
                edge.createArrowTip();
            }
        }

        const draggableContainer = new S2DraggableContainerBox(this);
        draggableContainer.data.boundA.set(-6, -4, worldSpace);
        draggableContainer.data.boundB.set(+6, +4, worldSpace);
        draggableContainer.data.space.set(worldSpace);

        for (let i = 0; i < nodeCount; i++) {
            // const draggable = new S2DraggableCircle(this);
            // draggable.data.snapMode.set('none');
            // draggable.setContainer(draggableContainer);
            // draggable.setParent(this.getSVG());
            // draggable.data.radius.set(1, worldSpace);

            const draggable = new S2DraggableRect(this);
            draggable.data.snapMode.set('release');
            draggable.data.extents.set(1.0 + 0.1, 0.5 + 0.1, worldSpace);
            draggable.data.cornerRadius.set(0.6, worldSpace);
            draggable.data.anchor.set(0, 0);
            draggable.setContainer(draggableContainer);
            draggable.setParent(this.getSVG());
            //draggable.data.radius.set(1, worldSpace);

            const target = draggable.attachTarget(nodes[i].data.position);
            target.snapMode.set('none');
            target.animatable.setDuration(500);
        }

        this.update();
    }

    showSpace(
        space: S2Space,
        gridSize: number,
        gridColor: S2HexColor,
        vecXColor: S2HexColor,
        vecYColor: S2HexColor,
    ): void {
        const grid = new S2Grid(this);
        grid.setParent(this.getSVG());
        grid.data.stroke.color.setFromHex(gridColor);
        grid.data.geometry.boundA.set(-gridSize, -gridSize, space);
        grid.data.geometry.boundB.set(+gridSize, +gridSize, space);
        grid.data.geometry.steps.set(1, 1, space);
        grid.data.geometry.referencePoint.set(0, 0, space);
        grid.data.geometry.space.set(space);

        const e0 = new S2Line(this);
        e0.setParent(this.getSVG());
        e0.data.stroke.color.setFromHex(vecXColor);
        e0.data.stroke.width.set(4, this.getViewSpace());
        e0.data.startPosition.set(0, 0, space);
        e0.data.endPosition.set(1, 0, space);
        e0.data.endPadding.set(5, this.getViewSpace());
        e0.createArrowTip().setAnchorAlignment(-1);

        const e1 = new S2Line(this);
        e1.setParent(this.getSVG());
        e1.data.stroke.color.setFromHex(vecYColor);
        e1.data.stroke.width.set(4, this.getViewSpace());
        e1.data.startPosition.set(0, 0, space);
        e1.data.endPosition.set(0, 1, space);
        e1.data.endPadding.set(5, this.getViewSpace());
        e1.createArrowTip().setAnchorAlignment(-1);
    }
}

const appDiv = document.querySelector<HTMLDivElement>('#app');
if (appDiv) {
    appDiv.innerHTML = `
        <div>
            <h1>${titleString}</h1>
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
