import type { S2BaseScene } from '../scene/s2-base-scene';
import type { S2AbstractSpace } from '../math/s2-abstract-space';
import type { S2Dirtyable, S2Tipable } from '../shared/s2-globals';
import { S2TipTransform, svgNS } from '../shared/s2-globals';
import { S2Vec2 } from '../math/s2-vec2';
import { S2CubicCurve, S2PolyCurve } from '../math/s2-curve';
import { S2Element } from './base/s2-element';
import { S2DataUtils } from './base/s2-data-utils';
import { S2FillData, S2ElementData, S2StrokeData } from './base/s2-base-data';
import { S2ArrowTip } from './s2-arrow-tip';
import { S2Number } from '../shared/s2-number';
import { S2Transform } from '../shared/s2-transform';
import { S2Enum } from '../shared/s2-enum';

export class S2PathData extends S2ElementData {
    public readonly fill: S2FillData;
    public readonly stroke: S2StrokeData;
    public readonly opacity: S2Number;
    public readonly transform: S2Transform;
    public readonly space: S2Enum<S2AbstractSpace>;
    public readonly polyCurve: S2PolyCurve;
    public readonly pathFrom: S2Number;
    public readonly pathTo: S2Number;

    constructor(scene: S2BaseScene) {
        super();
        this.stroke = new S2StrokeData(scene);
        this.opacity = new S2Number(1);
        this.fill = new S2FillData();
        this.transform = new S2Transform();
        this.space = new S2Enum<S2AbstractSpace>(scene.getWorldSpace());
        this.polyCurve = new S2PolyCurve();
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

export class S2Path extends S2Element<S2PathData> implements S2Tipable {
    protected element: SVGPathElement;
    protected sampleCount: number = 0;
    protected currStart: S2Vec2 = new S2Vec2(0, 0);
    protected endPosition: S2Vec2 = new S2Vec2(0, 0);
    protected arrowTips: S2ArrowTip[] = [];

    constructor(scene: S2BaseScene) {
        super(scene, new S2PathData(scene));
        this.element = document.createElementNS(svgNS, 'path');
    }

    createArrowTip(): S2ArrowTip {
        const arrowTip = new S2ArrowTip(this.scene);
        arrowTip.setParent(this.scene.getSVG());
        this.arrowTips.push(arrowTip);
        arrowTip.data.pathPosition.set(1);
        arrowTip.setTipableReference(this);
        this.markDirty();
        return arrowTip;
    }

    getTip(index: number): S2ArrowTip {
        return this.arrowTips[index];
    }

    getTipCount(): number {
        return this.arrowTips.length;
    }

    detachTip(index: number): this {
        if (index >= 0 && index < this.arrowTips.length) {
            this.arrowTips.splice(index, 1);
        }
        this.markDirty();
        return this;
    }

    detachTipElement(arrowTip: S2ArrowTip): this {
        const index = this.arrowTips.indexOf(arrowTip);
        if (index >= 0) {
            this.arrowTips.splice(index, 1);
        }
        this.markDirty();
        return this;
    }

    detachTipElements(): this {
        this.arrowTips.length = 0;
        this.markDirty();
        return this;
    }

    getTipTransformAt(t: number): S2TipTransform {
        const from = this.data.pathFrom.get();
        const to = this.data.pathTo.get();
        t = t * (to - from) + from;
        const transform = new S2TipTransform(this.scene);
        transform.space = this.data.space.get();
        transform.position = this.data.polyCurve.getPointAt(t);
        transform.tangent = this.data.polyCurve.getTangentAt(t);
        transform.pathLength = this.data.polyCurve.getLength() * (to - from);
        transform.strokeWidth = this.data.stroke.width.get(transform.space);
        return transform;
    }

    setSampleCount(sampleCount: number): this {
        this.sampleCount = sampleCount;
        this.markDirty();
        return this;
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    getStart(space: S2AbstractSpace): S2Vec2 {
        return this.data.space.get().convertPointToV(this.data.polyCurve.getStart(), space);
    }

    getEnd(space: S2AbstractSpace): S2Vec2 {
        return this.data.space.get().convertPointToV(this.data.polyCurve.getEnd(), space);
    }

    getPointAt(t: number, space: S2AbstractSpace): S2Vec2 {
        return this.data.space.get().convertPointToV(this.data.polyCurve.getPointAt(t), space);
    }

    getTangentAt(t: number, space: S2AbstractSpace): S2Vec2 {
        return this.data.space.get().convertOffsetToV(this.data.polyCurve.getTangentAt(t), space);
    }

    getStartTangent(space: S2AbstractSpace): S2Vec2 {
        return this.data.space.get().convertOffsetToV(this.data.polyCurve.getStartTangent(), space);
    }

    getEndTangent(space: S2AbstractSpace): S2Vec2 {
        return this.data.space.get().convertOffsetToV(this.data.polyCurve.getEndTangent(), space);
    }

    getLength(space: S2AbstractSpace): number {
        return this.data.space.get().convertLengthTo(this.data.polyCurve.getLength(), space);
    }

    clear(): this {
        this.data.polyCurve.clear();
        this.endPosition.set(0, 0);
        this.markDirty();
        return this;
    }

    moveTo(x: number, y: number): this {
        return this.moveToV(new S2Vec2(x, y));
    }

    moveToV(v: S2Vec2): this {
        this.currStart.copy(v);
        this.endPosition.copy(v);
        this.markDirty();
        return this;
    }

    lineTo(x: number, y: number): this {
        return this.lineToV(new S2Vec2(x, y));
    }

    lineToV(v: S2Vec2): this {
        this.data.polyCurve.addLine(this.endPosition, v);
        this.endPosition.copy(v);
        this.markDirty();
        return this;
    }

    cubicTo(
        dx1: number,
        dy1: number,
        dx2: number,
        dy2: number,
        x: number,
        y: number,
        sampleCount: number = this.sampleCount,
    ): this {
        return this.cubicToV(new S2Vec2(dx1, dy1), new S2Vec2(dx2, dy2), new S2Vec2(x, y), sampleCount);
    }

    cubicToV(dv1: S2Vec2, dv2: S2Vec2, v: S2Vec2, sampleCount: number = this.sampleCount): this {
        this.data.polyCurve.addCubic(
            this.endPosition,
            S2Vec2.addV(this.endPosition, dv1),
            S2Vec2.addV(v, dv2),
            v,
            sampleCount,
        );
        this.endPosition.copy(v);
        this.markDirty();
        return this;
    }

    smoothCubicTo(dx: number, dy: number, x: number, y: number, sampleCount: number = this.sampleCount): this {
        return this.smoothCubicToV(new S2Vec2(dx, dy), new S2Vec2(x, y), sampleCount);
    }

    smoothCubicToV(dv: S2Vec2, v: S2Vec2, sampleCount: number = this.sampleCount): this {
        if (this.data.polyCurve.getCurveCount() <= 0) return this;
        const lastCurve = this.data.polyCurve.getLastCurve();
        if (lastCurve instanceof S2CubicCurve === false) return this;
        this.data.polyCurve.addCubic(
            this.endPosition,
            S2Vec2.subV(S2Vec2.scaleV(this.endPosition, 2), lastCurve.getBezierPoint(2)),
            S2Vec2.addV(v, dv),
            v,
            sampleCount,
        );
        this.endPosition.copy(v);
        this.markDirty();
        return this;
    }

    close(): this {
        if (S2Vec2.eqV(this.currStart, this.endPosition)) return this;
        this.data.polyCurve.addLine(this.endPosition, this.currStart);
        this.markDirty();
        return this;
    }

    update(): void {
        if (this.skipUpdate()) return;

        S2DataUtils.applyPointerEvents(this.data.pointerEvents, this.element, this.scene);
        S2DataUtils.applyFill(this.data.fill, this.element, this.scene);
        S2DataUtils.applyStroke(this.data.stroke, this.element, this.scene);
        S2DataUtils.applyOpacity(this.data.opacity, this.element, this.scene);
        S2DataUtils.applyTransform(this.data.transform, this.element, this.scene);
        S2DataUtils.applyPath(
            this.data.polyCurve,
            this.data.space,
            this.data.pathFrom,
            this.data.pathTo,
            this.element,
            this.scene,
        );

        for (const arrowTip of this.arrowTips) {
            arrowTip.data.fill.color.copyIfUnlocked(this.data.stroke.color);
            arrowTip.data.fill.opacity.copyIfUnlocked(this.data.stroke.opacity);
            arrowTip.markDirty();
            arrowTip.update();
        }

        this.clearDirty();
    }
}
