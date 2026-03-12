import { S2Scene } from '../../../src/core/scene/s2-scene.ts';
import { S2StepAnimator } from '../../../src/core/animation/s2-step-animator.ts';
import { DirectedGraph, type VertexId } from '../directed-graph.ts';

import { S2ColorTheme, type S2Palette } from '../../../src/core/shared/s2-color-theme.ts';
import * as radixDark from '../../../src/utils/radix-colors-dark.ts';
import * as radixLight from '../../../src/utils/radix-colors-light.ts';
import { S2PlainNode } from '../../../src/core/element/node/s2-plain-node.ts';
import { S2CubicEdge } from '../../../src/core/element/node/s2-cubic-edge.ts';
import { S2LerpAnimFactory } from '../../../src/core/animation/s2-lerp-anim.ts';
import { ease } from '../../../src/core/animation/s2-easing.ts';
import { S2Code, tokenizeAlgorithm } from '../../../src/core/element/s2-code.ts';
import { S2FontData } from '../../../src/core/element/base/s2-base-data.ts';
import { S2Rect } from '../../../src/core/element/s2-rect.ts';
import { S2TriggerPoint } from '../../../src/core/animation/s2-timeline-trigger.ts';

const dsaturAlgorithm =
    '**kw:tant que** **num:vrai** **kw:faire**\n' +
    '  **type:sommet** **var:u** = **num:indéfini**\n' +
    '  **kw:pour chaque** sommet **var:v** non colorié **kw:faire**\n' +
    '    **kw:si** (**var:u** est **num:indéfini**)\n' +
    '      **kw:ou** (sat[**var:v**] > sat[**var:u**])\n' +
    '      **kw:ou** (sat[**var:v**] = sat[**var:u**] **kw:et** deg[**var:v**] > deg[**var:u**])\n' +
    '      **kw:alors**\n' +
    '      **var:u** = **var:v**\n' +
    '  **kw:si** **var:u** est **num:indéfini** **kw:alors**\n' +
    '    **kw:quitter**\n' +
    '  **var:u**.couleur = plus petite couleur disponible\n' +
    '    dans le voisinage de **var:u**\n' +
    '  **kw:pour** chaque voisin **var:v** de **var:u** **kw:faire**\n' +
    '    mettre à jour sat[**var:v**]';

const mode = 0; // 0 = dark, 1 = light
let palette: S2Palette;
if (mode === 0) {
    palette = {
        back: radixDark.slateDark,
        main: radixDark.cyanDark,
        secondary: radixDark.cyanDark,
        'no-color': radixDark.slateDark,
        'color-0': radixDark.cyanDark,
        'color-1': radixDark.purpleDark,
        'color-2': radixDark.redDark,
        'color-3': radixDark.amberDark,
        'color-4': radixDark.grassDark,
    };
} else {
    palette = {
        back: radixLight.slate,
        main: radixLight.cyan,
        secondary: radixLight.cyan,
        'no-color': radixLight.slate,
        'color-0': radixLight.cyan,
        'color-1': radixLight.purple,
        'color-2': radixLight.red,
        'color-3': radixLight.amber,
        'color-4': radixLight.grass,
    };
}
const colorTheme = new S2ColorTheme(palette);

class VertexData {
    public color: number = -1;
    public saturation: number = 0;

    public node: S2PlainNode;
    public satNode: S2PlainNode;

    constructor(scene: S2Scene) {
        this.node = new S2PlainNode(scene);
        this.node.setParent(scene.getSVG());
        this.satNode = new S2PlainNode(scene);
        this.satNode.setParent(scene.getSVG());
        this.satNode.data.layer.set(4);
    }
}

class EdgeData {
    public edge: S2CubicEdge;
    public from: VertexId;
    public to: VertexId;
    public emphFrom: S2CubicEdge;
    public emphTo: S2CubicEdge;

    constructor(scene: S2Scene, from: VertexId, to: VertexId, nodeFrom: S2PlainNode, nodeTo: S2PlainNode) {
        this.edge = new S2CubicEdge(scene, nodeFrom, nodeTo);
        this.edge.setParent(scene.getSVG());
        this.emphFrom = new S2CubicEdge(scene, nodeFrom, nodeTo);
        this.emphFrom.setParent(scene.getSVG());
        this.emphTo = new S2CubicEdge(scene, nodeTo, nodeFrom);
        this.emphTo.setParent(scene.getSVG());
        this.from = from;
        this.to = to;
    }
}

