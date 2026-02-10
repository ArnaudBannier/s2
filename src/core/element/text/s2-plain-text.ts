import type { S2Space } from '../../math/s2-space';
import type { S2BaseScene } from '../../scene/s2-base-scene';
import { S2Vec2 } from '../../math/s2-vec2';
import { svgNS } from '../../shared/s2-globals';
import { S2Element } from '../base/s2-element';
import { S2DataUtils } from '../base/s2-data-utils';
import { S2TextData } from './s2-text-data';
import { S2LocalBBox } from '../../shared/s2-local-bbox';
import { S2Point } from '../../shared/s2-point';

export class S2BasePlainText<Data extends S2TextData> extends S2Element<Data> {
    protected readonly element: SVGTextElement;
    protected readonly localBBox: S2LocalBBox;
    protected readonly svgPosition: S2Point;

    constructor(scene: S2BaseScene, data: Data) {
        super(scene, data);
        this.element = document.createElementNS(svgNS, 'text');
        this.localBBox = new S2LocalBBox(scene);
        this.localBBox.setOwner(this);
        this.svgPosition = new S2Point(0, 0, scene.getViewSpace());

        this.element.setAttribute('x', this.svgPosition.value.x.toString());
        this.element.setAttribute('y', this.svgPosition.value.y.toString());
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

    getSVGPositionInto(dst: S2Vec2, space: S2Space): this {
        this.svgPosition.getInto(dst, space);
        return this;
    }

    getExtentsInto(dst: S2Vec2, space: S2Space): this {
        this.localBBox.getExtentsInto(dst, space);
        return this;
    }

    getCenterInto(dst: S2Vec2, space: S2Space): this {
        const centerOffset = this.scene.acquireVec2();
        const position = this.scene.acquireVec2();
        this.localBBox.getCenterOffsetInto(centerOffset, space);
        this.data.position.getInto(position, space);
        dst.copy(position).addV(centerOffset);

        this.scene.releaseVec2(centerOffset);
        this.scene.releaseVec2(position);
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

        const viewSpace = this.scene.getViewSpace();
        const svgPosition = this.svgPosition.value;
        this.svgPosition.space = viewSpace;

        const isBBoxDirty =
            this.localBBox.isDirty() || this.data.font.isDirty() || this.data.preserveWhitespace.isDirty();

        if (isBBoxDirty) {
            this.localBBox.set(this.element, svgPosition, viewSpace);
        }

        const isPositionDirty =
            isBBoxDirty || this.data.position.isDirty() || this.data.offset.isDirty() || this.data.textAnchor.isDirty();

        if (isPositionDirty) {
            const viewSpace = this.scene.getViewSpace();
            const anchor = this.data.textAnchor.get();
            const extents = this.scene.acquireVec2();
            const shift = this.scene.acquireVec2();

            this.data.position.getInto(svgPosition, viewSpace);
            this.localBBox.getExtentsInto(extents, viewSpace);
            this.data.offset.getInto(shift, viewSpace);
            svgPosition.x += -anchor * extents.x + shift.x;
            svgPosition.y += shift.y;

            this.element.setAttribute('x', svgPosition.x.toString());
            this.element.setAttribute('y', svgPosition.y.toString());

            this.scene.releaseVec2(extents);
            this.scene.releaseVec2(shift);
        }

        this.clearDirty();
    }
}

export class S2PlainText extends S2BasePlainText<S2TextData> {
    constructor(scene: S2BaseScene) {
        super(scene, new S2TextData(scene));
    }
}
