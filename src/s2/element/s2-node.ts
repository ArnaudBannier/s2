import { Vector2 } from '../../math/vector2';
import { type S2BaseScene } from '../s2-interface';
import { svgNS, type S2Anchor, S2AnchorUtils, type S2SVGAttributes, FlexUtils } from '../s2-globals';
import { S2Rect } from './s2-rect';
import { S2Circle } from './s2-circle';
import { S2Shape } from './s2-shape';
import { S2Text } from './s2-text';
import { S2Extents, S2Length, type S2Space } from '../math/s2-space';
import { S2TextGroup, type S2TextAlign, type S2VerticalAlign } from './s2-text-group';
import { clamp } from '../../math/utils';
import { S2Line } from './s2-line';
import { S2Animatable, S2Attributes } from '../s2-attributes';
import { S2Color } from '../s2-globals';

export class S2Node extends S2Shape<SVGGElement> {
    protected anchor: S2Anchor;
    protected nodeExtents: S2Extents;
    protected minExtents: S2Extents;
    protected padding: S2Extents;
    protected partSep: S2Length;

    protected textAlign: S2TextAlign = 'center';
    protected verticalAlign: S2VerticalAlign = 'middle';
    protected lineHeight: number = 24;
    protected ascenderHeight: number = 18;

    protected textGroups: Array<S2TextGroup>;
    protected textGrows: Array<number>;
    protected lines: Array<S2Line>;

    protected backRect: S2Rect | null = null;
    protected backCircle: S2Circle | null = null;

    public textFillColor?: S2Color;
    public textFillOpacity?: number;
    public textOpacity?: number;
    public textStrokeColor?: S2Color;

    constructor(scene: S2BaseScene, partCount: number = 1) {
        const element = document.createElementNS(svgNS, 'g');
        super(scene, element);

        this.textGroups = [];
        this.textGrows = [];
        for (let i = 0; i < partCount; i++) {
            const textGroup = new S2TextGroup(this.scene);
            textGroup.addClass('s2-node-text');
            this.textGroups.push(textGroup);
            this.textGrows.push(1);
            const textElement = textGroup.getElement();
            if (textElement) this.oldElement?.appendChild(textElement);
        }
        this.lines = [];
        for (let i = 0; i < partCount - 1; i++) {
            const line = new S2Line(this.scene);
            this.lines.push(line);
            const lineElement = line.getElement();
            if (lineElement) this.oldElement?.appendChild(lineElement);
        }
        this.anchor = 'center';
        this.nodeExtents = new S2Extents(0, 0, 'view');
        this.minExtents = new S2Extents(0, 0, 'view');
        this.padding = new S2Extents(10, 5, 'view');
        this.partSep = new S2Length(5, 'view');
        this.addClass('s2-node');
    }

    addLine(options?: { partIndex?: number; align?: S2TextAlign; skip?: number }): S2Text {
        const index = clamp(options?.partIndex ?? 0, 0, this.textGroups.length - 1);
        return this.textGroups[index].addLine(options);
    }

    addTextClass(className: string): this {
        for (const textGroup of this.textGroups) {
            textGroup.addClass(className);
        }
        return this;
    }

    createRectBackground(): S2Rect {
        if (this.backRect === null) {
            this.backRect = new S2Rect(this.scene);
            this.backRect.addClass('s2-node-background').setAnchor(this.anchor);
            this.backRect.setAttributes(this.getAttributes());
            const backElement = this.backRect.getElement();
            const textElement = this.textGroups[0].getElement();
            if (this.oldElement && backElement && textElement) this.oldElement.insertBefore(backElement, textElement);
        }
        return this.backRect;
    }

