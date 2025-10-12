import type { S2BaseScene } from '../../scene/s2-base-scene';
import type { S2Space } from '../../shared/s2-base-type';
import { S2Vec2 } from '../../math/s2-vec2';
import { svgNS } from '../../shared/s2-globals';
import { S2Element } from '../base/s2-element';
import { S2DataUtils } from '../base/s2-data-utils';
import { S2TextData } from './s2-text-data';
import { S2BBox } from '../../shared/s2-bbox';

export class S2BasePlainText<Data extends S2TextData> extends S2Element<Data> {
    protected element: SVGTextElement;
    protected localBBox: S2BBox;

    constructor(scene: S2BaseScene, data: Data) {
        super(scene, data);
        this.element = document.createElementNS(svgNS, 'text');
        this.localBBox = new S2BBox();
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

    getPosition(space: S2Space): S2Vec2 {
        return this.data.position.toSpace(space, this.scene.getActiveCamera());
    }

    getExtents(space: S2Space): S2Vec2 {
        return this.localBBox.getExtents(space, this.scene.getActiveCamera());
    }

    getCenter(space: S2Space): S2Vec2 {
        const localCenter = this.localBBox.getCenter(space, this.scene.getActiveCamera());
        const position = this.getPosition(space);
        return localCenter.addV(position);
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
        S2DataUtils.applyShiftedPosition(this.data.position, this.data.localShift, this.element, this.scene, 'x', 'y');
        S2DataUtils.applyFont(this.data.font, this.element, this.scene);
        S2DataUtils.applyPreserveWhitespace(this.data.preserveWhitespace, this.element, this.scene);
        S2DataUtils.applyTextAnchor(this.data.textAnchor, this.element, this.scene);

        const isBBoxDirty =
            this.localBBox.isDirty() ||
            this.data.textAnchor.isDirty() ||
            this.data.font.isDirty() ||
            this.data.preserveWhitespace.isDirty();

        if (isBBoxDirty) {
            this.localBBox.set(this.element, this.data.position, this.scene.getActiveCamera());
        }

        this.clearDirty();
    }
}

export class S2PlainText extends S2BasePlainText<S2TextData> {
    constructor(scene: S2BaseScene) {
        super(scene, new S2TextData());
    }
}
