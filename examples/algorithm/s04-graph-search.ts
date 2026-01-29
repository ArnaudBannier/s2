import { S2Scene } from '../../src/core/scene/s2-scene.ts';
import { S2StepAnimator } from '../../src/core/animation/s2-step-animator.ts';
import { S2MathUtils } from '../../src/core/math/s2-math-utils.ts';

const titleString = 'Parcours de graphes';

import { S2ColorTheme, type S2Palette } from '../../src/core/shared/s2-color-theme.ts';

import * as radixDark from '../../src/utils/radix-colors-dark.ts';
import * as radixLight from '../../src/utils/radix-colors-light.ts';
import { S2Vec2 } from '../../src/core/math/s2-vec2.ts';
import { S2Rect } from '../../src/core/element/s2-rect.ts';
import { DirectedGraph, type VertexId } from './directed-graph.ts';
import { S2Color } from '../../src/core/shared/s2-color.ts';
import { S2LerpAnimFactory } from '../../src/core/animation/s2-lerp-anim.ts';
import { ease } from '../../src/core/animation/s2-easing.ts';
import { S2Circle } from '../../src/core/element/s2-circle.ts';
import { S2Line } from '../../src/core/element/s2-line.ts';
import { S2TriggerNumber } from '../../src/core/animation/s2-timeline-trigger.ts';

// Ordre haut bas gauche droite
// Chemin oui/non
// point d'arrivée modifiable
// Murs modifiables
//

let mode = 0; // 0 = dark, 1 = light
let palette: S2Palette;
if (mode === 0) {
    palette = {
        back: radixDark.slateDark,
        main: radixDark.cyanDark,
        secondary: radixDark.limeDark,
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
        wall: radixLight.slate,
        blue: radixLight.blue,
        red: radixLight.red,
        cyan: radixLight.cyan,
    };
}

const colorTheme = new S2ColorTheme(palette);

// class Queue<T> {
//     private input: T[] = [];
//     private output: T[] = [];

//     enqueue(x: T) {
//         this.input.push(x);
//     }

//     dequeue(): T | undefined {
//         if (this.output.length === 0) {
//             while (this.input.length > 0) {
//                 this.output.push(this.input.pop()!);
//             }
//         }
//         return this.output.pop();
//     }
// }
type Direction = 'U' | 'D' | 'L' | 'R';

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

class SceneFigure extends S2Scene {
    public animator: S2StepAnimator;
    public graph: DirectedGraph<VertexData>;
    public size: number = 10;
    protected startI: number = -1;
    protected startJ: number = -1;
    protected cellWidth: number;
    protected stepByStep: boolean = false;

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

        console.log('view', viewSpace);
        console.log('world', worldSpace);

        const fillRect = this.addFillRect();
        fillRect.data.color.setFromTheme(colorTheme, 'back', 2);

        // const helperGrid = this.addWorldGrid();
        // helperGrid.data.stroke.color.setFromTheme(colorTheme, 'back', 4);
        // helperGrid.data.stroke.width.set(2, viewSpace);
        // helperGrid.data.geometry.boundA.set(-8, -4.5, worldSpace);
        // helperGrid.data.geometry.boundB.set(+8, +4.5, worldSpace);
        // helperGrid.data.geometry.space.set(worldSpace);

        const gridWidth = 8.0;
        const gridSpacing = 0.1;
        const cellWidth = (gridWidth - gridSpacing * (this.size - 1)) / this.size;
        this.cellWidth = cellWidth;

        const graph = new DirectedGraph<VertexData>();
        this.graph = graph;

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const vertexData = new VertexData(this);

                const cell = vertexData.cell;
                cell.data.layer.set(1);
                cell.getSVGElement().addEventListener(
                    'pointerdown',
                    (event: PointerEvent): void => {
                        void event;
                        this.onClick(i, j);
                    },
                    {
                        passive: false,
                    },
                );

                const cellEmph = vertexData.cellEmph;
                cellEmph.data.layer.set(2);

