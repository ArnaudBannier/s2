import { ease } from '../core/animation/s2-easing';
import { S2LerpAnimFactory } from '../core/animation/s2-lerp-anim';
import type { S2StepAnimator } from '../core/animation/s2-step-animator';
import { S2Element } from '../core/element/base/s2-element';
import { S2Line } from '../core/element/s2-line';
import { S2Rect } from '../core/element/s2-rect';
import { S2PlainText } from '../core/element/text/s2-plain-text';
import { S2Vec2 } from '../core/math/s2-vec2';
import type { S2BaseScene } from '../core/scene/s2-base-scene';
import { S2AnchorUtils, svgNS } from '../core/shared/s2-globals';
import { type S2Space } from '../core/shared/s2-base-type';
import { S2MemoryData } from './s2-memory-data';
import { S2Position } from '../core/shared/s2-position';
import { S2MotionPathDirection } from '../core/animation/s2-motion-path';
import type { S2Color } from '../core/shared/s2-color';

class S2MemoryRow {
    protected scene: S2BaseScene;
    public parentMemory: S2Memory;
    public index: number;
    public values: S2PlainText[];
    public names: S2PlainText[];
    public address: S2PlainText;
    public hLine: S2Line;
    public isStacked: boolean;
    public lowerBound: S2Position;
    public upperBound: S2Position;
    protected basePosName: S2Position;
    protected basePosValue: S2Position;

    constructor(parent: S2Memory, index: number) {
        const scene = parent.getScene();
        this.scene = scene;
        this.parentMemory = parent;
        this.index = index;
        this.values = [];
        this.names = [];
        this.address = new S2PlainText(scene);
        this.hLine = new S2Line(scene);
        this.lowerBound = new S2Position();
        this.upperBound = new S2Position();
        this.basePosName = new S2Position();
        this.basePosValue = new S2Position();

        this.hLine.setParent(parent);
        this.address.setParent(parent);
        this.address.data.textAnchor.set('end');
        this.isStacked = false;
    }

    setAddress(address: string): void {
        this.address.setContent(address);
    }

    setValue(value: string, options: { color?: S2Color } = {}): S2PlainText {
        const text = new S2PlainText(this.scene);
        text.setParent(this.parentMemory);
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

        animator.enableElement(dstText, true, label, offset);
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
                S2Vec2.add(shift, S2Vec2.fromPolarDeg(srcAngle, tension * distance)),
                S2Vec2.fromPolarDeg(dstAngle, tension * distance),
                new S2Vec2(0, 0),
                sampleCount,
            )
            .updateLength();
        dstText.data.localShift.set(0, 0, space);
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

