import { Vector2 } from '../../math/vector2';
import { type S2SceneInterface } from '../s2-scene-interface';
import { type S2Anchor, S2AnchorUtils } from '../s2-globals';
import { S2Group } from './s2-group';
import { S2Shape } from './s2-shape';
import { S2Text } from './s2-text';
import { S2Extents, type S2Space } from '../s2-space';

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

type S2LineInfo = {
    text: S2Text;
    skip: number;
    // facultatif, sinon hérite du global
    align?: S2TextAlign;
};

export class S2TextGroup extends S2Shape<SVGGElement> {
    protected anchor: S2Anchor = 'center';
    protected minExtents: S2Extents;
    protected textExtents: S2Extents;
    protected textAlign: S2TextAlign = 'center';
    protected verticalAlign: S2VerticalAlign = 'middle';
    protected textGroup: S2Group<S2Text>;
    protected lines: Array<S2LineInfo>;
    protected lineHeight: number = 24;
    protected ascenderHeight: number = 18;

    constructor(scene: S2SceneInterface) {
        const textGroup = new S2Group<S2Text>(scene);
        super(textGroup.getElement(), scene);

        this.textGroup = textGroup;
        this.textExtents = new S2Extents(0, 0, 'view');
        this.minExtents = new S2Extents(0, 0, 'view');
        this.lines = [];
    }

    addLine(options?: { align?: S2TextAlign; skip?: number }): S2Text {
        const text = new S2Text(this.scene);
        text.setAttribute('text-anchor', 'start');
        this.textGroup.appendChild(text);

        const info: S2LineInfo = {
            text,
            skip: options?.skip ?? 0,
            align: options?.align,
        };
        this.lines.push(info);
        return text;
    }

    setMinExtents(x: number, y: number, space?: S2Space): this {
        if (space) this.minExtents.space = space;
        this.minExtents.value.set(x, y);
        return this;
    }

    setMinExtentsV(minExtents: Vector2, space?: S2Space): this {
        if (space) this.minExtents.space = space;
        this.minExtents.value.copy(minExtents);
        return this;
    }

    setLineHeight(lineHeight: number, ascenderHeight: number): this {
        this.lineHeight = lineHeight;
        this.ascenderHeight = ascenderHeight;
        return this;
    }

    setAnchor(anchor: S2Anchor): this {
        this.anchor = anchor;
        return this;
    }

    setTextAlign(align: S2TextAlign): this {
        this.textAlign = align;
        return this;
    }

    setTextVerticalAlign(align: S2VerticalAlign): this {
        this.verticalAlign = align;
        return this;
    }

    getTextExtents(space: S2Space = this.textExtents.space): Vector2 {
        return this.textExtents.toSpace(space, this.getActiveCamera());
    }

    getMinExtents(space: S2Space = this.minExtents.space): Vector2 {
        return this.minExtents.toSpace(space, this.getActiveCamera());
    }

    getCenter(space: S2Space = this.position.space): Vector2 {
        return S2AnchorUtils.getCenter(this.anchor, space, this.getActiveCamera(), this.position, this.minExtents);
    }

    getTextGroup(): S2Group<S2Text> {
        return this.textGroup;
    }

    getLineHeight(): number {
        return this.lineHeight;
    }

    getTextAlign(): S2TextAlign {
        return this.textAlign;
    }

    getTextVerticalAlign(): S2VerticalAlign {
        return this.verticalAlign;
    }

    updateTextExtents(): void {
        let maxWidth = 0;
        let totalSkip = 0;
        for (const line of this.lines) {
            const bbox = line.text.getBBox();
            maxWidth = bbox.width > maxWidth ? bbox.width : maxWidth;
            totalSkip += line.skip;
        }
        const extents = new Vector2(maxWidth, this.lines.length * this.lineHeight + totalSkip).scale(0.5);
        this.textExtents.setValueFromSpace('view', this.getActiveCamera(), extents.x, extents.y);
    }

    update(): this {
        super.update();
        this.updateTextExtents();
        const textExtents = this.getTextExtents('view');
        const groupExtents = this.getMinExtents('view').maxV(textExtents);
        const groupNW = this.getCenter('view').subV(groupExtents);

        let lineX = 0;
        let lineY = groupNW.y + this.ascenderHeight;
        switch (this.verticalAlign) {
            case 'top':
                break;
            case 'middle':
                lineY += groupExtents.y - textExtents.y;
                break;
            case 'bottom':
                lineY += 2 * (groupExtents.y - textExtents.y);
                break;
        }

        for (const line of this.lines) {
            const text = line.text;
            switch (line.align ?? this.textAlign) {
                case 'left':
                    lineX = groupNW.x;
                    text.setTextAnchor('start');
                    break;
                case 'center':
                    lineX = groupNW.x + groupExtents.x;
                    text.setTextAnchor('middle');
                    break;
                case 'right':
                    lineX = groupNW.x + 2 * groupExtents.x;
                    text.setTextAnchor('end');
                    break;
            }
            text.setPosition(lineX, lineY, 'view');
            text.update();
            lineY += line.skip + this.lineHeight;
        }

        return this;
    }
}
