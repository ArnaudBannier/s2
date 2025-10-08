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
import type { S2Color } from '../core/shared/s2-color';
import { S2MemoryRow } from './s2-memory-row';

export class S2Memory extends S2Element<S2MemoryData> {
    protected element: SVGGElement;
    protected addressCount: number;
    protected background: S2Rect;
    protected vLine: S2Line;
    protected rows: S2MemoryRow[];
    protected isStacked: boolean;

    constructor(scene: S2BaseScene, addressCount: number, isStacked = false) {
        super(scene, new S2MemoryData());
        this.element = document.createElementNS(svgNS, 'g');
        this.addressCount = addressCount;
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

    addVariable(): number {
        let varId = 0;
        while (varId < this.addressCount && !this.rows[varId].isAvailable()) {
            varId++;
        }
        if (varId >= this.addressCount) {
            throw new Error('Memory is full');
        }
        this.rows[varId].setAvailability(false);
        return varId;
    }

    setValue(varId: number, value: string, options: { color?: S2Color } = {}): S2PlainText {
        if (varId < 0 || varId >= this.addressCount) {
            throw new Error('Invalid variable ID');
        }
        return this.rows[varId].setValue(value, options);
    }

    setName(varId: number, name: string, options: { color?: S2Color } = {}): S2PlainText {
        if (varId < 0 || varId >= this.addressCount) {
            throw new Error('Invalid variable ID');
        }
        return this.rows[varId].setName(name, options);
    }

    animateSetValue(
        varId: number,
        value: string,
        animator: S2StepAnimator,
        options: { label?: string; offset?: number; duration?: number; color?: S2Color } = {},
    ): S2PlainText {
        if (varId < 0 || varId >= this.addressCount) {
            throw new Error('Invalid variable ID');
        }
        return this.rows[varId].animateSetValue(value, animator, options);
    }

    animateSetName(
        varId: number,
        name: string,
        animator: S2StepAnimator,
        options: { label?: string; offset?: number; duration?: number; color?: S2Color } = {},
    ): S2PlainText {
        if (varId < 0 || varId >= this.addressCount) {
            throw new Error('Invalid variable ID');
        }
        return this.rows[varId].animateSetName(name, animator, options);
    }

    animateDestroy(
        varId: number,
        animator: S2StepAnimator,
        options: { label?: string; offset?: number; duration?: number } = {},
    ): void {
        if (varId < 0 || varId >= this.addressCount) {
            throw new Error('Invalid variable ID');
        }
        this.rows[varId].animateDestroy(animator, options);
        this.rows[varId].setAvailability(true);
    }

    animateCopyValue(
        dstId: number,
        srcId: number,
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
        if (dstId < 0 || dstId >= this.addressCount || srcId < 0 || srcId >= this.addressCount) {
            throw new Error('Invalid variable ID');
        }
        return this.rows[dstId].animateCopyValue(this.rows[srcId], animator, options);
    }

    animateCopyAddress(
        dstId: number,
        srcId: number,
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
        if (dstId < 0 || dstId >= this.addressCount || srcId < 0 || srcId >= this.addressCount) {
            throw new Error('Invalid variable ID');
        }
        return this.rows[dstId].animateCopyAddress(this.rows[srcId], animator, options);
    }

    animateColor(
        varId: number,
        color: S2Color,
        animator: S2StepAnimator,
        options: { label?: string; offset?: number; duration?: number } = {},
    ): void {
        if (varId < 0 || varId >= this.addressCount) {
            throw new Error('Invalid variable ID');
        }
        this.rows[varId].animateColor(color, animator, options);
    }

    animateEmphIn(
        varId: number,
        animator: S2StepAnimator,
        options: {
            label?: string;
            offset?: number;
            duration?: number;
            color?: S2Color;
        } = {},
    ): void {
        if (varId < 0 || varId >= this.addressCount) {
            throw new Error('Invalid variable ID');
        }
        this.rows[varId].animateEmphIn(animator, options);
    }

    animateEmphOut(
        varId: number,
        animator: S2StepAnimator,
        options: {
            label?: string;
            offset?: number;
            duration?: number;
        } = {},
    ): void {
        if (varId < 0 || varId >= this.addressCount) {
            throw new Error('Invalid variable ID');
        }
        this.rows[varId].animateEmphOut(animator, options);
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
            row.address.data.fill.copyIfUnlocked(this.data.text.addressFill);
            //row.address.data.background.copyIfUnlocked(this.data.text.addressFill);
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