        if (S2Vec2.isZero(shift) === false) {
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
        if (S2Vec2.isZero(shift) === false) {
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

    updateGeometry(): void {
        const parentData = this.parentMemory.data;
        const isDirty =
            this.lowerBound.isDirty() ||
            this.upperBound.isDirty() ||
            parentData.padding.isDirty() ||
            parentData.text.font.isDirty();
        if (isDirty === false) return;

        const space: S2Space = 'world';
        const camera = this.scene.getActiveCamera();
        const lowerBound = this.lowerBound.toSpace(space, camera);
        const upperBound = this.upperBound.toSpace(space, camera);
        const height = upperBound.y - lowerBound.y;
        const width = upperBound.x - lowerBound.x;

        const font = parentData.text.font;
        const ascenderHeight = font.relativeAscenderHeight.value * font.size.toSpace(space, camera);
        const textY = lowerBound.y + height / 2 - ascenderHeight / 2;
        const padding = parentData.padding.toSpace(space, camera).x;

        this.address.data.position.set(lowerBound.x - padding, textY, space);
        this.basePosValue.set(lowerBound.x + padding, textY, space);
        this.basePosName.set(lowerBound.x + 0.5 * width + padding, textY, space);
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
    }
}

export class S2Memory extends S2Element<S2MemoryData> {
    protected element: SVGGElement;
    protected addressCount: number;
    protected background: S2Rect;
    protected vLine: S2Line;
    protected rows: S2MemoryRow[];
    protected index: number;
    protected isStacked: boolean;

    constructor(scene: S2BaseScene, addressCount: number, isStacked = false) {
        super(scene, new S2MemoryData());
        this.element = document.createElementNS(svgNS, 'g');
        this.addressCount = addressCount;
        this.index = 0;
        this.isStacked = isStacked;
        this.background = new S2Rect(scene);
        this.vLine = new S2Line(scene);

        this.background.setParent(this);
        this.vLine.setParent(this);
        this.rows = [];
        for (let i = 0; i < this.addressCount; i++) {
            const row = new S2MemoryRow(this, i);
            row.isStacked = isStacked;
            if (isStacked) {
                row.setAddress(`@${this.addressCount - 1 - i}`);
            } else {
                row.setAddress(`@${i}`);
            }
            this.rows.push(row);
        }
        this.rows[this.addressCount - 1].hLine.setEnabled(false);
        //this.updateBackground();
        this.element.dataset.role = 'memory';
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    getExtents(space: S2Space): S2Vec2 {
        return this.data.extents.toSpace(space, this.scene.getActiveCamera());
    }

    getCenter(space: S2Space): S2Vec2 {
        return S2AnchorUtils.getCenter(
            this.data.anchor.get(),
            space,
            this.scene.getActiveCamera(),
            this.data.position,
            this.data.extents,
        );
    }

    addVariable(name: string, value: string): this {
        const row = this.rows[this.index];
        row.setName(name);
        row.setValue(value);
        this.index++;
        return this;
    }

    getRow(index: number): S2MemoryRow {
        return this.rows[index];
    }

    protected updateBackground(): void {
        //const camera = this.scene.getActiveCamera();
        const space: S2Space = 'view';
        const center = this.getCenter(space);
        const extents = this.getExtents(space);

        this.background.data.stroke.copyIfUnlocked(this.data.background.stroke);
        this.background.data.fill.copyIfUnlocked(this.data.background.fill);
        this.background.data.opacity.copyIfUnlocked(this.data.background.opacity);
        if (this.background instanceof S2Rect) {
            this.background.data.cornerRadius.copyIfUnlocked(this.data.background.cornerRadius);
        }

        // Position background
        this.background.data.position.setV(center, space);
        this.background.data.extents.setV(extents, space);
        this.background.data.anchor.set('center');

        this.background.update();
    }

    protected updateSeparators(): void {
        const space: S2Space = 'view';
        const center = this.getCenter(space);
        const extents = this.getExtents(space);

        this.vLine.data.startPosition.set(center.x, center.y + extents.y, space);
        this.vLine.data.endPosition.set(center.x, center.y - extents.y, space);
        this.vLine.data.stroke.color.copyIfUnlocked(this.data.background.stroke.color);
        this.vLine.data.stroke.width.copyIfUnlocked(this.data.background.stroke.width);

        this.vLine.update();

        // const stepY = (2 * extents.y) / this.addressCount;
        // let lineY = center.y - extents.y + stepY;
        // for (const hLine of this.hLines) {
        //     hLine.data.startPosition.set(center.x - extents.x, lineY, space);
        //     hLine.data.endPosition.set(center.x + extents.x, lineY, space);
        //     hLine.data.stroke.color.copyIfUnlocked(this.data.background.stroke.color);
        //     hLine.data.stroke.width.copyIfUnlocked(this.data.background.stroke.width);
        //     hLine.update();
        //     lineY += stepY;
        // }
    }

    protected updateVariables(): void {
        const space: S2Space = 'world';
        const center = this.getCenter(space);
        const extents = this.getExtents(space);
        const sign = this.isStacked ? 1 : -1;
        const stepY = (2 * extents.y) / this.addressCount;
        for (let i = 0; i < this.rows.length; i++) {
            const variable = this.rows[i];
            const centerY = center.y + sign * ((i + 0.5) * stepY - extents.y);
            const lowerBound = new S2Vec2(center.x - extents.x, centerY - 0.5 * stepY);
            const upperBound = new S2Vec2(center.x + extents.x, centerY + 0.5 * stepY);
            variable.setWorldBounds(lowerBound, upperBound);
            variable.hLine.data.stroke.color.copyIfUnlocked(this.data.background.stroke.color);
            variable.hLine.data.stroke.width.copyIfUnlocked(this.data.background.stroke.width);
        }

        if (this.data.text.font.isDirty()) {
            for (const row of this.rows) {
                for (const value of row.values) {
                    value.data.font.copyIfUnlocked(this.data.text.font);
                }
                for (const name of row.names) {
                    name.data.font.copyIfUnlocked(this.data.text.font);
                }
                row.address.data.font.copyIfUnlocked(this.data.text.font);
            }
        }

        for (const row of this.rows) {
            row.update();
        }
    }

    update(): void {
        if (this.skipUpdate()) return;

        this.updateSVGChildren();
        this.updateBackground();
        this.updateSeparators();
        this.updateVariables();

        this.clearDirty();
    }
}

// class S2MemoryText {
//     public text: S2PlainText;
//     public shift: S2Extents;
//     protected scene: S2BaseScene;

//     constructor(parent: S2Memory) {
//         const scene = parent.getScene();
//         this.scene = scene;
//         this.text = new S2PlainText(scene);
//         this.shift = new S2Extents(0, 0, 'view');

//         this.text.setParent(parent);
//         this.shift.setOwner(parent);
//     }

//     updatePosition(basePosition: S2Position): void {
//         const space: S2Space = 'world';
//         const camera = this.scene.getActiveCamera();
//         const shift = this.shift.toSpace(space, camera);
//         const position = basePosition.toSpace(space, camera).addV(shift);
//         this.text.data.position.setV(position, space);
//     }
// }
