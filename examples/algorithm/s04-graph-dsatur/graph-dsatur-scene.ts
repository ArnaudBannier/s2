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
import type { S2Circle } from '../../../src/core/element/s2-circle.ts';
import { S2TipTransform } from '../../../src/core/shared/s2-globals.ts';
import { S2Code, tokenizeAlgorithm } from '../../../src/core/element/s2-code.ts';
import { S2FontData } from '../../../src/core/element/base/s2-base-data.ts';
import { S2Rect } from '../../../src/core/element/s2-rect.ts';

const dsaturAlgorithm =
    '**kw:tant que** **num:vrai** **kw:faire**\n' +
    '  **type:noeud** **var:n** = **num:null**\n' +
    '  **kw:pour chaque** noeud **var:v** non colorié **kw:faire**\n' +
    '    **kw:si** **var:n** = **num:null** **kw:alors**\n' +
    '      **var:n** = **var:v**\n' +
    '    **kw:sinon si** sat[**var:v**] > sat[**var:n**] **kw:alors**\n' +
    '      **var:n** = **var:v**\n' +
    '    **kw:sinon si** sat[**var:v**] = sat[**var:n**] et\n' +
    '      deg[**var:v**] > deg[**var:n**] **kw:alors**\n' +
    '      **var:n** = **var:v**\n' +
    '  **kw:si** **var:n** = **num:null** **kw:quitter**\n' +
    '  **var:n**.couleur = plus petite couleur disponible\n' +
    '    dans le voisinage de **var:n**\n' +
    '  **kw:pour** chaque voisin **var:v** de **var:n** **kw:faire**\n' +
    '    mettre à jour sat[**var:v**]';

const mode = 0; // 0 = dark, 1 = light
let palette: S2Palette;
if (mode === 0) {
    palette = {
        back: radixDark.slateDark,
        main: radixDark.cyanDark,
        secondary: radixDark.cyanDark,
        temp: radixDark.rubyDark,
        color1: radixDark.cyanDark,
        color2: radixDark.rubyDark,
        color3: radixDark.greenDark,
        color4: radixDark.yellowDark,
        color5: radixDark.orangeDark,
        color6: radixDark.pinkDark,
    };
} else {
    palette = {
        back: radixLight.slate,
        main: radixLight.cyan,
        secondary: radixLight.cyan,
        temp: radixLight.ruby,
    };
}
const colorTheme = new S2ColorTheme(palette);

class VertexData {
    public visited: boolean = false;
    public prevId: VertexId | null = null;
    public distance: number = Infinity;

    public prevCircle: S2Circle;
    public node: S2PlainNode;
    public satNode: S2PlainNode;

    constructor(scene: S2Scene) {
        this.node = new S2PlainNode(scene);
        this.node.setParent(scene.getSVG());
        this.satNode = new S2PlainNode(scene);
        this.satNode.setParent(scene.getSVG());
        this.satNode.data.layer.set(4);
        this.prevCircle = scene.addCircle();
        this.prevCircle.setParent(scene.getSVG());
        this.prevCircle.data.layer.set(4);
        this.prevCircle.data.radius.set(50, scene.getViewSpace());
    }
}

class EdgeData {
    public weight: number = 1;

    public edge: S2CubicEdge;
    public emph: S2CubicEdge;