export class GraphDsaturScene extends S2Scene {
    public animator: S2StepAnimator;

    protected code: S2Code;
    protected graph: DirectedGraph<VertexData, EdgeData>;
    protected nodeCount: number = 7;

    protected showHelperGrid: boolean = false;
    protected edgeEndDistance: number = 15;
    protected panelWidth: number = 7;

    protected colorRects: S2PlainNode[] = [];
    protected uMarker: S2PlainNode;
    protected vMarker: S2PlainNode;
    protected undefinedNode: S2PlainNode;

    constructor(svgElement: SVGSVGElement) {
        super(svgElement);
        this.camera.setExtents(8.0, 4.5);
        this.setViewportSize(640.0 * 1.5, 360.0 * 1.5);
        this.tracePoolAllocations = true;

        this.animator = new S2StepAnimator(this);

        const viewSpace = this.getViewSpace();
        const worldSpace = this.getWorldSpace();

        const fillRect = this.addFillRect();
        fillRect.data.color.setFromTheme(colorTheme, 'back', 2);

        if (this.showHelperGrid) {
            const helperGrid = this.addWorldGrid();
            helperGrid.data.stroke.color.setFromTheme(colorTheme, 'back', 4);
            helperGrid.data.stroke.width.set(2, viewSpace);
            helperGrid.data.geometry.boundA.set(-8, -4.5, worldSpace);
            helperGrid.data.geometry.boundB.set(+8, +4.5, worldSpace);
            helperGrid.data.geometry.space.set(worldSpace);
        }

        const graph = new DirectedGraph<VertexData, EdgeData>();
        this.graph = graph;

        this.createGraph();

        this.code = new S2Code(this);
        this.code.setParent(this.getSVG());

        this.setCodeStyle(this.code);
        this.code.setContent(tokenizeAlgorithm(dsaturAlgorithm));
        this.code.data.anchor.set(-1, 0);
        this.code.data.position.set(-7.5, 0, worldSpace);

        this.update();
        this.createColorPanel();

        this.uMarker = this.createMarker();
        this.vMarker = this.createMarker();
        this.uMarker.addState('u');
        this.vMarker.addState('v');

        this.undefinedNode = new S2PlainNode(this);
        this.undefinedNode.setParent(this.getSVG());
        this.undefinedNode.addState('indéfini');
        this.undefinedNode.data.background.shape.set('rectangle');
        this.undefinedNode.data.background.fill.color.setFromTheme(colorTheme, 'back', 5);
        this.undefinedNode.data.position.set(1.0, 3.4, worldSpace);

        this.update();
        this.createAnimation();
        this.animator.setMasterElapsed(0);
        this.update();
    }

    createMarker(): S2PlainNode {
        const marker = new S2PlainNode(this);
        marker.setParent(this.getSVG());
        marker.data.layer.set(5);
        marker.data.background.shape.set('circle');
        marker.data.background.fill.color.setFromTheme(colorTheme, 'main', 8);
        //marker.data.background.stroke.color.setFromTheme(colorTheme, 'main', 8);
        marker.data.background.stroke.width.set(0, this.getViewSpace());
        marker.data.minExtents.set(0.2, 0.2, this.getWorldSpace());
        marker.data.padding.set(0, 0, this.getViewSpace());
        marker.data.text.font.size.set(12, this.getViewSpace());
        marker.data.text.fill.color.setFromTheme(colorTheme, 'main', 12);
        return marker;
    }

    setDefaultFont(data: S2FontData): void {
        data.family.set('monospace');
        data.size.set(14, this.getViewSpace());
        data.relativeLineHeight.set(1.3);
    }

