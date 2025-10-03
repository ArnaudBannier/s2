import './style.css';
import { S2Vec2 } from '../core/math/s2-vec2.ts';
import { S2Camera } from '../core/math/s2-camera.ts';
import { MTL } from '../utils/mtl-colors.ts';
import { S2Scene } from '../core/scene/s2-scene.ts';
import { S2StepAnimator } from '../core/animation/s2-step-animator.ts';
import { S2LerpAnimFactory } from '../core/animation/s2-lerp-anim.ts';
import { ease } from '../core/animation/s2-easing.ts';
import { S2MathUtils } from '../core/math/s2-utils.ts';
import { S2DataSetter } from '../core/element/base/s2-data-setter.ts';
import { S2PlainNode } from '../core/element/node/s2-plain-node.ts';
import type { S2Anchor } from '../core/shared/s2-globals.ts';
import { S2CubicEdge } from '../core/element/node/s2-edge.ts';
import { S2AnimGroup } from '../core/animation/s2-anim-group.ts';

const viewportScale = 1.5;
const viewport = new S2Vec2(640.0, 360.0).scale(viewportScale);
const camera = new S2Camera(new S2Vec2(0.0, 0.0), new S2Vec2(8.0, 4.5), viewport, 1.0);

class SceneFigure extends S2Scene {
    public animator: S2StepAnimator;
    protected nodes: S2PlainNode[] = [];

    setNodeDefaultStyle(node: S2PlainNode): void {
        S2DataSetter.setTargets(node.data)
            .setPadding(10, 5, 'view')
            .setMinExtents(0.5, 0.5, 'world')
            // Background
            .setTargets(node.data.background)
            .setFillColor(MTL.GREY_9)
            .setStrokeColor(MTL.GREY_5)
            .setStrokeWidth(2, 'view')
            .setCornerRadius(10, 'view')
            // Text
            .setTargets(node.data.text)
            .setColor(MTL.WHITE)
            .setHorizontalAlign('center')
            .setVerticalAlign('middle')
            .setFontWeight(700);
    }

    constructor(svgElement: SVGSVGElement) {
        super(svgElement, camera);
        this.animator = new S2StepAnimator(this);

        const fillRect = this.addFillRect();
        S2DataSetter.setTargets(fillRect.data).setColor(MTL.GREY_8);

        const grid = this.addWorldGrid();
        S2DataSetter.setTargets(grid.data).setStrokeColor(MTL.GREY_6);

        const circle = this.addCircle();
        S2DataSetter.setTargets(circle.data)
            .setRadius(3, 'world')
            .setFillOpacity(0)
            .setStrokeColor(MTL.BLUE_9)
            .setStrokeWidth(2, 'view');

        const anchors: S2Anchor[] = [
            'west',
            'south-west',
            'south',
            'south-east',
            'east',
            'north-east',
            'north',
            'north-west',
        ];

        for (let i = 0; i < 8; i++) {
            const node = new S2PlainNode(this);
            node.setParent(this.getSVG());
            this.setNodeDefaultStyle(node);
            node.setContent(i.toString());
            node.data.background.shape.set('rectangle');
            node.data.position.setV(S2Vec2.fromPolarDeg(i * 45, 3), 'world');
            node.data.anchor.set(anchors[i]);

            this.nodes.push(node);
        }

        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = -1; j < 2; j += 2) {
                const edge = new S2CubicEdge(this);
                edge.setParent(this.getSVG());
                edge.data.stroke.color.copy(MTL.GREY_5);
                edge.data.start.set(this.nodes[i]);
                edge.data.end.set(this.nodes[(i + 1) % this.nodes.length]);
                edge.data.startDistance.set(10, 'view');
                edge.data.endDistance.set(10, 'view');
                edge.data.curveBendAngle.set(j * 15);
            }
        }
        this.update();

        this.createAnimation();
    }

    createAnimation(): void {
        for (let i = 0; i < this.nodes.length; i++) {
            const node = this.nodes[i];
            const anim = S2LerpAnimFactory.create(this, node.data.position).setCycleDuration(500).setEasing(ease.out);

            node.data.position.setV(S2Vec2.fromPolarDeg(i * 45, 2.5), 'world');
            anim.commitFinalState();
            if (i === 0) {
                this.animator.addAnimation(anim, 'previous-end', 0);
            } else {
                this.animator.addAnimation(anim, 'previous-start', 40);
            }
        }
        this.animator.makeStep();
        let first = true;
        for (let i = 0; i < this.nodes.length; i++) {
            const node = this.nodes[i];
            const group = new S2AnimGroup(this).addLerpProperties(
                [
                    node.data.background.cornerRadius,
                    node.data.background.fill.color,
                    node.data.text.fill.color,
                    node.data.minExtents,
                ],
                500,
                ease.inOut,
            );

            S2DataSetter.setTargets(node.data)
                .setMinExtents(0.35, 0.35, 'world')
                // Background
                .setTargets(node.data.background)
                .setFillColor(MTL.GREY_5)
                .setCornerRadius(0.35, 'world')
                // Text
                .setTargets(node.data.text)
                .setColor(MTL.BLACK);

            group.commitLerpFinalStates();

            if (first) {
                this.animator.addAnimation(group, 'previous-end', 0);
                first = false;
            } else {
                this.animator.addAnimation(group, 'previous-start', 40);
            }
        }

        this.animator.makeStep();

        for (let i = 0; i < this.nodes.length; i++) {
            const node = this.nodes[i];
            const anim = S2LerpAnimFactory.create(this, node.data.position).setCycleDuration(500).setEasing(ease.inOut);

            node.data.position.setV(S2Vec2.fromPolarDeg(i * 45, 3), 'world');
            anim.commitFinalState();
            this.animator.addAnimation(anim, 'previous-start', 0);
        }
        this.animator.makeStep();
    }
}

const appDiv = document.querySelector<HTMLDivElement>('#app');
if (appDiv) {
    appDiv.innerHTML = `
        <div>
            <h1>My first SVG</h1>
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
    });
    document.querySelector<HTMLButtonElement>('#prev-button')?.addEventListener('click', () => {
        index = S2MathUtils.clamp(index - 1, 0, scene.animator.getStepCount() - 1);
        scene.animator.playStep(index);
    });
    document.querySelector<HTMLButtonElement>('#next-button')?.addEventListener('click', () => {
        index = S2MathUtils.clamp(index + 1, 0, scene.animator.getStepCount() - 1);
        scene.animator.playStep(index);
    });
    document.querySelector<HTMLButtonElement>('#play-button')?.addEventListener('click', () => {
        scene.animator.playStep(index);
    });
    document.querySelector<HTMLButtonElement>('#full-button')?.addEventListener('click', () => {
        scene.animator.playMaster();
    });

    slider.addEventListener('input', () => {
        const ratio = slider.valueAsNumber / 100;
        scene.animator.stop();
        scene.animator.setMasterElapsed(ratio * scene.animator.getMasterDuration());
        scene.getSVG().update();
    });
}