    constructor(scene: S2Scene, from: S2PlainNode, to: S2PlainNode) {
        this.edge = new S2CubicEdge(scene, from, to);
        this.edge.setParent(scene.getSVG());
        this.emph = new S2CubicEdge(scene, from, to);
        this.emph.setParent(scene.getSVG());
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
        //this.createAnimation();

        this.animator.setMasterElapsed(0);
        this.update();
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
        nodeData.layer.set(1);
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

        const distData = vertex.satNode.data;
        distData.layer.set(4);
        distData.padding.set(5, 5, this.viewSpace);
        distData.anchor.set(0, 0);
        distData.background.fill.color.setFromTheme(colorTheme, 'temp', 4);
        distData.background.stroke.width.set(0, this.viewSpace);
        distData.background.fill.opacity.set(1.0);
        distData.background.shape.set('circle');
        distData.minExtents.set(0.25, 0.25, worldSpace);
        distData.text.horizontalAlign.set(0);
        distData.text.verticalAlign.set(0);
        distData.text.fill.color.setFromTheme(colorTheme, 'temp', 12);
        distData.text.font.size.set(16, this.getViewSpace());

        const prevData = vertex.prevCircle.data;
        prevData.layer.set(4);
        prevData.radius.set(0, this.viewSpace);
        prevData.fill.color.setFromTheme(colorTheme, 'secondary', 9);
    }

    setEdgeStyle(edge: EdgeData): void {
        const edgeData = edge.edge.data;
        edgeData.stroke.color.setFromTheme(colorTheme, 'back', 7);
        edgeData.stroke.width.set(4, this.getViewSpace());
        edgeData.startDistance.set(0, this.viewSpace);
        edgeData.endDistance.set(0, this.viewSpace);
        edgeData.pathFrom.set(0);

        const emphData = edge.emph.data;
        emphData.stroke.color.setFromTheme(colorTheme, 'back', 12);
        emphData.stroke.width.set(6, this.getViewSpace());
        emphData.startDistance.set(0, this.viewSpace);
        emphData.endDistance.set(this.edgeEndDistance, this.viewSpace);
        emphData.pathFrom.set(0);
        emphData.pathTo.set(0.0);
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
        for (const edgeInfo of edgesInfo) {
            const edgeData = new EdgeData(this, nodes[edgeInfo.from], nodes[edgeInfo.to]);
            this.graph.setEdge(edgeInfo.from.toString(), edgeInfo.to.toString(), edgeData);
            this.setEdgeStyle(edgeData);
        }
        this.update();
    }

    createColorPanel(): void {
        // TODO
        const colorCount = 6;
        const position = this.acquireVec2();
        const sep = 0.2;

        const rect = new S2Rect(this);
        rect.setParent(this.getSVG());

        this.code.getRectPointInto(position, this.getWorldSpace(), 0, 1);
        position.y += sep;

        rect.data.position.setV(position, this.getWorldSpace());
        rect.data.anchor.set(0, 1);
        rect.data.extents.set(this.panelWidth / 2, 0.3, this.getWorldSpace());
        rect.data.cornerRadius.set(10, this.getViewSpace());
        rect.data.fill.color.setFromTheme(colorTheme, 'back', 3);
        rect.data.stroke.color.setFromTheme(colorTheme, 'back', 8);
        rect.data.stroke.width.set(2, this.getViewSpace());

        // node.data.position.setV(position, this.getWorldSpace());
        // node.data.anchor.set(-1, -1);
        // node.data.background.shape.set('none');
        // node.data.padding.set(5, 5, this.getViewSpace());
        // node.data.minExtents.set(this.panelWidth / 2, 0, this.getWorldSpace());
        // node.data.background.fill.color.setFromTheme(colorTheme, 'color1', 5);
        // node.data.background.stroke.color.setFromTheme(colorTheme, 'color1', 8);

        // const node = new S2PlainNode(this);
        // node.setParent(this.getSVG());

        // node.addState('Algorithme de coloration DSATUR');
        this.releaseVec2(position);
    }

