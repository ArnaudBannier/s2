import { S2Vec2 } from '../../math/s2-vec2';
import { S2BaseScene } from '../../s2-base-scene';
import { svgNS, type S2Dirtyable } from '../../s2-globals';
import { S2BBox, S2Number, S2Position, S2Transform, S2TypeState, type S2Space } from '../../s2-types';
import { S2BaseData, S2FillData, S2FontData, S2StrokeData } from '../base/s2-base-data';
import { S2Element } from '../base/s2-element';
import { S2DataUtils } from '../base/s2-data-utils';
import type { S2BaseRichText } from './s2-rich-text';
import type { S2TextData } from './s2-text-data';

export class S2TSpanData extends S2BaseData {
    public readonly fill: S2FillData;
    public readonly stroke: S2StrokeData;
    public readonly opacity: S2Number;
    public readonly transform: S2Transform;
    public readonly font: S2FontData;

    constructor() {
        super();
        this.fill = new S2FillData();
        this.stroke = new S2StrokeData();
        this.opacity = new S2Number(1, S2TypeState.Inactive);
        this.transform = new S2Transform();
        this.font = new S2FontData();

        this.stroke.width.set(0, 'view', S2TypeState.Inactive);
        this.transform.state = S2TypeState.Inactive;
        this.fill.opacity.set(1, S2TypeState.Inactive);
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        this.fill.setOwner(owner);
        this.stroke.setOwner(owner);
        this.opacity.setOwner(owner);
        this.font.setOwner(owner);
    }

    resetDirtyFlags(): void {
        super.resetDirtyFlags();
        this.fill.resetDirtyFlags();
        this.stroke.resetDirtyFlags();
        this.opacity.resetDirtyFlags();
        this.transform.resetDirtyFlags();
        this.font.resetDirtyFlags();
    }
}

export class S2TSpan extends S2Element<S2TSpanData> {
    public category: string;
    protected content: string;
    protected element: SVGTSpanElement;
    protected localBBox: S2BBox;
    protected parentText: S2BaseRichText<S2TextData>;

    constructor(scene: S2BaseScene, parentText: S2BaseRichText<S2TextData>) {
        super(scene, new S2TSpanData());
        this.element = document.createElementNS(svgNS, 'tspan');
        this.category = '';
        this.content = '';
        this.localBBox = new S2BBox();
        this.parentText = parentText;

        this.localBBox.setOwner(this);
    }

    getSVGElement(): SVGTextElement {
        return this.element;
    }

    setContent(content: string): this {
        this.element.textContent = content;
        this.content = content;
        this.setDirty();
        return this;
    }

    getContent(): string {
        return this.content;
    }

    getLocalCenter(space: S2Space): S2Vec2 {
        return this.localBBox.getCenter(space, this.scene.getActiveCamera());
    }

    getPosition(space: S2Space): S2Vec2 {
        const localPos = this.getLocalCenter(space);
        const parentPos = this.parentText.getPosition(space);
        return localPos.addV(parentPos);
    }

    getExtents(space: S2Space): S2Vec2 {
        return this.localBBox.getExtents(space, this.scene.getActiveCamera());
    }

    updateLocalBBox(parentPosition: S2Position | null): this {
        S2DataUtils.applyFont(this.data.font, this.element, this.scene);
        this.localBBox.set(this.element, parentPosition, this.scene.getActiveCamera());
        this.localBBox.resetDirtyFlags();
        this.data.font.resetDirtyFlags();
        return this;
    }

    update(): void {
        if (this.isDirty() === false) return;

        S2DataUtils.applyFill(this.data.fill, this.element, this.scene);
        S2DataUtils.applyStroke(this.data.stroke, this.element, this.scene);
        S2DataUtils.applyOpacity(this.data.opacity, this.element, this.scene);
        S2DataUtils.applyTransform(this.data.transform, this.element, this.scene);
        S2DataUtils.applyFont(this.data.font, this.element, this.scene);

        this.resetDirtyFlags();
    }
}
