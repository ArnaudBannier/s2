import type { S2BaseScene } from '../scene/s2-base-scene';
import type { S2Dirtyable } from '../shared/s2-globals';
import { svgNS } from '../shared/s2-globals';
import { S2Vec2 } from '../math/s2-vec2';
import { S2Element } from './base/s2-element';
import { S2DataUtils } from './base/s2-data-utils';
import { S2FillData, S2ElementData, S2StrokeData } from './base/s2-base-data';
import { S2Number } from '../shared/s2-number';
import { S2Transform } from '../shared/s2-transform';
import { S2SpaceRef } from '../shared/s2-space-ref';
import { S2CubicCurveNew } from '../math/curve/s2-curve-opt';

export class S2PathNewData extends S2ElementData {
    public readonly fill: S2FillData;
    public readonly stroke: S2StrokeData;
    public readonly opacity: S2Number;
    public readonly transform: S2Transform;
    public readonly space: S2SpaceRef;
    public readonly polyCurve: S2CubicCurveNew;
    public readonly pathFrom: S2Number;
    public readonly pathTo: S2Number;

    constructor(scene: S2BaseScene) {
        super();
        this.stroke = new S2StrokeData(scene);
        this.opacity = new S2Number(1);
        this.fill = new S2FillData();
        this.transform = new S2Transform();
        this.space = new S2SpaceRef(scene.getWorldSpace());
        this.polyCurve = new S2CubicCurveNew(0, 0, 1, 1, 2, 2, 3, 3);
        this.pathFrom = new S2Number(0);
        this.pathTo = new S2Number(1);

        this.fill.opacity.set(0);
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        super.setOwner(owner);
        this.fill.setOwner(owner);
        this.stroke.setOwner(owner);
        this.opacity.setOwner(owner);
        this.transform.setOwner(owner);
        this.space.setOwner(owner);
        //this.polyCurve.setOwner(owner);
        this.pathFrom.setOwner(owner);
        this.pathTo.setOwner(owner);
    }

    clearDirty(): void {
        super.clearDirty();
        this.fill.clearDirty();
        this.stroke.clearDirty();
        this.opacity.clearDirty();
        this.transform.clearDirty();
        this.space.clearDirty();
        //this.polyCurve.resetDirtyFlags();
        this.pathFrom.clearDirty();
        this.pathTo.clearDirty();
    }
}

export class S2PathNew extends S2Element<S2PathNewData> {
    protected element: SVGPathElement;
    protected sampleCount: number = 0;
    protected currStart: S2Vec2 = new S2Vec2(0, 0);
    protected endPosition: S2Vec2 = new S2Vec2(0, 0);

    constructor(scene: S2BaseScene) {
        super(scene, new S2PathNewData(scene));
        this.element = document.createElementNS(svgNS, 'path');
    }

    setSampleCount(sampleCount: number): this {
        this.sampleCount = sampleCount;
        this.markDirty();
        return this;
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    update(): void {
        if (this.skipUpdate()) return;

        S2DataUtils.applyPointerEvents(this.data.pointerEvents, this.element, this.scene);
        S2DataUtils.applyFill(this.data.fill, this.element, this.scene);
        S2DataUtils.applyStroke(this.data.stroke, this.element, this.scene);
        S2DataUtils.applyOpacity(this.data.opacity, this.element, this.scene);
        S2DataUtils.applyTransform(this.data.transform, this.element, this.scene);

        const point = new S2Vec2(0, 0);
        const space = this.data.space.get();
        const viewSpace = this.scene.getViewSpace();
        const curve = this.data.polyCurve;

        let svgPath = '';

        curve.getBezierPointInto(point, 0);
        space.convertPointIntoV(point, point, viewSpace);
        svgPath += `M ${point.x.toFixed(2)},${point.y.toFixed(2)} `;

        svgPath += 'C ';
        for (let j = 1; j < 4; j++) {
            curve.getBezierPointInto(point, j);
            space.convertPointIntoV(point, point, viewSpace);
            svgPath += `${point.x.toFixed(2)},${point.y.toFixed(2)} `;
        }

        this.element.setAttribute('d', svgPath.trim());

        this.clearDirty();
    }
}
