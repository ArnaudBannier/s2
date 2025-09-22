import { S2Vec2 } from '../../math/s2-vec2';
import { S2BaseScene } from '../../s2-base-scene';
import {
    type S2Anchor,
    type S2Dirtyable,
    type S2HorizontalAlign,
    type S2VerticalAlign,
    S2AnchorUtils,
    svgNS,
} from '../../s2-globals';
import { S2BaseRichText } from './s2-rich-text';
import {
    S2Enum,
    S2Extents,
    S2Length,
    S2Number,
    S2Position,
    S2Transform,
    S2TypeState,
    type S2Space,
} from '../../s2-types';
import { S2Element } from '../base/s2-element';
import { S2BaseData, S2FillData, S2FontData, S2StrokeData } from '../base/s2-base-data';
import { S2DataUtils } from '../base/s2-data-utils';
import { S2TextData } from './s2-text-data';

export class S2TextLineData extends S2TextData {
    public readonly skip: S2Length;
    public readonly horizontalAlign: S2Enum<S2HorizontalAlign>;

    constructor() {
        super();
        this.skip = new S2Length(0, 'view');
        this.horizontalAlign = new S2Enum<S2HorizontalAlign>('left', S2TypeState.Inactive);
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        super.setOwner(owner);
        this.skip.setOwner(owner);
        this.horizontalAlign.setOwner(owner);
    }

    resetDirtyFlags(): void {
        super.resetDirtyFlags();
        this.skip.resetDirtyFlags();
        this.horizontalAlign.resetDirtyFlags();
    }
}

export class S2TextLine extends S2BaseRichText<S2TextLineData> {
    constructor(scene: S2BaseScene) {
        super(scene, new S2TextLineData());
    }
}

export class S2TextGroupData extends S2BaseData {
    public readonly fill: S2FillData;
    public readonly stroke: S2StrokeData;
    public readonly opacity: S2Number;
    public readonly transform: S2Transform;
    public readonly position: S2Position;

    public readonly font: S2FontData;
    public readonly skip: S2Length;
    public readonly horizontalAlign: S2Enum<S2HorizontalAlign>;
    public readonly verticalAlign: S2Enum<S2VerticalAlign>;
    public readonly minExtents: S2Extents;
    public readonly anchor: S2Enum<S2Anchor>;

    constructor() {
        super();
        this.fill = new S2FillData();
        this.stroke = new S2StrokeData();
        this.opacity = new S2Number(1, S2TypeState.Inactive);
        this.transform = new S2Transform();
        this.position = new S2Position(0, 0, 'world');
        this.font = new S2FontData();
        this.skip = new S2Length(0, 'view');
        this.horizontalAlign = new S2Enum<S2HorizontalAlign>('left', S2TypeState.Inactive);
        this.verticalAlign = new S2Enum<S2VerticalAlign>('middle');
        this.minExtents = new S2Extents(0, 0, 'view');
        this.anchor = new S2Enum<S2Anchor>('center');

        this.stroke.width.set(0, 'view', S2TypeState.Inactive);
        this.transform.state = S2TypeState.Inactive;
        this.fill.opacity.set(1, S2TypeState.Inactive);
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        this.fill.setOwner(owner);
        this.stroke.setOwner(owner);
        this.opacity.setOwner(owner);
        this.transform.setOwner(owner);
        this.position.setOwner(owner);
        this.font.setOwner(owner);
        this.skip.setOwner(owner);
        this.horizontalAlign.setOwner(owner);
        this.verticalAlign.setOwner(owner);
        this.minExtents.setOwner(owner);
        this.anchor.setOwner(owner);
    }

    resetDirtyFlags(): void {
        super.resetDirtyFlags();
        this.fill.resetDirtyFlags();
        this.stroke.resetDirtyFlags();
        this.opacity.resetDirtyFlags();
        this.transform.resetDirtyFlags();
        this.position.resetDirtyFlags();
        this.font.resetDirtyFlags();
        this.skip.resetDirtyFlags();
        this.horizontalAlign.resetDirtyFlags();
        this.verticalAlign.resetDirtyFlags();
        this.minExtents.resetDirtyFlags();
        this.anchor.resetDirtyFlags();
    }
}

export class S2TextGroup extends S2Element<S2TextGroupData> {
    protected element: SVGGElement;
    protected textLines: Array<S2TextLine>;
    protected contentExtents: S2Extents;
    protected extents: S2Extents;