    setCodeStyle(code: S2Code): void {
        const viewSpace = this.getViewSpace();
        const worldSpace = this.getWorldSpace();
        this.setDefaultFont(code.data.text.font);
        code.data.text.fill.color.setFromTheme(colorTheme, 'back', 12);
        code.data.padding.set(20, 10, viewSpace);
        code.data.minExtents.set(this.panelWidth / 2, 0, worldSpace);
        code.data.background.fill.color.setFromTheme(colorTheme, 'back', 3);
        code.data.background.stroke.color.setFromTheme(colorTheme, 'back', 8);
        code.data.background.stroke.width.set(2, viewSpace);
        code.data.background.cornerRadius.set(10, viewSpace);
        code.data.currentLine.opacity.set(1);
        code.data.currentLine.fill.color.setFromTheme(colorTheme, 'back', 1);
        code.data.currentLine.fill.opacity.set(0.5);
        code.data.currentLine.stroke.color.setFromTheme(colorTheme, 'back', 12);
        code.data.currentLine.stroke.width.set(1, viewSpace);
        code.data.currentLine.stroke.opacity.set(0.2);
        code.data.currentLine.padding.set(-0.5, 2, viewSpace);
        code.data.currentLine.index.set(0);
    }

    setVertexStyle(vertex: VertexData): void {
        const worldSpace = this.getWorldSpace();
        const nodeData = vertex.node.data;
        nodeData.space.set(worldSpace);
        nodeData.layer.set(3);
        nodeData.padding.set(5, 5, this.viewSpace);
        nodeData.anchor.set(0, 0);
        nodeData.background.fill.color.setFromTheme(colorTheme, 'back', 3);
        nodeData.background.stroke.color.setFromTheme(colorTheme, 'back', 8);
        nodeData.background.stroke.width.set(4, this.viewSpace);
        nodeData.background.fill.opacity.set(1.0);
        nodeData.minExtents.set(0.5, 0.5, worldSpace);
        nodeData.text.horizontalAlign.set(0);
        nodeData.text.verticalAlign.set(0);
        nodeData.text.fill.color.setFromTheme(colorTheme, 'back', 12);
        nodeData.text.font.size.set(24, this.getViewSpace());
        nodeData.background.shape.set('circle');

        const satData = vertex.satNode.data;
        satData.layer.set(4);
        satData.padding.set(5, 5, this.viewSpace);
        satData.anchor.set(0, 0);
        satData.background.fill.color.setFromTheme(colorTheme, 'back', 4);
        satData.background.stroke.width.set(0, this.viewSpace);
        satData.background.fill.opacity.set(1.0);
        satData.background.shape.set('circle');
        satData.minExtents.set(0.25, 0.25, worldSpace);
        satData.text.horizontalAlign.set(0);
        satData.text.verticalAlign.set(0);
        satData.text.fill.color.setFromTheme(colorTheme, 'back', 12);
        satData.text.font.size.set(16, this.getViewSpace());
    }

    setEdgeStyle(edge: EdgeData): void {
        const edgeData = edge.edge.data;
        edgeData.stroke.color.setFromTheme(colorTheme, 'back', 7);
        edgeData.stroke.width.set(4, this.getViewSpace());
        edgeData.startDistance.set(0, this.viewSpace);
        edgeData.endDistance.set(0, this.viewSpace);
        edgeData.pathFrom.set(0);
        edgeData.layer.set(1);

        for (const emphEdge of [edge.emphFrom, edge.emphTo]) {
            const emphData = emphEdge.data;
            emphData.stroke.color.setFromTheme(colorTheme, 'back', 12);
            emphData.stroke.width.set(6, this.getViewSpace());
            emphData.startDistance.set(0, this.viewSpace);
            emphData.endDistance.set(0, this.viewSpace);
            emphData.pathFrom.set(0);
            emphData.pathTo.set(0);
            emphData.layer.set(2);
        }
    }

