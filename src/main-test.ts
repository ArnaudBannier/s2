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
import { S2TextGroup } from './core/element/s2-text-group.ts';

const algorithm =
    '**kw:Tant que** **var:file** non vide **kw:faire**\n' +
    '    **type:Noeud** **var:n** = **fn:Défiler**()\n' +
    '    **fn:Traiter**(**var:n**)\n' +
    '    **fn:Enfiler**(fils gauche de **var:n**)\n' +
    '    **fn:Enfiler**(fils droit de **var:n**)';

type Token = {
    type: string;
    value: string;
};

function tokenizeAlgorithm(input: string): Token[] {
    const tokens: Token[] = [];
    // Regex qui capture :
    // 1. Balises **tag:texte**
    // 2. Espaces
    // 3. Ponctuation ((),=,; etc.)
    // 4. Tout le reste (mots)
    const regex = /\*\*(\w+):(.*?)\*\*|(\s+)|([()=;,.])|([^\s()=;,.]+)/g;

    for (const line of input.split('\n')) {
        let match;
        while ((match = regex.exec(line)) !== null) {
            if (match[1]) {
                tokens.push({ type: match[1], value: match[2] });
            } else if (match[3]) {
                tokens.push({ type: 'space', value: match[3] });
            } else if (match[4]) {
                tokens.push({ type: 'punct', value: match[4] });
            } else if (match[5]) {
                tokens.push({ type: 'plain', value: match[5] });
            }
        }
        tokens.push({ type: 'newline', value: '\n' });
    }
    return tokens;
}

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

        const textGroup = new S2TextGroup(this);
        this.getSVG().appendChild(textGroup);
        S2DataSetter.addTarget(textGroup.data).setLayer(1).setFillColor(MTL.GREY_1);
        textGroup.data.horizontalAlign.set('left');
        textGroup.data.font.copy(font);

        const tokens = tokenizeAlgorithm(algorithm);
        tokens.pop();

        let lineElement = textGroup.addLine();
        for (const token of tokens) {
            lineElement.setPreserveWhitespace(true);
            if (token.type === 'plain') {
                lineElement.addSpan(token.value);
            } else if (token.type === 'newline') {
                lineElement = textGroup.addLine();
            } else {
                const span = lineElement.addSpan(token.value, token.type);
                switch (token.type) {
                    case 'fn':
                        span.data.fill.color.copy(MTL.ORANGE_2);
                        break;
                    case 'type':
                        span.data.fill.color.copy(MTL.CYAN_3);
                        break;
                    case 'kw':
                        span.data.fill.color.copy(MTL.PURPLE_3);
                        span.data.font.weight.set(700);
                        break;
                    case 'var':
                        span.data.fill.color.copy(MTL.LIGHT_BLUE_1);
                        //span.data.font.style.set('italic');
                        break;
                    case 'punct':
                        span.data.fill.color.copy(MTL.PURPLE_1);
                        break;
                }
                span.update();
            }
        }
        textGroup.update();

        const background = this.addRect();
        S2DataSetter.addTarget(background.data)
            .setLayer(0)
            .setColor(MTL.GREY_9)
            .setExtentsV(textGroup.getExtents('view').add(10, 10), 'view');

        const funcSpan = textGroup.getLine(0).findTSpan({ category: 'kw' });
        if (funcSpan) {
            console.log('funcSpan', funcSpan);
            //funcSpan.data.fill.color.copy(MTL.WHITE);
            const bbox = funcSpan.getBBox();
            const rect = this.addRect();
            S2DataSetter.addTarget(rect.data)
                .setLayer(0)
                .setStrokeColor(MTL.RED_5)
                .setStrokeWidth(1, 'view')
                .setFillOpacity(0.0)
                .setExtents(bbox.width / 2 + 4, bbox.height / 2 + 2, 'view')
                .setPosition(bbox.x + bbox.width / 2, bbox.y + bbox.height / 2, 'view');
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
        scene.update();
    });

    slider.addEventListener('input', () => {
        const ratio = slider.valueAsNumber / 100;
        scene.animator.stop();
        scene.animator.setMasterElapsed(ratio * scene.animator.getMasterDuration());
    });
}