    constructor(scene: S2BaseScene) {
        super(scene, new S2TextGroupData());
        this.textLines = [];
        this.element = document.createElementNS(svgNS, 'g');
        this.contentExtents = new S2Extents(0, 0, 'view');
        this.extents = new S2Extents(0, 0, 'view');
        this.element.dataset.role = 'text-group';
        this.element.style.whiteSpaceCollapse = 'preserve';
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    addLine(options?: { align?: S2HorizontalAlign; skip?: number }): S2TextLine {
        const textLine = new S2TextLine(this.scene);
        textLine.setParent(this);

        if (options?.align) {
            textLine.data.horizontalAlign.set(options.align);
        }
        if (options?.skip !== undefined) {
            textLine.data.skip.set(options.skip);
        }
        this.textLines.push(textLine);
        this.updateSVGChildren();
        // S2ElementUtils.appendChild(this, this.textLines, textLine);
        // S2ElementUtils.updateSVGChildren(this.element, this.textLines);
        return textLine;
    }

    getLineCount(): number {
        return this.textLines.length;
    }

    getLine(index: number): S2TextLine {
        return this.textLines[index];
    }

    getTextExtents(space: S2Space): S2Vec2 {
        return this.contentExtents.toSpace(space, this.scene.getActiveCamera());
    }

    getExtents(space: S2Space): S2Vec2 {
        return this.extents.toSpace(space, this.scene.getActiveCamera());
    }

    getCenter(space: S2Space): S2Vec2 {
        return S2AnchorUtils.getCenter(
            this.data.anchor.getInherited(),
            space,
            this.scene.getActiveCamera(),
            this.data.position,
            this.data.minExtents,
        );
    }

    refreshExtents(): this {
        this.contentExtents.set(0, 0, 'view');
        this.extents.set(0, 0, 'view');

        const camera = this.scene.getActiveCamera();
        const space = 'view';

        // Apply font to group element to ensure correct measurement of bounding boxes
        S2DataUtils.applyFont(this.data.font, this.element, this.scene);

        let maxWidth = 0;
        let totalHeight = 0;
        for (let i = 0; i < this.textLines.length; i++) {
            const line = this.textLines[i];
            line.update();
            line.updateExtents();
            //
            const lineExtents = line.getExtents('view');
            const font = line.data.font;
            const relativeHeight = font.relativeLineHeight.getInherited();
            const size = font.size.getInherited(space, camera);
            maxWidth = Math.max(lineExtents.x * 2, maxWidth);
            totalHeight += line.data.skip.value + relativeHeight * size;
        }
        const textExtents = new S2Vec2(maxWidth, totalHeight).scale(0.5);
        const minExtents = this.data.minExtents.toSpace(space, camera);
        const extents = minExtents.maxV(textExtents);

        this.contentExtents.setValueFromSpace(space, camera, textExtents.x, textExtents.y);
        this.extents.setValueFromSpace(space, camera, extents.x, extents.y);
        return this;
    }

    // updateExtents(): void {
    //     const camera = this.scene.getActiveCamera();
    //     const space = 'view';

    //     // Apply font to group element to ensure correct measurement of bounding boxes
    //     S2DataUtils.applyFont(this.data.font, this.element, this.scene);

    //     let maxWidth = 0;
    //     let totalHeight = 0;
    //     for (let i = 0; i < this.textLines.length; i++) {
    //         const line = this.textLines[i];
    //         line.update();
    //         const bbox = line.getBBox();
    //         const font = line.data.font;
    //         const relativeHeight = font.relativeLineHeight.getInherited();
    //         const size = font.size.getInherited(space, camera);
    //         maxWidth = Math.max(bbox.width, maxWidth);
    //         totalHeight += line.data.skip.value + relativeHeight * size;
    //     }
    //     const textExtents = new S2Vec2(maxWidth, totalHeight).scale(0.5);
    //     const minExtents = this.data.minExtents.toSpace(space, camera);
    //     const extents = minExtents.maxV(textExtents);

    //     this.contentExtents.setValueFromSpace(space, camera, textExtents.x, textExtents.y);
    //     this.extents.setValueFromSpace(space, camera, extents.x, extents.y);
    // }

    update(): void {
        if (this.dirty === false) return;
        if (this.textLines.length === 0) return;
        const camera = this.scene.getActiveCamera();
        const space = 'view';

        // S2DataUtils.applyFill(this.data.fill, this.element, this.scene);
        // S2DataUtils.applyStroke(this.data.stroke, this.element, this.scene);
        // S2DataUtils.applyOpacity(this.data.opacity, this.element, this.scene);
        S2DataUtils.applyTransform(this.data.transform, this.element, this.scene);
        //S2DataUtils.applyFont(this.data.font, this.element, this.scene);

        const font = this.data.font;
        const ascenderHeight = font.relativeAscenderHeight.value * font.size.value;
        const lineHeight = font.relativeLineHeight.value * font.size.value;
        const textExtents = new S2Vec2(0, 0);
        for (const line of this.textLines) {
            line.data.font.copy(this.data.font);
            line.data.fill.copy(this.data.fill);
            line.data.stroke.copy(this.data.stroke);
            line.data.opacity.copy(this.data.opacity);
            line.data.horizontalAlign.copy(this.data.horizontalAlign);
            line.data.skip.copy(this.data.skip);
            line.update();

            const lineExt = line.getExtents(space);
            textExtents.x = Math.max(textExtents.x, lineExt.x);
            textExtents.y += lineHeight + line.data.skip.value;
        }
        textExtents.y /= 2;

        const extents = this.data.minExtents.toSpace(space, camera);
        extents.maxV(textExtents);

        this.contentExtents.setValueFromSpace(space, camera, textExtents.x, textExtents.y);
        this.extents.setValueFromSpace(space, camera, extents.x, extents.y);

        const groupNW = this.getCenter(space).subV(extents); // TODO

        let lineX = 0;
        let lineY = groupNW.y + ascenderHeight;
        switch (this.data.verticalAlign.getInherited()) {
            case 'top':
                break;
            case 'middle':
                lineY += extents.y - textExtents.y;
                break;
            case 'bottom':
                lineY += 2 * (extents.y - textExtents.y);
                break;
        }

        for (let i = 0; i < this.textLines.length; i++) {
            const line = this.textLines[i];
            switch (line.data.horizontalAlign.getInherited()) {
                case 'left':
                    lineX = groupNW.x;
                    line.data.textAnchor.set('start');
                    break;
                case 'center':
                    lineX = groupNW.x + extents.x;
                    line.data.textAnchor.set('middle');
                    break;
                case 'right':
                    lineX = groupNW.x + 2 * extents.x;
                    line.data.textAnchor.set('end');
                    break;
            }
            line.data.position.set(lineX, lineY, 'view');
            lineY += line.data.skip.value + lineHeight;
        }

        this.updateSVGChildren();
        for (const line of this.textLines) {
            line.update();
        }

        this.resetDirtyFlags();
    }
}