    createAnimation(): void {
        const ids = this.graph.getVertices();
        for (const id of ids) {
            const vertexData = this.graph.getVertex(id);
            vertexData.visited = false;
            vertexData.prevId = null;
            vertexData.distance = Infinity;
            vertexData.satNode.addState('0');
        }

        let currId = ids[0];
        let currVertex = this.graph.getVertex(currId);
        currVertex.distance = 0;
        this.animateCodeLine(0);
        this.animateUpdateDistance(currVertex, 0);
        this.animator.makeStep();

        while (true) {
            this.animateCodeLine(1);
            this.animator.makeStep();
            let allVisited = true;
            let minDistance = Infinity;
            for (const id of ids) {
                const vertexData = this.graph.getVertex(id);
                if (vertexData.visited === false) {
                    allVisited = false;
                    if (vertexData.distance < minDistance) {
                        minDistance = vertexData.distance;
                        currId = id;
                    }
                }
            }
            if (allVisited || minDistance === Infinity) {
                break;
            }

            currVertex = this.graph.getVertex(currId);
            currVertex.visited = true;

            this.animateCodeLine(2, 3);
            this.animateVisitVertex(currVertex, currId);
            this.animator.makeStep();

            this.animateCodeLine(5);
            this.animator.makeStep();

            for (const edge of this.graph.edgesOf(currId)) {
                const edgeData = edge.data;

                this.animateCodeLine(6);
                this.animatedVisitEdge(edgeData);
                this.animator.makeStep();

                this.animateCodeLine(7);
                this.animator.makeStep();

                const nextId = edge.to;
                const vertexData = this.graph.getVertex(nextId);
                if (vertexData.visited === false) {
                    this.animateCodeLine(9);
                    this.animator.makeStep();

                    const newDistance = this.graph.getVertex(currId).distance + edgeData.weight;
                    if (newDistance < vertexData.distance) {
                        this.animateCodeLine(10);
                        this.animateUpdateDistance(vertexData, newDistance);
                        this.animator.makeStep();

                        this.animateCodeLine(11);
                        this.animateUpdatePrev(vertexData, edgeData);
                        this.animator.makeStep();

                        vertexData.distance = newDistance;
                        vertexData.prevId = currId;
                    }
                } else {
                    this.animateCodeLine(8);
                    this.animator.makeStep();
                }
                this.animatedEndVisitEdge(edgeData);
            }
        }
        this.update();
    }

    animateVisitVertex(vertex: VertexData, id: VertexId): void {
        const cycleDuration = 500;
        const node = vertex.node;
        const animLabel = this.animator.createLabelAtCurrentTime();
        const animFill = S2LerpAnimFactory.create(this, node.data.background.fill.color)
            .setCycleDuration(cycleDuration)
            .setEasing(ease.out);
        node.data.background.fill.color.setFromTheme(colorTheme, 'main', 5);
        this.animator.addAnimation(animFill.commitFinalState(), animLabel, 0);

        const animStroke = S2LerpAnimFactory.create(this, node.data.background.stroke.color)
            .setCycleDuration(cycleDuration)
            .setEasing(ease.out);
        node.data.background.stroke.color.setFromTheme(colorTheme, 'main', 8);
        this.animator.addAnimation(animStroke.commitFinalState(), animLabel, 0);

        const animText = S2LerpAnimFactory.create(this, node.data.text.fill.color)
            .setCycleDuration(cycleDuration)
            .setEasing(ease.out);
        node.data.text.fill.color.setFromTheme(colorTheme, 'main', 12);
        this.animator.addAnimation(animText.commitFinalState(), animLabel, 0);

        const animDist = S2LerpAnimFactory.create(this, vertex.satNode.data.background.fill.color)
            .setCycleDuration(cycleDuration)
            .setEasing(ease.out);
        vertex.satNode.data.background.fill.color.setFromTheme(colorTheme, 'main', 4);
        this.animator.addAnimation(animDist.commitFinalState(), animLabel, 0);

        const animTextDist = S2LerpAnimFactory.create(this, vertex.satNode.data.text.fill.color)
            .setCycleDuration(cycleDuration)
            .setEasing(ease.out);
        vertex.satNode.data.text.fill.color.setFromTheme(colorTheme, 'main', 12);
        this.animator.addAnimation(animTextDist.commitFinalState(), animLabel, 0);

        for (const edge of this.graph.edgesOf(id)) {
            const edgeData = edge.data;
            const animEdge = S2LerpAnimFactory.create(this, edgeData.edge.data.stroke.color)
                .setCycleDuration(cycleDuration)
                .setEasing(ease.out);
            edgeData.edge.data.stroke.color.setFromTheme(colorTheme, 'main', 8);
            this.animator.addAnimation(animEdge.commitFinalState(), animLabel, 0);
        }
    }

