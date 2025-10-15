import { S2Vec2 } from '../../src/core/math/s2-vec2.ts';
import { S2Camera } from '../../src/core/math/s2-camera.ts';
import { MTL } from '../../src/utils/mtl-colors.ts';
import { S2MathUtils } from '../../src/core/math/s2-math-utils.ts';
import { S2Memory } from '../../src/extension/s2-memory.ts';
import { BaseMemoryScene } from './base-memory-scene.ts';
import { S2Code, tokenizeAlgorithm } from '../../src/core/element/s2-code.ts';

const titleString = 'Etat de la mémoire : conditionnelles';

const codeString =
    '**type:int** **fn:main**(**type:void**) {\n' +
    '    **type:int** **var:a** = **num:3**, **var:b** = **num:2**;\n' +
    "    **type:char** **var:c** = **str:'c'**;\n" +
    '    **type:float** **var:f** = **var:a** + **num:0.5f**;\n' +
    '    \n' +
    '    **kw:if** (**var:a** == **var:b**) {\n' +
    '        **var:c**++;\n' +
    '    }\n' +
    '    **kw:if** (**var:a** = **var:b**) {\n' +
    '        **var:f** *= **num:2**;\n' +
    '    }\n' +
    '    \n' +
    '    **var:b** = (**var:a** == (**var:b** - **num:1**));\n' +
    '    **kw:switch** (**var:b**) {\n' +
    '    **kw:case** **num:0** :\n' +
    '        **var:f** -= **num:1**;\n' +
    '    **kw:case** **num:1** :\n' +
    '        **var:f** *= **num:2**;\n' +
    '        **kw:break**;\n' +
    '    **kw:default** :\n' +
    '        **var:a** = **num:7**;\n' +
    '    }\n' +
    '    **kw:return** **num:0**;\n' +
    '}';

const viewportScale = 1.5;
const viewport = new S2Vec2(640.0, 360.0).scale(viewportScale);
const camera = new S2Camera(new S2Vec2(0.0, 0.0), new S2Vec2(8.0, 4.5), viewport);

class SceneFigure extends BaseMemoryScene {
    public memory: S2Memory;
    public code: S2Code;

    constructor(svgElement: SVGSVGElement) {
        super(svgElement, camera);

        // const grid = this.addWorldGrid();
        // S2DataSetter.setTargets(grid.data).setStrokeColor(MTL.GREY_9);

        this.setDefaultFont(14);
        this.code = new S2Code(this);
        this.code.setParent(this.getSVG());
        this.setDefaultCodeStyle(this.code);
        this.code.setContent(tokenizeAlgorithm(codeString));

        this.setDefaultFont(16);
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
        //const undefinedColor = MTL.RED_3;
        const charColor = MTL.DEEP_ORANGE_2;
        let currLine = 1;

        // int a = 10, b = 5;
        this.code.animateSetCurrentLine(currLine++, this.animator);
        const varA = this.memory.createMemoryId();
        const varB = this.memory.createMemoryId();
        let label = this.animator.createLabelAtCurrentTime();
        varA.animateSetNameAndValue('a', '3', this.animator, { label: label, valueColor: numberColor });
        varB.animateSetNameAndValue('b', '2', this.animator, {
            label: label,
            offset: 200,
            valueColor: numberColor,
        });
        this.animator.makeStep();
        this.update();

        // char c = 'c';
        this.code.animateSetCurrentLine(currLine++, this.animator);
        const varC = this.memory.createMemoryId();
        varC.animateSetNameAndValue('c', '99', this.animator, { valueColor: charColor });
        this.animator.makeStep();
        this.update();

        // float f = a + 0.5f;
        this.code.animateSetCurrentLine(currLine++, this.animator);
        const varF = this.memory.createMemoryId();
        varF.animateSetNameAndValue('f', '3.5', this.animator, { valueColor: numberColor });
        this.animator.makeStep();
        this.update();

        // if (a == b) {
        currLine++;
        this.code.animateSetCurrentLine(currLine++, this.animator);
        this.animator.makeStep();
        this.update();

        currLine++;
        this.code.animateSetCurrentLine(currLine++, this.animator);
        this.animator.makeStep();
        this.update();

        // if (a = b) {
        this.code.animateSetCurrentLine(currLine++, this.animator);
        label = this.animator.createLabelAtCurrentTime();
        const codeHighlight = this.code.createTokenHighlight(
            [
                { lineIndex: currLine - 1, content: 'a' },
                { lineIndex: currLine - 1, content: 'b' },
            ],
            MTL.CYAN,
        );
        codeHighlight.animateFadeIn(this.animator, { label: label });
        varA.animateHighlightIn(this.animator, { label: label, offset: 100, color: MTL.CYAN });
        this.animator.makeStep();
        this.update();

        varA.animateCopyValue(varB, this.animator, { color: numberColor });
        this.animator.makeStep();
        this.update();

        label = this.animator.createLabelAtCurrentTime();
        codeHighlight.animateFadeOut(this.animator, { label: label });
        varA.animateHighlightOut(this.animator, { label: label, offset: 100 });

        // f *= 2;
        this.code.animateSetCurrentLine(currLine++, this.animator);
        varF.animateSetValue('7', this.animator, { color: numberColor });
        this.animator.makeStep();
        this.update();

        this.code.animateSetCurrentLine(currLine++, this.animator);
        this.animator.makeStep();
        this.update();

        // b = (a == (b - 1));
        currLine++;
        this.code.animateSetCurrentLine(currLine++, this.animator);
        varB.animateSetValue('0', this.animator, { color: numberColor });

        // switch (b) {
        this.code.animateSetCurrentLine(currLine++, this.animator);
        this.animator.makeStep();
        this.update();

        // case 0 :
        this.code.animateSetCurrentLine(currLine++, this.animator);
        this.animator.makeStep();
        this.update();

        // f -= 1;
        this.code.animateSetCurrentLine(currLine++, this.animator);
        varF.animateSetValue('6', this.animator, { color: numberColor });
        this.animator.makeStep();
        this.update();

        // case 1 :
        this.code.animateSetCurrentLine(currLine++, this.animator);
        this.animator.makeStep();
        this.update();

        // f *= 2;
        this.code.animateSetCurrentLine(currLine++, this.animator);
        varF.animateSetValue('12', this.animator, { color: numberColor });
        this.animator.makeStep();
        this.update();

        // break;
        this.code.animateSetCurrentLine(currLine++, this.animator);
        this.animator.makeStep();
        this.update();

        currLine += 2;
        this.code.animateSetCurrentLine(currLine++, this.animator);
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
