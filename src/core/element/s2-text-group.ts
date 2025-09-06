import { S2Vec2 } from '../math/s2-vec2';
import { type S2BaseScene } from '../s2-interface';
import { type S2Anchor, S2AnchorUtils, svgNS } from '../s2-globals';
import { S2TransformGraphicData } from './s2-shape';
import { S2BaseText, S2TextData } from './s2-text';
import { S2Extents, S2Number, S2Position, type S2Space } from '../s2-types';
import { S2Container } from './s2-container';

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
    public readonly position: S2Position;
    public readonly minExtents: S2Extents;
    public anchor: S2Anchor;
    public textAlign: S2TextAlign;
    public verticalAlign: S2VerticalAlign;
    public lineHeight: number;
    public ascenderHeight: number;

    constructor() {
        super();
        this.position = new S2Position(0, 0, 'world');
        this.anchor = 'center';
        this.textAlign = 'center';
        this.verticalAlign = 'middle';
        this.minExtents = new S2Extents(0, 0, 'view');
        this.lineHeight = 24;
        this.ascenderHeight = 18;
    }

    copy(other: S2TextGroupData): void {
        super.copy(other);
        this.position.copy(other.position);
        this.minExtents.copy(other.minExtents);
        this.anchor = other.anchor;
        this.textAlign = other.textAlign;
        this.verticalAlign = other.verticalAlign;
        this.lineHeight = other.lineHeight;
        this.ascenderHeight = other.ascenderHeight;
    }

    applyToElement(element: SVGElement, scene: S2BaseScene): void {
        super.applyToElement(element, scene);
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
        textLine.data.skip.value = options?.skip ?? 0;
        textLine.data.align = options?.align ?? this.data.textAlign;
        this.appendChild(textLine);
        return textLine;
    }

    getTextExtents(space: S2Space = this.textExtents.space): S2Vec2 {
        return this.textExtents.toSpace(space, this.getActiveCamera());
    }

    getExtents(space: S2Space = this.extents.space): S2Vec2 {
        return this.extents.toSpace(space, this.getActiveCamera());
    }

    getCenter(space: S2Space = this.data.position.space): S2Vec2 {
        return S2AnchorUtils.getCenter(
            this.data.anchor,
            space,
            this.getActiveCamera(),
            this.data.position,
            this.data.minExtents,
        );
    }

    updateExtents(): void {
        let maxWidth = 0;
        let totalSkip = 0;
        for (const line of this.children) {
            const bbox = line.getBBox();
            maxWidth = bbox.width > maxWidth ? bbox.width : maxWidth;
            totalSkip += line.data.skip.value;
        }
        const textExtents = new S2Vec2(maxWidth, this.children.length * this.data.lineHeight + totalSkip).scale(0.5);
        const minExtents = this.data.minExtents.toSpace('view', this.getActiveCamera());
        const extents = minExtents.maxV(textExtents);
        this.textExtents.setValueFromSpace('view', this.getActiveCamera(), textExtents.x, textExtents.y);
        this.extents.setValueFromSpace('view', this.getActiveCamera(), extents.x, extents.y);
    }

    update(updateId?: number): this {
        if (this.shouldSkipUpdate(updateId)) return this;
        this.data.applyToElement(this.element, this.scene);
        this.updateExtents();

        const textExtents = this.textExtents.toSpace('view', this.scene.activeCamera);
        const groupExtents = this.extents.toSpace('view', this.scene.activeCamera);
        const groupNW = this.getCenter('view').subV(groupExtents); // TODO

        let lineX = 0;
        let lineY = groupNW.y + this.data.ascenderHeight;
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
            switch (line.data.align ?? this.data.textAlign) {
                case 'left':
                    lineX = groupNW.x;
                    line.data.anchor = 'start';
                    break;
                case 'center':
                    lineX = groupNW.x + groupExtents.x;
                    line.data.anchor = 'middle';
                    break;
                case 'right':
                    lineX = groupNW.x + 2 * groupExtents.x;
                    line.data.anchor = 'end';
                    break;
            }
            line.position.set(lineX, lineY, 'view');
            line.update();
            lineY += line.data.skip.value + this.data.lineHeight;
        }

        return this;
    }
}
