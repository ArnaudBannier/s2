import type { S2StepAnimator } from '../core/animation/s2-step-animator';
import type { S2BaseScene } from '../core/scene/s2-base-scene';
import type { S2Space } from '../core/math/s2-camera';
import type { S2Color } from '../core/shared/s2-color';
import type { S2Memory } from './s2-memory';
import { ease } from '../core/animation/s2-easing';
import { S2LerpAnimFactory } from '../core/animation/s2-lerp-anim';
import { S2Line } from '../core/element/s2-line';
import { S2PlainText } from '../core/element/text/s2-plain-text';
import { S2Vec2 } from '../core/math/s2-vec2';
import { S2Point } from '../core/shared/s2-point';
import { S2MotionPathDirection } from '../core/animation/s2-motion-path';
import { S2Rect } from '../core/element/s2-rect';
import { S2TriggerColor } from '../core/animation/s2-timeline-trigger';

export class S2MemoryRow {
    protected scene: S2BaseScene;
    public parentMemory: S2Memory;
    public index: number;
    public values: S2PlainText[];
    public names: S2PlainText[];
    public address: S2PlainText;
    public highlight: S2Rect;
    public hLine: S2Line;
    public isStacked: boolean;
    public lowerBound: S2Point;
    public upperBound: S2Point;
    protected basePosName: S2Point;
    protected basePosValue: S2Point;
    protected available: boolean;

    constructor(parent: S2Memory, index: number) {
        const scene = parent.getScene();
        this.scene = scene;
        this.parentMemory = parent;
        this.index = index;
        this.values = [];
        this.names = [];
        this.address = new S2PlainText(scene);
        this.hLine = new S2Line(scene);
        this.lowerBound = new S2Point();
        this.upperBound = new S2Point();
        this.basePosName = new S2Point();
        this.basePosValue = new S2Point();
        this.highlight = new S2Rect(scene);

        this.hLine.setParent(parent);
        this.highlight.setParent(parent);
        this.highlight.data.isEnabled.set(false);
        this.address.setParent(parent);
        this.address.data.textAnchor.set('end');
        this.isStacked = false;
        this.available = true;
    }

    setAvailability(isAvailable: boolean): void {
        this.available = isAvailable;
    }

    isAvailable(): boolean {
        return this.available;
    }

    setAddress(address: string): void {
        this.address.setContent(address);
    }

    setValue(value: string, options: { color?: S2Color } = {}): S2PlainText {
        const text = new S2PlainText(this.scene);
        text.setParent(this.parentMemory);
        text.data.layer.set(2);
        text.data.textAnchor.set('start');
        text.data.position.copyIfUnlocked(this.basePosValue);
        text.data.font.copyIfUnlocked(this.parentMemory.data.text.font);
        text.data.fill.color.copyIfUnlocked(this.parentMemory.data.text.fill.color);
        text.data.fill.opacity.copyIfUnlocked(this.parentMemory.data.text.fill.opacity);
        if (options.color) {
            text.data.fill.color.copy(options.color).lock();
        }
        text.setContent(value);
        this.values.push(text);
        return text;
    }

    setName(name: string, options: { color?: S2Color } = {}): S2PlainText {
        const text = new S2PlainText(this.scene);
        text.setParent(this.parentMemory);
        text.data.layer.set(2);
        text.data.textAnchor.set('start');
        text.data.position.copyIfUnlocked(this.basePosName);
        text.data.font.copyIfUnlocked(this.parentMemory.data.text.font);
        text.data.fill.color.copyIfUnlocked(this.parentMemory.data.text.fill.color);
        text.data.fill.opacity.copyIfUnlocked(this.parentMemory.data.text.fill.opacity);
        if (options.color) {
            text.data.fill.color.copy(options.color).lock();
        }
        text.setContent(name);
        this.names.push(text);
        return text;
    }

    animateSetValue(
        value: string,
        animator: S2StepAnimator,
        options: { label?: string; offset?: number; duration?: number; color?: S2Color } = {},
    ): S2PlainText {
        const label = animator.ensureLabel(options.label);
        const offset = options.offset ?? 0;
        const duration = options.duration ?? 500;
        let delay = 0;
        if (this.values.length > 0) {
            const lastValue = this.values[this.values.length - 1];
            if (lastValue.data.isEnabled) {
                this.animateFadeOut(lastValue, animator, new S2Vec2(30, 0), label, duration, offset);
                delay = 250;
            }
        }

        const text = this.setValue(value, { color: options.color });
        this.animateFadeIn(text, animator, new S2Vec2(-5, 0), label, duration, offset + delay);
        return text;
    }

