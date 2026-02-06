import { S2Scene } from '../../../src/core/scene/s2-scene.ts';
import { S2StepAnimator } from '../../../src/core/animation/s2-step-animator.ts';
import { S2MathUtils } from '../../../src/core/math/s2-math-utils.ts';
import { S2Vec2 } from '../../../src/core/math/s2-vec2.ts';
import { S2Rect } from '../../../src/core/element/s2-rect.ts';
import { DirectedGraph, type VertexId } from '../directed-graph.ts';
import { S2Color } from '../../../src/core/shared/s2-color.ts';
import { S2LerpAnimFactory } from '../../../src/core/animation/s2-lerp-anim.ts';
import { ease } from '../../../src/core/animation/s2-easing.ts';
import { S2Circle } from '../../../src/core/element/s2-circle.ts';
import { S2Line } from '../../../src/core/element/s2-line.ts';
import { S2TriggerNumber } from '../../../src/core/animation/s2-timeline-trigger.ts';

import { S2ColorTheme, type S2Palette } from '../../../src/core/shared/s2-color-theme.ts';
import * as radixDark from '../../../src/utils/radix-colors-dark.ts';
import * as radixLight from '../../../src/utils/radix-colors-light.ts';

const mode = 0; // 0 = dark, 1 = light
let palette: S2Palette;
if (mode === 0) {
    palette = {
        back: radixDark.slateDark,
        main: radixDark.cyanDark,
        secondary: radixDark.limeDark,
        'scale-a': radixDark.cyanDark,
        'scale-b': radixDark.limeDark,
        'scale-c': radixDark.amberDark,
        'scale-d': radixDark.tomatoDark,
        'scale-e': radixDark.plumDark,
        wall: radixDark.slateDark,
        blue: radixDark.blueDark,
        red: radixDark.redDark,
        cyan: radixDark.cyanDark,
    };
} else {
    palette = {
        back: radixLight.slate,
        main: radixLight.cyan,
        secondary: radixLight.lime,
        'scale-a': radixLight.cyan,
        'scale-b': radixLight.lime,
        'scale-c': radixLight.yellow,
        'scale-d': radixLight.tomato,
        'scale-e': radixLight.plum,
        wall: radixLight.slate,
        blue: radixLight.blue,
        red: radixLight.red,
        cyan: radixLight.cyan,
    };
}
const colorTheme = new S2ColorTheme(palette);

class ColorScale {
    public colors: S2Color[] = [];

    getInto(color: S2Color, t: number): void {
        if (this.colors.length === 0) {
            color.setBlack();
            return;
        }
        const scaledT = t * (this.colors.length - 1);
        const index0 = Math.floor(scaledT);
        const index1 = Math.min(index0 + 1, this.colors.length - 1);
        const localT = scaledT - index0;
        color.lerp(this.colors[index0], this.colors[index1], localT);
    }
}

class Queue<T> {
    private input: T[] = [];
    private output: T[] = [];

    enqueue(x: T) {
        this.input.push(x);
    }

    dequeue(): T | undefined {
        if (this.output.length === 0) {
            while (this.input.length > 0) {
                this.output.push(this.input.pop()!);
            }
        }
        return this.output.pop();
    }

    get length(): number {
        return this.input.length + this.output.length;
    }
}

export type Direction = 'U' | 'D' | 'L' | 'R';

class VertexData {
    public isWall: boolean = false;
    public visited: boolean = false;
    public prevId: VertexId | null = null;
    public depth: number = -1;

    public cell: S2Rect;
    public cellEmph: S2Rect;
    public circle: S2Circle;
    public lineToPrev: S2Line;

    constructor(scene: S2Scene) {
        this.cell = new S2Rect(scene);
        this.cell.setParent(scene.getSVG());

        this.cellEmph = new S2Rect(scene);
        this.cellEmph.setParent(scene.getSVG());

        this.circle = new S2Circle(scene);
        this.circle.setParent(scene.getSVG());
        this.circle.data.isEnabled.set(false);

        this.lineToPrev = new S2Line(scene);
        this.lineToPrev.setParent(scene.getSVG());
        this.lineToPrev.data.isEnabled.set(false);
    }
}

