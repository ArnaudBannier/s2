import { S2Vec2 } from '../math/s2-vec2';
import { S2BaseScene } from '../s2-base-scene';
import type { S2Anchor, S2HorizontalAlign, S2VerticalAlign } from '../s2-globals';
import { S2AnchorUtils, S2FlexUtils, svgNS } from '../s2-globals';
import { S2Rect } from './s2-rect';
import { S2Circle } from './s2-circle';
import {
    S2Color,
    S2Enum,
    S2Extents,
    S2Length,
    S2Number,
    S2Position,
    S2Transform,
    S2TypeState,
    type S2Space,
} from '../s2-types';
import { S2TextGroup, S2TextLine } from './s2-text-group';
import { clamp } from '../math/s2-utils';
import { S2Line } from './s2-line';
import { S2Element, S2ElementUtils, type S2BaseElement } from './base/s2-element';
import { S2FontData, S2BaseData, S2FillData, S2StrokeData } from './base/s2-base-data';
import { S2DataUtils } from './base/s2-data-utils';

export class S2NodeData extends S2BaseData {
    public readonly position: S2Position;
    public readonly anchor: S2Enum<S2Anchor>;
    public readonly background: S2NodeBackgroundData;
    public readonly text: S2NodeTextData;
    public readonly separator: S2NodeSeparatorData;
    public readonly padding: S2Extents;
    public readonly partSep: S2Length;
    public readonly minExtents: S2Extents;

    constructor() {
        super();
        this.position = new S2Position(0, 0, 'world');
        this.anchor = new S2Enum<S2Anchor>('center');
        this.minExtents = new S2Extents(0, 0, 'view');
        this.background = new S2NodeBackgroundData();
        this.separator = new S2NodeSeparatorData();
        this.text = new S2NodeTextData();
        this.padding = new S2Extents(10, 5, 'view');
        this.partSep = new S2Length(5, 'view');
    }

    applyToElement(element: SVGElement, scene: S2BaseScene): void {
        super.applyToElement(element, scene);
    }

    get textHorizontalAlign(): S2Enum<S2HorizontalAlign> {
        return this.text.horizontalAlign;
    }

    get textVerticalAlign(): S2Enum<S2VerticalAlign> {
        return this.text.verticalAlign;
    }

    get textFillColor(): S2Color {
        return this.text.fill.color;
    }

    get textOpacity(): S2Number {
        return this.text.opacity;
    }

    get textFont(): S2FontData {
        return this.text.font;
    }

    get backFillColor(): S2Color {
        return this.background.fill.color;
    }

    get backFillOpacity(): S2Number {
        return this.background.fill.opacity;
    }

    get backStrokeColor(): S2Color {
        return this.background.stroke.color;
    }

    get backStrokeOpacity(): S2Number {
        return this.background.stroke.opacity;
    }

    get backStrokeWidth(): S2Length {
        return this.background.stroke.width;
    }

    get backCornerRadius(): S2Length {
        return this.background.cornerRadius;
    }

    get backOpacity(): S2Number {
        return this.background.opacity;
    }

    setPosition(x: number, y: number, space?: S2Space, state: S2TypeState = S2TypeState.Active): this {
        this.position.set(x, y, space, state);
        return this;
    }

    setPositionV(v: S2Vec2, space?: S2Space, state: S2TypeState = S2TypeState.Active): this {
        this.position.setV(v, space, state);
        return this;
    }

    setMinExtents(x: number, y: number, space?: S2Space, state: S2TypeState = S2TypeState.Active): this {
        this.minExtents.set(x, y, space, state);
        return this;
    }

    setMinExtentsV(v: S2Vec2, space?: S2Space, state: S2TypeState = S2TypeState.Active): this {
        this.minExtents.setV(v, space, state);
        return this;
    }

    setPadding(x: number, y: number, space?: S2Space, state: S2TypeState = S2TypeState.Active): this {
        this.padding.set(x, y, space, state);
        return this;
    }

    setPaddingV(v: S2Vec2, space?: S2Space, state: S2TypeState = S2TypeState.Active): this {
        this.padding.setV(v, space, state);
        return this;
    }

    setPartSep(sep: number, space?: S2Space, state: S2TypeState = S2TypeState.Active): this {
        this.partSep.set(sep, space, state);
        return this;
    }

    setAnchor(anchor: S2Anchor, state: S2TypeState = S2TypeState.Active): this {
        this.anchor.set(anchor, state);
        return this;
    }
}

export class S2NodeBackgroundData extends S2BaseData {
    public readonly fill: S2FillData;
    public readonly stroke: S2StrokeData;
    public readonly opacity: S2Number;
    public readonly transform: S2Transform;
    public readonly cornerRadius: S2Length;

    constructor() {
        super();
        this.fill = new S2FillData();
        this.stroke = new S2StrokeData();
        this.opacity = new S2Number(1, S2TypeState.Inactive);
        this.transform = new S2Transform();
        this.cornerRadius = new S2Length(5, 'view');

        this.stroke.opacity.set(1, S2TypeState.Inactive);
        this.transform.state = S2TypeState.Inactive;
        this.fill.opacity.set(1, S2TypeState.Inactive);
    }
}

