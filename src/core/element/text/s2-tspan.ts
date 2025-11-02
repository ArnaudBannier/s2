import type { S2Space } from '../../math/s2-space';
import type { S2BaseScene } from '../../scene/s2-base-scene';
import type { S2BaseRichText } from './s2-rich-text';
import type { S2Dirtyable } from '../../shared/s2-globals';
import type { S2TextData } from './s2-text-data';
import { S2Vec2 } from '../../math/s2-vec2';
import { svgNS } from '../../shared/s2-globals';
import { S2ElementData, S2FillData, S2FontData, S2StrokeData } from '../base/s2-base-data';
import { S2Element } from '../base/s2-element';
import { S2DataUtils } from '../base/s2-data-utils';
import { S2Number } from '../../shared/s2-number';
import { S2Transform } from '../../shared/s2-transform';
import { S2LocalBBox } from '../../shared/s2-local-bbox';

export class S2TSpanData extends S2ElementData {
    public readonly fill: S2FillData;
    public readonly stroke: S2StrokeData;
    public readonly opacity: S2Number;
    public readonly transform: S2Transform;
    public readonly font: S2FontData;

    constructor(scene: S2BaseScene) {
        super();
        this.fill = new S2FillData();
        this.stroke = new S2StrokeData(scene);
        this.opacity = new S2Number(1);
        this.transform = new S2Transform();
        this.font = new S2FontData(scene);

        this.fill.opacity.set(1);
        this.stroke.width.set(0, scene.getViewSpace());
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        super.setOwner(owner);
        this.fill.setOwner(owner);
        this.stroke.setOwner(owner);
        this.opacity.setOwner(owner);
        this.transform.setOwner(owner);
        this.font.setOwner(owner);
    }

    clearDirty(): void {
        super.clearDirty();
        this.fill.clearDirty();
        this.stroke.clearDirty();
        this.opacity.clearDirty();
        this.transform.clearDirty();
        this.font.clearDirty();
    }
}

export class S2TSpan extends S2Element<S2TSpanData> {
    public category: string;
    protected content: string;
    protected readonly element: SVGTSpanElement;
    protected readonly localBBox: S2LocalBBox;
    protected readonly parentText: S2BaseRichText<S2TextData>;

    constructor(scene: S2BaseScene, parentText: S2BaseRichText<S2TextData>) {
        super(scene, new S2TSpanData(scene));
        this.element = document.createElementNS(svgNS, 'tspan');
        this.category = '';
        this.content = '';
        this.localBBox = new S2LocalBBox(scene);
        this.parentText = parentText;
    }

    getSVGElement(): SVGTextElement {
        return this.element;
    }

    setContent(content: string): this {
        this.element.textContent = content;
        this.content = content;
        this.localBBox.markDirty();
        this.markDirty();
        return this;
    }

    markBBoxDirty(): void {
        this.localBBox.markDirty();
        this.markDirty();
    }

    isBBoxDirty(): boolean {
        return this.localBBox.isDirty() || this.data.font.isDirty() || this.data.transform.isDirty();
    }

    getContent(): string {
        return this.content;
    }

    getCenterInto(dst: S2Vec2, space: S2Space): this {
        const centerOffset = _vec0;
        const position = _vec1;
        this.localBBox.getCenterOffsetInto(centerOffset, space);
        this.parentText.getPositionInto(position, space);
        dst.copy(position).addV(centerOffset);
        return this;
    }

    getCenterOffsetInto(dst: S2Vec2, space: S2Space): this {
        this.localBBox.getCenterOffsetInto(dst, space);
        return this;
    }

    getBBoxInto(dstLower: S2Vec2, dstUpper: S2Vec2, space: S2Space): this {
        const position = _vec0;
        this.parentText.getPositionInto(position, space);
        this.localBBox.getBBoxOffsetsInto(dstLower, dstUpper, space);
        dstLower.addV(position);
        dstUpper.addV(position);
        return this;
    }

    getBBoxOffsetsInto(dstLower: S2Vec2, dstUpper: S2Vec2, space: S2Space): this {
        this.localBBox.getBBoxOffsetsInto(dstLower, dstUpper, space);
        return this;
    }

    getExtentsInto(dst: S2Vec2, space: S2Space): this {
        this.localBBox.getExtentsInto(dst, space);
        return this;
    }

    protected updateBBox(): void {
        const viewSpace = this.scene.getViewSpace();
        const svgPosition = _vec0;
        this.parentText.getSVGPositionInto(svgPosition, viewSpace);
        this.localBBox.set(this.element, svgPosition, viewSpace);
        this.localBBox.clearDirty();
    }

    update(): void {
        if (this.skipUpdate()) return;

        S2DataUtils.applyFill(this.data.fill, this.element, this.scene);
        S2DataUtils.applyStroke(this.data.stroke, this.element, this.scene);
        S2DataUtils.applyOpacity(this.data.opacity, this.element, this.scene);
        S2DataUtils.applyTransform(this.data.transform, this.element, this.scene);
        S2DataUtils.applyFont(this.data.font, this.element, this.scene);

        if (this.localBBox.isDirty()) this.updateBBox();
        this.clearDirty();
    }
}

const _vec0 = new S2Vec2();
const _vec1 = new S2Vec2();
