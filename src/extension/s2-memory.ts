import type { S2BaseScene } from '../core/scene/s2-base-scene';
import type { S2Color } from '../core/shared/s2-color';
import type { S2StepAnimator } from '../core/animation/s2-step-animator';
import { S2Element } from '../core/element/base/s2-element';
import { S2Line } from '../core/element/s2-line';
import { S2Rect } from '../core/element/s2-rect';
import { S2PlainText } from '../core/element/text/s2-plain-text';
import { S2Vec2 } from '../core/math/s2-vec2';
import { S2AnchorUtils, svgNS } from '../core/shared/s2-globals';
import { S2MemoryData } from './s2-memory-data';
import { S2MemoryRow } from './s2-memory-row';
import type { S2Space } from '../core/math/s2-space';

export class S2MemoryId {
    public readonly memoryRef: S2Memory;
    public readonly index: number;

    constructor(memoryRef: S2Memory, index: number) {
        this.memoryRef = memoryRef;
        this.index = index;
    }

    free(): void {
        this.memoryRef.destroyMemoryId(this);
    }

    setValue(value: string, options: { color?: S2Color } = {}): S2PlainText {
        return this.memoryRef.getRow(this.index).setValue(value, options);
    }

    setName(name: string, options: { color?: S2Color } = {}): S2PlainText {
        return this.memoryRef.getRow(this.index).setName(name, options);
    }

    animateSetValue(
        value: string,
        animator: S2StepAnimator,
        options: { label?: string; offset?: number; duration?: number; color?: S2Color } = {},
    ): S2PlainText {
        return this.memoryRef.getRow(this.index).animateSetValue(value, animator, options);
    }

    animateSetName(
        name: string,
        animator: S2StepAnimator,
        options: { label?: string; offset?: number; duration?: number; color?: S2Color } = {},
    ): S2PlainText {
        return this.memoryRef.getRow(this.index).animateSetName(name, animator, options);
    }

    animateSetNameAndValue(
        name: string,
        value: string,
        animator: S2StepAnimator,
        options: {
            label?: string;
            offset?: number;
            delay?: number;
            duration?: number;
            nameColor?: S2Color;
            valueColor?: S2Color;
        } = {},
    ): { name: S2PlainText; value: S2PlainText } {
        const offset = options.offset ?? 0;
        const delay = options.delay ?? 100;
        const label = animator.ensureLabel(options.label);
        const valueOptions = { duration: options.duration, label: label, color: options.valueColor, offset: offset };
        const nameOptions = {
            duration: options.duration,
            label: label,
            color: options.nameColor,
            offset: offset + delay,
        };
        return {
            value: this.memoryRef.getRow(this.index).animateSetValue(value, animator, valueOptions),
            name: this.memoryRef.getRow(this.index).animateSetName(name, animator, nameOptions),
        };
    }

    animateDestroy(
        animator: S2StepAnimator,
        options: { label?: string; offset?: number; duration?: number } = {},
    ): void {
        this.memoryRef.getRow(this.index).animateDestroy(animator, options);
        this.free();
    }

    animateCopyValue(
        src: S2MemoryId,
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
        const srcRow = src.memoryRef.getRow(src.index);
        return this.memoryRef.getRow(this.index).animateCopyValue(srcRow, animator, options);
    }

    animateCopyAddress(
        src: S2MemoryId,
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
        const srcRow = src.memoryRef.getRow(src.index);
        return this.memoryRef.getRow(this.index).animateCopyAddress(srcRow, animator, options);
    }

    animateColor(
        color: S2Color,
        animator: S2StepAnimator,
        options: { label?: string; offset?: number; duration?: number } = {},
    ): void {
        this.memoryRef.getRow(this.index).animateColor(color, animator, options);
    }

    animateHighlightIn(
        animator: S2StepAnimator,
        options: { label?: string; offset?: number; duration?: number; color?: S2Color } = {},
    ): void {
        this.memoryRef.getRow(this.index).animateHighlightIn(animator, options);
    }

    animateHighlightOut(
        animator: S2StepAnimator,
        options: { label?: string; offset?: number; duration?: number } = {},
    ): void {
        this.memoryRef.getRow(this.index).animateHighlightOut(animator, options);
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
        this.memoryRef.getRow(this.index).animateHLine(animator, options);
    }

    animateRestoreHLine(
        animator: S2StepAnimator,
        options: { label?: string; offset?: number; duration?: number } = {},
    ): void {
        const hLineOptions = {
            ...options,
            color: this.memoryRef.data.background.stroke.color,
            width: this.memoryRef.data.background.stroke.width.value,
        };
        this.memoryRef.getRow(this.index).animateHLine(animator, hLineOptions);
    }
}

