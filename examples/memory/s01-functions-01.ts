import { S2Vec2 } from '../../src/core/math/s2-vec2.ts';
import { S2Camera } from '../../src/core/math/s2-camera.ts';
import { MTL } from '../../src/utils/mtl-colors.ts';
import { S2MathUtils } from '../../src/core/math/s2-math-utils.ts';
import { S2Memory } from '../../src/extension/s2-memory.ts';
import { BaseMemoryScene } from './base-memory-scene.ts';
import { S2Code, tokenizeAlgorithm } from '../../src/core/element/s2-code.ts';

const titleString = 'Etat de la mémoire : fonctions simples 1';

const codeStringMain =
    '**type:int** **fn:main**(**type:void**) {\n' +
    '    **type:short** **var:a** = **num:1337**;\n' +
    '    **type:int** **var:b** = (**type:int**)**var:a** / **num:133**;\n' +
    '    **var:b** = **fn:func**(**var:a**, **var:b**);\n' +
    '    **kw:return** **num:0**;\n' +
    '}';
const codeStringFunc =
    '**type:int** **fn:func**(**type:short** **var:a**, **type:int** **var:b**) {\n' +
    '    **type:int** **var:res** = **var:a** + **var:b** / **num:100**;\n' +
    '    **kw:for** (**type:int** **var:i** = **num:0**; **var:i** < **var:b**; **var:i**++)\n' +
    '        **var:res** += (**type:int**)**var:a** / **num:100**;\n' +
    '    **kw:return** **var:res**;\n' +
    '}';
//const codeString = codeStringMain + '\n\n' + codeStringFunc;

const viewportScale = 1.5;
const viewport = new S2Vec2(640.0, 360.0).scale(viewportScale);
const camera = new S2Camera(new S2Vec2(0.0, 0.0), new S2Vec2(8.0, 4.5), viewport);

class SceneFigure extends BaseMemoryScene {
    public memory: S2Memory;
    //public code: S2Code;
    public codeFunc: S2Code;
    public codeMain: S2Code;

    constructor(svgElement: SVGSVGElement) {
        super(svgElement, camera);

        // const grid = this.addWorldGrid();
        // grid.data.stroke.color.copy(MTL.GREY_9);

        // this.code = new S2Code(this);
        // this.code.setParent(this.getSVG());
        // this.setDefaultCodeStyle(this.code);
        // this.code.setContent(tokenizeAlgorithm(codeString));

        this.codeMain = new S2Code(this);
        this.codeMain.setParent(this.getSVG());
        this.setDefaultCodeStyle(this.codeMain);
        this.codeMain.setContent(tokenizeAlgorithm(codeStringMain));
        this.codeMain.data.position.set(-6, 4.0, 'world');
        this.codeMain.data.anchor.set('north-west');

        this.codeFunc = new S2Code(this);
        this.codeFunc.setParent(this.getSVG());
        this.setDefaultCodeStyle(this.codeFunc);
        this.codeFunc.setContent(tokenizeAlgorithm(codeStringFunc));

        const addressCount = 10;
        this.memory = new S2Memory(this, addressCount, {
            isStacked: true,
            addressStart: 64,
            addressPrefix: '@',
            addressRadix: 10,
        });
        this.memory.setParent(this.getSVG());
        this.setDefaultMemoryStyle(this.memory);
        this.memory.data.position.set(6, 0, 'world');
        this.update();

        this.createAnimation();
    }

