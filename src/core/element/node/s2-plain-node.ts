import { S2Vec2 } from '../../math/s2-vec2';
import { S2BaseScene } from '../../s2-base-scene';
import type { S2Anchor, S2Dirtyable, S2HorizontalAlign, S2VerticalAlign } from '../../s2-globals';
import { S2AnchorUtils, svgNS } from '../../s2-globals';
import { S2Rect } from '../s2-rect';
import { S2Circle } from '../s2-circle';
import { S2Enum, S2Extents, S2Length, S2Number, S2Position, S2Transform, type S2Space } from '../../s2-types';
import { S2Element } from '../base/s2-element';
import { S2FontData, S2BaseData, S2FillData, S2StrokeData } from '../base/s2-base-data';
import { S2PlainText } from '../text/s2-plain-text';

export class S2NodeData extends S2BaseData {
    public readonly position: S2Position;
    public readonly anchor: S2Enum<S2Anchor>;
    public readonly background: S2NodeBackgroundData;
    public readonly text: S2NodeTextData;
    public readonly padding: S2Extents;
    public readonly minExtents: S2Extents;

    constructor() {
        super();
        this.position = new S2Position(0, 0, 'world');
        this.anchor = new S2Enum<S2Anchor>('center');
        this.minExtents = new S2Extents(0, 0, 'view');
        this.background = new S2NodeBackgroundData();
        this.text = new S2NodeTextData();
        this.padding = new S2Extents(10, 5, 'view');
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        this.position.setOwner(owner);
        this.anchor.setOwner(owner);
        this.minExtents.setOwner(owner);
        this.background.setOwner(owner);
        this.text.setOwner(owner);
        this.padding.setOwner(owner);
    }

    clearDirty(): void {
        super.clearDirty();
        this.position.clearDirty();
        this.anchor.clearDirty();
        this.minExtents.clearDirty();
        this.background.clearDirty();
        this.text.clearDirty();
        this.padding.clearDirty();
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
        this.opacity = new S2Number(1);
        this.transform = new S2Transform();
        this.cornerRadius = new S2Length(5, 'view');

        this.stroke.opacity.set(1);
        this.fill.opacity.set(1);
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        this.fill.setOwner(owner);
        this.stroke.setOwner(owner);
        this.opacity.setOwner(owner);
        this.transform.setOwner(owner);
        this.cornerRadius.setOwner(owner);
    }

    clearDirty(): void {
        super.clearDirty();
        this.fill.clearDirty();
        this.stroke.clearDirty();
        this.opacity.clearDirty();
        this.transform.clearDirty();
        this.cornerRadius.clearDirty();
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
        this.opacity = new S2Number(1);
        this.transform = new S2Transform();
        this.font = new S2FontData();
        this.horizontalAlign = new S2Enum<S2HorizontalAlign>('center');
        this.verticalAlign = new S2Enum<S2VerticalAlign>('middle');

        this.stroke.width.set(0, 'view');
        this.fill.opacity.set(1);
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        this.fill.setOwner(owner);
        this.stroke.setOwner(owner);
        this.opacity.setOwner(owner);
        this.transform.setOwner(owner);
        this.font.setOwner(owner);
        this.horizontalAlign.setOwner(owner);
        this.verticalAlign.setOwner(owner);
    }

    clearDirty(): void {
        super.clearDirty();
        this.fill.clearDirty();
        this.stroke.clearDirty();
        this.opacity.clearDirty();
        this.transform.clearDirty();
        this.font.clearDirty();
        this.horizontalAlign.clearDirty();
        this.verticalAlign.clearDirty();
    }
}

export class S2PlainNode extends S2Element<S2NodeData> {
    protected element: SVGGElement;
    protected text: S2PlainText;
    protected background: S2Rect | S2Circle | null = null;
    protected extents: S2Extents;