    createGraph(): void {
        this.graph.clearEdges();
        const nodes: S2PlainNode[] = [];
        const verticesData: VertexData[] = [];
        for (let i = 0; i < this.nodeCount; i++) {
            const vertexData = new VertexData(this);
            this.setVertexStyle(vertexData);
            const node = vertexData.node;
            nodes.push(node);
            node.addState(i.toString());
            verticesData.push(vertexData);
            this.graph.addVertex(i.toString(), vertexData);
        }

        const worldSpace = this.getWorldSpace();
        const radius = 2.5;
        const d = 0.9;
        const shiftX = 3.2;
        const vec = this.acquireVec2();
        for (let i = 0; i < 6; i++) {
            const vertexData = verticesData[i];

            vec.setPolar(90 - i * 60, radius, 'deg');
            vec.add(shiftX, 0);
            vertexData.node.data.position.setV(vec, worldSpace);

            vec.setPolar(90 - i * 60, radius + d, 'deg');
            vec.add(shiftX, 0);
            vertexData.satNode.data.position.setV(vec, worldSpace);
        }
        {
            const vertexData = verticesData[6];
            vertexData.node.data.position.set(shiftX, 0, worldSpace);
            vec.setPolar(30, d, 'deg');
            vec.add(shiftX, 0);
            vertexData.satNode.data.position.setV(vec, worldSpace);
        }

        this.releaseVec2(vec);

        const edgesInfo = [
            { from: 0, to: 1 },
            { from: 0, to: 4 },
            { from: 0, to: 5 },
            { from: 0, to: 6 },
            { from: 1, to: 2 },
            { from: 1, to: 3 },
            { from: 1, to: 5 },
            { from: 2, to: 4 },
            { from: 2, to: 6 },
            { from: 3, to: 5 },
        ];
        const edgeDataArray: EdgeData[] = [];
        for (const edgeInfo of edgesInfo) {
            const from = edgeInfo.from.toString();
            const to = edgeInfo.to.toString();
            const edgeData = new EdgeData(this, from, to, nodes[edgeInfo.from], nodes[edgeInfo.to]);
            this.setEdgeStyle(edgeData);
            edgeDataArray.push(edgeData);
        }
        for (const edgeData of edgeDataArray) {
            this.graph.setEdge(edgeData.from, edgeData.to, edgeData);
            this.graph.setEdge(edgeData.to, edgeData.from, edgeData);
        }
        this.update();
    }

    createColorPanel(): void {
        // TODO
        const viewSpace = this.getViewSpace();
        const worldSpace = this.getWorldSpace();
        const colorCount = 5;
        const position = this.acquireVec2();
        const sep = 0.2;

        const paddingX = viewSpace.convertLength(10, worldSpace);
        const paddingY = viewSpace.convertLength(10, worldSpace);
        const colorRectHeight = 0.5;
        const colorRectWidth = (this.panelWidth - paddingX * (colorCount + 1)) / colorCount;
        const panelHeight = colorRectHeight + paddingY * 2;

        const colorPanel = new S2Rect(this);
        colorPanel.setParent(this.getSVG());

        this.code.getRectPointInto(position, this.getWorldSpace(), 0, 1);
        position.y += sep;

        colorPanel.data.position.setV(position, this.getWorldSpace());
        colorPanel.data.anchor.set(0, -1);
        colorPanel.data.extents.set(this.panelWidth / 2, panelHeight / 2, this.getWorldSpace());
        colorPanel.data.cornerRadius.set(10, this.getViewSpace());
        colorPanel.data.fill.color.setFromTheme(colorTheme, 'back', 3);
        colorPanel.data.stroke.color.setFromTheme(colorTheme, 'back', 8);
        colorPanel.data.stroke.width.set(2, this.getViewSpace());
        this.update();

        const colors = ['color-0', 'color-1', 'color-2', 'color-3', 'color-4', 'color-5'];
        const colorStrings = ['0', '1', '2', '3', '4'];

        for (let i = 0; i < colorCount; i++) {
            const colorRect = new S2PlainNode(this);
            colorRect.setParent(this.getSVG());

            colorPanel.getRectPointInto(position, worldSpace, -1, 1);
            position.x += paddingX + i * (colorRectWidth + paddingX);
            position.y -= paddingY;

            colorRect.data.position.setV(position, worldSpace);
            colorRect.data.anchor.set(-1, 1);
            colorRect.data.minExtents.set(colorRectWidth / 2, colorRectHeight / 2, worldSpace);
            colorRect.data.background.fill.color.setFromTheme(colorTheme, colors[i], 5);
            colorRect.data.background.stroke.color.setFromTheme(colorTheme, colors[i], 9);
            colorRect.data.text.fill.color.setFromTheme(colorTheme, colors[i], 12);
            colorRect.data.background.stroke.width.set(2, this.getViewSpace());
            colorRect.data.background.cornerRadius.set(5, this.getViewSpace());
            colorRect.addState(colorStrings[i]);
            colorRect.addState('X');
            const state = colorRect.getState(colorRect.getStateCount() - 1);
            this.animator.enableElement(state, false);
            // state.data.opacity.set(0.1);

            this.colorRects.push(colorRect);
        }
        this.releaseVec2(position);
    }

