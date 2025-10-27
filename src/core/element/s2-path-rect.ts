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
import { S2SpaceRef } from '../shared/s2-space-ref';
import type { S2SDF } from '../math/curve/s2-sdf';

export class S2RectPathData extends S2ElementData {
    public readonly fill: S2FillData;
    public readonly stroke: S2StrokeData;
    public readonly opacity: S2Number;
    public readonly transform: S2Transform;
    public readonly space: S2SpaceRef;
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
        this.space = new S2SpaceRef(scene.getWorldSpace());
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
        this.space.setOwner(owner);
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
        this.space.clearDirty();
        this.position.clearDirty();
        this.extents.clearDirty();
        this.anchor.clearDirty();
        this.cornerRadius.clearDirty();
    }
}

export class S2PathRect extends S2Element<S2RectPathData> implements S2SDF {
    protected readonly element: SVGPathElement;
    protected readonly cornerNE0: S2Vec2 = new S2Vec2();
    protected readonly cornerNE1: S2Vec2 = new S2Vec2();
    protected readonly cornerNE2: S2Vec2 = new S2Vec2();
    protected readonly cornerNE3: S2Vec2 = new S2Vec2();
    protected readonly cornerNW0: S2Vec2 = new S2Vec2();
    protected readonly cornerNW1: S2Vec2 = new S2Vec2();
    protected readonly cornerNW2: S2Vec2 = new S2Vec2();
    protected readonly cornerNW3: S2Vec2 = new S2Vec2();
    protected readonly cornerSW0: S2Vec2 = new S2Vec2();
    protected readonly cornerSW1: S2Vec2 = new S2Vec2();
    protected readonly cornerSW2: S2Vec2 = new S2Vec2();
    protected readonly cornerSW3: S2Vec2 = new S2Vec2();
    protected readonly cornerSE0: S2Vec2 = new S2Vec2();
    protected readonly cornerSE1: S2Vec2 = new S2Vec2();
    protected readonly cornerSE2: S2Vec2 = new S2Vec2();
    protected readonly cornerSE3: S2Vec2 = new S2Vec2();
    protected readonly vecNE: S2Vec2 = new S2Vec2();
    protected readonly vecNW: S2Vec2 = new S2Vec2();
    protected readonly vecSE: S2Vec2 = new S2Vec2();
    protected readonly vecSW: S2Vec2 = new S2Vec2();

    protected readonly sdfCenter: S2Vec2 = new S2Vec2();
    protected readonly sdfExtents: S2Vec2 = new S2Vec2();
    protected sdfRadius: number = 0;

    constructor(scene: S2BaseScene) {
        super(scene, new S2RectPathData(scene));
        this.element = document.createElementNS(svgNS, 'path');
    }

    getExtents(space: S2Space): S2Vec2 {
        return this.data.extents.get(space);
    }

