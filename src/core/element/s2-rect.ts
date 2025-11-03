import type { S2BaseScene } from '../scene/s2-base-scene';
import type { S2Dirtyable } from '../shared/s2-globals';
import type { S2Space } from '../math/s2-space';
import { S2Vec2 } from '../math/s2-vec2';
import { svgNS } from '../shared/s2-globals';
import { S2ElementData, S2FillData, S2StrokeData } from './base/s2-base-data';
import { S2Element } from './base/s2-element';
import { S2DataUtils } from './base/s2-data-utils';
import { S2Number } from '../shared/s2-number';
import { S2Transform } from '../shared/s2-transform';
import { S2Point } from '../shared/s2-point';
import { S2Extents } from '../shared/s2-extents';
import { S2Length } from '../shared/s2-length';
import { S2Anchor } from '../shared/s2-anchor';

export class S2RectData extends S2ElementData {
    public readonly fill: S2FillData;
    public readonly stroke: S2StrokeData;
    public readonly opacity: S2Number;
    public readonly transform: S2Transform;

    public readonly position: S2Point;
    public readonly extents: S2Extents;
    public readonly anchor: S2Anchor;
    public readonly cornerRadius: S2Length;

    constructor(scene: S2BaseScene) {
        super();
        this.fill = new S2FillData();
        this.stroke = new S2StrokeData(scene);
        this.opacity = new S2Number(1);
        this.transform = new S2Transform();
        this.position = new S2Point(0, 0, scene.getWorldSpace());
        this.extents = new S2Extents(1, 1, scene.getWorldSpace());
        this.anchor = new S2Anchor(0, 0);
        this.cornerRadius = new S2Length(0, scene.getViewSpace());

        this.stroke.opacity.set(1);
        this.fill.opacity.set(1);
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        super.setOwner(owner);
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
    protected readonly element: SVGRectElement;
    protected readonly svgPosition: S2Point;

    constructor(scene: S2BaseScene) {
        super(scene, new S2RectData(scene));
        this.element = document.createElementNS(svgNS, 'rect');
        this.svgPosition = new S2Point(0, 0, scene.getViewSpace());
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    getCenterInto(dst: S2Vec2, space: S2Space): this {
        this.data.anchor.getCenterInto(dst, space, this.data.position, this.data.extents);
        return this;
    }

    update(): void {
        if (this.skipUpdate()) return;

        S2DataUtils.applyPointerEvents(this.data.pointerEvents, this.element, this.scene);
        S2DataUtils.applyFill(this.data.fill, this.element, this.scene);
        S2DataUtils.applyStroke(this.data.stroke, this.element, this.scene);
        S2DataUtils.applyOpacity(this.data.opacity, this.element, this.scene);
        S2DataUtils.applyTransform(this.data.transform, this.element, this.scene);
        S2DataUtils.applyExtents(this.data.extents, this.element, this.scene);
        S2DataUtils.applyCornerRadius(this.data.cornerRadius, this.element, this.scene);

        const viewSpace = this.scene.getViewSpace();
        const position = this.scene.acquireVec2();
        this.data.anchor.getRectPointInto(position, viewSpace, this.data.position, this.data.extents, -1, -1);
        this.svgPosition.setV(position, viewSpace);
        S2DataUtils.applyPosition(this.svgPosition, this.element, this.scene);
        this.svgPosition.clearDirty();
        this.scene.releaseVec2(position);

        this.clearDirty();
    }
}