    createAnimation(): void {
        const ids = this.graph.getVertices();
        for (const id of ids) {
            const vertexData = this.graph.getVertex(id);
            vertexData.color = -1;
            vertexData.saturation = 0;
            vertexData.satNode.addState('0');
        }

        this.animateCodeLine(0);
        this.animator.makeStep();

        this.uMarker.data.position.set(1.0, 3.5, this.getWorldSpace());
        let label = '';

        while (true) {
            label = this.animator.createLabelAtCurrentTime();
            this.animateCodeLine(1, { timeLabel: label });
            this.animateMarker(this.uMarker, this.undefinedNode, 'fade-in', {
                timeLabel: label,
                anchorX: 0,
                anchorY: -1.5,
            });
            this.animator.makeStep();

            let idU = '';
            let vertexU = null;
            let idEmphU: VertexId | null = null;
            let idEmphV: VertexId | null = null;
            let targetNodeV = this.undefinedNode;

            for (const idV of ids) {
                const vertexV = this.graph.getVertex(idV);
                if (vertexV.color !== -1) continue;

                targetNodeV = vertexV.node;

                this.animateCodeLine(2);
                label = this.animator.createLabelAtCurrentTime();
                this.animateMarker(this.vMarker, targetNodeV, idEmphV === null ? 'fade-in' : 'move', {
                    timeLabel: label,
                    anchorX: 1,
                    anchorY: 0,
                });
                if (idEmphV !== null && idEmphV !== idEmphU) {
                    this.animateSearch(idEmphV, 'end', { timeLabel: label });
                    this.animateSearch(idV, 'start', { timeLabel: label });
                } else {
                    this.animateSearch(idV, 'start', { timeLabel: label });
                }
                this.animator.makeStep();
                idEmphV = idV;

                this.animateCodeLine(3, { lineSpan: 3 });
                this.animator.makeStep();
                if (
                    vertexU === null ||
                    vertexV.saturation > vertexU.saturation ||
                    (vertexV.saturation === vertexU.saturation &&
                        this.graph.edgesOf(idV).length > this.graph.edgesOf(idU).length)
                ) {
                    idU = idV;
                    vertexU = vertexV;
                    this.animateCodeLine(7);
                    this.animateMarker(this.uMarker, vertexV.node, 'move', {
                        anchorX: -1,
                        anchorY: 0,
                    });

                    label = this.animator.createLabelAtCurrentTime();
                    if (idEmphU) {
                        this.animateSearch(idEmphU, 'end', { timeLabel: label });
                    }
                    idEmphU = idU;

                    // this.animateSearch(id, 'start');
                    this.animator.makeStep();
                    continue;
                }
            }

            label = this.animator.createLabelAtCurrentTime();
            this.animateCodeLine(2, { timeLabel: label });
            this.animateMarker(this.vMarker, targetNodeV, 'fade-out', {
                timeLabel: label,
                anchorX: 1,
                anchorY: 0,
            });
            if (idEmphV !== null && idEmphV !== idEmphU) {
                this.animateSearch(idEmphV, 'end', { timeLabel: label });
                this.animator.makeStep();
            }
            this.animator.makeStep();

            label = this.animator.createLabelAtCurrentTime();
            this.animateCodeLine(8, { timeLabel: label });
            this.animator.makeStep();

            if (vertexU === null) {
                label = this.animator.createLabelAtCurrentTime();
                this.animateCodeLine(9, { timeLabel: label });
                this.animator.makeStep();
                break;
            }

            label = this.animator.createLabelAtCurrentTime();
            this.animateCodeLine(10, { lineSpan: 2, timeLabel: label });
            this.animator.makeStep();

            label = this.animator.createLabelAtCurrentTime();
            this.animateShowColors(idU, 'start', { timeLabel: label });
            this.animator.makeStep();

            vertexU.color = 0;
            label = this.animator.createLabelAtCurrentTime();
            this.animateSetColor(idU, vertexU.color, { timeLabel: label });
            this.animateShowColors(idU, 'end', { timeLabel: label });
            this.animator.makeStep();

            idEmphV = null;
            for (const edge of this.graph.edgesOf(idU)) {
                const idV = edge.to;
                const vertexV = this.graph.getVertex(idV);
                if (vertexV.color !== -1) continue;

                label = this.animator.createLabelAtCurrentTime();
                this.animateCodeLine(12, { timeLabel: label });
                this.animateShowColors(idV, 'start', { timeLabel: label });
                this.animateMarker(this.vMarker, vertexV.node, idEmphV === null ? 'fade-in' : 'move', {
                    timeLabel: label,
                    anchorX: 1,
                    anchorY: 0,
                });
                this.animator.makeStep();
                idEmphV = idV;

                label = this.animator.createLabelAtCurrentTime();
                this.animateShowColors(idV, 'end', { timeLabel: label });
                this.animator.makeStep();
                idEmphV = idV;
            }

            break;
        }

        this.update();
    }