                graph.addVertex(`${i},${j}`, vertexData);
            }
        }

        this.createRandomWalls();
        this.createEdges();

        this.update();
        this.startI = 0;
        this.startJ = 0;
        this.createAnimation();
    }

    onClick(i: number, j: number): void {
        console.log(`Cell clicked: ${i},${j}`);
        const vertex = this.graph.getVertex(`${i},${j}`);
        if (vertex.isWall) {
            console.log('is wall, ignoring');

            return;
        }

        if (i == this.startI && j == this.startJ) return;
        this.startI = i;
        this.startJ = j;

        this.createAnimation();
        this.animator.playMaster();
    }

    createRandomWalls(): void {
        const wallThreshold = 0.25;
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const isWall = Math.random() < wallThreshold ? true : false;
                this.graph.getVertex(`${i},${j}`).isWall = isWall;
            }
        }
    }

    createEdges(): void {
        this.graph.clearEdges();
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                for (let k = this.directionOrder.length - 1; k >= 0; k--) {
                    //for (let k = 0; k < this.directionOrder.length; k++) {
                    const dir = this.directionOrder[k];
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
        const start: VertexId = `${this.startI},${this.startJ}`;

        this.animator.stop();
        this.animator.reset();
        this.animator = new S2StepAnimator(this);

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
                cell.data.fill.color.setFromTheme(colorTheme, 'back', 1);
                cell.data.stroke.color.setFromTheme(colorTheme, 'back', 5);
                cell.data.stroke.width.set(2, viewSpace);
                cell.data.pointerEvents.set('auto');

                const cellEmph = vertex.cellEmph;
                cellEmph.data.layer.set(2);
                cellEmph.data.extents.set(1, 1, viewSpace);
                cellEmph.data.position.setV(center, worldSpace);
                cellEmph.data.anchor.set(0, 0);
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

        console.log('Creating animation');
        const stack: VertexId[] = [];
        const color0 = new S2Color();
        const color1 = new S2Color();
        const strokeColor0 = new S2Color();
        const strokeColor1 = new S2Color();
        const treeColor0 = new S2Color();
        const treeColor1 = new S2Color();
        const tmpColor = new S2Color();
        color0.setFromTheme(colorTheme, 'main', 4);
        color1.setFromTheme(colorTheme, 'secondary', 4);
        strokeColor0.setFromTheme(colorTheme, 'main', 9);
        strokeColor1.setFromTheme(colorTheme, 'secondary', 9);
        treeColor0.setFromTheme(colorTheme, 'main', 12);
        treeColor1.setFromTheme(colorTheme, 'secondary', 12);

        const maxPathIndex = 0.5 * this.size * this.size - 1;
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
            const t = S2MathUtils.clamp01(vertex.depth / maxPathIndex);

            // Circle
            tmpColor.lerp(treeColor0, treeColor1, t);
            vertex.circle.data.fill.color.copy(tmpColor);
            vertex.circle.data.isEnabled.set(true);
            vertex.circle.data.layer.set(4);
            vertex.circle.data.position.copy(vertex.cell.data.position);
            vertex.circle.data.radius.set(1, this.getViewSpace());
            vertex.circle.data.opacity.set(0.0);

            const animCircleRadius = S2LerpAnimFactory.create(this, vertex.circle.data.radius)
                .setCycleDuration(cycleDuration)
                .setEasing(ease.out);
            vertex.circle.data.radius.set(5, this.getViewSpace());
            this.animator.addAnimation(animCircleRadius.commitFinalState(), 'timeline-start', currTime);

            const triggerCircleOpacity0 = new S2TriggerNumber(vertex.circle.data.opacity, 0.0);
            this.animator.addTrigger(triggerCircleOpacity0, 'timeline-start', 0);

            const triggerCircleOpacity1 = new S2TriggerNumber(vertex.circle.data.opacity, 1.0);
            this.animator.addTrigger(triggerCircleOpacity1, 'timeline-start', currTime + 1);

            // Cell emphasis
            tmpColor.lerp(color0, color1, t);
            vertex.cellEmph.data.fill.color.copy(tmpColor);

            tmpColor.lerp(strokeColor0, strokeColor1, t);
            vertex.cellEmph.data.stroke.color.copy(tmpColor);

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
                tmpColor.lerp(treeColor0, treeColor1, t);
                vertex.lineToPrev.data.stroke.color.copy(tmpColor);

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
            this.animator.makeStep();
        }
        this.animator.finalize();
    }
}

const appDiv = document.querySelector<HTMLDivElement>('#app');
if (appDiv) {
    appDiv.innerHTML = `
        <div>
            <h1>${titleString}</h1>
            <div class="figure-panel">
                <p>Choisissez l'ordre des directions (glisser/déposer pour réordonner) :</p>
                <ul id="direction-order" class="dir-list">
                    <li draggable="true" data-dir="U">Haut</li>
                    <li draggable="true" data-dir="D">Bas</li>
                    <li draggable="true" data-dir="L">Gauche</li>
                    <li draggable="true" data-dir="R">Droite</li>
                </ul>
            </div>
            <p>Cliquer sur une cellule pour lancer le parcours depuis cette cellule.</p>
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
const list = document.getElementById('direction-order')!;
let draggedItem: HTMLElement | null = null;

if (svgElement && slider && list) {
    const scene = new SceneFigure(svgElement);
    void scene;

    let index = -1;
    scene.animator.reset();

    document.querySelector<HTMLButtonElement>('#reset-button')?.addEventListener('click', () => {
        index = -1;
        scene.animator.stop();
        scene.animator.reset();
        slider.value = '0';
        console.log('Used vec2 count:', scene.getUsedVecCount());
        console.log('Vec2 pool size:', scene.getVecPoolSize());
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

    // Drag start
    list.addEventListener('dragstart', (e) => {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'LI') return;

        draggedItem = target;
        target.classList.add('dragging');
    });

    // Drag end
    list.addEventListener('dragend', () => {
        draggedItem?.classList.remove('dragging');
        draggedItem = null;

        list.querySelectorAll('.over').forEach((el) => el.classList.remove('over'));
    });

    // Drag over (obligatoire pour autoriser le drop)
    list.addEventListener('dragover', (e) => {
        e.preventDefault();

        const target = e.target as HTMLElement;
        if (!draggedItem || target === draggedItem || target.tagName !== 'LI') return;

        target.classList.add('over');
    });

    list.addEventListener('dragleave', (e) => {
        e.preventDefault();

        const target = e.target as HTMLElement;
        if (!draggedItem || target === draggedItem || target.tagName !== 'LI') return;

        target.classList.remove('over');
    });

    // Drop
    list.addEventListener('drop', (e) => {
        e.preventDefault();

        const target = e.target as HTMLElement;
        if (!draggedItem || target === draggedItem || target.tagName !== 'LI') return;

        target.classList.remove('over');

        const rect = draggedItem.getBoundingClientRect();
        const offset = e.clientX - rect.x;

        if (offset < 0) {
            list.insertBefore(draggedItem, target);
        } else {
            list.insertBefore(draggedItem, target.nextSibling);
        }

        scene.directionOrder = Array.from(list.children).map((li) => (li as HTMLElement).dataset.dir! as Direction);
        scene.createEdges();
        scene.createAnimation();
        //scene.createAnimation();
    });
}
