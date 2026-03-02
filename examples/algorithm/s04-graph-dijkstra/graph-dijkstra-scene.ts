import { S2Scene } from '../../../src/core/scene/s2-scene.ts';
import { S2StepAnimator } from '../../../src/core/animation/s2-step-animator.ts';
import { DirectedGraph, type VertexId } from '../directed-graph.ts';

import { S2ColorTheme, type S2Palette } from '../../../src/core/shared/s2-color-theme.ts';
import * as radixDark from '../../../src/utils/radix-colors-dark.ts';
import * as radixLight from '../../../src/utils/radix-colors-light.ts';
import { S2PlainNode } from '../../../src/core/element/node/s2-plain-node.ts';
import { S2CubicEdge } from '../../../src/core/element/node/s2-cubic-edge.ts';
import { S2EdgeLabel } from '../../../src/core/element/node/s2-edge-label.ts';
import { S2Vec2 } from '../../../src/core/math/s2-vec2.ts';

const mode = 0; // 0 = dark, 1 = light
let palette: S2Palette;
if (mode === 0) {
    palette = {
        back: radixDark.slateDark,
        main: radixDark.cyanDark,
        secondary: radixDark.slateDark,
    };
} else {
    palette = {
        back: radixLight.slate,
        main: radixLight.cyan,
        secondary: radixLight.slate,
    };
}
const colorTheme = new S2ColorTheme(palette);

class VertexData {
    public visited: boolean = false;
    public prevId: VertexId | null = null;
    public depth: number = -1;

    public node: S2PlainNode;
    public distanceNode: S2PlainNode;

    constructor(scene: S2Scene) {
        this.node = new S2PlainNode(scene);
        this.node.setParent(scene.getSVG());
        this.distanceNode = new S2PlainNode(scene);
        this.distanceNode.setParent(scene.getSVG());
        this.distanceNode.addState('+∞');
        this.distanceNode.data.layer.set(4);
    }
}

class EdgeData {
    public edge: S2CubicEdge;
    public weight: number = 1;

    constructor(scene: S2Scene, from: S2PlainNode, to: S2PlainNode) {
        this.edge = new S2CubicEdge(scene, from, to);
        this.edge.setParent(scene.getSVG());
    }
}

export class GraphDijkstraScene extends S2Scene {
    public animator: S2StepAnimator;

    protected graph: DirectedGraph<VertexData>;
    protected nodeCount: number = 7;
    protected showHelperGrid: boolean = false;

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

        // this.createEdges();
        // this.initializeGraphCells();
        this.update();

