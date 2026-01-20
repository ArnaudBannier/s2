import { MTL } from '../../src/utils/mtl-colors.ts';
import { S2Scene } from '../../src/core/scene/s2-scene.ts';
import { S2StepAnimator } from '../../src/core/animation/s2-step-animator.ts';
import { S2MathUtils } from '../../src/core/math/s2-math-utils.ts';
import { S2PlainNode } from '../../src/core/element/node/s2-plain-node.ts';
import { S2CubicEdge } from '../../src/core/element/node/s2-cubic-edge.ts';

const titleString = 'Algorithme de Dijkstra';

import { S2ColorTheme, type S2Palette } from '../../src/core/shared/s2-color-theme.ts';

import * as radixDark from '../../src/utils/radix-colors-dark.ts';
import * as radixLight from '../../src/utils/radix-colors-light.ts';

let mode = 1; // 0 = dark, 1 = light
let palette: S2Palette;
if (mode === 0) {
    palette = {
        back: radixDark.slateDark,
        main: radixDark.cyanDark,
        secondary: radixDark.slateDark,
        blue: radixDark.blueDark,
        red: radixDark.redDark,
        cyan: radixDark.cyanDark,
    };
} else {
    palette = {
        back: radixLight.slate,
        main: radixLight.cyan,
        secondary: radixLight.slate,
        blue: radixLight.blue,
        red: radixLight.red,
        cyan: radixLight.cyan,
    };
}
const colorTheme = new S2ColorTheme(palette);

class SceneFigure extends S2Scene {
    public animator: S2StepAnimator;

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
        //data.text.stroke.color.copy(MTL.BLACK);
        //data.text.stroke.width.set(3, this.viewSpace);
        data.text.font.size.set(24, this.getViewSpace());
        data.background.shape.set('circle');
    }

    setEdgeDefaultStyle(edge: S2CubicEdge): void {
        const data = edge.data;
        data.stroke.color.setFromTheme(colorTheme, 'main', 8);
        data.stroke.width.set(4, this.getViewSpace());
        data.startDistance.set(5, this.viewSpace);
        data.endDistance.set(12, this.viewSpace);
        data.pathFrom.set(0);
    }

    setEdgeEmphStyle(edge: S2CubicEdge): void {
        const data = edge.data;
        data.stroke.color.copy(MTL.WHITE);
        data.stroke.width.set(6, this.getViewSpace());
        data.startDistance.set(0, this.viewSpace);
        data.endDistance.set(12, this.viewSpace);
        data.pathFrom.set(0);
    }

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
        fillRect.data.color.setFromTheme(colorTheme, 'back', 1);

        const grid = this.addWorldGrid();
        grid.data.stroke.color.setFromTheme(colorTheme, 'back', 3);
        grid.data.stroke.width.set(2, viewSpace);
        grid.data.geometry.boundA.set(-8, -4.5, worldSpace);
        grid.data.geometry.boundB.set(+8, +4.5, worldSpace);
        grid.data.geometry.space.set(worldSpace);

        const nodeCount = 7;
        const nodes: S2PlainNode[] = [];
        for (let i = 0; i < nodeCount; i++) {
            const node = new S2PlainNode(this);
            node.setParent(this.getSVG());
            this.setNodeDefaultStyle(node);
            node.setContent(i.toString());
            nodes.push(node);
        }

        const halfW = 4;
        const halfH = 2;
        nodes[0].data.position.set(-halfW, 0, worldSpace);
        nodes[1].data.position.set(-halfW / 2, +halfH, worldSpace);
        nodes[2].data.position.set(-halfW / 2, -halfH, worldSpace);
        nodes[3].data.position.set(0, 0, worldSpace);
        nodes[4].data.position.set(+halfW / 2, +halfH, worldSpace);
        nodes[5].data.position.set(+halfW / 2, -halfH, worldSpace);
        nodes[6].data.position.set(halfW, 0, worldSpace);

        const edgesInfo = [
            [0, 1, -45],
            [0, 2, +45],
            [1, 3, 0],
            [1, 4, 0],
            [2, 1, 0],
            [2, 3, 0],
            [2, 5, 0],
            [3, 5, 0],
            [3, 6, 0],
            [4, 6, -45],
            [5, 6, +45],
        ];
        for (const edgeInfo of edgesInfo) {
            const edge = new S2CubicEdge(this, nodes[edgeInfo[0]], nodes[edgeInfo[1]]);
            edge.setParent(this.getSVG());
            this.setEdgeDefaultStyle(edge);
            if (edgeInfo[2] !== 0) {
                edge.data.bendAngle.set(edgeInfo[2]);
                edge.data.startTension.set(0.4);
                edge.data.endTension.set(0.4);
            }
            const tip = edge.createArrowTip();
            tip.data.pathStrokeFactor.set(0.5);
        }
        // for (const edgeInfo of edgesInfo) {
        //     const edge = new S2CubicEdge(this, nodes[edgeInfo[0]], nodes[edgeInfo[1]]);
        //     edge.setParent(this.getSVG());
        //     this.setEdgeEmphStyle(edge);
        //     if (edgeInfo[2] !== 0) {
        //         edge.data.bendAngle.set(edgeInfo[2]);
        //         edge.data.startTension.set(0.4);
        //         edge.data.endTension.set(0.4);
        //     }
        //     edge.createArrowTip();
        // }

        this.update();
        this.createAnimation();
    }

    createAnimation(): void {
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
                <button id="play-button"><i class="fa-solid fa-redo"><n/i></button>
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
