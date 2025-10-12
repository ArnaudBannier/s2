import type { S2BaseScene } from '../../scene/s2-base-scene';
import type { S2Dirtyable } from '../../shared/s2-globals';
import type { S2Space } from '../../shared/s2-base-type';
import type { S2BaseRichText } from './s2-rich-text';
import type { S2TextData } from './s2-text-data';
import { S2Vec2 } from '../../math/s2-vec2';
import { svgNS } from '../../shared/s2-globals';
import { S2ElementData, S2FillData, S2FontData, S2StrokeData } from '../base/s2-base-data';
import { S2Element } from '../base/s2-element';
import { S2DataUtils } from '../base/s2-data-utils';
import { S2Number } from '../../shared/s2-number';
import { S2Transform } from '../../shared/s2-transform';
import { S2BBox } from '../../shared/s2-bbox';

export class S2TSpanData extends S2ElementData {
    public readonly fill: S2FillData;
    public readonly stroke: S2StrokeData;
    public readonly opacity: S2Number;
    public readonly transform: S2Transform;
    public readonly font: S2FontData;

    constructor() {
        super();
        this.fill = new S2FillData();
        this.stroke = new S2StrokeData();
        this.opacity = new S2Number(1);
        this.transform = new S2Transform();
        this.font = new S2FontData();

        this.fill.opacity.set(1);
        this.stroke.width.set(0, 'view');
    }

    setOwner(owner: S2Dirtyable | null = null): void {
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

    clearDirty(): void {
        super.clearDirty();
        this.localBBox.clearDirty();
    }

    getSVGElement(): SVGTextElement {
        return this.element;
    }

    setContent(content: string): this {
        this.element.textContent = content;
        this.content = content;
        this.localBBox.markDirty();
        return this;
    }

    getContent(): string {
        return this.content;
    }

    getLocalCenter(space: S2Space): S2Vec2 {
        return this.localBBox.getCenter(space, this.scene.getActiveCamera());
    }

    getCenter(space: S2Space): S2Vec2 {
        const localCenter = this.getLocalCenter(space);
        return localCenter.addV(this.parentText.getPosition(space));
    }

    getExtents(space: S2Space): S2Vec2 {
        return this.localBBox.getExtents(space, this.scene.getActiveCamera());
    }

    getLower(space: S2Space): S2Vec2 {
        const localLower = this.localBBox.getLower(space, this.scene.getActiveCamera());
        return localLower.addV(this.parentText.getPosition(space));
    }

    getUpper(space: S2Space): S2Vec2 {
        const localUpper = this.localBBox.getUpper(space, this.scene.getActiveCamera());
        return localUpper.addV(this.parentText.getPosition(space));
    }

    update(): void {
        if (this.skipUpdate()) return;

        S2DataUtils.applyFill(this.data.fill, this.element, this.scene);
        S2DataUtils.applyStroke(this.data.stroke, this.element, this.scene);
        S2DataUtils.applyOpacity(this.data.opacity, this.element, this.scene);
        S2DataUtils.applyTransform(this.data.transform, this.element, this.scene);
        S2DataUtils.applyFont(this.data.font, this.element, this.scene);

        const isBBoxDirty =
            this.localBBox.isDirty() || this.data.font.isDirty() || this.parentText.data.preserveWhitespace.isDirty();

        if (isBBoxDirty) {
            this.localBBox.set(this.element, this.parentText.data.position, this.scene.getActiveCamera());
        }

        this.clearDirty();
    }
}