    constructor(scene: S2BaseScene) {
        super(scene, new S2NodeData());
        this.element = document.createElementNS(svgNS, 'g');
        this.text = new S2PlainText(this.scene);
        this.text.data.setLayer(2);
        this.text.setParent(this);
        this.extents = new S2Extents(0, 0, 'view');
        this.element.dataset.role = 'plain-node';
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

    setContent(content: string): this {
        this.text.setContent(content);
        return this;
    }

    createRectBackground(): S2Rect {
        if (this.background !== null) this.background.setParent(null);
        this.background = new S2Rect(this.scene);
        this.background.data.setLayer(0);

        this.background.setParent(this);
        this.updateSVGChildren();
        return this.background;
    }

    createCircleBackground(): S2Circle {
        if (this.background !== null) this.background.setParent(null);
        this.background = new S2Circle(this.scene);
        this.background.data.setLayer(0);

        this.background.setParent(this);
        this.updateSVGChildren();
        return this.background;
    }

    getBackground(): S2Circle | S2Rect | null {
        return this.background;
    }

    getCenter(space: S2Space): S2Vec2 {
        return S2AnchorUtils.getCenter(
            this.data.anchor.getInherited(),
            space,
            this.scene.getActiveCamera(),
            this.data.position,
            this.extents,
        );
    }

    getPointInDirection(direction: S2Vec2, space: S2Space, distance: S2Length): S2Vec2 {
        if (this.background) {
            return this.background.getPointInDirection(direction, space, distance);
        }
        return this.data.position.toSpace(space, this.scene.getActiveCamera());
    }

    update(): void {
        if (!this.isDirty()) return;
        if (!this.element.isConnected) return;

        const camera = this.scene.getActiveCamera();
        const space: S2Space = 'view';
        this.updateSVGChildren();

        this.text.data.font.copy(this.data.text.font);
        this.text.data.fill.copy(this.data.text.fill);
        this.text.data.opacity.copy(this.data.text.opacity);
        this.text.data.stroke.copy(this.data.text.stroke);
        this.text.update();

        const textExtents = this.text.getExtents(space);
        const padding = this.data.padding.toSpace(space, camera);
        const extents = this.data.minExtents.toSpace(space, camera);
        extents.max(textExtents.x + padding.x, textExtents.y + padding.y);
        const contentExtents = extents.clone().subV(padding);

        this.extents.setValueFromSpace(space, camera, extents.x, extents.y);

        const nodeCenter = this.getCenter(space);
        const contentNW = nodeCenter.clone().subV(contentExtents);

        const font = this.data.text.font;
        const ascenderHeight = font.relativeAscenderHeight.value * font.size.value;

        let lineX = 0;
        let lineY = contentNW.y + ascenderHeight;
        switch (this.data.text.verticalAlign.value) {
            case 'top':
                break;
            case 'middle':
                lineY += contentExtents.y - textExtents.y;
                break;
            case 'bottom':
                lineY += 2 * (contentExtents.y - textExtents.y);
                break;
        }
        switch (this.data.text.horizontalAlign.value) {
            case 'left':
                lineX = contentNW.x;
                this.text.data.textAnchor.set('start');
                break;
            case 'center':
                lineX = contentNW.x + contentExtents.x;
                this.text.data.textAnchor.set('middle');
                break;
            case 'right':
                lineX = contentNW.x + 2 * contentExtents.x;
                this.text.data.textAnchor.set('end');
                break;
        }
        this.text.data.position.set(lineX, lineY, 'view');
        this.text.update();

        // Style background
        if (this.background !== null) {
            this.background.data.stroke.copy(this.data.background.stroke);
            this.background.data.fill.copy(this.data.background.fill);
            this.background.data.opacity.copy(this.data.background.opacity);
            this.background.data.transform.copy(this.data.background.transform);
            if (this.background instanceof S2Rect) {
                this.background.data.cornerRadius.copy(this.data.background.cornerRadius);
            }

            // Position background
            if (this.background instanceof S2Rect) {
                // Rectangle
                this.background.data.position.setV(nodeCenter, 'view');
                this.background.data.extents.setV(extents, 'view');
                this.background.data.anchor.set('center');
            } else if (this.background instanceof S2Circle) {
                // Circle
                const radius = Math.max(extents.x, extents.y);
                this.background.data.position.setV(nodeCenter, 'view');
                this.background.data.radius.set(radius, 'view');
            }

            this.background.update();
        }

        this.clearDirty();
    }
}
