import type { S2Space } from '../../math/s2-space';
import type { S2BaseScene } from '../../scene/s2-base-scene';
import { S2Vec2 } from '../../math/s2-vec2';
import { svgNS } from '../../shared/s2-globals';
import { S2Element } from '../base/s2-element';
import { S2DataUtils } from '../base/s2-data-utils';
import { S2TSpan } from './s2-tspan';
import { S2TextData } from './s2-text-data';
import { S2Extents } from '../../shared/s2-extents';
import { S2Offset } from '../../shared/s2-offset';
import { S2Point } from '../../shared/s2-point';

export class S2BaseRichText<Data extends S2TextData> extends S2Element<Data> {
    protected readonly element: SVGTextElement;
    protected readonly extents: S2Extents;
    protected readonly centerOffset: S2Offset;
    protected readonly svgPosition: S2Point;
    protected readonly tspans: S2TSpan[] = [];

    constructor(scene: S2BaseScene, data: Data) {
        super(scene, data);
        const viewSpace = scene.getViewSpace();
        this.element = document.createElementNS(svgNS, 'text');
        this.extents = new S2Extents(0, 0, viewSpace);
        this.centerOffset = new S2Offset(0, 0, viewSpace);
        this.svgPosition = new S2Point(0, 0, viewSpace);

        this.element.setAttribute('x', this.svgPosition.value.x.toString());
        this.element.setAttribute('y', this.svgPosition.value.y.toString());
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    addTSpan(content: string, category?: string): S2TSpan {
        const tspan = new S2TSpan(this.scene, this);
        tspan.setParent(this);
        tspan.setContent(content);
        tspan.category = category ?? '';
        this.tspans.push(tspan);

        this.extents.markDirty();
        this.centerOffset.markDirty();
        this.markDirty();
        return tspan;
    }

    getPositionInto(dst: S2Vec2, space: S2Space): this {
        this.data.position.getInto(dst, space);
        return this;
    }

    getSVGPositionInto(dst: S2Vec2, space: S2Space): this {
        this.svgPosition.getInto(dst, space);
        return this;
    }

    getExtentsInto(dst: S2Vec2, space: S2Space): this {
        this.extents.getInto(dst, space);
        return this;
    }

    getCenterInto(dst: S2Vec2, space: S2Space): this {
        const centerOffset = this.scene.acquireVec2();
        const position = this.scene.acquireVec2();
        this.centerOffset.getInto(centerOffset, space);
        this.data.position.getInto(position, space);
        dst.copy(position).addV(centerOffset);

        this.scene.releaseVec2(centerOffset);
        this.scene.releaseVec2(position);
        return this;
    }

    getTSpans(): Array<S2TSpan> {
        return this.tspans;
    }

    getTSpanCount(): number {
        return this.tspans.length;
    }

    getTSpan(index: number): S2TSpan {
        return this.tspans[index];
    }

    findTSpan(options: { content?: string; category?: string }): S2TSpan | undefined {
        return this.tspans.find((tspan) => {
            return (
                (options.content ? tspan.getContent() === options.content : true) &&
                (options.category ? tspan.category === options.category : true)
            );
        });
    }

    clearText(): this {
        this.children.length = 0;
        this.tspans.length = 0;
        this.element.replaceChildren();
        this.updateSVGChildren();

        this.extents.markDirty();
        this.centerOffset.markDirty();
        this.markDirty();
        return this;
    }

    protected updateExtents(): void {
        const viewSpace = this.scene.getViewSpace();
        if (this.tspans.length === 0) {
            this.extents.set(0, 0, viewSpace);
            this.centerOffset.set(0, 0, viewSpace);
        } else {
            const lowerOffset = this.scene.acquireVec2().set(+Infinity, +Infinity);
            const upperOffset = this.scene.acquireVec2().set(-Infinity, -Infinity);
            const tLower = this.scene.acquireVec2();
            const tUpper = this.scene.acquireVec2();
            for (const tspan of this.tspans) {
                tspan.getBBoxOffsetsInto(tLower, tUpper, viewSpace);
                lowerOffset.minV(tLower);
                upperOffset.maxV(tUpper);
            }
            this.extents.set((upperOffset.x - lowerOffset.x) / 2, (upperOffset.y - lowerOffset.y) / 2, viewSpace);
            this.centerOffset.set((upperOffset.x + lowerOffset.x) / 2, (upperOffset.y + lowerOffset.y) / 2, viewSpace);

            this.scene.releaseVec2(tLower);
            this.scene.releaseVec2(tUpper);
            this.scene.releaseVec2(lowerOffset);
            this.scene.releaseVec2(upperOffset);
        }
        this.extents.clearDirty();
        this.centerOffset.clearDirty();
    }

    update(): void {
        if (this.skipUpdate()) return;

        this.updateSVGChildren();

        S2DataUtils.applyOpacity(this.data.opacity, this.element, this.scene);
        S2DataUtils.applyTransform(this.data.transform, this.element, this.scene);
        S2DataUtils.applyPreserveWhitespace(this.data.preserveWhitespace, this.element, this.scene);

        this.element.setAttribute('text-anchor', 'middle');
        if (this.data.stroke.width.value > 0) {
            this.element.setAttribute('paint-order', 'stroke');
        } else {
            this.element.removeAttribute('paint-order');
        }

        let areBBoxesDirty =
            this.data.preserveWhitespace.isDirty() || this.data.font.isDirty() || this.extents.isDirty();

        for (const tspan of this.tspans) {
            tspan.data.fill.copyIfUnlocked(this.data.fill);
            tspan.data.stroke.copyIfUnlocked(this.data.stroke);
            tspan.data.font.copyIfUnlocked(this.data.font);
            tspan.applyStyle();
            areBBoxesDirty = areBBoxesDirty || tspan.isBBoxDirty();
        }
        if (areBBoxesDirty) {
            for (const tspan of this.tspans) {
                tspan.markBBoxDirty();
            }
        }
        for (const tspan of this.tspans) {
            tspan.update();
        }

        this.updateExtents();

        const viewSpace = this.scene.getViewSpace();
        const anchor = this.data.textAnchor.get();
        const extents = this.scene.acquireVec2();
        const shift = this.scene.acquireVec2();
        const svgPosition = this.svgPosition.value;
        this.svgPosition.space = viewSpace;

        this.data.position.getInto(svgPosition, viewSpace);
        this.extents.getInto(extents, viewSpace);
        this.data.localShift.getInto(shift, viewSpace);
        svgPosition.x += -anchor * extents.x + shift.x;
        svgPosition.y += shift.y;

        this.element.setAttribute('x', svgPosition.x.toFixed(2));
        this.element.setAttribute('y', svgPosition.y.toFixed(2));

        this.scene.releaseVec2(extents);
        this.scene.releaseVec2(shift);

        for (const tspan of this.tspans) {
            tspan.update();
        }

        this.clearDirty();
    }
}

export class S2RichText extends S2BaseRichText<S2TextData> {
    constructor(scene: S2BaseScene) {
        super(scene, new S2TextData(scene));
    }
}
