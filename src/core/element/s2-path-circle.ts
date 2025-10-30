import type { S2BaseScene } from '../scene/s2-base-scene';
import type { S2Dirtyable } from '../shared/s2-globals';
import type { S2Space } from '../math/s2-space';
import type { S2SDF } from '../math/curve/s2-sdf';
import { S2Vec2 } from '../math/s2-vec2';
import { svgNS } from '../shared/s2-globals';
import { S2ElementData, S2FillData, S2StrokeData } from './base/s2-base-data';
import { S2Element } from './base/s2-element';
import { S2DataUtils } from './base/s2-data-utils';
import { S2Number } from '../shared/s2-number';
import { S2Transform } from '../shared/s2-transform';
import { S2Point } from '../shared/s2-point';
import { S2Length } from '../shared/s2-length';
import { S2SpaceRef } from '../shared/s2-space-ref';

export class S2PathCircleData extends S2ElementData {
    public readonly fill: S2FillData;
    public readonly stroke: S2StrokeData;
    public readonly opacity: S2Number;
    public readonly transform: S2Transform;
    public readonly space: S2SpaceRef;
    public readonly position: S2Point;
    public readonly radius: S2Length;

    constructor(scene: S2BaseScene) {
        super();
        this.fill = new S2FillData();
        this.stroke = new S2StrokeData(scene);
        this.opacity = new S2Number(1);
        this.transform = new S2Transform();
        this.space = new S2SpaceRef(scene.getWorldSpace());
        this.position = new S2Point(0, 0, scene.getWorldSpace());
        this.radius = new S2Length(1, scene.getViewSpace());

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
        this.radius.setOwner(owner);
    }

    clearDirty(): void {
        super.clearDirty();
        this.fill.clearDirty();
        this.stroke.clearDirty();
        this.opacity.clearDirty();
        this.transform.clearDirty();
        this.space.clearDirty();
        this.position.clearDirty();
        this.radius.clearDirty();
    }
}

export class S2PathCircle extends S2Element<S2PathCircleData> implements S2SDF {
    protected readonly element: SVGPathElement;
    protected readonly controlE: S2Vec2 = new S2Vec2();
    protected readonly controlNE1: S2Vec2 = new S2Vec2();
    protected readonly controlNE2: S2Vec2 = new S2Vec2();
    protected readonly controlN: S2Vec2 = new S2Vec2();
    protected readonly controlNW1: S2Vec2 = new S2Vec2();
    protected readonly controlNW2: S2Vec2 = new S2Vec2();
    protected readonly controlW: S2Vec2 = new S2Vec2();
    protected readonly controlSW1: S2Vec2 = new S2Vec2();
    protected readonly controlSW2: S2Vec2 = new S2Vec2();
    protected readonly controlS: S2Vec2 = new S2Vec2();
    protected readonly controlSE1: S2Vec2 = new S2Vec2();
    protected readonly controlSE2: S2Vec2 = new S2Vec2();

    protected readonly sdfCenter: S2Vec2 = new S2Vec2();
    protected sdfRadius: number = 0;

    constructor(scene: S2BaseScene) {
        super(scene, new S2PathCircleData(scene));
        this.element = document.createElementNS(svgNS, 'path');
    }

    getRadius(space: S2Space): number {
        return this.data.radius.get(space);
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    evaluateSDF(x: number, y: number): number {
        const dx = Math.abs(x - this.sdfCenter.x);
        const dy = Math.abs(y - this.sdfCenter.y);
        return Math.sqrt(dx * dx + dy * dy) - this.sdfRadius;
    }

    evaluateSDFV(p: S2Vec2): number {
        return this.evaluateSDF(p.x, p.y);
    }

    protected updateGeometry(): void {
        const space = this.data.space.get();
        const center = _vec0;
        this.data.position.getInto(center, space);

        const r = this.data.radius.get(space);
        const cX = center.x;
        const cY = center.y;
        const k = r * 0.552284749831; // 4/3*tan(pi/8)

        this.controlE.set(cX + r, cY);
        this.controlW.set(cX - r, cY);
        this.controlS.set(cX, cY - r);
        this.controlN.set(cX, cY + r);

        this.controlNE1.copy(this.controlE).add(0, +k);
        this.controlNE2.copy(this.controlN).add(+k, 0);
        this.controlNW1.copy(this.controlN).add(-k, 0);
        this.controlNW2.copy(this.controlW).add(0, +k);
        this.controlSW1.copy(this.controlW).add(0, -k);
        this.controlSW2.copy(this.controlS).add(-k, 0);
        this.controlSE1.copy(this.controlS).add(+k, 0);
        this.controlSE2.copy(this.controlE).add(0, -k);
    }

    protected updateSVGPath(): void {
        const viewSpace = this.scene.getViewSpace();
        const space = this.data.space.get();
        const point = _vec0;
        let svgPath = '';

        point.copy(this.controlE);
        space.convertPointIntoV(point, point, viewSpace);
        svgPath += `M ${point.x.toFixed(2)},${point.y.toFixed(2)} `;

        point.copy(this.controlNE1);
        space.convertPointIntoV(point, point, viewSpace);
        svgPath += `C ${point.x.toFixed(2)},${point.y.toFixed(2)} `;
        point.copy(this.controlNE2);
        space.convertPointIntoV(point, point, viewSpace);
        svgPath += `${point.x.toFixed(2)},${point.y.toFixed(2)} `;
        point.copy(this.controlN);
        space.convertPointIntoV(point, point, viewSpace);
        svgPath += `${point.x.toFixed(2)},${point.y.toFixed(2)} `;

        point.copy(this.controlNW1);
        space.convertPointIntoV(point, point, viewSpace);
        svgPath += `C ${point.x.toFixed(2)},${point.y.toFixed(2)} `;
        point.copy(this.controlNW2);
        space.convertPointIntoV(point, point, viewSpace);
        svgPath += `${point.x.toFixed(2)},${point.y.toFixed(2)} `;
        point.copy(this.controlW);
        space.convertPointIntoV(point, point, viewSpace);
        svgPath += `${point.x.toFixed(2)},${point.y.toFixed(2)} `;

        point.copy(this.controlSW1);
        space.convertPointIntoV(point, point, viewSpace);
        svgPath += `C ${point.x.toFixed(2)},${point.y.toFixed(2)} `;
        point.copy(this.controlSW2);
        space.convertPointIntoV(point, point, viewSpace);
        svgPath += `${point.x.toFixed(2)},${point.y.toFixed(2)} `;
        point.copy(this.controlS);
        space.convertPointIntoV(point, point, viewSpace);
        svgPath += `${point.x.toFixed(2)},${point.y.toFixed(2)} `;

        point.copy(this.controlSE1);
        space.convertPointIntoV(point, point, viewSpace);
        svgPath += `C ${point.x.toFixed(2)},${point.y.toFixed(2)} `;
        point.copy(this.controlSE2);
        space.convertPointIntoV(point, point, viewSpace);
        svgPath += `${point.x.toFixed(2)},${point.y.toFixed(2)} `;
        point.copy(this.controlE);
        space.convertPointIntoV(point, point, viewSpace);
        svgPath += `${point.x.toFixed(2)},${point.y.toFixed(2)} Z`;

        this.element.setAttribute('d', svgPath);
    }

    protected updateSDF(): void {
        const space = this.data.space.get();
        this.data.position.getInto(this.sdfCenter, space);
        this.sdfRadius = this.data.radius.get(space);
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
