import './style.css';
import { S2Vec2 } from './core/math/s2-vec2.ts';
import { S2Camera } from './core/math/s2-camera.ts';
import { MTL } from './utils/mtl-colors.ts';
import { S2Circle } from './core/element/s2-circle.ts';
import { S2Path } from './core/element/s2-path.ts';
import { S2Scene } from './core/s2-scene.ts';
import { S2StepAnimator } from './core/animation/s2-step-animator.ts';
import { S2LerpAnim } from './core/animation/s2-lerp-anim.ts';
import { ease } from './core/animation/s2-easing.ts';
import { S2MathUtils } from './core/math/s2-utils.ts';
import { S2DataSetter } from './core/element/base/s2-data-setter.ts';
import { S2BaseData } from './core/element/base/s2-base-data.ts';
import { S2Position } from './core/s2-types.ts';
import { S2ArrowTip } from './core/element/s2-arrow-tip.ts';

const viewportScale = 1.5;
const viewport = new S2Vec2(640.0, 360.0).scale(viewportScale);
const camera = new S2Camera(new S2Vec2(0.0, 0.0), new S2Vec2(8.0, 4.5), viewport, 1.0);

export class TEST {
    static setParent<Data extends S2BaseData>(data: Data, parent: Data): void {
        for (const key of Object.keys(data) as (keyof Data)[]) {
            if (data[key] instanceof S2Position) {
                (data[key] as S2Position).setParent(parent[key] as S2Position);
            }
        }
    }
}

class SceneFigure extends S2Scene {
    protected circle: S2Circle;
    protected path: S2Path;
    public animator: S2StepAnimator;
    //protected node: S2Node;
    // protected styles = {
    //     backBase: new S2Attributes({
    //         fillColor: MTL_COLORS.GREY_6,
    //         strokeColor: MTL_COLORS.GREY_4,
    //         strokeWidth: new S2Length(4, 'view'),
    //         textFillColor: MTL_COLORS.GREY_1,
    //     }),
    //     backSlct: new S2Attributes({
    //         fillColor: MTL_COLORS.BLUE_GREY_9,
    //         strokeColor: MTL_COLORS.LIGHT_BLUE_5,
    //         strokeWidth: new S2Length(4, 'view'),
    //         textFillColor: MTL_COLORS.LIGHT_BLUE_1,
    //     }),
    //     path: new S2Attributes({
    //         strokeColor: MTL_COLORS.CYAN_5,
    //         strokeWidth: new S2Length(4, 'view'),
    //         fillOpacity: 0,
    //         lineCap: 'round',
    //     }),
    // };

    setCircleDefaultStyle(circle: S2Circle): void {
        S2DataSetter.addTarget(circle.data)
            .setFillColor(MTL.GREY_6)
            .setStrokeColor(MTL.GREY_4)
            .setStrokeWidth(4, 'view')
            .setFillOpacity(1.0)
            .setRadius(1, 'world');
    }

    constructor(svgElement: SVGSVGElement) {
        super(svgElement, camera);
        this.animator = new S2StepAnimator(this);

        const fillRect = this.addFillRect();
        S2DataSetter.addTarget(fillRect.data).setColor(MTL.GREY_8);

        const grid = this.addWorldGrid();
        S2DataSetter.addTarget(grid.data).setStrokeColor(MTL.GREY_6);

        this.path = this.addPath();
        this.path.moveTo(-5, 0).cubicTo(0, -4, 0, -4, +5, 0).cubicTo(0, +4, 0, +4, -5, 0).update();
        S2DataSetter.addTarget(this.path.data)
            .setStrokeColor(MTL.CYAN_5)
            .setStrokeWidth(4, 'view')
            .setStrokeLineCap('round')
            .setSpace('world')
            .setPathFrom(0.0)
            .setPathTo(0.0);

        this.circle = this.addCircle();
        this.setCircleDefaultStyle(this.circle);
        this.circle.data.position.set(0, 0, 'world');
        this.circle.data.opacity.set(0.0);
        this.circle.update();

        // const line = this.addLine();
        // S2DataSetter.addTarget(line.data)
        //     .setStrokeColor(MTL.RED_5)
        //     .setStrokeWidth(4, 'view')
        //     .setStartPosition(-6, -2, 'world')
        //     .setEndPosition(6, 2, 'world');
        // line.update();

        const tip = new S2ArrowTip(this);
        this.getSVG().appendChild(tip);
        S2DataSetter.addTarget(tip.data)
            .setFillColor(MTL.GREY_6)
            .setStrokeColor(MTL.GREY_4)
            .setStrokeWidth(4, 'view')
            .setOpacity(1.0);
        tip.setTipableReference(this.path);
        tip.data.ratio.set(1);
        tip.update();

        this.update();

        this.createAnimation();
    }

    createAnimation(): void {
        let anim = new S2LerpAnim(this)
            .addUpdateTarget(this.path)
            .bind(this.path.data.pathTo)
            .setCycleDuration(2000)
            .setEasing(ease.inOut);

        this.path.data.pathTo.set(1.0);
        anim.commitFinalStates();
        this.animator.addAnimation(anim);

        anim = new S2LerpAnim(this)
            .addUpdateTarget(this.path)
            .bind(this.path.data.pathFrom)
            .setCycleDuration(1000)
            .setEasing(ease.inOut);

        this.path.data.pathFrom.set(0.8);

        this.animator.addAnimation(anim.commitFinalStates(), 'previous-start', 1000);

        this.animator.makeStep();

        anim = new S2LerpAnim(this)
            .addUpdateTarget(this.circle)
            .bind(this.circle.data.opacity)
            .setCycleDuration(500)
            .setEasing(ease.inOut);

        this.circle.data.opacity.set(1.0);
        this.animator.addAnimation(anim.commitFinalStates());

        this.animator.makeStep();
        anim = new S2LerpAnim(this)
            .addUpdateTarget(this.circle)
            .addUpdateTarget(this.path)
            .bind(this.circle.data.position)
            .bind(this.circle.data.fill.color);
        anim.bind(this.circle.data.stroke.color)
            .bind(this.path.data.stroke.color)
            .setCycleDuration(600)
            .setCycleCount(3)
            .setAlternate(true)
            .setEasing(ease.inOut);

        const anim2 = new S2LerpAnim(this)
            .addUpdateTarget(this.circle)
            .bind(this.circle.data.radius)
            .setCycleDuration(1800)
            .setEasing(ease.inOut);

        S2DataSetter.addTarget(this.circle.data)
            .setPosition(-2, 0, 'world')
            .setFillColor(MTL.LIGHT_GREEN_9)
            .setStrokeColor(MTL.LIGHT_GREEN_5)
            .setRadius(20, 'view');
        S2DataSetter.addTarget(this.path.data).setStrokeColor(MTL.LIGHT_GREEN_5);

        this.animator.addAnimation(anim.commitFinalStates());
        this.animator.addAnimation(anim2.commitFinalStates(), 'previous-start', 0);
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
    });
}
