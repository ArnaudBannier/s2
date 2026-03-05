import type { S2BaseScene } from '../scene/s2-base-scene';
import type { S2Dirtyable } from '../shared/s2-globals';
import { svgNS } from '../shared/s2-globals';
import { S2DataUtils } from './base/s2-data-utils';
import { S2FillData, S2ElementData, S2StrokeData } from './base/s2-base-data';
import { S2Element, type S2HasBounds } from './base/s2-element';
import { S2Number } from '../shared/s2-number';
import { S2Transform } from '../shared/s2-transform';
import { S2Point } from '../shared/s2-point';
import { S2Length } from '../shared/s2-length';
import type { S2Vec2 } from '../math/s2-vec2';
import type { S2Space } from '../math/s2-space';

export class S2CircleData extends S2ElementData {
    public readonly fill: S2FillData;
    public readonly stroke: S2StrokeData;
    public readonly opacity: S2Number;
    public readonly transform: S2Transform;
    public readonly position: S2Point;
    public readonly radius: S2Length;

    constructor(scene: S2BaseScene) {
        super();
        this.fill = new S2FillData();
        this.stroke = new S2StrokeData(scene);
        this.opacity = new S2Number(1);
        this.transform = new S2Transform();
        this.position = new S2Point(0, 0, scene.getWorldSpace());
        this.radius = new S2Length(1, scene.getWorldSpace());

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
        this.radius.setOwner(owner);
    }

    clearDirty(): void {
        super.clearDirty();
        this.fill.clearDirty();
        this.stroke.clearDirty();
        this.opacity.clearDirty();
        this.transform.clearDirty();
        this.position.clearDirty();
        this.radius.clearDirty();
    }
}

export class S2Circle extends S2Element<S2CircleData> implements S2HasBounds {
    protected element: SVGCircleElement;

    constructor(scene: S2BaseScene) {
        super(scene, new S2CircleData(scene));
        this.element = document.createElementNS(svgNS, 'circle');
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    getPositionInto(dst: S2Vec2, space: S2Space): void {
        this.data.position.getInto(dst, space);
    }

    getExtentsInto(dst: S2Vec2, space: S2Space): void {
        const radius = this.data.radius.get(space);
        dst.set(radius, radius);
    }

    getCenterInto(dst: S2Vec2, space: S2Space): void {
        this.data.position.getInto(dst, space);
    }

    getRectPointInto(dst: S2Vec2, space: S2Space, anchorX: number, anchorY: number): void {
        const radius = this.data.radius.get(space);
        this.data.position.getInto(dst, space);
        dst.add(radius * anchorX, radius * anchorY);
    }

    update(): void {
        if (this.skipUpdate()) return;

        S2DataUtils.applyPointerEvents(this.data.pointerEvents, this.element, this.scene);
        S2DataUtils.applyFill(this.data.fill, this.element, this.scene);
        S2DataUtils.applyStroke(this.data.stroke, this.element, this.scene);
        S2DataUtils.applyOpacity(this.data.opacity, this.element, this.scene);
        S2DataUtils.applyTransform(this.data.transform, this.element, this.scene);
        S2DataUtils.applyPosition(this.data.position, this.element, this.scene, 'cx', 'cy');
        S2DataUtils.applyRadius(this.data.radius, this.element, this.scene);

        this.clearDirty();
    }
}
