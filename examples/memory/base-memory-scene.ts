import { ease } from '../../src/core/animation/s2-easing';
import { S2LerpAnimFactory } from '../../src/core/animation/s2-lerp-anim';
import { S2StepAnimator } from '../../src/core/animation/s2-step-animator';
import { S2FontData } from '../../src/core/element/base/s2-base-data';
import { S2Code } from '../../src/core/element/s2-code';
import type { S2FillRect } from '../../src/core/element/s2-fill-rect';
import type { S2Camera } from '../../src/core/math/s2-camera';
import { S2Scene } from '../../src/core/scene/s2-scene';
import { S2Color } from '../../src/core/shared/s2-color';
import type { S2Memory } from '../../src/extension/s2-memory';
import { MTL } from '../../src/utils/mtl-colors';

export class BaseMemoryScene extends S2Scene {
    public animator: S2StepAnimator;
    protected font: S2FontData;
    protected fillRect: S2FillRect;

    protected setDefaultFont(fontSize: number = 16): void {
        this.font.family.set('monospace');
        this.font.size.set(fontSize, 'view');
        this.font.relativeAscenderHeight.set(0.7);
        this.font.relativeLineHeight.set(1.3);
    }

    protected setDefaultCodeStyle(code: S2Code): void {
        const data = code.data;
        data.text.font.copy(this.font);
        data.text.fill.color.copy(MTL.WHITE);
        data.padding.set(20, 15, 'view');
        data.background.fill.color.copy(MTL.GREY_9);
        data.background.stroke.color.copy(MTL.GREY_7);
        data.background.stroke.width.set(2, 'view');
        data.background.cornerRadius.set(10, 'view');
        data.currentLine.opacity.set(1);
        data.currentLine.fill.color.copy(MTL.BLACK);
        data.currentLine.fill.opacity.set(0.5);
        data.currentLine.stroke.color.copy(MTL.WHITE);
        data.currentLine.stroke.width.set(1, 'view');
        data.currentLine.stroke.opacity.set(0.2);
        data.currentLine.padding.set(-0.5, 2, 'view');
        data.currentLine.index.set(0);
        data.position.set(-6, 4, 'world');
        data.anchor.set('north-west');
        data.minExtents.set(2.5, 1.0, 'world');
    }

    protected setDefaultMemoryStyle(memory: S2Memory): void {
        const data = memory.data;
        data.extents.set(2, 4.0, 'world');
        data.padding.set(15, 0, 'view');
        data.valueWidth.set(2, 'world');
        data.text.fill.color.copyIfUnlocked(MTL.WHITE);
        data.text.addressFill.color.copyIfUnlocked(MTL.GREY_4);
        data.text.font.copyIfUnlocked(this.font);
        data.background.fill.color.copyIfUnlocked(MTL.GREY_9);
        data.background.stroke.color.copyIfUnlocked(MTL.GREY_7);
        data.background.stroke.width.set(2, 'view');
        data.background.cornerRadius.set(10, 'view');
        data.highlight.cornerRadius.set(7, 'view');
        data.highlight.padding.set(3, 3, 'view');
        data.position.set(+6, 0, 'world');
        data.anchor.set('east');
    }

    constructor(svgElement: SVGSVGElement, camera: S2Camera) {
        super(svgElement, camera);
        this.animator = new S2StepAnimator(this);
        this.font = new S2FontData();
        this.fillRect = this.addFillRect();
        this.fillRect.data.color.copy(S2Color.lerp(MTL.GREY_8, MTL.GREY_9, 0.7));

        this.setDefaultFont(16);
    }

    protected animateCallIn(
        mainCode: S2Code,
        funcCode: S2Code,
        funcIndex: number,
        options: { label?: string; offset?: number; duration?: number } = {},
    ): void {
        const camera = this.getActiveCamera();
        const funcTSpan = mainCode.findTokenTSpan(funcIndex, { category: 'fn' });
        if (!funcTSpan) return;

        const label = this.animator.ensureLabel(options.label);
        const offset = options.offset ?? 0;
        const duration = options.duration ?? 500;
        const shift = 30;

        const codeMainPos = mainCode.data.position.get('view', camera);
        const funcPos = funcTSpan.getUpper('view');

        funcCode.data.position.set(codeMainPos.x + 10 + shift, funcPos.y + 5, 'view');
        funcCode.data.anchor.set('north-west');
        funcCode.data.opacity.set(0);

        const posAnim = S2LerpAnimFactory.create(this, funcCode.data.position)
            .setCycleDuration(duration)
            .setEasing(ease.inOut);
        const opacityAnim = S2LerpAnimFactory.create(this, funcCode.data.opacity)
            .setCycleDuration(duration)
            .setEasing(ease.inOut);
        funcCode.data.position.set(codeMainPos.x + 10, funcPos.y + 5, 'view');
        funcCode.data.opacity.set(1);
        this.animator.enableElement(funcCode, true, label, offset);
        this.animator.addAnimation(posAnim.commitFinalState(), label, offset);
        this.animator.addAnimation(opacityAnim.commitFinalState(), label, offset);
    }

    protected animateCallOut(
        funcCode: S2Code,
        options: { label?: string; offset?: number; duration?: number } = {},
    ): void {
        const camera = this.getActiveCamera();
        const label = this.animator.ensureLabel(options.label);
        const offset = options.offset ?? 0;
        const duration = options.duration ?? 500;
        const shift = 30;

        const posAnim = S2LerpAnimFactory.create(this, funcCode.data.position)
            .setCycleDuration(duration)
            .setEasing(ease.inOut);
        const opacityAnim = S2LerpAnimFactory.create(this, funcCode.data.opacity)
            .setCycleDuration(duration)
            .setEasing(ease.inOut);
        const position = funcCode.data.position.get('view', camera);
        funcCode.data.position.set(position.x + shift, position.y, 'view');
        funcCode.data.opacity.set(0);
        this.animator.addAnimation(posAnim.commitFinalState(), label, offset);
        this.animator.addAnimation(opacityAnim.commitFinalState(), label, offset);
        this.animator.enableElement(funcCode, false, label, offset + duration);
    }
}
