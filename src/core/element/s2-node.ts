import { S2Vec2 } from '../math/s2-vec2';
import { type S2BaseScene } from '../s2-interface';
import { type S2Anchor, S2AnchorUtils, FlexUtils } from '../s2-globals';
import { S2Rect } from './s2-rect';
import { S2Circle } from './s2-circle';
import { S2TransformGraphicData } from './s2-transform-graphic';
import { S2Color, S2Enum, S2Extents, S2Length, S2Number, S2Position, S2TypeState, type S2Space } from '../s2-types';
import { S2TextGroup, S2TextLine, type S2HorizontalAlign, type S2VerticalAlign } from './s2-text-group';
import { clamp } from '../math/s2-utils';
import { S2Line } from './s2-line';
import { S2Element, type S2BaseElement } from './s2-element';
import { S2Group } from './s2-group';
import { S2FontData, S2LayerData } from './s2-base-data';

export class S2NodeBackgroundData extends S2TransformGraphicData {
    public readonly cornerRadius: S2Length;

    constructor() {
        super();
        this.cornerRadius = new S2Length(0, 'view');
    }

    applyToElement(element: SVGElement, scene: S2BaseScene): void {
        super.applyToElement(element, scene);
        if (!(element instanceof SVGRectElement)) return;
        const camera = scene.getActiveCamera();
        const cornerRadius = this.cornerRadius.toSpace('view', camera);
        if (cornerRadius > 0) {
            element.setAttribute('rx', cornerRadius.toString());
            element.setAttribute('ry', cornerRadius.toString());
        } else {
            element.removeAttribute('rx');
            element.removeAttribute('ry');
        }
    }
}

export class S2NodeTextData extends S2TransformGraphicData {
    public readonly font: S2FontData;
    public readonly horizontalAlign: S2Enum<S2HorizontalAlign>;
    public readonly verticalAlign: S2Enum<S2VerticalAlign>;

    constructor() {
        super();
        this.font = new S2FontData();
        this.horizontalAlign = new S2Enum<S2HorizontalAlign>('center');
        this.verticalAlign = new S2Enum<S2VerticalAlign>('middle');
    }

    applyToElement(element: SVGElement, scene: S2BaseScene): void {
        super.applyToElement(element, scene);
        this.font.applyToElement(element, scene);
    }
}

export class S2NodeSeparatorData extends S2TransformGraphicData {}

export class S2NodeData extends S2LayerData {
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
}

export class S2Node extends S2Element<S2NodeData> {
    protected mainGroup: S2Group<S2BaseElement>;
    protected textGroups: S2TextGroup[];
    protected textGrows: number[];
    protected sepLines: S2Line[];
    protected background: S2Rect | S2Circle | null = null;
    protected nodeExtents: S2Extents;

    constructor(scene: S2BaseScene, partCount: number = 1) {
        super(scene, new S2NodeData());
        this.mainGroup = new S2Group<S2BaseElement>(scene);

        this.textGroups = [];
        this.textGrows = [];
        for (let i = 0; i < partCount; i++) {
            const textGroup = new S2TextGroup(this.scene);
            textGroup.setLayer(2);
            textGroup.data.setParent(this.data.text);
            textGroup.data.font.setParent(this.data.text.font);
            textGroup.data.horizontalAlign.setParent(this.data.text.horizontalAlign);
            textGroup.data.verticalAlign.setParent(this.data.text.verticalAlign);
            textGroup.data.fill.color.setParent(this.data.text.fill.color);
            this.textGroups.push(textGroup);
            this.textGrows.push(1);
            this.mainGroup.appendChild(textGroup);
        }
        this.sepLines = [];
        for (let i = 0; i < partCount - 1; i++) {
            const line = new S2Line(this.scene).setLayer(1);
            line.data.setParent(this.data.separator);
            this.sepLines.push(line);
            this.mainGroup.appendChild(line);
        }
        this.nodeExtents = new S2Extents(0, 0, 'view');
    }

    get position(): S2Position {
        return this.data.position;
    }

    get anchor(): S2Enum<S2Anchor> {
        return this.data.anchor;
    }

    get minExtents(): S2Extents {
        return this.data.minExtents;
    }

    get padding(): S2Extents {
        return this.data.padding;
    }

    get partSep(): S2Length {
        return this.data.partSep;
    }

    get textHorizontalAlign(): S2Enum<S2HorizontalAlign> {
        return this.data.text.horizontalAlign;
    }

    get textVerticalAlign(): S2Enum<S2VerticalAlign> {
        return this.data.text.verticalAlign;
    }

    get textFillColor(): S2Color {
        return this.data.text.fill.color;
    }

    get textOpacity(): S2Number {
        return this.data.text.opacity;
    }

    get textFont(): S2FontData {
        return this.data.text.font;
    }

