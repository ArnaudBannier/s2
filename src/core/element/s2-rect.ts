import { S2ShapeUtils } from '../math/s2-shape-utils';
import { S2BaseScene } from '../scene/s2-base-scene';
import { S2Vec2 } from '../math/s2-vec2';
import { svgNS, type S2Anchor, S2AnchorUtils, type S2Dirtyable } from '../shared/s2-globals';
import { S2ElementData, S2FillData, S2StrokeData } from './base/s2-base-data';
import { S2Element } from './base/s2-element';
import { S2DataUtils } from './base/s2-data-utils';
import { S2Number } from '../shared/s2-number';
import { S2Transform } from '../shared/s2-transform';
import { S2Position } from '../shared/s2-position';
import { S2Extents } from '../shared/s2-extents';
import { S2Enum } from '../shared/s2-enum';
import { S2Length } from '../shared/s2-length';
import type { S2Space } from '../shared/s2-base-type';

export class S2RectData extends S2ElementData {
    public readonly fill: S2FillData;
    public readonly stroke: S2StrokeData;
    public readonly opacity: S2Number;
    public readonly transform: S2Transform;

    public readonly position: S2Position;
    public readonly extents: S2Extents;
    public readonly anchor: S2Enum<S2Anchor>;
    public readonly cornerRadius: S2Length;

    constructor() {
        super();
        this.fill = new S2FillData();
        this.stroke = new S2StrokeData();
        this.opacity = new S2Number(1);
        this.transform = new S2Transform();
        this.position = new S2Position(0, 0, 'world');
        this.extents = new S2Extents(1, 1, 'world');
        this.anchor = new S2Enum<S2Anchor>('center');
        this.cornerRadius = new S2Length(0, 'view');

        this.stroke.opacity.set(1);
        this.fill.opacity.set(1);
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        this.fill.setOwner(owner);
        this.stroke.setOwner(owner);
        this.opacity.setOwner(owner);
        this.transform.setOwner(owner);
        this.position.setOwner(owner);
        this.extents.setOwner(owner);
        this.anchor.setOwner(owner);
        this.cornerRadius.setOwner(owner);
    }

    clearDirty(): void {
        super.clearDirty();
        this.fill.clearDirty();
        this.stroke.clearDirty();
        this.opacity.clearDirty();
        this.transform.clearDirty();
        this.position.clearDirty();
        this.extents.clearDirty();
        this.anchor.clearDirty();
        this.cornerRadius.clearDirty();
    }
}

export class S2Rect extends S2Element<S2RectData> {
    protected element: SVGRectElement;

    constructor(scene: S2BaseScene) {
        super(scene, new S2RectData());
        this.element = document.createElementNS(svgNS, 'rect');
    }

    getExtents(space: S2Space): S2Vec2 {
        return this.data.extents.toSpace(space, this.scene.getActiveCamera());
    }

    getCornerRadius(space: S2Space): number {
        return this.data.cornerRadius.toSpace(space, this.scene.getActiveCamera());
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    getPointInDirection(direction: S2Vec2, space: S2Space, distance: S2Length): S2Vec2 {
        const camera = this.scene.getActiveCamera();
        const d = distance.toSpace(space, camera);
        const extents = this.data.extents.toSpace(space, camera).add(d, d).max(0, 0);
        const radius = Math.min(Math.max(this.data.cornerRadius.toSpace(space, camera) + d, 0), extents.x, extents.y);
        const center = S2AnchorUtils.getCenter(
            this.data.anchor.get(),
            space,
            camera,
            this.data.position,
            this.data.extents,
        );
        return S2ShapeUtils.intersectDirectionRoundedRectangle(direction, extents, radius).addV(center);
    }

    update(): void {
        if (this.skipUpdate()) return;

        S2DataUtils.applyFill(this.data.fill, this.element, this.scene);
        S2DataUtils.applyStroke(this.data.stroke, this.element, this.scene);
        S2DataUtils.applyOpacity(this.data.opacity, this.element, this.scene);
        S2DataUtils.applyTransform(this.data.transform, this.element, this.scene);
        S2DataUtils.applyAnchoredPosition(
            this.data.position,
            this.data.extents,
            this.data.anchor,
            this.element,
            this.scene,
        );
        S2DataUtils.applyExtents(this.data.extents, this.element, this.scene);
        S2DataUtils.applyCornerRadius(this.data.cornerRadius, this.element, this.scene);

        this.clearDirty();
    }
}