    animateSetName(
        name: string,
        animator: S2StepAnimator,
        options: { label?: string; offset?: number; duration?: number; color?: S2Color } = {},
    ): S2PlainText {
        const label = animator.ensureLabel(options.label);
        const offset = options.offset ?? 0;
        const duration = options.duration ?? 500;
        let delay = 0;
        if (this.names.length > 0) {
            const lastName = this.names[this.names.length - 1];
            if (lastName.data.isEnabled) {
                this.animateFadeOut(lastName, animator, new S2Vec2(30, 0), label, duration, offset);
                delay = 250;
            }
        }

        const text = this.setName(name, { color: options.color });
        this.animateFadeIn(text, animator, new S2Vec2(-5, 0), label, duration, offset + delay);
        return text;
    }

    animateDestroy(
        animator: S2StepAnimator,
        options: { label?: string; offset?: number; duration?: number } = {},
    ): void {
        const label = animator.ensureLabel(options.label);
        const offset = options.offset ?? 0;
        const duration = options.duration ?? 500;

        if (this.values.length > 0) {
            const lastValue = this.values[this.values.length - 1];
            this.animateFadeOut(lastValue, animator, new S2Vec2(30, 0), label, duration, offset);
        }

        if (this.names.length > 0) {
            const lastName = this.names[this.names.length - 1];
            this.animateFadeOut(lastName, animator, new S2Vec2(30, 0), label, duration, offset);
        }
    }

    animateCopyValue(
        srcRow: S2MemoryRow,
        animator: S2StepAnimator,
        options: {
            label?: string;
            offset?: number;
            duration?: number;
            srcAngle?: number;
            dstAngle?: number;
            curveTension?: number;
            color?: S2Color;
        } = {},
    ): S2PlainText {
        if (srcRow.values.length === 0) {
            throw new Error('Source row has no value to copy');
        }
        const lastText = this.values.length > 0 ? this.values[this.values.length - 1] : undefined;
        const srcText = srcRow.values[srcRow.values.length - 1];
        const dstText = this.setValue(srcText.getContent());
        this.animateCopy(srcText, dstText, animator, { lastText: lastText, ...options });
        return dstText;
    }

    animateCopyAddress(
        srcRow: S2MemoryRow,
        animator: S2StepAnimator,
        options: {
            label?: string;
            offset?: number;
            duration?: number;
            srcAngle?: number;
            dstAngle?: number;
            curveTension?: number;
            color?: S2Color;
        } = {},
    ): S2PlainText {
        const lastText = this.values.length > 0 ? this.values[this.values.length - 1] : undefined;
        const srcText = srcRow.address;
        const dstText = this.setValue(srcText.getContent());
        this.animateCopy(srcText, dstText, animator, { lastText: lastText, ...options });
        return dstText;
    }

    animateColor(
        color: S2Color,
        animator: S2StepAnimator,
        options: { label?: string; offset?: number; duration?: number } = {},
    ): void {
        const label = animator.ensureLabel(options.label);
        const offset = options.offset ?? 0;
        const duration = options.duration ?? 500;

        if (this.values.length > 0) {
            const lastValue = this.values[this.values.length - 1];
            const colorAnim = S2LerpAnimFactory.create(this.scene, lastValue.data.fill.color);
            lastValue.data.fill.color.copy(color).lock();
            colorAnim.setCycleDuration(duration).commitFinalState();
            animator.addAnimation(colorAnim, label, offset);
        }

        if (this.names.length > 0) {
            const lastName = this.names[this.names.length - 1];
            const colorAnim = S2LerpAnimFactory.create(this.scene, lastName.data.fill.color);
            lastName.data.fill.color.copy(color).lock();
            colorAnim.setCycleDuration(duration).commitFinalState();
            animator.addAnimation(colorAnim, label, offset);
        }
    }

    animateHighlightIn(
        animator: S2StepAnimator,
        options: {
            label?: string;
            offset?: number;
            duration?: number;
            color?: S2Color;
        } = {},
    ): void {
        const label = animator.ensureLabel(options.label);
        const offset = options.offset ?? 0;
        const duration = options.duration ?? 500;

        this.highlight.data.opacity.set(0.0);
        this.highlight.data.fill.opacity.set(0.15);
        this.highlight.data.stroke.width.set(1, 'view');
        const opacityAnim = S2LerpAnimFactory.create(this.scene, this.highlight.data.opacity)
            .setCycleDuration(duration)
            .setEasing(ease.inOut);
        this.highlight.data.opacity.set(1.0);
        opacityAnim.commitFinalState();
        animator.addAnimation(opacityAnim, label, offset);
        animator.enableElement(this.highlight, true, label, offset);

        if (options.color) {
            animator.addTrigger(new S2TriggerColor(this.highlight.data.fill.color, options.color), label, offset);
            animator.addTrigger(new S2TriggerColor(this.highlight.data.stroke.color, options.color), label, offset);
        }
    }