        this.createAnimation();
        // this.animator.playMaster();
        // this.animator.pause();
    }

    setNodeDefaultStyle(node: S2PlainNode): void {
        const worldSpace = this.getWorldSpace();
        const data = node.data;
        data.layer.set(1);
        data.padding.set(5, 5, this.viewSpace);
        data.anchor.set(0, 0);
        data.background.fill.color.setFromTheme(colorTheme, 'main', 5);
        data.background.stroke.color.setFromTheme(colorTheme, 'main', 8);
        data.background.stroke.width.set(4, this.viewSpace);
        data.background.fill.opacity.set(1.0);
        data.minExtents.set(0.5, 0.5, worldSpace);
        data.text.horizontalAlign.set(0);
        data.text.verticalAlign.set(0);
        data.text.fill.color.setFromTheme(colorTheme, 'main', 12);
        data.text.font.size.set(24, this.getViewSpace());
        data.background.shape.set('circle');
    }

    setNodeDistanceStyle(node: S2PlainNode): void {
        const worldSpace = this.getWorldSpace();
        const data = node.data;
        data.layer.set(4);
        data.padding.set(5, 5, this.viewSpace);
        data.anchor.set(0, 0);
        data.background.fill.color.setFromTheme(colorTheme, 'main', 4);
        data.background.stroke.width.set(0, this.viewSpace);
        data.background.fill.opacity.set(1.0);
        data.background.shape.set('rectangle');
        data.minExtents.set(0.25, 0.25, worldSpace);
        data.text.horizontalAlign.set(0);
        data.text.verticalAlign.set(0);
        data.text.fill.color.setFromTheme(colorTheme, 'main', 12);
        data.text.font.size.set(16, this.getViewSpace());
    }

    setEdgeDefaultStyle(edge: S2CubicEdge): void {
        const data = edge.data;
        data.stroke.color.setFromTheme(colorTheme, 'main', 8);
        data.stroke.width.set(4, this.getViewSpace());
        data.startDistance.set(5, this.viewSpace);
        data.endDistance.set(12, this.viewSpace);
        data.pathFrom.set(0);
    }

    createGraph(): void {
        this.graph.clearEdges();
        const nodes: S2PlainNode[] = [];
        for (let i = 0; i < this.nodeCount; i++) {
            const vertexData = new VertexData(this);
            const node = vertexData.node;
            nodes.push(node);
            this.setNodeDefaultStyle(node);
            node.addState(i.toString());
            this.setNodeDistanceStyle(vertexData.distanceNode);
            this.graph.addVertex(i.toString(), vertexData);
        }

        const worldSpace = this.getWorldSpace();
        const halfW = 4;
        const halfH = 2;
        nodes[0].data.position.set(-halfW, 0, worldSpace);
        nodes[1].data.position.set(-halfW / 2, +halfH, worldSpace);
        nodes[2].data.position.set(-halfW / 2, -halfH, worldSpace);
        nodes[3].data.position.set(0, 0, worldSpace);
        nodes[4].data.position.set(+halfW / 2, +halfH, worldSpace);
        nodes[5].data.position.set(+halfW / 2, -halfH, worldSpace);
        nodes[6].data.position.set(halfW, 0, worldSpace);

        const d = 1;
        const distancesInfo = [
            { from: 0, offset: new S2Vec2(-d, 0) },
            { from: 1, offset: new S2Vec2(0, +d) },
            { from: 2, offset: new S2Vec2(0, -d) },
            { from: 3, offset: new S2Vec2(0, +d) },
            { from: 4, offset: new S2Vec2(0, +d) },
            { from: 5, offset: new S2Vec2(0, -d) },
            { from: 6, offset: new S2Vec2(+d, 0) },
        ];

        for (const distanceInfo of distancesInfo) {
            const vertexData = this.graph.getVertex(distanceInfo.from.toString());
            const distanceNode = vertexData.distanceNode;
            const position = this.acquireVec2();
            vertexData.node.data.position.getInto(position, worldSpace);
            position.addV(distanceInfo.offset);
            distanceNode.data.position.setV(position, worldSpace);
            this.releaseVec2(position);
        }

        const edgesInfo = [
            { from: 0, to: 1, weight: 5, bend: -45 },
            { from: 0, to: 2, weight: 2, bend: +45 },
            { from: 1, to: 3, weight: 1, bend: 0 },
            { from: 1, to: 4, weight: 5, bend: 0 },
            { from: 2, to: 1, weight: 2, bend: 0 },
            { from: 2, to: 3, weight: 1, bend: 0 },
            { from: 2, to: 5, weight: 5, bend: 0 },
            { from: 3, to: 5, weight: 3, bend: 0 },
            { from: 3, to: 6, weight: 6, bend: 0 },
            { from: 4, to: 6, weight: 1, bend: -45 },
            { from: 5, to: 6, weight: 1, bend: +45 },
        ];
        for (const edgeInfo of edgesInfo) {
            const edgeData = new EdgeData(this, nodes[edgeInfo.from], nodes[edgeInfo.to]);
            edgeData.weight = edgeInfo.weight;
            this.graph.setEdge(edgeInfo.from.toString(), edgeInfo.to.toString(), edgeData);
            const edge = edgeData.edge;
            this.setEdgeDefaultStyle(edge);
            if (edgeInfo.bend !== 0) {
                edge.data.bendAngle.set(edgeInfo.bend);
                edge.data.startTension.set(0.4);
                edge.data.endTension.set(0.4);
            }
            const labelNode = new S2PlainNode(this);
            labelNode.addState(edgeInfo.weight.toString());
            labelNode.data.layer.set(3);
            labelNode.data.background.shape.set('none');

            const label = new S2EdgeLabel(this, labelNode);
            label.data.pathPosition.set(0.5);
            label.data.flip.set(edgeInfo.bend > 0);
            label.data.distance.set(20, this.viewSpace);
            edge.attachLabel(label);

            const tip = edge.createArrowTip();
            tip.data.pathStrokeFactor.set(0.5);
        }
        this.update();
    }

    createAnimation(): void {
        const node = this.graph.getVertex('0')!.node;
        node.addState('1');
        node.addState('2');
        this.update();
        node.animateChangeState(1, this.animator, { timeOffset: 0 });
        node.animateChangeState(0, this.animator, { timeOffset: 0 });
        node.animateChangeState(2, this.animator, { timeOffset: 0 });
        node.animateChangeState(-1, this.animator, { timeOffset: 0 });
        this.update();
    }

    // initializeGraphCells(): void {
    //     const viewSpace = this.getViewSpace();
    //     const worldSpace = this.getWorldSpace();
    //     const gridWidth = 8.0;
    //     const gridSpacing = 0.1;
    //     const cellWidth = (gridWidth - gridSpacing * (this.size - 1)) / this.size;
    //     const cellSep = cellWidth + gridSpacing;
    //     this.cellWidth = cellWidth;

    //     const nw = new S2Vec2(-gridWidth / 2, -gridWidth / 2);
    //     for (let i = 0; i < this.size; i++) {
    //         for (let j = 0; j < this.size; j++) {
    //             const vertex = this.graph.getVertex(`${i},${j}`);
    //             vertex.visited = false;
    //             vertex.prevId = null;
    //             vertex.depth = -1;

    //             const center = new S2Vec2(
    //                 nw.x + j * cellSep + cellWidth / 2,
    //                 nw.y + (this.size - 1 - i) * cellSep + cellWidth / 2,
    //             );

    //             const cell = vertex.cell;
    //             cell.data.layer.set(1);
    //             cell.data.extents.set(cellWidth / 2, cellWidth / 2, worldSpace);
    //             cell.data.position.setV(center, worldSpace);
    //             cell.data.anchor.set(0, 0);
    //             cell.data.pointerEvents.set('auto');

    //             const cellEmph = vertex.cellEmph;
    //             cellEmph.data.layer.set(2);
    //             cellEmph.data.extents.set(1, 1, viewSpace);
    //             cellEmph.data.position.setV(center, worldSpace);
    //             cellEmph.data.anchor.set(0, 0);
    //             cellEmph.data.opacity.set(0.0);
    //         }
    //     }
    // }

    // setInitialStyle(): void {
    //     const viewSpace = this.getViewSpace();
    //     for (let i = 0; i < this.size; i++) {
    //         for (let j = 0; j < this.size; j++) {
    //             const vertex = this.graph.getVertex(`${i},${j}`);
    //             vertex.visited = false;
    //             vertex.prevId = null;
    //             vertex.depth = -1;

    //             const cell = vertex.cell;
    //             cell.data.layer.set(1);
    //             cell.data.fill.color.setFromTheme(colorTheme, 'back', 1);
    //             cell.data.stroke.color.setFromTheme(colorTheme, 'back', 5);
    //             cell.data.stroke.width.set(2, viewSpace);
    //             cell.data.pointerEvents.set('auto');

    //             const cellEmph = vertex.cellEmph;
    //             cellEmph.data.layer.set(2);
    //             cellEmph.data.opacity.set(1);
    //             cellEmph.data.fill.color.setFromTheme(colorTheme, 'main', 1);
    //             cellEmph.data.stroke.color.setFromTheme(colorTheme, 'main', 5);
    //             cellEmph.data.stroke.width.set(2, viewSpace);
    //             cellEmph.data.opacity.set(0.0);

    //             if (vertex.isWall) {
    //                 cell.data.fill.color.setFromTheme(colorTheme, 'wall', 10);
    //                 cell.data.stroke.color.setFromTheme(colorTheme, 'wall', 10);
    //             }
    //         }
    //     }
    // }

    // createEdges(): void {
    //     this.graph.clearEdges();
    //     for (let i = 0; i < this.size; i++) {
    //         for (let j = 0; j < this.size; j++) {
    //             for (let k = 0; k < this.directionOrder.length; k++) {
    //                 let index = k;
    //                 if (this.traversal === 'dfs') {
    //                     // For DFS, we want to prioritize directions based on the order, so we add edges in reverse order
    //                     index = this.directionOrder.length - 1 - k;
    //                 }

    //                 const dir = this.directionOrder[index];
    //                 const vec = this.directionVectors[dir];
    //                 const ni = i + vec[0];
    //                 const nj = j + vec[1];
    //                 if (ni < 0 || ni >= this.size || nj < 0 || nj >= this.size) {
    //                     continue;
    //                 }
    //                 if (this.graph.getVertex(`${ni},${nj}`).isWall) {
    //                     continue;
    //                 }
    //                 this.graph.setEdge(`${i},${j}`, `${ni},${nj}`, {});
    //             }
    //         }
    //     }
    // }

    // createAnimation(): void {
    //     switch (this.traversal) {
    //         case 'bfs':
    //             this.createBFSAnimation();
    //             break;
    //         case 'dfs':
    //             this.createDFSAnimation();
    //             break;
    //     }
    // }

    // createBFSAnimation(): void {
    //     const start: VertexId = `${this.startI},${this.startJ}`;

    //     this.animator.stop();
    //     this.animator.reset();
    //     this.animator = new S2StepAnimator(this);

    //     this.setInitialStyle();

    //     const queue = new Queue<VertexId>();
    //     const maxDepth = this.size * this.size;
    //     queue.enqueue(start);
    //     this.graph.getVertex(start).depth = 0;
    //     this.graph.getVertex(start).visited = true;

    //     let currTime = 0;
    //     let timeStep = 50;
    //     let cycleDuration = 500;
    //     if (this.stepByStep) {
    //         timeStep = 300;
    //         cycleDuration = 300;
    //     }

    //     const startVertex = this.graph.getVertex(start);
    //     startVertex.depth = 0;
    //     startVertex.visited = true;

    //     while (queue.length > 0) {
    //         const current = queue.dequeue()!;
    //         const vertex = this.graph.getVertex(current);

    //         const isStart = current === start;
    //         this.animateVisitVertex(vertex, isStart, maxDepth, currTime, cycleDuration, timeStep);
    //         if (this.stepByStep) {
    //             this.animator.makeStep();
    //         }

    //         currTime += timeStep;

    //         for (const edge of this.graph.edgesOf(current)) {
    //             const nextId = edge.to;
    //             const nextVertex = this.graph.getVertex(nextId);
    //             if (!nextVertex.visited) {
    //                 queue.enqueue(nextId);
    //                 nextVertex.prevId = current;
    //                 nextVertex.depth = vertex.depth + 1;
    //                 nextVertex.visited = true;
    //             }
    //         }
    //     }
    //     this.animator.finalize();
    //     this.animator.setMasterElapsed(0);
    //     this.update();
    // }

    // createDFSAnimation(): void {
    //     const start: VertexId = `${this.startI},${this.startJ}`;

    //     this.animator.stop();
    //     this.animator.reset();
    //     this.animator = new S2StepAnimator(this);

    //     this.setInitialStyle();

    //     const stack: VertexId[] = [];

    //     const maxDepth = this.size * this.size;
    //     stack.push(start);
    //     this.graph.getVertex(start).depth = 0;

    //     let currTime = 0;
    //     let timeStep = 50;
    //     let cycleDuration = 500;
    //     if (this.stepByStep) {
    //         timeStep = 300;
    //         cycleDuration = 300;
    //     }

    //     while (stack.length > 0) {
    //         const current = stack.pop()!;
    //         const vertex = this.graph.getVertex(current);
    //         if (vertex.visited) {
    //             continue;
    //         }
    //         vertex.visited = true;

    //         const isStart = current === start;
    //         this.animateVisitVertex(vertex, isStart, maxDepth, currTime, cycleDuration, timeStep);
    //         if (this.stepByStep) {
    //             this.animator.makeStep();
    //         }

    //         currTime += timeStep;

    //         for (const edge of this.graph.edgesOf(current)) {
    //             const nextId = edge.to;
    //             const nextVertex = this.graph.getVertex(nextId);
    //             if (!nextVertex.visited) {
    //                 stack.push(nextId);
    //                 nextVertex.prevId = current;
    //                 nextVertex.depth = vertex.depth + 1;
    //             }
    //         }
    //     }
    //     this.animator.finalize();
    //     this.animator.setMasterElapsed(0);
    //     this.update();
    // }

    // animateVisitVertex(
    //     vertex: VertexData,
    //     isStart: boolean,
    //     maxdepth: number,
    //     currTime: number,
    //     cycleDuration: number,
    //     timeStep: number,
    // ): void {
    //     const t = S2MathUtils.clamp01(vertex.depth / maxdepth);

    //     // Circle
    //     if (isStart) {
    //         vertex.circle.data.fill.color.setFromTheme(colorTheme, 'back', 12);
    //     } else {
    //         this.treeColorScale.getInto(vertex.circle.data.fill.color, t);
    //     }
    //     vertex.circle.data.isEnabled.set(true);
    //     vertex.circle.data.layer.set(4);
    //     vertex.circle.data.position.copy(vertex.cell.data.position);
    //     vertex.circle.data.radius.set(1, this.getViewSpace());
    //     vertex.circle.data.opacity.set(0.0);

    //     const animCircleRadius = S2LerpAnimFactory.create(this, vertex.circle.data.radius)
    //         .setCycleDuration(cycleDuration)
    //         .setEasing(ease.out);
    //     if (isStart) {
    //         vertex.circle.data.radius.set(this.cellWidth / 4, this.getWorldSpace());
    //     } else {
    //         vertex.circle.data.radius.set(5, this.getViewSpace());
    //     }
    //     this.animator.addAnimation(animCircleRadius.commitFinalState(), 'timeline-start', currTime);

    //     const triggerCircleOpacity0 = new S2TriggerNumber(vertex.circle.data.opacity, 0.0);
    //     this.animator.addTrigger(triggerCircleOpacity0, 'timeline-start', 0);

    //     const triggerCircleOpacity1 = new S2TriggerNumber(vertex.circle.data.opacity, 1.0);
    //     this.animator.addTrigger(triggerCircleOpacity1, 'timeline-start', currTime + 1);

    //     // Cell emphasis
    //     this.fillColorScale.getInto(vertex.cellEmph.data.fill.color, t);
    //     this.strokeColorScale.getInto(vertex.cellEmph.data.stroke.color, t);

    //     const animOpacity = S2LerpAnimFactory.create(this, vertex.cellEmph.data.opacity)
    //         .setCycleDuration(cycleDuration)
    //         .setEasing(ease.out);
    //     vertex.cellEmph.data.opacity.set(1.0);
    //     this.animator.addAnimation(animOpacity.commitFinalState(), 'timeline-start', currTime);

    //     const animExt = S2LerpAnimFactory.create(this, vertex.cellEmph.data.extents)
    //         .setCycleDuration(cycleDuration)
    //         .setEasing(ease.out);
    //     vertex.cellEmph.data.extents.set(this.cellWidth / 2, this.cellWidth / 2, this.getWorldSpace());
    //     this.animator.addAnimation(animExt.commitFinalState(), 'timeline-start', currTime);

    //     // Line to previous
    //     if (vertex.prevId !== null) {
    //         const prevVertex = this.graph.getVertex(vertex.prevId);
    //         vertex.lineToPrev.data.isEnabled.set(true);
    //         vertex.lineToPrev.data.layer.set(3);
    //         vertex.lineToPrev.data.startPosition.copy(prevVertex.cell.data.position);
    //         vertex.lineToPrev.data.endPosition.copy(vertex.cell.data.position);
    //         vertex.lineToPrev.data.stroke.color.setFromTheme(colorTheme, 'back', 12);
    //         vertex.lineToPrev.data.stroke.width.set(3, this.getViewSpace());
    //         vertex.lineToPrev.data.pathFrom.set(0.0);
    //         vertex.lineToPrev.data.pathTo.set(0.0);
    //         vertex.lineToPrev.data.opacity.set(0.0);
    //         this.treeColorScale.getInto(vertex.lineToPrev.data.stroke.color, t);

    //         const triggerLineOpacity0 = new S2TriggerNumber(vertex.lineToPrev.data.opacity, 0.0);
    //         this.animator.addTrigger(triggerLineOpacity0, 'timeline-start', 0);

    //         const triggerLineOpacity1 = new S2TriggerNumber(vertex.lineToPrev.data.opacity, 1.0);
    //         this.animator.addTrigger(triggerLineOpacity1, 'timeline-start', currTime);

    //         const animPath = S2LerpAnimFactory.create(this, vertex.lineToPrev.data.pathTo)
    //             .setCycleDuration(timeStep)
    //             .setEasing(ease.linear);
    //         vertex.lineToPrev.data.pathTo.set(1.0);
    //         this.animator.addAnimation(animPath.commitFinalState(), 'timeline-start', currTime);
    //     }
    // }
}
