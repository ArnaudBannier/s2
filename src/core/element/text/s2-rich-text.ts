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

export class S2BaseRichText<Data extends S2TextData> extends S2Element<Data> {
    protected readonly element: SVGTextElement;
    protected readonly extents: S2Extents;
    protected readonly centerOffset: S2Offset;
    protected readonly tspans: S2TSpan[] = [];

    constructor(scene: S2BaseScene, data: Data) {
        super(scene, data);
        this.element = document.createElementNS(svgNS, 'text');
        this.extents = new S2Extents(0, 0, scene.getViewSpace());
        this.centerOffset = new S2Offset(0, 0, scene.getViewSpace());

        this.extents.setOwner(this);
        this.centerOffset.setOwner(this);
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
        return tspan;
    }

    getPositionInto(dst: S2Vec2, space: S2Space): this {
        this.data.position.getInto(dst, space);
        return this;
    }

    getExtentsInto(dst: S2Vec2, space: S2Space): this {
        this.extents.getInto(dst, space);
        return this;
    }

    getCenterInto(dst: S2Vec2, space: S2Space): this {
        const centerOffset = _vec0;
        const position = _vec1;
        this.centerOffset.getInto(centerOffset, space);
        this.data.position.getInto(position, space);
        dst.copy(position).addV(centerOffset);
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
        return this;
    }

    updateExtents(): this {
        const viewSpace = this.scene.getViewSpace();
        if (this.tspans.length === 0) {
            this.extents.set(0, 0, viewSpace);
            this.centerOffset.set(0, 0, viewSpace);
        } else {
            const lowerOffset = _vec0.set(Infinity, Infinity);
            const upperOffset = _vec1.set(-Infinity, -Infinity);
            for (const tspan of this.tspans) {
                tspan.getBBoxOffsetsInto(_vec2, _vec3, viewSpace);
                lowerOffset.minV(_vec2);
                upperOffset.maxV(_vec3);
            }
            this.extents.set((upperOffset.x - lowerOffset.x) / 2, (upperOffset.y - lowerOffset.y) / 2, viewSpace);
            this.centerOffset.set((upperOffset.x + lowerOffset.x) / 2, (upperOffset.y + lowerOffset.y) / 2, viewSpace);
        }
        this.extents.clearDirty();
        this.centerOffset.clearDirty();
        return this;
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

        for (const tspan of this.tspans) {
            if (this.data.fill.isDirty() || tspan.isDirty()) {
                tspan.data.fill.copyIfUnlocked(this.data.fill);
            }
            if (this.data.stroke.isDirty() || tspan.isDirty()) {
                tspan.data.stroke.copyIfUnlocked(this.data.stroke);
            }
            if (this.data.font.isDirty() || tspan.isDirty()) {
                tspan.data.font.copyIfUnlocked(this.data.font);
            }
            tspan.update();
        }
        this.updateExtents();

        const viewSpace = this.scene.getViewSpace();
        const anchor = this.data.textAnchor.get();
        const position = _vec0;
        const extents = _vec1;
        const shift = _vec2;

        this.data.position.getInto(position, viewSpace);
        this.extents.getInto(extents, viewSpace);
        this.data.localShift.getInto(shift, viewSpace);
        position.x += anchor * extents.x + shift.x;
        position.y += shift.y;

        if (isNaN(position.x) || isNaN(position.y)) {
            throw new Error('S2RichText update resulted in NaN position');
        }

        this.element.setAttribute('x', position.x.toString());
        this.element.setAttribute('y', position.y.toString());

        this.clearDirty();
    }
}

export class S2RichText extends S2BaseRichText<S2TextData> {
    constructor(scene: S2BaseScene) {
        super(scene, new S2TextData(scene));
    }
}

const _vec0 = new S2Vec2();
const _vec1 = new S2Vec2();
const _vec2 = new S2Vec2();
const _vec3 = new S2Vec2();