    animateHighlightOut(
        animator: S2StepAnimator,
        options: {
            label?: string;
            offset?: number;
            duration?: number;
        } = {},
    ): void {
        const label = animator.ensureLabel(options.label);
        const offset = options.offset ?? 0;
        const duration = options.duration ?? 500;

        this.highlight.data.opacity.set(1.0);
        const opacityAnim = S2LerpAnimFactory.create(this.scene, this.highlight.data.opacity)
            .setCycleDuration(duration)
            .setEasing(ease.inOut);
        this.highlight.data.opacity.set(0.0);
        opacityAnim.commitFinalState();
        animator.addAnimation(opacityAnim, label, offset);
        animator.enableElement(this.highlight, false, label, offset + duration);
    }

    animateHLine(
        animator: S2StepAnimator,
        options: {
            label?: string;
            offset?: number;
            duration?: number;
            color?: S2Color;
            width?: number;
        } = {},
    ): void {
        const label = animator.ensureLabel(options.label);
        const offset = options.offset ?? 0;
        const duration = options.duration ?? 500;

        if (options.color) {
            const colorAnim = S2LerpAnimFactory.create(this.scene, this.hLine.data.stroke.color).setCycleDuration(
                duration,
            );
            this.hLine.data.stroke.color.copy(options.color).lock();
            colorAnim.commitFinalState();
            animator.addAnimation(colorAnim, label, offset);
        }

        if (options.width) {
            const widthAnim = S2LerpAnimFactory.create(this.scene, this.hLine.data.stroke.width)
                .setCycleDuration(duration)
                .setEasing(ease.inOut);
            this.hLine.data.stroke.width.set(options.width, 'view').lock();
            widthAnim.commitFinalState();
            animator.addAnimation(widthAnim, label, offset);
        }
    }

    protected animateCopy(
        srcText: S2PlainText,
        dstText: S2PlainText,
        animator: S2StepAnimator,
        options: {
            label?: string;
            offset?: number;
            duration?: number;
            srcAngle?: number;
            dstAngle?: number;
            curveTension?: number;
            color?: S2Color;
            lastText?: S2PlainText;
        } = {},
    ): void {
        const label = animator.ensureLabel(options.label);
        const offset = options.offset ?? 0;
        const duration = options.duration ?? 500;
        const srcAngle = options.srcAngle ?? 180;
        const dstAngle = options.dstAngle ?? 180;
        const tension = options.curveTension ?? 0.4;

        let delay = 0;
        if (options.lastText && options.lastText.data.isEnabled) {
            this.animateFadeOut(options.lastText, animator, new S2Vec2(30, 0), label, duration, offset);
            delay = 250;
        }

        const space: S2Space = 'world';
        const srcPosition = srcText.getPosition(space);
        const dstPosition = dstText.getPosition(space);
        if (srcText.data.textAnchor.get() === 'end') {
            srcPosition.x -= 2 * srcText.getExtents(space).x;
        }
        const motionAnim = new S2MotionPathDirection(this.scene, dstText.data.localShift)
            .setCycleDuration(duration)
            .setEasing(ease.inOut)
            .setSpace(space);

        const shift = srcPosition.subV(dstPosition);
        const distance = shift.length();
        const path = motionAnim.getCurve();
        const sampleCount = 16;
        path.clear()
            .addCubic(
                shift,
                S2Vec2.addV(shift, S2Vec2.fromPolarDeg(srcAngle, tension * distance)),
                S2Vec2.fromPolarDeg(dstAngle, tension * distance),
                new S2Vec2(0, 0),
                sampleCount,
            )
            .updateLength();
        dstText.data.localShift.set(0, 0, space);
        animator.enableElement(dstText, true, label, offset + delay);
        animator.addAnimation(motionAnim, label, offset + delay);

        if (options.color) {
            dstText.data.fill.color.copy(srcText.data.fill.color);
            const colorAnim = S2LerpAnimFactory.create(this.scene, dstText.data.fill.color).setCycleDuration(duration);
            dstText.data.fill.color.copy(options.color).lock();
            colorAnim.commitFinalState();
            animator.addAnimation(colorAnim, label, offset + delay);
        }
    }

