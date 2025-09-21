import { S2Vec2 } from '../math/s2-vec2';
import { S2BaseScene } from '../s2-base-scene';
import { svgNS, type S2Dirtyable, type S2TextAnchor } from '../s2-globals';
import {
    S2Boolean,
    S2Enum,
    S2Extents,
    S2LocalBBox,
    S2Number,
    S2Position,
    S2Transform,
    S2TypeState,
    type S2Space,
} from '../s2-types';
import { S2BaseData, S2FillData, S2FontData, S2StrokeData } from './base/s2-base-data';
import { S2Element } from './base/s2-element';
import { S2DataUtils } from './base/s2-data-utils';

export class S2TextData extends S2BaseData {
    public readonly fill: S2FillData;
    public readonly stroke: S2StrokeData;
    public readonly opacity: S2Number;
    public readonly transform: S2Transform;
    public readonly position: S2Position;
    public readonly font: S2FontData;
    public readonly textAnchor: S2Enum<S2TextAnchor>;
    public readonly preserveWhitespace: S2Boolean;

    constructor() {
        super();
        this.fill = new S2FillData();
        this.stroke = new S2StrokeData();
        this.opacity = new S2Number(1, S2TypeState.Inactive);
        this.transform = new S2Transform();
        this.position = new S2Position(0, 0, 'world');
        this.font = new S2FontData();
        this.textAnchor = new S2Enum<S2TextAnchor>('start');
        this.preserveWhitespace = new S2Boolean(false, S2TypeState.Inactive);

        this.stroke.width.set(0, 'view', S2TypeState.Inactive);
        this.transform.state = S2TypeState.Inactive;
        this.fill.opacity.set(1, S2TypeState.Inactive);
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        this.fill.setOwner(owner);
        this.stroke.setOwner(owner);
        this.opacity.setOwner(owner);
        this.position.setOwner(owner);
        this.font.setOwner(owner);
        this.textAnchor.setOwner(owner);
        this.preserveWhitespace.setOwner(owner);
    }

    resetDirtyFlags(): void {
        super.resetDirtyFlags();
        this.fill.resetDirtyFlags();
        this.stroke.resetDirtyFlags();
        this.opacity.resetDirtyFlags();
        this.transform.resetDirtyFlags();
        this.position.resetDirtyFlags();
        this.font.resetDirtyFlags();
        this.textAnchor.resetDirtyFlags();
        this.preserveWhitespace.resetDirtyFlags();
    }
}

export class S2BaseText<Data extends S2TextData> extends S2Element<Data> {
    protected element: SVGTextElement;
    protected tspans: Array<S2TSpan>;
    protected extents: S2Extents;

    constructor(scene: S2BaseScene, data: Data) {
        super(scene, data);
        this.element = document.createElementNS(svgNS, 'text');
        this.tspans = [];
        this.extents = new S2Extents(0, 0, 'view');
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    getPosition(space: S2Space): S2Vec2 {
        return this.data.position.toSpace(space, this.scene.getActiveCamera());
    }

    setContent(content: string): this {
        //throw new Error('Use addTSpan() to add text content with S2TSpan elements.');
        this.addTSpan(content);
        return this;
    }

    addTSpan(content: string, category?: string): S2TSpan {
        const tspan = new S2TSpan(this.scene, this);
        tspan.setParent(this);
        tspan.setContent(content);
        tspan.category = category ?? '';

        this.tspans.push(tspan);
        //this.updateSVGChildren();
        this.setDirty();
        this.extents.setDirty();
        return tspan;
    }

    getExtents(space: S2Space): S2Vec2 {
        return this.extents.toSpace(space, this.scene.getActiveCamera());
    }

    // updateExtents(): this {
    //     const bbox = this.element.getBBox();
    //     this.extents.set(bbox.width / 2, bbox.height / 2, 'view');
    //     return this;
    // }

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
        this.setDirty();
        return this;
    }

    getBBox(): DOMRect {
        return this.element.getBBox();
    }

    getDimensions(): S2Vec2 {
        const bbox = this.element.getBBox();
        return new S2Vec2(bbox.width, bbox.height);
    }

    updateExtents(): this {
        const lowerBound = new S2Vec2(Infinity, Infinity);
        const upperBound = new S2Vec2(-Infinity, -Infinity);
        for (const tspan of this.tspans) {
            const pos = tspan.getLocalPosition('view');
            const ext = tspan.getExtents('view');
            lowerBound.x = Math.min(lowerBound.x, pos.x - ext.x);
            lowerBound.y = Math.min(lowerBound.y, pos.y - ext.y);
            upperBound.x = Math.max(upperBound.x, pos.x + ext.x);
            upperBound.y = Math.max(upperBound.y, pos.y + ext.y);
        }
        this.extents.set((upperBound.x - lowerBound.x) / 2, (upperBound.y - lowerBound.y) / 2, 'view');
        return this;
    }

    update(): void {
        if (this.dirty === false) return;

        this.updateSVGChildren();

        S2DataUtils.applyFill(this.data.fill, this.element, this.scene);
        S2DataUtils.applyStroke(this.data.stroke, this.element, this.scene);
        S2DataUtils.applyOpacity(this.data.opacity, this.element, this.scene);
        S2DataUtils.applyTransform(this.data.transform, this.element, this.scene);
        S2DataUtils.applyPosition(this.data.position, this.element, this.scene, 'x', 'y');
        S2DataUtils.applyFont(this.data.font, this.element, this.scene);
        S2DataUtils.applyPreserveWhitespace(this.data.preserveWhitespace, this.element, this.scene);
        S2DataUtils.applyTextAnchor(this.data.textAnchor, this.element, this.scene);

        if (this.data.font.isDirty() || this.data.preserveWhitespace.isDirty() || this.data.textAnchor.isDirty()) {
            for (const tspan of this.tspans) {
                tspan.data.font.copy(this.data.font);
                tspan.updateLocalBBox(this.data.position);
                tspan.update();
            }
            this.extents.setDirty();
        }

        if (this.extents.isDirty()) {
            this.updateExtents();
            this.extents.resetDirtyFlags();
        }

        this.resetDirtyFlags();
    }
}

export class S2Text extends S2BaseText<S2TextData> {
    constructor(scene: S2BaseScene) {
        super(scene, new S2TextData());
    }
}

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
    protected localBBox: S2LocalBBox;
    protected parentText: S2BaseText<S2TextData>;

    constructor(scene: S2BaseScene, parentText: S2BaseText<S2TextData>) {
        super(scene, new S2TSpanData());
        this.element = document.createElementNS(svgNS, 'tspan');
        this.category = '';
        this.content = '';
        this.localBBox = new S2LocalBBox();
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

    getLocalPosition(space: S2Space): S2Vec2 {
        return this.localBBox.getLocalPosition(space, this.scene.getActiveCamera());
    }

    getPosition(space: S2Space): S2Vec2 {
        const localPos = this.getLocalPosition(space);
        const parentPos = this.parentText.getPosition(space);
        return localPos.addV(parentPos);
    }

    getExtents(space: S2Space): S2Vec2 {
        return this.localBBox.getExtents(space, this.scene.getActiveCamera());
    }

    getBBox(): DOMRect {
        return this.element.getBBox();
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