    animatedVisitEdge(edge: EdgeData): void {
        const cycleDuration = 500;
        edge.emph.data.pathTo.set(0);
        const animPath = S2LerpAnimFactory.create(this, edge.emph.data.pathTo)
            .setCycleDuration(cycleDuration)
            .setEasing(ease.out);
        edge.emph.data.pathTo.set(1);
        this.animator.addAnimation(animPath.commitFinalState(), 'previous-end', 0);
    }

    animatedEndVisitEdge(edge: EdgeData): void {
        const cycleDuration = 500;
        const animPath = S2LerpAnimFactory.create(this, edge.emph.data.pathTo)
            .setCycleDuration(cycleDuration)
            .setEasing(ease.out);
        edge.emph.data.pathTo.set(0);
        this.animator.addAnimation(animPath.commitFinalState(), 'previous-end', 0);

        const animFill = S2LerpAnimFactory.create(this, edge.edge.data.stroke.color)
            .setCycleDuration(cycleDuration)
            .setEasing(ease.out);
        edge.edge.data.stroke.color.setFromTheme(colorTheme, 'back', 7);
        this.animator.addAnimation(animFill.commitFinalState(), 'previous-end', 0);
    }

    animateUpdateDistance(vertex: VertexData, newDistance: number): void {
        const cycleDuration = 500;
        const node = vertex.satNode;
        const index = node.addState(newDistance.toString());
        node.animateChangeState(index, this.animator, { timeOffset: 0, duration: cycleDuration });
    }

    animateUpdatePrev(vertex: VertexData, edge: EdgeData): void {
        const viewSpace = this.getViewSpace();
        const tipTransform = new S2TipTransform(this);
        edge.edge.getTipTransformAtInto(tipTransform, 1);
        const position = this.acquireVec2();
        const tangent = this.acquireVec2();
        tipTransform.position.getInto(position, viewSpace);
        tipTransform.tangent.getInto(tangent, viewSpace);
        position.addV(tangent.normalize().scale(this.edgeEndDistance));

        if (vertex.prevId === null) {
            vertex.prevCircle.data.position.setV(position, viewSpace);
            vertex.prevCircle.data.radius.set(0, this.viewSpace);
            const animRadius = S2LerpAnimFactory.create(this, vertex.prevCircle.data.radius)
                .setCycleDuration(500)
                .setEasing(ease.out);
            vertex.prevCircle.data.radius.set(10, this.viewSpace);
            this.animator.addAnimation(animRadius.commitFinalState(), 'previous-end', 0);
        } else {
            const animPosition = S2LerpAnimFactory.create(this, vertex.prevCircle.data.position)
                .setCycleDuration(500)
                .setEasing(ease.out);
            vertex.prevCircle.data.position.setV(position, viewSpace);
            this.animator.addAnimation(animPosition.commitFinalState(), 'previous-end', 0);
        }
    }

    animateCodeLine(lineIndex: number, lineSpan: number = 1): void {
        const code = this.code;
        const animIndex = S2LerpAnimFactory.create(this, code.data.currentLine.index)
            .setCycleDuration(500)
            .setEasing(ease.inOut);
        const animSpan = S2LerpAnimFactory.create(this, code.data.currentLine.span)
            .setCycleDuration(500)
            .setEasing(ease.inOut);
        code.data.currentLine.index.set(lineIndex);
        code.data.currentLine.span.set(lineSpan);
        const label = this.animator.createLabelAtCurrentTime();
        this.animator.addAnimation(animIndex.commitFinalState(), label, 0);
        this.animator.addAnimation(animSpan.commitFinalState(), label, 0);
    }
}
