import { S2Vec2 } from '../math/s2-vec2';
import { type S2BaseScene } from '../s2-interface';
import { type S2Anchor, S2AnchorUtils, svgNS } from '../s2-globals';
import { S2TransformGraphicData } from './s2-transform-graphic';
import { S2BaseText, S2TextData } from './s2-text';
import { S2Enum, S2Extents, S2Length, S2Number, S2Position, S2TypeState, type S2Space } from '../s2-types';
import { S2Container } from './s2-container';
import { S2FontData } from './s2-base-data';

// "text-anchor": "start | middle | end"
// "dominant-baseline": "auto | middle | hanging" + autres
// "font-family"
// "font-size"
// "font-stretch"
// "font-style"
// "font-variant"
// "font-weight"

export type S2HorizontalAlign = 'left' | 'center' | 'right';
export type S2VerticalAlign = 'top' | 'middle' | 'bottom';

export class S2TextLineData extends S2TextData {
    public readonly skip: S2Length;
    public readonly align: S2Enum<S2HorizontalAlign>;

    constructor() {
        super();
        this.skip = new S2Length(0, 'view');
        this.align = new S2Enum<S2HorizontalAlign>('left', S2TypeState.Inactive);
    }

    setParent(parent: S2TextLineData | null = null): void {
        super.setParent(parent);
        this.skip.setParent(parent ? parent.skip : null);
        this.align.setParent(parent ? parent.align : null);
    }

    copy(other: S2TextLineData): void {
        super.copy(other);
        this.skip.copy(other.skip);
        this.align.copy(other.align);
    }
}

export class S2TextLine extends S2BaseText<S2TextLineData> {
    constructor(scene: S2BaseScene) {
        super(scene, new S2TextLineData());
    }

    get skip(): S2Length {
        return this.data.skip;
    }
}

export class S2TextGroupData extends S2TransformGraphicData {
    public readonly font: S2FontData;
    public readonly position: S2Position;
    public readonly minExtents: S2Extents;
    public readonly anchor: S2Enum<S2Anchor>;
    public readonly horizontalAlign: S2Enum<S2HorizontalAlign>;
    public readonly verticalAlign: S2Enum<S2VerticalAlign>;

    constructor() {
        super();
        this.font = new S2FontData();
        this.position = new S2Position(0, 0, 'world');
        this.anchor = new S2Enum<S2Anchor>('center');
        this.horizontalAlign = new S2Enum<S2HorizontalAlign>('center');
        this.verticalAlign = new S2Enum<S2VerticalAlign>('middle');
        this.minExtents = new S2Extents(0, 0, 'view');
    }

    copy(other: S2TextGroupData): void {
        super.copy(other);
        this.position.copy(other.position);
        this.minExtents.copy(other.minExtents);
        this.font.copy(other.font);
        this.anchor.copy(other.anchor);
        this.horizontalAlign.copy(other.horizontalAlign);
        this.verticalAlign.copy(other.verticalAlign);
    }

    applyToElement(element: SVGElement, scene: S2BaseScene): void {
        super.applyToElement(element, scene);
        this.font.applyToElement(element, scene);
    }
}

export class S2TextGroup extends S2Container<SVGGElement, S2TextLine, S2TextGroupData> {
    protected textExtents: S2Extents;
    protected extents: S2Extents;

    constructor(scene: S2BaseScene) {
        const element = document.createElementNS(svgNS, 'g');
        super(scene, new S2TextGroupData(), element);
        this.textExtents = new S2Extents(0, 0, 'view');
        this.extents = new S2Extents(0, 0, 'view');
    }

    get position(): S2Position {
        return this.data.position;
    }

    get minExtents(): S2Extents {
        return this.data.minExtents;
    }

    addLine(options?: { align?: S2HorizontalAlign; skip?: number }): S2TextLine {
        const textLine = new S2TextLine(this.scene);
        textLine.data.font.setParent(this.data.font);
        textLine.data.fill.setParent(this.data.fill);
        textLine.data.stroke.setParent(this.data.stroke);
        textLine.data.opacity.setParent(this.data.opacity);
        textLine.data.align.setParent(this.data.horizontalAlign);

        if (options?.align) {
            textLine.data.align.set(options.align);
        }

        textLine.data.skip.value = options?.skip ?? 0;
        //textLine.data.align = options?.align ?? this.data.textAlign;
        this.appendChild(textLine);
        return textLine;
    }

    getTextExtents(space: S2Space): S2Vec2 {
        return this.textExtents.toSpace(space, this.scene.getActiveCamera());
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

    updateExtents(): void {
        const camera = this.scene.getActiveCamera();
        const space = 'view';

        // Apply font to group element to ensure correct measurement of bounding boxes
        this.data.font.applyToElement(this.element, this.scene);

        let maxWidth = 0;
        let totalHeight = 0;
        for (let i = 0; i < this.children.length; i++) {
            const line = this.children[i];
            const bbox = line.getBBox();
            const font = line.data.font;
            const relativeHeight = font.relativeLineHeight.getInherited();
            const size = font.size.getInherited(space, camera);
            maxWidth = Math.max(bbox.width, maxWidth);
            totalHeight += line.data.skip.value + relativeHeight * size;
        }
        const textExtents = new S2Vec2(maxWidth, totalHeight).scale(0.5);
        const minExtents = this.data.minExtents.toSpace(space, camera);
        const extents = minExtents.maxV(textExtents);

        this.textExtents.setValueFromSpace(space, camera, textExtents.x, textExtents.y);
        this.extents.setValueFromSpace(space, camera, extents.x, extents.y);
    }

    protected updateImpl(updateId?: number): void {
        void updateId;
        if (this.children.length === 0) return;
        const camera = this.scene.getActiveCamera();
        this.data.applyToElement(this.element, this.scene);
        this.updateExtents();

        const textExtents = this.textExtents.toSpace('view', camera);
        const groupExtents = this.extents.toSpace('view', camera);
        const groupNW = this.getCenter('view').subV(groupExtents); // TODO
        const firstLineFont = this.children[0].data.font;
        const ascenderHeight =
            firstLineFont.relativeAscenderHeight.getInherited() * firstLineFont.size.getInherited('view', camera);

        let lineX = 0;
        let lineY = groupNW.y + ascenderHeight;
        switch (this.data.verticalAlign.getInherited()) {
            case 'top':
                break;
            case 'middle':
                lineY += groupExtents.y - textExtents.y;
                break;
            case 'bottom':
                lineY += 2 * (groupExtents.y - textExtents.y);
                break;
        }

        for (const line of this.children) {
            const font = line.data.font;
            const lineHeight = font.relativeLineHeight.getInherited() * font.size.getInherited('view', camera);
            switch (line.data.align.getInherited()) {
                //switch (line.data.align ?? this.data.textAlign) {
                case 'left':
                    lineX = groupNW.x;
                    line.data.textAnchor.set('start');
                    break;
                case 'center':
                    lineX = groupNW.x + groupExtents.x;
                    line.data.textAnchor.set('middle');
                    break;
                case 'right':
                    lineX = groupNW.x + 2 * groupExtents.x;
                    line.data.textAnchor.set('end');
                    break;
            }
            line.position.set(lineX, lineY, 'view');
            lineY += line.data.skip.value + lineHeight;
        }
    }
}