    animateSearchChangeVertex(vertex: VertexData, options: { first?: boolean; label?: string } = {}): void {
        const first = options.first ?? false;
        const cycleDuration = 500;
        const position = this.acquireVec2();
        const label = this.animator.ensureLabel(options.label);
        if (first) {
            this.vMarker.data.text.opacity.set(0);
            this.vMarker.data.background.opacity.set(0);
            const animOpacity1 = S2LerpAnimFactory.create(this, this.vMarker.data.text.opacity)
                .setCycleDuration(cycleDuration)
                .setEasing(ease.out);
            const animOpacity2 = S2LerpAnimFactory.create(this, this.vMarker.data.background.opacity)
                .setCycleDuration(cycleDuration)
                .setEasing(ease.out);
            vertex.node.getRectPointInto(position, this.getWorldSpace(), 1, 0);
            this.vMarker.data.position.setV(position, this.getWorldSpace());
            this.vMarker.data.text.opacity.set(1);
            this.vMarker.data.background.opacity.set(1);
            this.animator.addAnimation(animOpacity1.commitFinalState(), label, 0);
            this.animator.addAnimation(animOpacity2.commitFinalState(), label, 0);
        } else {
            const animPosition = S2LerpAnimFactory.create(this, this.vMarker.data.position)
                .setCycleDuration(cycleDuration)
                .setEasing(ease.out);
            vertex.node.getRectPointInto(position, this.getWorldSpace(), 1, 0);
            this.vMarker.data.position.setV(position, this.getWorldSpace());
            this.animator.addAnimation(animPosition.commitFinalState(), label, 0);
        }
        this.releaseVec2(position);
    }

    animateMarker(
        marker: S2PlainNode,
        target: S2PlainNode,
        animationType: 'fade-in' | 'move' | 'fade-out',
        options: { timeLabel?: string; anchorX?: number; anchorY?: number } = {},
    ): void {
        const cycleDuration = 500;
        const timeLabel = this.animator.ensureLabel(options.timeLabel);
        const anchorX = options.anchorX ?? 1;
        const anchorY = options.anchorY ?? 0;
        const position = this.acquireVec2();
        target.getRectPointInto(position, this.getWorldSpace(), anchorX, anchorY);
        const opacity0 = animationType === 'fade-in' ? 0 : 1;
        const opacity1 = animationType === 'fade-in' ? 1 : 0;
        if (animationType === 'move') {
            const animPosition = S2LerpAnimFactory.create(this, marker.data.position)
                .setCycleDuration(cycleDuration)
                .setEasing(ease.out);
            marker.data.position.setV(position, this.getWorldSpace());
            this.animator.addAnimation(animPosition.commitFinalState(), timeLabel, 0);
        } else {
            marker.data.text.opacity.set(opacity0);
            marker.data.background.opacity.set(opacity0);
            const animTextOpacity = S2LerpAnimFactory.create(this, marker.data.text.opacity)
                .setCycleDuration(cycleDuration)
                .setEasing(ease.out);
            const animBackOpacity = S2LerpAnimFactory.create(this, marker.data.background.opacity)
                .setCycleDuration(cycleDuration)
                .setEasing(ease.out);
            marker.data.position.setV(position, this.getWorldSpace());
            marker.data.text.opacity.set(opacity1);
            marker.data.background.opacity.set(opacity1);
            this.animator.addAnimation(animTextOpacity.commitFinalState(), timeLabel, 0);
            this.animator.addAnimation(animBackOpacity.commitFinalState(), timeLabel, 0);
            this.animator.addTrigger(
                new S2TriggerPoint(marker.data.position, position, this.getWorldSpace()),
                timeLabel,
                0,
            );
        }
        this.releaseVec2(position);
    }

