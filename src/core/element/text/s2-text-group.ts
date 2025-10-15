import type { S2BaseScene } from '../../scene/s2-base-scene';
import type { S2Anchor, S2Dirtyable, S2HorizontalAlign, S2VerticalAlign } from '../../shared/s2-globals';
import type { S2Space } from '../../math/s2-camera';
import { S2Vec2 } from '../../math/s2-vec2';
import { S2AnchorUtils, svgNS } from '../../shared/s2-globals';
import { S2BaseRichText } from './s2-rich-text';
import { S2Element } from '../base/s2-element';
import { S2ElementData, S2FillData, S2FontData, S2StrokeData } from '../base/s2-base-data';
import { S2DataUtils } from '../base/s2-data-utils';
import { S2TextData } from './s2-text-data';
import { S2Length } from '../../shared/s2-length';
import { S2Enum } from '../../shared/s2-enum';
import { S2Number } from '../../shared/s2-number';
import { S2Transform } from '../../shared/s2-transform';
import { S2Point } from '../../shared/s2-point';
import { S2Extents } from '../../shared/s2-extents';

export class S2TextLineData extends S2TextData {
    public readonly skip: S2Length;
    public readonly horizontalAlign: S2Enum<S2HorizontalAlign>;

    constructor() {
        super();
        this.skip = new S2Length(0, 'view');
        this.horizontalAlign = new S2Enum<S2HorizontalAlign>('left');
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        super.setOwner(owner);
        this.skip.setOwner(owner);
        this.horizontalAlign.setOwner(owner);
    }

    clearDirty(): void {
        super.clearDirty();
        this.skip.clearDirty();
        this.horizontalAlign.clearDirty();
    }
}

export class S2TextLine extends S2BaseRichText<S2TextLineData> {
    constructor(scene: S2BaseScene) {
        super(scene, new S2TextLineData());
    }
}

export class S2TextGroupData extends S2ElementData {
    public readonly fill: S2FillData;
    public readonly stroke: S2StrokeData;
    public readonly opacity: S2Number;
    public readonly transform: S2Transform;
    public readonly position: S2Point;

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
        this.opacity = new S2Number(1);
        this.transform = new S2Transform();
        this.position = new S2Point(0, 0, 'world');
        this.font = new S2FontData();
        this.skip = new S2Length(0, 'view');
        this.horizontalAlign = new S2Enum<S2HorizontalAlign>('left');
        this.verticalAlign = new S2Enum<S2VerticalAlign>('middle');
        this.minExtents = new S2Extents(0, 0, 'view');
        this.anchor = new S2Enum<S2Anchor>('center');

        this.stroke.width.set(0, 'view');
        this.fill.opacity.set(1);
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

    clearDirty(): void {
        super.clearDirty();
        this.fill.clearDirty();
        this.stroke.clearDirty();
        this.opacity.clearDirty();
        this.transform.clearDirty();
        this.position.clearDirty();
        this.font.clearDirty();
        this.skip.clearDirty();
        this.horizontalAlign.clearDirty();
        this.verticalAlign.clearDirty();
        this.minExtents.clearDirty();
        this.anchor.clearDirty();
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
        return this.contentExtents.get(space, this.scene.getActiveCamera());
    }

    getExtents(space: S2Space): S2Vec2 {
        return this.extents.get(space, this.scene.getActiveCamera());
    }

    getCenter(space: S2Space): S2Vec2 {
        return S2AnchorUtils.getCenter(
            this.data.anchor.get(),
            space,
            this.scene.getActiveCamera(),
            this.data.position,
            this.extents, // this.data.minExtents,
        );
    }

    update(): void {
        if (this.skipUpdate()) return;
        if (this.textLines.length === 0) return;

        const camera = this.scene.getActiveCamera();
        const space: S2Space = 'view';
        this.updateSVGChildren();

        S2DataUtils.applyTransform(this.data.transform, this.element, this.scene);

        const font = this.data.font;
        const ascenderHeight = font.relativeAscenderHeight.value * font.size.value;
        const lineHeight = font.relativeLineHeight.value * font.size.value;
        const textExtents = new S2Vec2(0, 0);
        for (const line of this.textLines) {
            line.data.font.copyIfUnlocked(this.data.font);
            line.data.fill.copyIfUnlocked(this.data.fill);
            line.data.stroke.copyIfUnlocked(this.data.stroke);
            line.data.opacity.copyIfUnlocked(this.data.opacity);
            line.data.horizontalAlign.copyIfUnlocked(this.data.horizontalAlign);
            line.data.skip.copyIfUnlocked(this.data.skip);
            line.update();

            const lineExt = line.getExtents(space);
            textExtents.x = Math.max(textExtents.x, lineExt.x);
            textExtents.y += lineHeight + line.data.skip.value;
        }
        textExtents.y /= 2;

        const extents = this.data.minExtents.get(space, camera);
        extents.maxV(textExtents);

        this.contentExtents.setValueFromSpace(textExtents.x, textExtents.y, space, camera);
        this.extents.setValueFromSpace(extents.x, extents.y, space, camera);

        const groupNW = this.getCenter(space).subV(extents); // TODO

        let lineX = 0;
        let lineY = groupNW.y + ascenderHeight;
        switch (this.data.verticalAlign.get()) {
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
            switch (line.data.horizontalAlign.get()) {
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

        for (const line of this.textLines) {
            line.update();
        }

        this.clearDirty();
    }
}
