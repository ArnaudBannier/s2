import type { S2Space } from '../../math/s2-space';
import type { S2BaseScene } from '../../scene/s2-base-scene';
import { S2Vec2 } from '../../math/s2-vec2';
import { svgNS } from '../../shared/s2-globals';
import { S2Element } from '../base/s2-element';
import { S2DataUtils } from '../base/s2-data-utils';
import { S2TextData } from './s2-text-data';
import { S2LocalBBox } from '../../shared/s2-local-bbox';

export class S2BasePlainText<Data extends S2TextData> extends S2Element<Data> {
    protected readonly element: SVGTextElement;
    protected readonly localBBox: S2LocalBBox;

    constructor(scene: S2BaseScene, data: Data) {
        super(scene, data);
        this.element = document.createElementNS(svgNS, 'text');
        this.localBBox = new S2LocalBBox(scene.getViewSpace());
        this.localBBox.setOwner(this);
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    setContent(content: string): this {
        this.element.textContent = content;
        this.localBBox.markDirty();
        return this;
    }

    getContent(): string {
        return this.element.textContent || '';
    }

    getPositionInto(dst: S2Vec2, space: S2Space): this {
        this.data.position.getInto(dst, space);
        return this;
    }

    getExtentsInto(dst: S2Vec2, space: S2Space): this {
        this.localBBox.getExtentsInto(dst, space);
        return this;
    }

    getCenterInto(dst: S2Vec2, space: S2Space): this {
        const centerOffset = _vec0;
        const position = _vec1;
        this.localBBox.getCenterOffsetInto(centerOffset, space);
        this.data.position.getInto(position, space);
        dst.copy(position).addV(centerOffset);
        return this;
    }

    clearText(): this {
        this.element.replaceChildren();
        this.localBBox.markDirty();
        return this;
    }

    clearDirty(): void {
        super.clearDirty();
        this.localBBox.clearDirty();
    }

    update(): void {
        if (this.skipUpdate()) return;

        S2DataUtils.applyFill(this.data.fill, this.element, this.scene);
        S2DataUtils.applyStroke(this.data.stroke, this.element, this.scene);
        S2DataUtils.applyOpacity(this.data.opacity, this.element, this.scene);
        S2DataUtils.applyTransform(this.data.transform, this.element, this.scene);
        S2DataUtils.applyFont(this.data.font, this.element, this.scene);
        S2DataUtils.applyPreserveWhitespace(this.data.preserveWhitespace, this.element, this.scene);

        this.element.setAttribute('text-anchor', 'middle');
        if (this.data.stroke.width.value > 0) {
            this.element.setAttribute('paint-order', 'stroke');
        } else {
            this.element.removeAttribute('paint-order');
        }

        const isBBoxDirty =
            this.localBBox.isDirty() || this.data.font.isDirty() || this.data.preserveWhitespace.isDirty();

        if (isBBoxDirty) {
            this.localBBox.set(this.element, this.data.position, this.scene);
        }

        const isPositionDirty =
            this.data.position.isDirty() ||
            this.data.localShift.isDirty() ||
            isBBoxDirty ||
            this.data.textAnchor.isDirty();

        if (isPositionDirty) {
            const viewSpace = this.scene.getViewSpace();
            const anchor = this.data.textAnchor.get();
            const position = _vec0;
            const extents = _vec1;
            const shift = _vec2;

            this.data.position.getInto(position, viewSpace);
            this.localBBox.getExtentsInto(extents, viewSpace);
            this.data.localShift.getInto(shift, viewSpace);
            position.x += anchor * extents.x + shift.x;
            position.y += shift.y;

            if (isNaN(position.x) || isNaN(position.y)) {
                throw new Error('S2RichText update resulted in NaN position');
            }

            this.element.setAttribute('x', position.x.toString());
            this.element.setAttribute('y', position.y.toString());
        }

        this.clearDirty();
    }
}

export class S2PlainText extends S2BasePlainText<S2TextData> {
    constructor(scene: S2BaseScene) {
        super(scene, new S2TextData(scene));
    }
}

const _vec0 = new S2Vec2();
const _vec1 = new S2Vec2();
const _vec2 = new S2Vec2();