    animateSearch(vertexId: VertexId, type: 'start' | 'end', options: { timeLabel?: string } = {}): void {
        const vertexData = this.graph.getVertex(vertexId);
        const timeLabel = this.animator.ensureLabel(options.timeLabel);
        const cycleDuration = 250;
        for (const edge of this.graph.edgesOf(vertexId)) {
            console.log(vertexId, edge.to);
            const emphEdge = edge.data.from === vertexId ? edge.data.emphFrom : edge.data.emphTo;
            const animPath = S2LerpAnimFactory.create(this, emphEdge.data.pathTo)
                .setCycleDuration(cycleDuration)
                .setEasing(ease.inOut);
            if (type === 'start') {
                const t = 0.5 / edge.data.edge.getLength();
                console.log(emphEdge.getLength());
                emphEdge.data.pathTo.set(t);
            } else {
                emphEdge.data.pathTo.set(0.0);
            }
            this.animator.addAnimation(animPath.commitFinalState(), timeLabel, 0);
        }

        const colorName = type === 'start' ? 'main' : 'back';
        const animFill = S2LerpAnimFactory.create(this, vertexData.satNode.data.background.fill.color)
            .setCycleDuration(cycleDuration)
            .setEasing(ease.out);
        vertexData.satNode.data.background.fill.color.setFromTheme(colorTheme, colorName, 5);
        this.animator.addAnimation(animFill.commitFinalState(), timeLabel, 0);
    }

    animateShowColors(vertexId: VertexId, type: 'start' | 'end', options: { timeLabel?: string } = {}): void {
        const vertexData = this.graph.getVertex(vertexId);
        const timeLabel = this.animator.ensureLabel(options.timeLabel);
        const cycleDuration = 250;
        const usedColors = [false, false, false, false, false];
        for (const edge of this.graph.edgesOf(vertexId)) {
            console.log(vertexId, edge.to);
            const emphEdge = edge.data.from === vertexId ? edge.data.emphFrom : edge.data.emphTo;
            const targetData = this.graph.getVertex(edge.to);
            const animPath = S2LerpAnimFactory.create(this, emphEdge.data.pathTo)
                .setCycleDuration(cycleDuration)
                .setEasing(ease.inOut);
            const colorAnim = S2LerpAnimFactory.create(this, emphEdge.data.stroke.color)
                .setCycleDuration(cycleDuration)
                .setEasing(ease.inOut);
            if (type === 'start') {
                emphEdge.data.pathTo.set(1.0);
                if (targetData.color >= 0) {
                    emphEdge.data.stroke.color.setFromTheme(colorTheme, `color-${targetData.color}`, 10);
                    usedColors[targetData.color] = true;
                } else {
                    emphEdge.data.stroke.color.setFromTheme(colorTheme, 'no-color', 11);
                }
            } else {
                emphEdge.data.pathTo.set(0.0);
                emphEdge.data.stroke.color.setFromTheme(colorTheme, 'no-color', 12);
            }
            this.animator.addAnimation(animPath.commitFinalState(), timeLabel, 0);
            this.animator.addAnimation(colorAnim.commitFinalState(), timeLabel, 0);
        }

        for (let i = 0; i < usedColors.length; i++) {
            if (usedColors[i] == false) continue;
            if (type === 'start') {
                this.colorRects[i].animateChangeState(1, this.animator, {
                    label: timeLabel,
                    duration: cycleDuration,
                });
            } else {
                this.colorRects[i].animateChangeState(0, this.animator, {
                    label: timeLabel,
                    duration: cycleDuration,
                });
            }
        }
    }