    createCircleBackground(): S2Circle {
        if (this.backCircle === null) {
            this.backCircle = new S2Circle(this.scene);
            this.backCircle.addClass('s2-node-background');
            this.backCircle.setAttributes(this.getAttributes());
            const backElement = this.backCircle.getElement();
            const textElement = this.textGroups[0].getElement();
            if (this.oldElement && backElement && textElement) this.oldElement.insertBefore(backElement, textElement);
        }
        return this.backCircle;
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

    setPadding(x: number, y: number, space?: S2Space): this {
        if (space) this.padding.space = space;
        this.padding.value.set(x, y);
        return this;
    }

    setPaddingV(padding: Vector2, space?: S2Space): this {
        if (space) this.padding.space = space;
        this.padding.value.copy(padding);
        return this;
    }

    setLineHeight(lineHeight: number, ascenderHeight: number): this {
        this.lineHeight = lineHeight;
        this.ascenderHeight = ascenderHeight;
        for (const textGroup of this.textGroups) {
            textGroup.setLineHeight(this.lineHeight, this.ascenderHeight);
        }
        return this;
    }

    setAnchor(anchor: S2Anchor): this {
        this.anchor = anchor;
        return this;
    }

    setTextAlign(align: S2TextAlign): this {
        this.textAlign = align;
        for (const textGroup of this.textGroups) {
            textGroup.setTextAlign(align);
        }
        return this;
    }

    setTextVerticalAlign(align: S2VerticalAlign): this {
        this.verticalAlign = align;
        for (const textGroup of this.textGroups) {
            textGroup.setTextVerticalAlign(align);
        }
        return this;
    }

    setTextGrowFactor(partIndex: number, grow: number = 1): this {
        this.textGrows[partIndex] = grow;
        return this;
    }

    setRadius(radius: number, space?: S2Space): this {
        if (this.backRect) {
            this.backRect.setRadius(radius, space);
        }
        return this;
    }

    setAttributes(attributes: S2Attributes): this {
        super.setAttributes(attributes);
        if (this.backCircle) this.backCircle.setAttributes(attributes);
        else if (this.backRect) this.backRect.setAttributes(attributes);

        const textAttributes = new S2Attributes();
        if (attributes.textFillColor) textAttributes.textFillColor = attributes.textFillColor;
        if (attributes.textFillOpacity) textAttributes.textFillOpacity = attributes.textFillOpacity;
        if (attributes.textStrokeColor) textAttributes.strokeColor = attributes.textStrokeColor;
        if (attributes.textOpacity) textAttributes.opacity = attributes.textOpacity;
        if (attributes.textStrokeWidth) textAttributes.strokeWidth = attributes.textStrokeWidth;
        for (const textGroup of this.textGroups) {
            textGroup.setAttributes(textAttributes);
        }
        return this;
    }

    setBackgroundStyle(style: S2SVGAttributes): this {
        if (this.backCircle) this.backCircle.setSVGAttributes(style);
        else if (this.backRect) this.backRect.setSVGAttributes(style);
        return this;
    }

    setTextStyle(style: S2SVGAttributes): this {
        for (const textGroup of this.textGroups) {
            textGroup.setSVGAttributes(style);
        }
        return this;
    }

    setSeparatorStyle(style: S2SVGAttributes): this {
        for (const line of this.lines) {
            line.setSVGAttributes(style);
        }
        return this;
    }

    getBackgroundCircle(): S2Circle | null {
        return this.backCircle;
    }

    getBackgroundRect(): S2Rect | null {
        return this.backRect;
    }

    getTextGroup(index: number = 0): S2TextGroup {
        return this.textGroups[index];
    }

    getTextGroupCount(): number {
        return this.textGroups.length;
    }

    getMinExtents(space: S2Space = this.minExtents.space): Vector2 {
        return this.minExtents.toSpace(space, this.getActiveCamera());
    }

    getNodeExtents(space: S2Space = this.nodeExtents.space): Vector2 {
        return this.nodeExtents.toSpace(space, this.getActiveCamera());
    }

    getPadding(space: S2Space = this.padding.space): Vector2 {
        return this.padding.toSpace(space, this.getActiveCamera());
    }

    getCenter(space: S2Space = this.position.space): Vector2 {
        return S2AnchorUtils.getCenter(this.anchor, space, this.getActiveCamera(), this.position, this.nodeExtents);
    }

    getPartSep(space: S2Space = this.partSep.space): number {
        return this.partSep.toSpace(space, this.getActiveCamera());
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

    setAnimatableAttributes(attributes: S2Animatable): this {
        super.setAnimatableAttributes(attributes);

        if (this.backCircle) this.backCircle.setAnimatableAttributes(attributes);
        else if (this.backRect) this.backRect.setAnimatableAttributes(attributes);

        // const textAttributes = new S2Attributes();
        // if (attributes.textFillColor) textAttributes.textFillColor = attributes.textFillColor;
        // if (attributes.textFillOpacity) textAttributes.textFillOpacity = attributes.textFillOpacity;
        // if (attributes.textStrokeColor) textAttributes.strokeColor = attributes.textStrokeColor;
        // if (attributes.textOpacity) textAttributes.opacity = attributes.textOpacity;
        // if (attributes.textStrokeWidth) textAttributes.strokeWidth = attributes.textStrokeWidth;
        // for (const textGroup of this.textGroups) {
        //     textGroup.setAnimatableAttributes(textAttributes);
        // }
        return this;
    }

    // getAnimatableAttributes(): S2Animatable {
    //     const attributes = super.getAnimatableAttributes();
    //     console.log('node get', attributes);
    //     return attributes;
    // }

    getPointInDirection(direction: Vector2, space: S2Space = this.position.space, distance: S2Length): Vector2 {
        if (this.backRect) {
            return this.backRect.getPointInDirection(direction, space, distance);
        } else if (this.backCircle) {
            return this.backCircle.getPointInDirection(direction, space, distance);
        }
        return this.getPosition(space);
    }

    update(): this {
        super.update();
        if (this.oldElement === undefined) return this;
        this.oldElement.removeAttribute('fill');
        this.oldElement.removeAttribute('stroke-width');
        this.oldElement.removeAttribute('stroke');

        const partHeights: Array<number> = [];
        let maxPartWidth = 0;

        for (let i = 0; i < this.textGroups.length; i++) {
            this.textGroups[i].updateTextExtents();
            const extents = this.textGroups[i].getTextExtents('view');
            maxPartWidth = Math.max(maxPartWidth, 2 * extents.x);
            partHeights.push(2 * extents.y);
        }
        const nodeMinExtents = this.getMinExtents('view');
        const padding = this.getPadding('view');
        const partSep = this.getPartSep('view');

        const height = FlexUtils.computeSizes(
            partHeights,
            this.textGrows,
            2 * nodeMinExtents.y,
            padding.y,
            2 * partSep,
        );

        const nodeExtents = new Vector2(Math.max(maxPartWidth / 2 + padding.x, nodeMinExtents.x), height / 2);
        this.nodeExtents.setValueFromSpace('view', this.getActiveCamera(), nodeExtents.x, nodeExtents.y);

        const nodeCenter = this.getCenter('view');
        const textPosition = nodeCenter.clone().subV(nodeExtents).addV(padding);
        for (let i = 0; i < this.textGroups.length; i++) {
            this.textGroups[i]
                .setPositionV(textPosition, 'view')
                .setMinExtents(nodeExtents.x - padding.x, partHeights[i] / 2, 'view')
                .setAnchor('north west')
                .update();
            textPosition.y += partHeights[i] + 2 * partSep;
        }

        if (this.backRect) {
            this.backRect.setPositionV(nodeCenter, 'view');
            this.backRect.setExtentsV(nodeExtents, 'view');
            this.backRect.setAnchor('center');
            this.backRect.update();

            let y = nodeCenter.y - nodeExtents.y + padding.y + partHeights[0] + partSep;
            for (let i = 0; i < this.textGroups.length - 1; i++) {
                this.lines[i]
                    .setStart(nodeCenter.x - nodeExtents.x, y, 'view')
                    .setEnd(nodeCenter.x + nodeExtents.x, y, 'view')
                    .update();
                y += partHeights[i + 1] + 2 * partSep;
            }
        }
        if (this.backCircle) {
            const radius = Math.max(nodeExtents.x, nodeExtents.y);
            this.backCircle.setPositionV(nodeCenter, 'view');
            this.backCircle.setRadius(radius, 'view');
            this.backCircle.update();

            let y = nodeCenter.y - nodeExtents.y + padding.y + partHeights[0] + partSep;
            for (let i = 0; i < this.textGroups.length - 1; i++) {
                const x = Math.sqrt(radius * radius - (y - nodeCenter.y) * (y - nodeCenter.y));
                this.lines[i]
                    .setStart(nodeCenter.x - x, y, 'view')
                    .setEnd(nodeCenter.x + x, y, 'view')
                    .update();
                y += partHeights[i + 1] + 2 * partSep;
            }
        }
        return this;
    }
}