export class GraphSearchScene extends S2Scene {
    public animator: S2StepAnimator;

    protected graph: DirectedGraph<VertexData>;
    protected size: number = 10;
    protected mode: 'wall' | 'search' = 'search';
    protected traversal: 'bfs' | 'dfs' = 'dfs';
    protected startI: number = 0;
    protected startJ: number = 0;
    protected cellWidth: number;
    protected stepByStep: boolean = false;
    protected showHelperGrid: boolean = false;

    private fillColorScale = new ColorScale();
    private strokeColorScale = new ColorScale();
    private treeColorScale = new ColorScale();

    public directionOrder: Direction[] = ['U', 'D', 'L', 'R'];
    protected directionVectors: Record<Direction, [number, number]> = {
        U: [-1, 0],
        D: [+1, 0],
        L: [0, -1],
        R: [0, +1],
    };

    constructor(svgElement: SVGSVGElement) {
        super(svgElement);
        this.camera.setExtents(8.0, 4.5);
        this.setViewportSize(640.0 * 1.5, 360.0 * 1.5);
        this.tracePoolAllocations = true;

        this.animator = new S2StepAnimator(this);

        const viewSpace = this.getViewSpace();
        const worldSpace = this.getWorldSpace();

        this.fillColorScale.colors = [
            S2Color.fromTheme(colorTheme, 'scale-a', 4),
            S2Color.fromTheme(colorTheme, 'scale-b', 4),
            S2Color.fromTheme(colorTheme, 'scale-c', 4),
            S2Color.fromTheme(colorTheme, 'scale-d', 4),
            S2Color.fromTheme(colorTheme, 'scale-e', 4),
        ];
        this.strokeColorScale.colors = [
            S2Color.fromTheme(colorTheme, 'scale-a', 9),
            S2Color.fromTheme(colorTheme, 'scale-b', 9),
            S2Color.fromTheme(colorTheme, 'scale-c', 9),
            S2Color.fromTheme(colorTheme, 'scale-d', 9),
            S2Color.fromTheme(colorTheme, 'scale-e', 9),
        ];
        this.treeColorScale.colors = [
            S2Color.fromTheme(colorTheme, 'scale-a', 12),
            S2Color.fromTheme(colorTheme, 'scale-b', 12),
            S2Color.fromTheme(colorTheme, 'scale-c', 12),
            S2Color.fromTheme(colorTheme, 'scale-d', 12),
            S2Color.fromTheme(colorTheme, 'scale-e', 12),
        ];

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

        const gridWidth = 8.0;
        const gridSpacing = 0.1;
        const cellWidth = (gridWidth - gridSpacing * (this.size - 1)) / this.size;
        this.cellWidth = cellWidth;

        const graph = new DirectedGraph<VertexData>();
        this.graph = graph;

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const vertexData = new VertexData(this);
                vertexData.cell.getSVGElement().addEventListener(
                    'pointerdown',
                    (event: PointerEvent): void => {
                        void event;
                        this.onClick(i, j);
                    },
                    {
                        passive: false,
                    },
                );
                graph.addVertex(`${i},${j}`, vertexData);
            }
        }

        this.createRandomWalls();
        this.createEdges();
        this.initializeGraphCells();
        this.update();

        this.createAnimation();
        this.animator.playMaster();
        this.animator.pause();
    }

    onClick(i: number, j: number): void {
        const vertex = this.graph.getVertex(`${i},${j}`);
        switch (this.mode) {
            case 'wall':
                if (i == this.startI && j == this.startJ) return;

                vertex.isWall = !vertex.isWall;

                this.createEdges();
                this.createAnimation();
                this.animator.setMasterElapsed(this.animator.getMasterDuration());
                this.update();
                break;

            case 'search':
                if (vertex.isWall) return;
                if (i == this.startI && j == this.startJ) {
                    this.animator.playMaster();
                    return;
                }

                this.startI = i;
                this.startJ = j;

                this.createAnimation();
                this.animator.playMaster();
                break;
        }
    }

    createRandomWalls(): void {
        const wallThreshold = 0.2;
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const isWall = Math.random() < wallThreshold ? true : false;
                this.graph.getVertex(`${i},${j}`).isWall = isWall;
            }
        }

        this.graph.getVertex(`${this.startI},${this.startJ}`).isWall = false;
    }

    initializeGraphCells(): void {
        const viewSpace = this.getViewSpace();
        const worldSpace = this.getWorldSpace();
        const gridWidth = 8.0;
        const gridSpacing = 0.1;
        const cellWidth = (gridWidth - gridSpacing * (this.size - 1)) / this.size;
        const cellSep = cellWidth + gridSpacing;
        this.cellWidth = cellWidth;

        const nw = new S2Vec2(-gridWidth / 2, -gridWidth / 2);
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const vertex = this.graph.getVertex(`${i},${j}`);
                vertex.visited = false;
                vertex.prevId = null;
                vertex.depth = -1;

                const center = new S2Vec2(
                    nw.x + j * cellSep + cellWidth / 2,
                    nw.y + (this.size - 1 - i) * cellSep + cellWidth / 2,
                );

                const cell = vertex.cell;
                cell.data.layer.set(1);
                cell.data.extents.set(cellWidth / 2, cellWidth / 2, worldSpace);
                cell.data.position.setV(center, worldSpace);
                cell.data.anchor.set(0, 0);
                cell.data.pointerEvents.set('auto');

                const cellEmph = vertex.cellEmph;
                cellEmph.data.layer.set(2);
                cellEmph.data.extents.set(1, 1, viewSpace);
                cellEmph.data.position.setV(center, worldSpace);
                cellEmph.data.anchor.set(0, 0);
                cellEmph.data.opacity.set(0.0);
            }
        }
    }

    setInitialStyle(): void {
        const viewSpace = this.getViewSpace();
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const vertex = this.graph.getVertex(`${i},${j}`);
                vertex.visited = false;
                vertex.prevId = null;
                vertex.depth = -1;

                const cell = vertex.cell;
                cell.data.layer.set(1);
                cell.data.fill.color.setFromTheme(colorTheme, 'back', 1);
                cell.data.stroke.color.setFromTheme(colorTheme, 'back', 5);
                cell.data.stroke.width.set(2, viewSpace);
                cell.data.pointerEvents.set('auto');

                const cellEmph = vertex.cellEmph;
                cellEmph.data.layer.set(2);
                cellEmph.data.opacity.set(1);
                cellEmph.data.fill.color.setFromTheme(colorTheme, 'main', 1);
                cellEmph.data.stroke.color.setFromTheme(colorTheme, 'main', 5);
                cellEmph.data.stroke.width.set(2, viewSpace);
                cellEmph.data.opacity.set(0.0);

                if (vertex.isWall) {
                    cell.data.fill.color.setFromTheme(colorTheme, 'wall', 10);
                    cell.data.stroke.color.setFromTheme(colorTheme, 'wall', 10);
                }
            }
        }
    }

    createEdges(): void {
        this.graph.clearEdges();
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                for (let k = 0; k < this.directionOrder.length; k++) {
                    let index = k;
                    if (this.traversal === 'dfs') {
                        // For DFS, we want to prioritize directions based on the order, so we add edges in reverse order
                        index = this.directionOrder.length - 1 - k;
                    }

                    const dir = this.directionOrder[index];
                    const vec = this.directionVectors[dir];
                    const ni = i + vec[0];
                    const nj = j + vec[1];
                    if (ni < 0 || ni >= this.size || nj < 0 || nj >= this.size) {
                        continue;
                    }
                    if (this.graph.getVertex(`${ni},${nj}`).isWall) {
                        continue;
                    }
                    this.graph.setEdge(`${i},${j}`, `${ni},${nj}`, {});
                }
            }
        }
    }

    createAnimation(): void {
        switch (this.traversal) {
            case 'bfs':
                this.createBFSAnimation();
                break;
            case 'dfs':
                this.createDFSAnimation();
                break;
        }
    }

    createBFSAnimation(): void {
        const start: VertexId = `${this.startI},${this.startJ}`;

        this.animator.stop();
        this.animator.reset();
        this.animator = new S2StepAnimator(this);

        this.setInitialStyle();

        const queue = new Queue<VertexId>();
        const maxDepth = this.size * this.size;
        queue.enqueue(start);
        this.graph.getVertex(start).depth = 0;
        this.graph.getVertex(start).visited = true;

        let currTime = 0;
        let timeStep = 50;
        let cycleDuration = 500;
        if (this.stepByStep) {
            timeStep = 300;
            cycleDuration = 300;
        }

        const startVertex = this.graph.getVertex(start);
        startVertex.depth = 0;
        startVertex.visited = true;

        while (queue.length > 0) {
            const current = queue.dequeue()!;
            const vertex = this.graph.getVertex(current);

            const isStart = current === start;
            this.animateVisitVertex(vertex, isStart, maxDepth, currTime, cycleDuration, timeStep);
            if (this.stepByStep) {
                this.animator.makeStep();
            }

            currTime += timeStep;

            for (const edge of this.graph.edgesOf(current)) {
                const nextId = edge.to;
                const nextVertex = this.graph.getVertex(nextId);
                if (!nextVertex.visited) {
                    queue.enqueue(nextId);
                    nextVertex.prevId = current;
                    nextVertex.depth = vertex.depth + 1;
                    nextVertex.visited = true;
                }
            }
        }
        this.animator.finalize();
        this.animator.setMasterElapsed(0);
        this.update();
    }

    createDFSAnimation(): void {
        const start: VertexId = `${this.startI},${this.startJ}`;

        this.animator.stop();
        this.animator.reset();
        this.animator = new S2StepAnimator(this);

        this.setInitialStyle();

        const stack: VertexId[] = [];

        const maxDepth = this.size * this.size;
        stack.push(start);
        this.graph.getVertex(start).depth = 0;

        let currTime = 0;
        let timeStep = 50;
        let cycleDuration = 500;
        if (this.stepByStep) {
            timeStep = 300;
            cycleDuration = 300;
        }

        while (stack.length > 0) {
            const current = stack.pop()!;
            const vertex = this.graph.getVertex(current);
            if (vertex.visited) {
                continue;
            }
            vertex.visited = true;

            const isStart = current === start;
            this.animateVisitVertex(vertex, isStart, maxDepth, currTime, cycleDuration, timeStep);
            if (this.stepByStep) {
                this.animator.makeStep();
            }

            currTime += timeStep;

            for (const edge of this.graph.edgesOf(current)) {
                const nextId = edge.to;
                const nextVertex = this.graph.getVertex(nextId);
                if (!nextVertex.visited) {
                    stack.push(nextId);
                    nextVertex.prevId = current;
                    nextVertex.depth = vertex.depth + 1;
                }
            }
        }
        this.animator.finalize();
        this.animator.setMasterElapsed(0);
        this.update();
    }

    animateVisitVertex(
        vertex: VertexData,
        isStart: boolean,
        maxdepth: number,
        currTime: number,
        cycleDuration: number,
        timeStep: number,
    ): void {
        const t = S2MathUtils.clamp01(vertex.depth / maxdepth);

        // Circle
        if (isStart) {
            vertex.circle.data.fill.color.setFromTheme(colorTheme, 'back', 12);
        } else {
            this.treeColorScale.getInto(vertex.circle.data.fill.color, t);
        }
        vertex.circle.data.isEnabled.set(true);
        vertex.circle.data.layer.set(4);
        vertex.circle.data.position.copy(vertex.cell.data.position);
        vertex.circle.data.radius.set(1, this.getViewSpace());
        vertex.circle.data.opacity.set(0.0);

        const animCircleRadius = S2LerpAnimFactory.create(this, vertex.circle.data.radius)
            .setCycleDuration(cycleDuration)
            .setEasing(ease.out);
        if (isStart) {
            vertex.circle.data.radius.set(this.cellWidth / 4, this.getWorldSpace());
        } else {
            vertex.circle.data.radius.set(5, this.getViewSpace());
        }
        this.animator.addAnimation(animCircleRadius.commitFinalState(), 'timeline-start', currTime);

        const triggerCircleOpacity0 = new S2TriggerNumber(vertex.circle.data.opacity, 0.0);
        this.animator.addTrigger(triggerCircleOpacity0, 'timeline-start', 0);

        const triggerCircleOpacity1 = new S2TriggerNumber(vertex.circle.data.opacity, 1.0);
        this.animator.addTrigger(triggerCircleOpacity1, 'timeline-start', currTime + 1);

        // Cell emphasis
        this.fillColorScale.getInto(vertex.cellEmph.data.fill.color, t);
        this.strokeColorScale.getInto(vertex.cellEmph.data.stroke.color, t);

        const animOpacity = S2LerpAnimFactory.create(this, vertex.cellEmph.data.opacity)
            .setCycleDuration(cycleDuration)
            .setEasing(ease.out);
        vertex.cellEmph.data.opacity.set(1.0);
        this.animator.addAnimation(animOpacity.commitFinalState(), 'timeline-start', currTime);

        const animExt = S2LerpAnimFactory.create(this, vertex.cellEmph.data.extents)
            .setCycleDuration(cycleDuration)
            .setEasing(ease.out);
        vertex.cellEmph.data.extents.set(this.cellWidth / 2, this.cellWidth / 2, this.getWorldSpace());
        this.animator.addAnimation(animExt.commitFinalState(), 'timeline-start', currTime);

        // Line to previous
        if (vertex.prevId !== null) {
            const prevVertex = this.graph.getVertex(vertex.prevId);
            vertex.lineToPrev.data.isEnabled.set(true);
            vertex.lineToPrev.data.layer.set(3);
            vertex.lineToPrev.data.startPosition.copy(prevVertex.cell.data.position);
            vertex.lineToPrev.data.endPosition.copy(vertex.cell.data.position);
            vertex.lineToPrev.data.stroke.color.setFromTheme(colorTheme, 'back', 12);
            vertex.lineToPrev.data.stroke.width.set(3, this.getViewSpace());
            vertex.lineToPrev.data.pathFrom.set(0.0);
            vertex.lineToPrev.data.pathTo.set(0.0);
            vertex.lineToPrev.data.opacity.set(0.0);
            this.treeColorScale.getInto(vertex.lineToPrev.data.stroke.color, t);

            const triggerLineOpacity0 = new S2TriggerNumber(vertex.lineToPrev.data.opacity, 0.0);
            this.animator.addTrigger(triggerLineOpacity0, 'timeline-start', 0);

            const triggerLineOpacity1 = new S2TriggerNumber(vertex.lineToPrev.data.opacity, 1.0);
            this.animator.addTrigger(triggerLineOpacity1, 'timeline-start', currTime);

            const animPath = S2LerpAnimFactory.create(this, vertex.lineToPrev.data.pathTo)
                .setCycleDuration(timeStep)
                .setEasing(ease.linear);
            vertex.lineToPrev.data.pathTo.set(1.0);
            this.animator.addAnimation(animPath.commitFinalState(), 'timeline-start', currTime);
        }
    }

    setDirectionOrder(order: Direction[]): void {
        if (order.length !== 4) {
            throw new Error('Direction order must have exactly 4 elements.');
        }
        this.directionOrder = order;
        this.createEdges();
        this.createAnimation();
        this.animator.setMasterElapsed(this.animator.getMasterDuration());
        this.update();
    }

    setStepByStep(enabled: boolean): void {
        this.stepByStep = enabled;
        this.createAnimation();
        this.animator.setMasterElapsed(this.animator.getMasterDuration());
        this.update();
    }

    setMode(mode: 'wall' | 'search'): void {
        this.mode = mode;
    }

    setTraversal(traversal: 'bfs' | 'dfs'): void {
        this.traversal = traversal;
        this.createAnimation();
        this.animator.setMasterElapsed(this.animator.getMasterDuration());
        this.update();
    }
}