export class S2NodeTextData extends S2BaseData {
    public readonly fill: S2FillData;
    public readonly stroke: S2StrokeData;
    public readonly opacity: S2Number;
    public readonly transform: S2Transform;

    public readonly font: S2FontData;
    public readonly horizontalAlign: S2Enum<S2HorizontalAlign>;
    public readonly verticalAlign: S2Enum<S2VerticalAlign>;

    constructor() {
        super();
        this.fill = new S2FillData();
        this.stroke = new S2StrokeData();
        this.opacity = new S2Number(1, S2TypeState.Inactive);
        this.transform = new S2Transform();
        this.font = new S2FontData();
        this.horizontalAlign = new S2Enum<S2HorizontalAlign>('center');
        this.verticalAlign = new S2Enum<S2VerticalAlign>('middle');

        this.stroke.width.set(0, 'view', S2TypeState.Inactive);
        this.transform.state = S2TypeState.Inactive;
        this.fill.opacity.set(1, S2TypeState.Inactive);
    }
}

export class S2NodeSeparatorData extends S2BaseData {
    public readonly stroke: S2StrokeData;
    public readonly opacity: S2Number;

    constructor() {
        super();
        this.stroke = new S2StrokeData();
        this.opacity = new S2Number(1, S2TypeState.Inactive);

        this.stroke.width.set(2, 'view', S2TypeState.Inactive);
        this.opacity.set(1, S2TypeState.Inactive);
    }
}

export class S2Node extends S2Element<S2NodeData> {
    protected element: SVGGElement;
    protected children: Array<S2BaseElement>;
    protected textGroups: S2TextGroup[];
    protected textGrows: number[];
    protected sepLines: S2Line[];
    protected background: S2Rect | S2Circle | null = null;
    protected nodeExtents: S2Extents;

    constructor(scene: S2BaseScene, partCount: number = 1) {
        super(scene, new S2NodeData());
        this.element = document.createElementNS(svgNS, 'g');
        this.children = [];
        this.textGroups = [];
        this.textGrows = [];
        this.sepLines = [];

        for (let i = 0; i < partCount; i++) {
            const textGroup = new S2TextGroup(this.scene);
            textGroup.data.setLayer(2);
            textGroup.data.font.setParent(this.data.text.font);
            textGroup.data.horizontalAlign.setParent(this.data.text.horizontalAlign);
            textGroup.data.verticalAlign.setParent(this.data.text.verticalAlign);
            textGroup.data.fill.setParent(this.data.text.fill);
            textGroup.data.opacity.setParent(this.data.text.opacity);
            textGroup.data.stroke.setParent(this.data.text.stroke);

            S2ElementUtils.appendChild(this, this.children, textGroup);
            this.textGroups.push(textGroup);
            this.textGrows.push(1);
        }
        for (let i = 0; i < partCount - 1; i++) {
            const line = new S2Line(this.scene);
            line.data.setLayer(1);
            line.data.opacity.setParent(this.data.separator.opacity);
            line.data.stroke.setParent(this.data.separator.stroke);

            S2ElementUtils.appendChild(this, this.children, line);
            this.sepLines.push(line);
        }
        this.nodeExtents = new S2Extents(0, 0, 'view');
        S2ElementUtils.updateSVGChildren(this.element, this.children);
        this.element.dataset.role = 'node';
    }

    getPosition(space: S2Space): S2Vec2 {
        return this.data.position.toSpace(space, this.scene.getActiveCamera());
    }

    getMinExtents(space: S2Space): S2Vec2 {
        return this.data.minExtents.toSpace(space, this.scene.getActiveCamera());
    }