    getCornerRadius(space: S2Space): number {
        return this.data.cornerRadius.get(space);
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    evaluateSDF(x: number, y: number): number {
        const dx = Math.abs(x - this.sdfCenter.x) - (this.sdfExtents.x - this.sdfRadius);
        const dy = Math.abs(y - this.sdfCenter.y) - (this.sdfExtents.y - this.sdfRadius);
        const ax = Math.max(dx, 0);
        const ay = Math.max(dy, 0);
        return Math.sqrt(ax * ax + ay * ay) + Math.min(Math.max(dx, dy), 0) - this.sdfRadius;
    }

    evaluateSDFV(p: S2Vec2): number {
        return this.evaluateSDF(p.x, p.y);
    }

    protected updateGeometry(): void {
        const space = this.data.space.get();
        const center = _vec0;
        const extents = _vec1;
        this.data.position.getInto(center, space);
        this.data.extents.getInto(extents, space);
        this.data.anchor.getRectPointIntoF(center, center.x, center.y, extents.x, extents.y, 0, 0);

        const r = this.data.cornerRadius.get(space);
        const cX = center.x;
        const cY = center.y;
        const eX = extents.x;
        const eY = extents.y;
        const k = r * 0.552284749831; // 4/3*tan(pi/8)

        this.vecNE.set(cX + eX, cY + eY);
        this.vecNW.set(cX - eX, cY + eY);
        this.vecSW.set(cX - eX, cY - eY);
        this.vecSE.set(cX + eX, cY - eY);

        this.cornerNE0.copy(this.vecNE).add(0, -r);
        this.cornerNE1.copy(this.vecNE).add(0, -r + k);
        this.cornerNE2.copy(this.vecNE).add(-r + k, 0);
        this.cornerNE3.copy(this.vecNE).add(-r, 0);

        this.cornerNW0.copy(this.vecNW).add(+r, 0);
        this.cornerNW1.copy(this.vecNW).add(+r - k, 0);
        this.cornerNW2.copy(this.vecNW).add(0, -r + k);
        this.cornerNW3.copy(this.vecNW).add(0, -r);

        this.cornerSW0.copy(this.vecSW).add(0, +r);
        this.cornerSW1.copy(this.vecSW).add(0, +r - k);
        this.cornerSW2.copy(this.vecSW).add(+r - k, 0);
        this.cornerSW3.copy(this.vecSW).add(+r, 0);

        this.cornerSE0.copy(this.vecSE).add(-r, 0);
        this.cornerSE1.copy(this.vecSE).add(-r + k, 0);
        this.cornerSE2.copy(this.vecSE).add(0, +r - k);
        this.cornerSE3.copy(this.vecSE).add(0, +r);
    }

    protected updateSVGPath(): void {
        const viewSpace = this.scene.getViewSpace();
        const space = this.data.space.get();
        const point = _vec0;
        point.copy(this.cornerSE3);
        space.convertPointIntoV(point, point, viewSpace);
        let svgPath = `M ${point.x.toFixed(2)},${point.y.toFixed(2)} `;

        point.copy(this.cornerNE0);
        space.convertPointIntoV(point, point, viewSpace);
        svgPath += `L ${point.x.toFixed(2)},${point.y.toFixed(2)} `;
        point.copy(this.cornerNE1);
        space.convertPointIntoV(point, point, viewSpace);
        svgPath += `C ${point.x.toFixed(2)},${point.y.toFixed(2)} `;
        point.copy(this.cornerNE2);
        space.convertPointIntoV(point, point, viewSpace);
        svgPath += `${point.x.toFixed(2)},${point.y.toFixed(2)} `;
        point.copy(this.cornerNE3);
        space.convertPointIntoV(point, point, viewSpace);
        svgPath += `${point.x.toFixed(2)},${point.y.toFixed(2)} `;

        point.copy(this.cornerNW0);
        space.convertPointIntoV(point, point, viewSpace);
        svgPath += `L ${point.x.toFixed(2)},${point.y.toFixed(2)} `;
        point.copy(this.cornerNW1);
        space.convertPointIntoV(point, point, viewSpace);
        svgPath += `C ${point.x.toFixed(2)},${point.y.toFixed(2)} `;
        point.copy(this.cornerNW2);
        space.convertPointIntoV(point, point, viewSpace);
        svgPath += `${point.x.toFixed(2)},${point.y.toFixed(2)} `;
        point.copy(this.cornerNW3);
        space.convertPointIntoV(point, point, viewSpace);
        svgPath += `${point.x.toFixed(2)},${point.y.toFixed(2)} `;

        point.copy(this.cornerSW0);
        space.convertPointIntoV(point, point, viewSpace);
        svgPath += `L ${point.x.toFixed(2)},${point.y.toFixed(2)} `;
        point.copy(this.cornerSW1);
        space.convertPointIntoV(point, point, viewSpace);
        svgPath += `C ${point.x.toFixed(2)},${point.y.toFixed(2)} `;
        point.copy(this.cornerSW2);
        space.convertPointIntoV(point, point, viewSpace);
        svgPath += `${point.x.toFixed(2)},${point.y.toFixed(2)} `;
        point.copy(this.cornerSW3);
        space.convertPointIntoV(point, point, viewSpace);
        svgPath += `${point.x.toFixed(2)},${point.y.toFixed(2)} `;

        point.copy(this.cornerSE0);
        space.convertPointIntoV(point, point, viewSpace);
        svgPath += `L ${point.x.toFixed(2)},${point.y.toFixed(2)} `;
        point.copy(this.cornerSE1);
        space.convertPointIntoV(point, point, viewSpace);
        svgPath += `C ${point.x.toFixed(2)},${point.y.toFixed(2)} `;
        point.copy(this.cornerSE2);
        space.convertPointIntoV(point, point, viewSpace);
        svgPath += `${point.x.toFixed(2)},${point.y.toFixed(2)} `;
        point.copy(this.cornerSE3);
        space.convertPointIntoV(point, point, viewSpace);
        svgPath += `${point.x.toFixed(2)},${point.y.toFixed(2)} Z`;

        this.element.setAttribute('d', svgPath);
    }

    protected updateSDF(): void {
        const space = this.data.space.get();
        this.data.position.getInto(this.sdfCenter, space);
        this.data.extents.getInto(this.sdfExtents, space);
        this.data.anchor.getRectPointIntoF(
            this.sdfCenter,
            this.sdfCenter.x,
            this.sdfCenter.y,
            this.sdfExtents.x,
            this.sdfExtents.y,
            0,
            0,
        );
        this.sdfRadius = this.data.cornerRadius.get(space);
        console.log('SDF Center:', this.sdfCenter);
        console.log('SDF Extents:', this.sdfExtents);
        console.log('SDF Radius:', this.sdfRadius);
    }

    update(): void {
        if (this.skipUpdate()) return;

        S2DataUtils.applyPointerEvents(this.data.pointerEvents, this.element, this.scene);
        S2DataUtils.applyFill(this.data.fill, this.element, this.scene);
        S2DataUtils.applyStroke(this.data.stroke, this.element, this.scene);
        S2DataUtils.applyOpacity(this.data.opacity, this.element, this.scene);
        S2DataUtils.applyTransform(this.data.transform, this.element, this.scene);

        this.updateSDF();
        this.updateGeometry();
        this.updateSVGPath();

        this.clearDirty();
    }
}

const _vec0 = new S2Vec2();
const _vec1 = new S2Vec2();
// const _vec2 = new S2Vec2();
// const _vec3 = new S2Vec2();