    createAnimation(): void {
        this.animator.makeStep();
        const numberColor = MTL.LIME_2;
        //const undefinedColor = MTL.RED_3;
        const freeColor = MTL.GREY_5;
        let currLine = 1;

        // short a = 1337
        this.codeMain.animateSetCurrentLine(currLine++, this.animator);
        const varA = this.memory.createMemoryId();
        varA.animateSetNameAndValue('a', '1337', this.animator, { valueColor: numberColor });
        this.animator.makeStep();
        this.update();

        // int b = (int)a / 133;
        this.codeMain.animateSetCurrentLine(currLine++, this.animator);
        const varB = this.memory.createMemoryId();
        varB.animateSetNameAndValue('b', '10', this.animator, { valueColor: numberColor });
        this.animator.makeStep();
        this.update();

        // b = func(a, b);
        this.codeMain.animateSetCurrentLine(currLine++, this.animator);
        let label = this.animator.createLabelAtCurrentTime();
        let codeHighlight = this.codeMain.createTokenHighlight(
            [{ lineIndex: currLine - 1, content: 'func' }],
            MTL.CYAN,
        );
        codeHighlight.animateFadeIn(this.animator, { label: label });
        this.animateCallIn(this.codeMain, this.codeFunc, 3);
        varB.animateHLine(this.animator, { color: MTL.CYAN, width: 4, label: label });

        this.animator.makeStep();
        this.update();

        const varFuncA = this.memory.createMemoryId();
        const varFuncB = this.memory.createMemoryId();
        label = this.animator.createLabelAtCurrentTime();
        varFuncA.animateSetName('a', this.animator, { label: label });
        varFuncB.animateSetName('b', this.animator, { label: label, offset: 100 });
        varFuncA.animateCopyValue(varA, this.animator, { color: numberColor });
        varFuncB.animateCopyValue(varB, this.animator, { color: numberColor });

        this.animator.makeStep();
        this.update();

        // int res = a + b / 100;
        this.codeFunc.animateSetCurrentLine(1, this.animator);
        const varFuncRes = this.memory.createMemoryId();
        varFuncRes.animateSetNameAndValue('res', '1337', this.animator, { valueColor: numberColor });
        this.animator.makeStep();
        this.update();

        // for (int i = 0; i < b; i++)
        const varFuncI = this.memory.createMemoryId();
        for (let i = 0; i <= 10; i++) {
            this.codeFunc.animateSetCurrentLine(2, this.animator);
            if (i === 0) {
                varFuncI.animateSetNameAndValue('i', '0', this.animator, { valueColor: numberColor });
            } else {
                varFuncI.animateSetValue(i.toFixed(0), this.animator, { color: numberColor });
            }
            this.animator.makeStep();
            this.update();

            if (i === 10) break;
            this.codeFunc.animateSetCurrentLine(3, this.animator);
            varFuncRes.animateSetValue((1337 + (i + 1) * 13).toFixed(0), this.animator, { color: numberColor });
            this.animator.makeStep();
            this.update();
        }

        // return res;
        this.codeFunc.animateSetCurrentLine(4, this.animator);
        varFuncI.animateColor(freeColor, this.animator);

        let codeHighlightB = this.codeMain.createTokenHighlight([{ lineIndex: 3, content: 'b' }], MTL.PURPLE_4);
        let codeHighlightRes = this.codeFunc.createTokenHighlight([{ lineIndex: 4, content: 'res' }], MTL.PURPLE_4);
        label = this.animator.createLabelAtCurrentTime();
        codeHighlightB.animateFadeIn(this.animator, { label: label });
        codeHighlightRes.animateFadeIn(this.animator, { label: label });
        varFuncRes.animateHighlightIn(this.animator, { label: label, offset: 100, color: MTL.PURPLE_4 });
        varB.animateHighlightIn(this.animator, { label: label, offset: 100, color: MTL.PURPLE_4 });
        this.animator.makeStep();
        this.update();

        varB.animateCopyValue(varFuncRes, this.animator, { color: numberColor });
        label = this.animator.createLabelAtCurrentTime();
        codeHighlightB.animateFadeOut(this.animator, { label: label });
        codeHighlightRes.animateFadeOut(this.animator, { label: label });
        varFuncRes.animateHighlightOut(this.animator, { label: label });
        varB.animateHighlightOut(this.animator, { label: label });
        this.animator.makeStep();
        this.update();

        label = this.animator.createLabelAtCurrentTime();
        this.animateCallOut(this.codeFunc, { label: label });
        varFuncA.animateColor(freeColor, this.animator, { label: label });
        varFuncB.animateColor(freeColor, this.animator, { label: label });
        varFuncRes.animateColor(freeColor, this.animator, { label: label });
        varB.animateRestoreHLine(this.animator, { label: label });
        codeHighlight.animateFadeOut(this.animator, { label: label });
        this.animator.makeStep();
        this.update();

        // return 0;
        this.codeMain.animateSetCurrentLine(currLine++, this.animator);
        this.animator.makeStep();
        this.update();

        // END
        this.codeMain.animateSetCurrentLine(currLine++, this.animator);
        label = this.animator.createLabelAtCurrentTime();
        varB.animateColor(freeColor, this.animator, { label: label });
        varA.animateColor(freeColor, this.animator, { label: label });
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