export class S2Memory extends S2Element<S2MemoryData> {
    protected element: SVGGElement;
    protected addressCount: number;
    protected background: S2Rect;
    protected vLine: S2Line;
    protected rows: S2MemoryRow[];
    protected isStacked: boolean;

    constructor(
        scene: S2BaseScene,
        addressCount: number,
        options: { isStacked?: boolean; addressStart?: number; addressPrefix?: string; addressRadix?: number } = {},
    ) {
        super(scene, new S2MemoryData(scene));
        const isStacked = options.isStacked ?? false;
        const addressStart = options.addressStart ?? 0;
        const addressPrefix = options.addressPrefix ?? '@';
        const addressRadix = options.addressRadix ?? 10;

        this.element = document.createElementNS(svgNS, 'g');
        this.addressCount = addressCount;
        this.isStacked = isStacked;
        this.background = new S2Rect(scene);
        this.vLine = new S2Line(scene);

        this.background.setParent(this);
        this.vLine.setParent(this);
        this.rows = [];
        for (let i = 0; i < this.addressCount; i++) {
            const address = addressStart + (this.isStacked ? this.addressCount - 1 - i : i);
            const row = new S2MemoryRow(this, i);
            row.isStacked = this.isStacked;
            row.setAddress(addressPrefix + address.toString(addressRadix).toUpperCase());
            this.rows.push(row);
        }
        this.rows[this.addressCount - 1].hLine.setEnabled(false);
        this.element.dataset.role = 'memory';
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    getExtents(space: S2Space): S2Vec2 {
        return this.data.extents.get(space);
    }

    getCenter(space: S2Space): S2Vec2 {
        return S2AnchorUtils.getCenter(
            this.data.anchor.get(),
            space,
            this.scene,
            this.data.position,
            this.data.extents,
        );
    }

    getRow(rowId: number): S2MemoryRow {
        if (rowId < 0 || rowId >= this.addressCount) {
            throw new Error('Invalid row ID');
        }
        return this.rows[rowId];
    }

    createMemoryId(): S2MemoryId {
        let index = 0;
        while (index < this.addressCount && !this.rows[index].isAvailable()) {
            index++;
        }
        if (index >= this.addressCount) {
            throw new Error('Memory is full');
        }
        this.rows[index].setAvailability(false);
        return new S2MemoryId(this, index);
    }

    destroyMemoryId(varId: S2MemoryId): void {
        if (varId.memoryRef !== this || varId.index < 0 || varId.index >= this.addressCount) {
            throw new Error('Invalid memory ID');
        }
        this.rows[varId.index].setAvailability(true);
    }

    protected updateBackground(): void {
        const viewSpace = this.scene.getViewSpace();
        const center = this.getCenter(viewSpace);
        const extents = this.getExtents(viewSpace);

        // Background style
        this.background.data.stroke.copyIfUnlocked(this.data.background.stroke);
        this.background.data.fill.copyIfUnlocked(this.data.background.fill);
        this.background.data.opacity.copyIfUnlocked(this.data.background.opacity);
        if (this.background instanceof S2Rect) {
            this.background.data.cornerRadius.copyIfUnlocked(this.data.background.cornerRadius);
        }

        // Background position
        this.background.data.position.setV(center, viewSpace);
        this.background.data.extents.setV(extents, viewSpace);
        this.background.data.anchor.set('center');

        // Vertical line
        const valueWidth = this.data.valueWidth.get(viewSpace);
        const vLineX = center.x - extents.x + valueWidth;
        this.vLine.data.startPosition.set(vLineX, center.y + extents.y, viewSpace);
        this.vLine.data.endPosition.set(vLineX, center.y - extents.y, viewSpace);
        this.vLine.data.stroke.color.copyIfUnlocked(this.data.background.stroke.color);
        this.vLine.data.stroke.width.copyIfUnlocked(this.data.background.stroke.width);

        // Update
        this.background.update();
        this.vLine.update();
    }

    protected updateVariables(): void {
        const worldSpace = this.scene.getWorldSpace();
        const center = this.getCenter(worldSpace);
        const extents = this.getExtents(worldSpace);
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
            row.address.data.fill.copyIfUnlocked(this.data.text.addressFill);
            //row.address.data.background.copyIfUnlocked(this.data.text.addressFill);
            row.update();
        }
    }

    update(): void {
        if (this.skipUpdate()) return;

        this.updateSVGChildren();
        this.updateBackground();
        this.updateVariables();

        this.clearDirty();
    }
}
