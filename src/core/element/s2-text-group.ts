import { S2Vec2 } from '../math/s2-vec2';
import { type S2BaseScene } from '../s2-interface';
import { type S2Anchor, S2AnchorUtils, svgNS } from '../s2-globals';
import { S2TransformGraphicData } from './s2-transform-graphic';
import { S2BaseText, S2TextData } from './s2-text';
import { S2Extents, S2Number, S2Position, type S2Space } from '../s2-types';
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

export type S2TextAlign = 'left' | 'center' | 'right';
export type S2VerticalAlign = 'top' | 'middle' | 'bottom';

export class S2TextLineData extends S2TextData {
    public readonly skip: S2Number;
    public align?: S2TextAlign;

    constructor() {
        super();
        this.skip = new S2Number(0);
    }

    setInherited(): void {
        super.setInherited();
        this.skip.setInherited();
        this.align = undefined;
    }

    copy(other: S2TextLineData): void {
        super.copy(other);
        this.skip.copy(other.skip);
        this.align = other.align;
    }
}

export class S2TextLine extends S2BaseText<S2TextLineData> {
    constructor(scene: S2BaseScene) {
        super(scene, new S2TextLineData());
    }

    get skip(): S2Number {
        return this.data.skip;
    }
}

export class S2TextGroupData extends S2TransformGraphicData {
    public readonly font: S2FontData;
    public readonly position: S2Position;
    public readonly minExtents: S2Extents;
    public anchor: S2Anchor;
    public textAlign: S2TextAlign;
    public verticalAlign: S2VerticalAlign;

    constructor() {
        super();
        this.font = new S2FontData();
        this.position = new S2Position(0, 0, 'world');
        this.anchor = 'center';
        this.textAlign = 'center';
        this.verticalAlign = 'middle';
        this.minExtents = new S2Extents(0, 0, 'view');
    }

    copy(other: S2TextGroupData): void {
        super.copy(other);
        this.position.copy(other.position);
        this.minExtents.copy(other.minExtents);
        this.font.copy(other.font);
        this.anchor = other.anchor;
        this.textAlign = other.textAlign;
        this.verticalAlign = other.verticalAlign;
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

    addLine(options?: { align?: S2TextAlign; skip?: number }): S2TextLine {
        const textLine = new S2TextLine(this.scene);
        textLine.data.setInherited();
        textLine.data.font.parent = this.data.font;
        textLine.data.skip.value = options?.skip ?? 0;
        textLine.data.align = options?.align ?? this.data.textAlign;
        this.appendChild(textLine);
        return textLine;
    }

    getTextExtents(space: S2Space = this.textExtents.space): S2Vec2 {
        return this.textExtents.toSpace(space, this.scene.getActiveCamera());
    }

    getExtents(space: S2Space = this.extents.space): S2Vec2 {
        return this.extents.toSpace(space, this.scene.getActiveCamera());
    }

    getCenter(space: S2Space = this.data.position.space): S2Vec2 {
        return S2AnchorUtils.getCenter(
            this.data.anchor,
            space,
            this.scene.getActiveCamera(),
            this.data.position,
            this.data.minExtents,
        );
    }

    updateExtents(): void {
        const camera = this.scene.getActiveCamera();
        let maxWidth = 0;
        let totalHeight = 0;
        for (const line of this.children) {
            const bbox = line.getBBox();
            const lineHeight = line.data.font.getInheritedLineHeight(camera);
            maxWidth = bbox.width > maxWidth ? bbox.width : maxWidth;
            totalHeight += line.data.skip.value + lineHeight;
        }
        const textExtents = new S2Vec2(maxWidth, totalHeight).scale(0.5);
        const minExtents = this.data.minExtents.toSpace('view', camera);
        const extents = minExtents.maxV(textExtents);
        this.textExtents.setValueFromSpace('view', camera, textExtents.x, textExtents.y);
        this.extents.setValueFromSpace('view', camera, extents.x, extents.y);
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
        const ascenderHeight = this.children[0].data.font.getInheritedAscenderHeight(camera);

        let lineX = 0;
        let lineY = groupNW.y + ascenderHeight;
        switch (this.data.verticalAlign) {
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
            const lineHeight = line.data.font.getInheritedLineHeight(camera);
            switch (line.data.align ?? this.data.textAlign) {
                case 'left':
                    lineX = groupNW.x;
                    line.data.textAnchor = 'start';
                    break;
                case 'center':
                    lineX = groupNW.x + groupExtents.x;
                    line.data.textAnchor = 'middle';
                    break;
                case 'right':
                    lineX = groupNW.x + 2 * groupExtents.x;
                    line.data.textAnchor = 'end';
                    break;
            }
            line.position.set(lineX, lineY, 'view');
            lineY += line.data.skip.value + lineHeight;
        }
    }
}
