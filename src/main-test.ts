import './style.css';
import { S2Vec2 } from './core/math/s2-vec2.ts';
import { S2Camera } from './core/math/s2-camera.ts';
import { MTL } from './utils/mtl-colors.ts';
import { S2Circle } from './core/element/s2-circle.ts';
import { S2Scene } from './core/s2-scene.ts';
import { S2StepAnimator } from './core/animation/s2-step-animator.ts';
import { S2MathUtils } from './core/math/s2-utils.ts';
import { S2DataSetter } from './core/element/base/s2-data-setter.ts';
import { S2BaseData, S2FontData } from './core/element/base/s2-base-data.ts';
import { S2Position } from './core/s2-types.ts';

const algorithm = `Tant que file non vide faire
    Noeud n = Défiler()
    Traiter(n)
    Enfiler(fils gauche de n)
    Enfiler(fils droit de n)`;

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
    public animator: S2StepAnimator;

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

        const font = new S2FontData();
        font.family.set('monospace');

        const node = this.addNode(1);
        node.data.text.font.copy(font);
        node.data.text.horizontalAlign.set('left');
        node.data.text.fill.color.copy(MTL.GREY_1);

        const lines = algorithm.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const lineElement = node.addLine();
            let line = lines[i];
            let tabCount = 0;
            while (line.indexOf('    ') === 0) {
                line = line.slice(4);
                tabCount++;
                console.log('tab', tabCount);
            }
            const tspan = lineElement.addSpan(line);
            tspan.data.tabsize.set(tabCount);
            tspan.update();
        }

        this.update();
    }

    createAnimation(): void {}
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