    get backFillColor(): S2Color {
        return this.data.background.fill.color;
    }

    get backFillOpacity(): S2Number {
        return this.data.background.fill.opacity;
    }

    get backStrokeColor(): S2Color {
        return this.data.background.stroke.color;
    }

    get backStrokeOpacity(): S2Number {
        return this.data.background.stroke.opacity;
    }

    get backStrokeWidth(): S2Length {
        return this.data.background.stroke.width;
    }

    get backCornerRadius(): S2Length {
        return this.data.background.cornerRadius;
    }

    get backOpacity(): S2Number {
        return this.data.background.opacity;
    }

    setPosition(x: number, y: number, space: S2Space): this {
        this.data.position.set(x, y, space);
        return this;
    }

    setPositionV(v: S2Vec2, space: S2Space): this {
        this.data.position.setV(v, space);
        return this;
    }

    getPosition(space: S2Space): S2Vec2 {
        return this.data.position.toSpace(space, this.scene.getActiveCamera());
    }

    setMinExtents(x: number, y: number, space: S2Space): this {
        this.data.minExtents.set(x, y, space);
        return this;
    }

    setMinExtentsV(v: S2Vec2, space: S2Space): this {
        this.data.minExtents.setV(v, space);
        return this;
    }

    getMinExtents(space: S2Space): S2Vec2 {
        return this.data.minExtents.toSpace(space, this.scene.getActiveCamera());
    }

    setPadding(x: number, y: number, space: S2Space): this {
        this.data.padding.set(x, y, space);
        return this;
    }

    setPaddingV(v: S2Vec2, space: S2Space): this {
        this.data.padding.setV(v, space);
        return this;
    }

    getPadding(space: S2Space): S2Vec2 {
        return this.data.padding.toSpace(space, this.scene.getActiveCamera());
    }

    setPartSep(sep: number, space: S2Space): this {
        this.data.partSep.set(sep, space);
        return this;
    }

    getSVGElement(): SVGElement {
        return this.mainGroup.getSVGElement();
    }

    setAnchor(anchor: S2Anchor, state: S2TypeState = S2TypeState.Active): this {
        this.data.anchor.set(anchor, state);
        return this;
    }

    addLine(options?: { partIndex?: number; align?: S2HorizontalAlign; skip?: number }): S2TextLine {
        const index = clamp(options?.partIndex ?? 0, 0, this.textGroups.length - 1);
        const textLine = this.textGroups[index].addLine(options);
        return textLine;
    }

    createRectBackground(): S2Rect {
        if (this.background !== null) this.mainGroup.removeChild(this.background);
        this.background = new S2Rect(this.scene);
        this.background.setLayer(0);
        this.mainGroup.appendChild(this.background);
        return this.background;
    }

    createCircleBackground(): S2Circle {
        if (this.background !== null) this.mainGroup.removeChild(this.background);
        this.background = new S2Circle(this.scene);
        this.background.setLayer(0);
        this.mainGroup.appendChild(this.background);
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

        const height = FlexUtils.computeSizes(
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
            this.textGroups[i].data.anchor.set('north west');
            textPosition.y += partHeights[i] + 2 * partSep;
        }

        // Position background and separator lines
        if (this.background instanceof S2Rect) {
            // Background
            this.background.position.setV(nodeCenter, 'view');
            this.background.extents.setV(nodeExtents, 'view');
            this.background.data.anchor.set('center');

            // Separator lines
            let y = nodeCenter.y - nodeExtents.y + padding.y + partHeights[0] + partSep;
            for (let i = 0; i < this.textGroups.length - 1; i++) {
                this.sepLines[i].startPosition.set(nodeCenter.x - nodeExtents.x, y, 'view');
                this.sepLines[i].endPosition.set(nodeCenter.x + nodeExtents.x, y, 'view');
                y += partHeights[i + 1] + 2 * partSep;
            }
        } else if (this.background instanceof S2Circle) {
            // Background
            const radius = Math.max(nodeExtents.x, nodeExtents.y);
            this.background.position.setV(nodeCenter, 'view');
            this.background.radius.set(radius, 'view');

            // Separator lines
            let y = nodeCenter.y - nodeExtents.y + padding.y + partHeights[0] + partSep;
            for (let i = 0; i < this.textGroups.length - 1; i++) {
                const x = Math.sqrt(radius * radius - (y - nodeCenter.y) * (y - nodeCenter.y));
                this.sepLines[i].startPosition.set(nodeCenter.x - x, y, 'view');
                this.sepLines[i].endPosition.set(nodeCenter.x + x, y, 'view');
                y += partHeights[i + 1] + 2 * partSep;
            }
        }

        this.data.text.applyToElement(this.mainGroup.getSVGElement(), this.scene);
        this.mainGroup.update(updateId);
    }
}