    protected animateFadeIn(
        text: S2PlainText,
        animator: S2StepAnimator,
        shift: S2Vec2,
        label: string,
        duration: number,
        offset: number,
    ): void {
        text.data.opacity.set(0.0);
        const opacityAnim = S2LerpAnimFactory.create(this.scene, text.data.opacity)
            .setCycleDuration(duration)
            .setEasing(ease.out);
        text.data.opacity.set(1.0);
        opacityAnim.commitFinalState();

        animator.enableElement(text, true, label, offset);
        animator.addAnimation(opacityAnim, label, offset);

        if (S2Vec2.isZeroV(shift) === false) {
            text.data.localShift.setV(shift, 'view');
            const shiftAnim = S2LerpAnimFactory.create(this.scene, text.data.localShift)
                .setCycleDuration(duration)
                .setEasing(ease.inOut);
            text.data.localShift.set(0, 0, 'view');
            shiftAnim.commitFinalState();
            animator.addAnimation(shiftAnim, label, offset);
        }
    }

    protected animateFadeOut(
        text: S2PlainText,
        animator: S2StepAnimator,
        shift: S2Vec2,
        label: string,
        duration: number,
        offset: number,
    ): void {
        text.data.opacity.set(1.0);
        const opacityAnim = S2LerpAnimFactory.create(this.scene, text.data.opacity)
            .setCycleDuration(duration)
            .setEasing(ease.out);
        text.data.opacity.set(0.0);
        opacityAnim.commitFinalState();
        animator.addAnimation(opacityAnim, label, offset);
        if (S2Vec2.isZeroV(shift) === false) {
            text.data.localShift.set(0, 0, 'view');
            const shiftAnim = S2LerpAnimFactory.create(this.scene, text.data.localShift)
                .setCycleDuration(duration)
                .setEasing(ease.inOut);
            text.data.localShift.setV(shift, 'view');
            shiftAnim.commitFinalState();
            animator.addAnimation(shiftAnim, label, offset);
        }
        animator.enableElement(text, false, label, offset + duration);
    }

    setWorldBounds(lowerBound: S2Vec2, upperBound: S2Vec2): void {
        this.lowerBound.setV(lowerBound, 'world');
        this.upperBound.setV(upperBound, 'world');
    }

    protected updateGeometry(): void {
        const parentData = this.parentMemory.data;
        const isDirty =
            this.lowerBound.isDirty() ||
            this.upperBound.isDirty() ||
            parentData.padding.isDirty() ||
            parentData.text.font.isDirty();
        if (isDirty === false) return;

        const space: S2Space = 'world';
        const camera = this.scene.getActiveCamera();
        const lowerBound = this.lowerBound.get(space, camera);
        const upperBound = this.upperBound.get(space, camera);
        const height = upperBound.y - lowerBound.y;
        const width = upperBound.x - lowerBound.x;

        const font = parentData.text.font;
        const ascenderHeight = font.relativeAscenderHeight.value * font.size.get(space, camera);
        const textY = lowerBound.y + height / 2 - ascenderHeight / 2;
        const padding = parentData.padding.get(space, camera).x;
        const valueWidth = parentData.valueWidth.get(space, camera);
        const nameWidth = width - valueWidth;

        this.address.data.position.set(lowerBound.x - padding, textY, space);
        this.basePosValue.set(lowerBound.x + padding, textY, space);
        this.basePosName.set(lowerBound.x + valueWidth + padding, textY, space);
        for (const value of this.values) {
            value.data.position.setV(this.basePosValue.value, space);
        }
        for (const name of this.names) {
            name.data.position.setV(this.basePosName.value, space);
        }

        if (this.isStacked) {
            this.hLine.data.startPosition.set(lowerBound.x, upperBound.y, space);
            this.hLine.data.endPosition.set(upperBound.x, upperBound.y, space);
        } else {
            this.hLine.data.startPosition.set(lowerBound.x, lowerBound.y, space);
            this.hLine.data.endPosition.set(upperBound.x, lowerBound.y, space);
        }

        const highlightCenter = new S2Vec2(lowerBound.x + 0.75 * width, lowerBound.y + 0.5 * height);
        this.highlight.data.position.setV(highlightCenter, space);

        const highlightPadding = parentData.highlight.padding.get(space, camera);
        this.highlight.data.position.setV(highlightCenter, space);
        this.highlight.data.extents.set(
            0.5 * nameWidth - 2 * highlightPadding.x,
            0.5 * height - 2 * highlightPadding.y,
            space,
        );
        this.highlight.data.cornerRadius.set(parentData.highlight.cornerRadius.get(space, camera), space);
        this.highlight.data.anchor.set('center');
    }

    update(): void {
        this.updateGeometry();
        for (const value of this.values) {
            value.update();
        }
        for (const name of this.names) {
            name.update();
        }
        this.address.update();
        this.hLine.update();
        this.highlight.update();
    }
}