    animateSetColor(vertexId: VertexId, color: number, options: { timeLabel?: string } = {}): void {
        const vertexData = this.graph.getVertex(vertexId);
        const timeLabel = this.animator.ensureLabel(options.timeLabel);
        const cycleDuration = 250;
        const colorName = color === -1 ? 'no-color' : `color-${color}`;
        const animFill = S2LerpAnimFactory.create(this, vertexData.node.data.background.fill.color)
            .setCycleDuration(cycleDuration)
            .setEasing(ease.out);
        vertexData.node.data.background.fill.color.setFromTheme(colorTheme, colorName, 5);
        this.animator.addAnimation(animFill.commitFinalState(), timeLabel, 0);

        const animText = S2LerpAnimFactory.create(this, vertexData.node.data.text.fill.color)
            .setCycleDuration(cycleDuration)
            .setEasing(ease.out);
        vertexData.node.data.text.fill.color.setFromTheme(colorTheme, colorName, 12);
        this.animator.addAnimation(animText.commitFinalState(), timeLabel, 0);

        const animStroke = S2LerpAnimFactory.create(this, vertexData.node.data.background.stroke.color)
            .setCycleDuration(cycleDuration)
            .setEasing(ease.out);
        vertexData.node.data.background.stroke.color.setFromTheme(colorTheme, colorName, 8);
        this.animator.addAnimation(animStroke.commitFinalState(), timeLabel, 0);
    }

    animateEmphSaturation(vertex: VertexData, type: 'start' | 'end', options: { timeLabel?: string } = {}): void {
        const cycleDuration = 200;
        const timeLabel = this.animator.ensureLabel(options.timeLabel);
        const colorName = type === 'start' ? 'main' : 'back';
        const animFill = S2LerpAnimFactory.create(this, vertex.satNode.data.background.fill.color)
            .setCycleDuration(cycleDuration)
            .setEasing(ease.out);
        vertex.satNode.data.background.fill.color.setFromTheme(colorTheme, colorName, 5);
        this.animator.addAnimation(animFill.commitFinalState(), timeLabel, 0);
    }

    animateEmphEdge(
        vertexId: VertexId,
        edge: EdgeData,
        type: 'start' | 'end',
        options: { timeLabel?: string } = {},
    ): void {
        const cycleDuration = 250;
        const timeLabel = this.animator.ensureLabel(options.timeLabel);
        const emphEdge = edge.from === vertexId ? edge.emphFrom : edge.emphTo;
        const animPath = S2LerpAnimFactory.create(this, emphEdge.data.pathTo)
            .setCycleDuration(cycleDuration)
            .setEasing(ease.inOut);
        if (type === 'start') {
            const t = 0.5 / edge.edge.getLength();
            console.log(emphEdge.getLength());
            emphEdge.data.pathTo.set(t);
        } else {
            emphEdge.data.pathTo.set(0.0);
        }
        this.animator.addAnimation(animPath.commitFinalState(), timeLabel, 0);
    }

    animateCodeLine(lineIndex: number, options: { timeLabel?: string; lineSpan?: number } = {}): void {
        const timeLabel = this.animator.ensureLabel(options.timeLabel);
        const lineSpan = options.lineSpan ?? 1;
        const code = this.code;
        const animIndex = S2LerpAnimFactory.create(this, code.data.currentLine.index)
            .setCycleDuration(500)
            .setEasing(ease.inOut);
        const animSpan = S2LerpAnimFactory.create(this, code.data.currentLine.span)
            .setCycleDuration(500)
            .setEasing(ease.inOut);
        code.data.currentLine.index.set(lineIndex);
        code.data.currentLine.span.set(lineSpan);
        this.animator.addAnimation(animIndex.commitFinalState(), timeLabel, 0);
        this.animator.addAnimation(animSpan.commitFinalState(), timeLabel, 0);
    }
}
