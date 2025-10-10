import { S2Vec2 } from '../../src/core/math/s2-vec2.ts';
import { S2Camera } from '../../src/core/math/s2-camera.ts';
import { MTL } from '../../src/utils/mtl-colors.ts';
import { S2MathUtils } from '../../src/core/math/s2-utils.ts';
import { S2Memory } from '../../src/extension/s2-memory.ts';
import { BaseMemoryScene } from './base-memory-scene.ts';
import { S2Code, tokenizeAlgorithm } from '../../src/core/element/s2-code.ts';

const titleString = 'Etat de la mémoire : instructions simples 2';
const codeString =
    '**type:int** **fn:main**(**type:void**) {\n' +
    '    **type:short** **var:a** = **num:7**;\n' +
    '    **type:float** **var:f** = **num:3.14f**;\n' +
    '    **type:double** **var:d**, **var:g** = **num:2**;\n' +
    '    **type:int** **var:i** = **num:0**;\n' +
    '    \n' +
    '    **var:f** += **var:a**;\n' +
    '    **var:g** = **var:a** + **var:i**;\n' +
    '    **var:i**++;\n' +
    '    **var:f** = **var:a** - **var:i**;\n' +
    '    **kw:return** **num:0**;\n' +
    '}';

const viewportScale = 1.5;
const viewport = new S2Vec2(640.0, 360.0).scale(viewportScale);
const camera = new S2Camera(new S2Vec2(0.0, 0.0), new S2Vec2(8.0, 4.5), viewport, 1.0);

class SceneFigure extends BaseMemoryScene {
    public memory: S2Memory;
    public code: S2Code;

    constructor(svgElement: SVGSVGElement) {
        super(svgElement, camera);

        // const grid = this.addWorldGrid();
        // S2DataSetter.setTargets(grid.data).setStrokeColor(MTL.GREY_9);

        this.code = new S2Code(this);
        this.code.setParent(this.getSVG());
        this.setDefaultCodeStyle(this.code);
        this.code.setContent(tokenizeAlgorithm(codeString));

        const addressCount = 10;
        this.memory = new S2Memory(this, addressCount, {
            isStacked: true,
            addressStart: 64,
            addressPrefix: '@',
            addressRadix: 10,
        });
        this.memory.setParent(this.getSVG());
        this.setDefaultMemoryStyle(this.memory);
        this.update();

        this.createAnimation();
    }

    createAnimation(): void {
        this.animator.makeStep();
        const numberColor = MTL.LIME_2;
        const undefinedColor = MTL.RED_3;
        //const charColor = MTL.DEEP_ORANGE_2;
        let currLine = 1;

        // short a = 7;
        this.code.animateSetCurrentLine(currLine++, this.animator);
        const varA = this.memory.createMemoryId();
        varA.animateSetNameAndValue('a', '7', this.animator, { valueColor: numberColor });
        this.animator.makeStep();
        this.update();

        // float f = 3.14f;
        this.code.animateSetCurrentLine(currLine++, this.animator);
        const varF = this.memory.createMemoryId();
        varF.animateSetNameAndValue('f', '3.14', this.animator, {
            valueColor: numberColor,
        });
        this.animator.makeStep();
        this.update();

        // double d, g = 2;
        this.code.animateSetCurrentLine(currLine++, this.animator);
        const varD = this.memory.createMemoryId();
        const varG = this.memory.createMemoryId();
        let label = this.animator.createLabelAtCurrentTime();
        varD.animateSetNameAndValue('d', '?', this.animator, { label: label, valueColor: undefinedColor });
        varG.animateSetNameAndValue('g', '2', this.animator, {
            label: label,
            offset: 100,
            valueColor: numberColor,
        });
        this.animator.makeStep();
        this.update();

        // int i = 0;
        this.code.animateSetCurrentLine(currLine++, this.animator);
        const varI = this.memory.createMemoryId();
        label = this.animator.createLabelAtCurrentTime();
        varI.animateSetNameAndValue('i', '0', this.animator, { label: label, valueColor: numberColor });
        this.animator.makeStep();
        this.update();

        // f += a;
        currLine++;
        this.code.animateSetCurrentLine(currLine++, this.animator);
        varF.animateSetValue('10.14', this.animator, { color: numberColor });
        this.animator.makeStep();
        this.update();

        // g = a + i;
        this.code.animateSetCurrentLine(currLine++, this.animator);
        varG.animateSetValue('7', this.animator, { color: numberColor });
        this.animator.makeStep();
        this.update();

        // i++;
        this.code.animateSetCurrentLine(currLine++, this.animator);
        varI.animateSetValue('1', this.animator, { color: numberColor });
        this.animator.makeStep();
        this.update();

        // f = a - i;
        this.code.animateSetCurrentLine(currLine++, this.animator);
        varF.animateSetValue('6', this.animator, { color: numberColor });
        this.animator.makeStep();
        this.update();

        // return 0;
        this.code.animateSetCurrentLine(currLine++, this.animator);
        this.animator.makeStep();
        this.update();
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
