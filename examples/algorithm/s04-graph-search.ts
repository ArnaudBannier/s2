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
// import { S2LerpAnimFactory } from '../../src/core/animation/s2-lerp-anim.ts';
// import { ease } from '../../src/core/animation/s2-easing.ts';
import { S2Color } from '../../src/core/shared/s2-color.ts';
import { S2AnimatableColor, S2AnimatableExtents } from '../../src/core/animation/s2-animatable.ts';
import { S2TriggerAnimatableColor, S2TriggerAnimatableExtents } from '../../src/core/animation/s2-timeline-trigger.ts';

let mode = 0; // 0 = dark, 1 = light
let palette: S2Palette;
if (mode === 0) {
    palette = {
        back: radixDark.slateDark,
        main: radixDark.cyanDark,
        secondary: radixDark.limeDark,
        wall: radixDark.rubyDark,
        blue: radixDark.blueDark,
        red: radixDark.redDark,
        cyan: radixDark.cyanDark,
    };
} else {
    palette = {
        back: radixLight.slate,
        main: radixLight.cyan,
        secondary: radixLight.lime,
        wall: radixLight.ruby,
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

class VertexData {
    public cell: S2Rect;
    public cellEmph: S2Rect;
    public isWall: boolean = false;
    public visited: boolean = false;
    public inStack: boolean = false;
    public prevId: VertexId | null = null;
    public isInPath: boolean = false;
    public wasInPath: boolean = false;
    public depth: number = -1;

    public animFill: S2AnimatableColor;
    public animStroke: S2AnimatableColor;
    public animExtents: S2AnimatableExtents;

    constructor(cell: S2Rect, cellEmph: S2Rect) {
        this.cell = cell;
        this.cellEmph = cellEmph;
        this.animFill = new S2AnimatableColor(cell.getScene(), cellEmph.data.fill.color);
        this.animStroke = new S2AnimatableColor(cell.getScene(), cellEmph.data.stroke.color);
        this.animExtents = new S2AnimatableExtents(cellEmph.getScene(), cellEmph.data.extents);
    }
}

class SceneFigure extends S2Scene {
    public animator: S2StepAnimator;
    public graph: DirectedGraph<VertexData>;
    public size: number = 10;

    protected cellWidth: number;

    constructor(svgElement: SVGSVGElement) {
        super(svgElement);
        this.camera.setExtents(8.0, 4.5);
        this.setViewportSize(640.0 * 1.5, 360.0 * 1.5);

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
        const gridSpacing = 0.05;
        const cellWidth = (gridWidth - gridSpacing * (this.size - 1)) / this.size;
        const cellSep = cellWidth + gridSpacing;
        this.cellWidth = cellWidth;

        const neighborShifts = [
            [+1, +0],
            [+0, -1],
            [-1, +0],
            [+0, +1],
        ];

        const graph = new DirectedGraph<VertexData>();
        this.graph = graph;
        const nw = new S2Vec2(-gridWidth / 2, -gridWidth / 2);
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const center = new S2Vec2(
                    nw.x + j * cellSep + cellWidth / 2,
                    nw.y + (this.size - 1 - i) * cellSep + cellWidth / 2,
                );
                const cell = new S2Rect(this);
                cell.setParent(this.getSVG());
                cell.data.layer.set(1);
                cell.data.extents.set(cellWidth / 2, cellWidth / 2, worldSpace);
                cell.data.position.setV(center, worldSpace);
                cell.data.anchor.set(0, 0);
                cell.data.fill.color.setFromTheme(colorTheme, 'back', 1);
                cell.data.stroke.color.setFromTheme(colorTheme, 'back', 5);
                cell.data.stroke.width.set(2, viewSpace);

                const cellEmph = new S2Rect(this);
                cellEmph.setParent(this.getSVG());
                cellEmph.data.layer.set(2);
                cellEmph.data.extents.set(cellWidth / 20, cellWidth / 20, worldSpace);
                cellEmph.data.position.setV(center, worldSpace);
                cellEmph.data.anchor.set(0, 0);
                cellEmph.data.opacity.set(1);
                cellEmph.data.fill.color.setFromTheme(colorTheme, 'main', 1);
                cellEmph.data.stroke.color.setFromTheme(colorTheme, 'main', 5);
                cellEmph.data.stroke.width.set(2, viewSpace);

                const data = new VertexData(cell, cellEmph);
                graph.addVertex(`${i},${j}`, data);
            }
        }

        const start = new S2Vec2(this.size - 1, 0);

        // Define some random walls
        const wallThreshold = 0.3;
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (i === start.x && j === start.y) {
                    continue;
                }
                if (Math.random() < wallThreshold) {
                    graph.getVertex(`${i},${j}`).isWall = true;
                    graph.getVertex(`${i},${j}`).cell.data.fill.color.setFromTheme(colorTheme, 'wall', 8);
                    graph.getVertex(`${i},${j}`).cell.data.stroke.color.setFromTheme(colorTheme, 'wall', 11);
                }
            }
        }

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                for (const shifts of neighborShifts) {
                    const ni = i + shifts[0];
                    const nj = j + shifts[1];
                    if (ni < 0 || ni >= this.size || nj < 0 || nj >= this.size) {
                        continue;
                    }
                    if (graph.getVertex(`${ni},${nj}`).isWall) {
                        continue;
                    }
                    graph.setEdge(`${i},${j}`, `${ni},${nj}`, {});
                }
            }
        }

        graph.getVertex(`${start.x},${start.y}`).cell.data.fill.color.setFromTheme(colorTheme, 'main', 7);

        this.update();

        this.createAnimation(`${start.x},${start.y}`);
    }

    createAnimation(start: VertexId): void {
        console.log('Creating animation');
        const stack: VertexId[] = [];
        const color0 = new S2Color();
        const color1 = new S2Color();
        const strokeColor0 = new S2Color();
        const strokeColor1 = new S2Color();
        const tmpColor = new S2Color();
        color0.setFromTheme(colorTheme, 'main', 6);
        color1.setFromTheme(colorTheme, 'secondary', 6);
        strokeColor0.setFromTheme(colorTheme, 'main', 10);
        strokeColor1.setFromTheme(colorTheme, 'secondary', 10);

        const maxPathIndex = 0.5 * this.size * this.size - 1;
        stack.push(start);
        this.graph.getVertex(start).depth = 0;

        let currTime = 0;
        const timeStep = 50;
        const cycleDuration = 500;

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const v = this.graph.getVertex(`${i},${j}`);
                v.animFill.setDuration(cycleDuration);

                const trigger = new S2TriggerAnimatableColor(v.animFill, v.cell.data.fill.color);
                this.animator.addTrigger(trigger, 'timeline-start', currTime);

                const triggerStroke = new S2TriggerAnimatableColor(v.animStroke, v.cell.data.stroke.color);
                this.animator.addTrigger(triggerStroke, 'timeline-start', currTime);

                const triggerExtents = new S2TriggerAnimatableExtents(v.animExtents, v.cellEmph.data.extents);
                this.animator.addTrigger(triggerExtents, 'timeline-start', currTime);

                // if (v.isWall === false) {
                //     const w = this.cellWidth * 0.25;
                //     v.cell.data.extents.set(w, w, this.getWorldSpace());
                // }
            }
        }

        while (stack.length > 0) {
            const current = stack.pop()!;
            const vertex = this.graph.getVertex(current);
            if (vertex.visited) {
                continue;
            }
            vertex.visited = true;

            // const fillAnim = S2LerpAnimFactory.create(this, vertex.cell.data.fill.color)
            //     .setCycleDuration(50)
            //     .setEasing(ease.inOut);
            // vertex.cell.data.fill.color.setFromTheme(colorTheme, 'main', 5);
            // this.animator.addAnimation(fillAnim.commitFinalState());

            // const strokeAnim = S2LerpAnimFactory.create(this, vertex.cell.data.stroke.color)
            //     .setCycleDuration(50)
            //     .setEasing(ease.inOut);
            // vertex.cell.data.stroke.color.setFromTheme(colorTheme, 'main', 7);
            // this.animator.addAnimation(strokeAnim.commitFinalState(), 'previous-start', 0);
            //this.animator.makeStep();

            for (let i = 0; i < this.size; i++) {
                for (let j = 0; j < this.size; j++) {
                    const v = this.graph.getVertex(`${i},${j}`);
                    v.wasInPath = v.isInPath;
                    v.isInPath = false;
                }
            }

            let currVertex = vertex;
            while (true) {
                currVertex.isInPath = true;
                if (currVertex.prevId === null) {
                    break;
                }
                currVertex = this.graph.getVertex(currVertex.prevId);
            }

            //const label = this.animator.createLabelAtCurrentTime();
            for (let i = 0; i < this.size; i++) {
                for (let j = 0; j < this.size; j++) {
                    const vertexId = `${i},${j}`;
                    const v = this.graph.getVertex(vertexId);

                    // if (inStack.has(vertexId) && !visited.has(vertexId)) {
                    // }

                    if (v.isInPath && !v.wasInPath) {
                        // const fillAnim = S2LerpAnimFactory.create(this, v.cell.data.fill.color)
                        //     .setCycleDuration(cycleDuration)
                        //     .setEasing(ease.inOut);
                        const t = S2MathUtils.clamp01(v.depth / maxPathIndex);
                        tmpColor.lerp(color0, color1, t);
                        //this.animator.addAnimation(fillAnim.commitFinalState(), 'start', currTime);

                        const trigger = new S2TriggerAnimatableColor(v.animFill, tmpColor);
                        this.animator.addTrigger(trigger, 'timeline-start', currTime);

                        tmpColor.lerp(strokeColor0, strokeColor1, t);
                        const triggerStroke = new S2TriggerAnimatableColor(v.animStroke, tmpColor);
                        this.animator.addTrigger(triggerStroke, 'timeline-start', currTime);

                        v.cellEmph.data.extents.set(this.cellWidth / 2, this.cellWidth / 2, this.getWorldSpace());
                        const triggerExtents = new S2TriggerAnimatableExtents(v.animExtents, v.cellEmph.data.extents);
                        this.animator.addTrigger(triggerExtents, 'timeline-start', currTime);
                    }
                    if (!v.isInPath && v.wasInPath) {
                        // const fillAnim = S2LerpAnimFactory.create(this, v.cell.data.fill.color)
                        //     .setCycleDuration(cycleDuration)
                        //     .setEasing(ease.inOut);
                        // v.cell.data.fill.color.setFromTheme(colorTheme, 'back', 7);
                        // this.animator.addAnimation(fillAnim.commitFinalState(), 'start', currTime);

                        tmpColor.setFromTheme(colorTheme, 'back', 5);
                        const trigger = new S2TriggerAnimatableColor(v.animFill, tmpColor);
                        this.animator.addTrigger(trigger, 'timeline-start', currTime);

                        tmpColor.setFromTheme(colorTheme, 'back', 6);
                        const strokeTrigger = new S2TriggerAnimatableColor(v.animStroke, tmpColor);
                        this.animator.addTrigger(strokeTrigger, 'timeline-start', currTime);
                    }
                }
            }
            currTime += timeStep;

            for (const edge of this.graph.edgesOf(current)) {
                const nextId = edge.to;
                const nextVertex = this.graph.getVertex(nextId);
                if (!nextVertex.visited) {
                    stack.push(nextId);
                    nextVertex.inStack = true;
                    nextVertex.prevId = current;
                    nextVertex.depth = vertex.depth + 1;
                }
            }

            vertex.inStack = false;
        }
        // this.animator.makeStep();
        // this.animator.finalize();
    }
}

const appDiv = document.querySelector<HTMLDivElement>('#app');
if (appDiv) {
    appDiv.innerHTML = `
        <div>
            <h1>${titleString}</h1>
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
}