    getPadding(space: S2Space): S2Vec2 {
        return this.data.padding.toSpace(space, this.scene.getActiveCamera());
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    addLine(options?: { partIndex?: number; align?: S2HorizontalAlign; skip?: number }): S2TextLine {
        const index = clamp(options?.partIndex ?? 0, 0, this.textGroups.length - 1);
        const textLine = this.textGroups[index].addLine(options);
        return textLine;
    }

    createRectBackground(): S2Rect {
        if (this.background !== null) S2ElementUtils.removeChild(this.children, this.background);
        this.background = new S2Rect(this.scene);
        this.background.data.setLayer(0);

        S2ElementUtils.appendChild(this, this.children, this.background);
        S2ElementUtils.updateSVGChildren(this.element, this.children);
        return this.background;
    }

    createCircleBackground(): S2Circle {
        if (this.background !== null) S2ElementUtils.removeChild(this.children, this.background);
        this.background = new S2Circle(this.scene);
        this.background.data.setLayer(0);

        S2ElementUtils.appendChild(this, this.children, this.background);
        S2ElementUtils.updateSVGChildren(this.element, this.children);
        return this.background;
    }

    setTextGrowFactor(partIndex: number, grow: number = 1): this {
        this.textGrows[partIndex] = grow;
        return this;
    }

    getBackground(): S2Circle | S2Rect | null {
        return this.background;
    }

    getCenter(space: S2Space = this.data.position.space): S2Vec2 {
        return S2AnchorUtils.getCenter(
            this.data.anchor.getInherited(),
            space,
            this.scene.getActiveCamera(),
            this.data.position,
            this.nodeExtents,
        );
    }

    getTextGroup(index: number = 0): S2TextGroup {
        return this.textGroups[index];
    }

    getTextGroupCount(): number {
        return this.textGroups.length;
    }

    getPointInDirection(direction: S2Vec2, space: S2Space, distance: S2Length): S2Vec2 {
        if (this.background) {
            return this.background.getPointInDirection(direction, space, distance);
        }
        return this.data.position.toSpace(space, this.scene.getActiveCamera());
    }

    protected updateImpl(updateId?: number): void {
        void updateId;
        const camera = this.scene.getActiveCamera();

        if (this.background !== null) {
            this.background.data.stroke.copy(this.data.background.stroke);
            this.background.data.fill.copy(this.data.background.fill);
            this.background.data.opacity.copy(this.data.background.opacity);
            this.background.data.transform.copy(this.data.background.transform);
            if (this.background instanceof S2Rect) {
                this.background.data.cornerRadius.copy(this.data.background.cornerRadius);
            }
        }

        const partHeights: Array<number> = [];
        let maxPartWidth = 0;

        for (let i = 0; i < this.textGroups.length; i++) {
            const textGroup = this.textGroups[i];
            textGroup.updateExtents();
            const extents = textGroup.getTextExtents('view');
            maxPartWidth = Math.max(maxPartWidth, 2 * extents.x);
            partHeights.push(2 * extents.y);
        }

        const nodeMinExtents = this.data.minExtents.toSpace('view', camera);
        const padding = this.data.padding.toSpace('view', camera);
        const partSep = this.data.partSep.toSpace('view', camera);

        const height = S2FlexUtils.computeSizes(
            partHeights,
            this.textGrows,
            2 * nodeMinExtents.y,
            padding.y,
            2 * partSep,
        );

        const nodeExtents = new S2Vec2(Math.max(maxPartWidth / 2 + padding.x, nodeMinExtents.x), height / 2);
        this.nodeExtents.setValueFromSpace('view', camera, nodeExtents.x, nodeExtents.y);

        const nodeCenter = S2AnchorUtils.getCenter(
            this.data.anchor.getInherited(),
            'view',
            camera,
            this.data.position,
            this.nodeExtents,
        );
        const textPosition = nodeCenter.clone().subV(nodeExtents).addV(padding);
        for (let i = 0; i < this.textGroups.length; i++) {
            this.textGroups[i].data.position.setV(textPosition, 'view');
            this.textGroups[i].data.minExtents.set(nodeExtents.x - padding.x, partHeights[i] / 2, 'view');
            this.textGroups[i].data.anchor.set('north-west');
            textPosition.y += partHeights[i] + 2 * partSep;
        }

        // Position background and separator lines
        if (this.background instanceof S2Rect) {
            // Background
            this.background.data.position.setV(nodeCenter, 'view');
            this.background.data.extents.setV(nodeExtents, 'view');
            this.background.data.anchor.set('center');

            // Separator lines
            let y = nodeCenter.y - nodeExtents.y + padding.y + partHeights[0] + partSep;
            for (let i = 0; i < this.textGroups.length - 1; i++) {
                this.sepLines[i].data.startPosition.set(nodeCenter.x - nodeExtents.x, y, 'view');
                this.sepLines[i].data.endPosition.set(nodeCenter.x + nodeExtents.x, y, 'view');
                y += partHeights[i + 1] + 2 * partSep;
            }
        } else if (this.background instanceof S2Circle) {
            // Background
            const radius = Math.max(nodeExtents.x, nodeExtents.y);
            this.background.data.position.setV(nodeCenter, 'view');
            this.background.data.radius.set(radius, 'view');

            // Separator lines
            let y = nodeCenter.y - nodeExtents.y + padding.y + partHeights[0] + partSep;
            for (let i = 0; i < this.textGroups.length - 1; i++) {
                const x = Math.sqrt(radius * radius - (y - nodeCenter.y) * (y - nodeCenter.y));
                this.sepLines[i].data.startPosition.set(nodeCenter.x - x, y, 'view');
                this.sepLines[i].data.endPosition.set(nodeCenter.x + x, y, 'view');
                y += partHeights[i + 1] + 2 * partSep;
            }
        }

        S2DataUtils.applyFont(this.data.text.font, this.element, this.scene);
        S2DataUtils.applyFill(this.data.text.fill, this.element, this.scene);
        S2DataUtils.applyStroke(this.data.text.stroke, this.element, this.scene);
        S2DataUtils.applyOpacity(this.data.text.opacity, this.element, this.scene);
        S2DataUtils.applyTransform(this.data.text.transform, this.element, this.scene);

        for (const child of this.children) {
            child.update(updateId);
        }
    }
}
