import type { S2BaseScene } from '../../scene/s2-base-scene';
import type { S2Space } from '../../math/s2-camera';
import type { S2Dirtyable } from '../../shared/s2-globals';
import { svgNS } from '../../shared/s2-globals';
import { S2ElementData, S2StrokeData } from '../base/s2-base-data';
import { S2Number } from '../../shared/s2-number';
import { S2Transform } from '../../shared/s2-transform';
import { S2Element } from '../base/s2-element';
import { S2Enum } from '../../shared/s2-enum';
import { S2Length } from '../../shared/s2-length';
import { S2PolyCurve } from '../../math/s2-curve';
import { S2Vec2 } from '../../math/s2-vec2';
import { S2DataUtils } from '../base/s2-data-utils';
import { S2ParamCurve } from './s2-param-curve';
import { S2PlotModifier } from './s2-plot-modifier';

export class S2CurvePlotData extends S2ElementData {
    public readonly stroke: S2StrokeData = new S2StrokeData();
    public readonly opacity: S2Number = new S2Number(1);
    public readonly transform: S2Transform = new S2Transform();
    public readonly space: S2Enum<S2Space> = new S2Enum<S2Space>('world');
    public readonly step: S2Length = new S2Length(0.2, 'world');
    public readonly derivativeEpsilon: S2Length = new S2Length(1e-5, 'world');
    public readonly pathFrom: S2Number = new S2Number(0);
    public readonly pathTo: S2Number = new S2Number(1);
    public readonly paramCurve: S2ParamCurve = new S2ParamCurve();
    public readonly plotModifier: S2PlotModifier = new S2PlotModifier();

    setOwner(owner: S2Dirtyable | null = null): void {
        super.setOwner(owner);
        this.stroke.setOwner(owner);
        this.opacity.setOwner(owner);
        this.transform.setOwner(owner);
        this.space.setOwner(owner);
        this.step.setOwner(owner);
        this.derivativeEpsilon.setOwner(owner);
        this.pathFrom.setOwner(owner);
        this.pathTo.setOwner(owner);
        this.paramCurve.setOwner(owner);
        this.plotModifier.setOwner(owner);
    }

    clearDirty(): void {
        super.clearDirty();
        this.stroke.clearDirty();
        this.opacity.clearDirty();
        this.transform.clearDirty();
        this.space.clearDirty();
        this.step.clearDirty();
        this.derivativeEpsilon.clearDirty();
        this.pathFrom.clearDirty();
        this.pathTo.clearDirty();
        this.paramCurve.clearDirty();
        this.plotModifier.clearDirty();
    }
}

export type S2FunctionModifier = (v: S2Vec2) => void;

export class S2CurvePlot extends S2Element<S2CurvePlotData> {
    protected readonly element: SVGPathElement;
    protected readonly curve: S2PolyCurve = new S2PolyCurve();
    protected ranges: Array<[number, number]> = [[0, 1]];
    protected cubicSampleCount: number = 8;

    constructor(scene: S2BaseScene) {
        super(scene, new S2CurvePlotData());
        this.element = document.createElementNS(svgNS, 'path');
        this.data.stroke.width.set(2, 'view');
        this.data.stroke.opacity.set(1);
    }

    setRanges(ranges: Array<[number, number]>): void {
        this.ranges = ranges;
        this.markDirty();
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    protected updateCurve(): void {
        const space = this.data.space.get();
        const camera = this.scene.getActiveCamera();
        const paramCurve = this.data.paramCurve;
        const plotModifier = this.data.plotModifier;
        const step = this.data.step.get(space, camera);
        const epsilon = this.data.derivativeEpsilon.get(space, camera);

        this.curve.clear();
        const points: S2Vec2[] = [new S2Vec2(), new S2Vec2(), new S2Vec2(), new S2Vec2()];
        const tmp0 = new S2Vec2();
        const tmp1 = new S2Vec2();
        for (const [from, to] of this.ranges) {
            for (let t = from; t < to; t += step) {
                const t0 = t;
                const t1 = Math.min(t + step, to);
                const currStep = t1 - t0;
                paramCurve.evaluate(t0, points[0]);
                plotModifier.evaluate(points[0]);
                paramCurve.evaluate(t1, points[3]);
                plotModifier.evaluate(points[3]);

                tmp0.copy(points[0]);
                paramCurve.evaluate(t0 + epsilon, tmp1);
                plotModifier.evaluate(tmp1);
                points[1].copy(points[0]).addV(tmp1.subV(tmp0).scale(currStep / (3 * epsilon)));

                paramCurve.evaluate(t1 - epsilon, tmp0);
                plotModifier.evaluate(tmp0);
                tmp1.copy(points[3]);
                points[2].copy(points[3]).subV(tmp1.subV(tmp0).scale(currStep / (3 * epsilon)));

                this.curve.addCubic(points[0], points[1], points[2], points[3], this.cubicSampleCount);
            }
        }
    }

    update(): void {
        if (this.skipUpdate()) return;

        let curveDirty = false;
        if (
            this.data.paramCurve.isDirty() ||
            this.data.plotModifier.isDirty() ||
            this.data.step.isDirty() ||
            this.data.space.isDirty() ||
            this.data.derivativeEpsilon.isDirty()
        ) {
            this.updateCurve();
            curveDirty = true;
        }

        S2DataUtils.applyPointerEvents(this.data.pointerEvents, this.element, this.scene);
        S2DataUtils.applyStroke(this.data.stroke, this.element, this.scene);
        S2DataUtils.applyOpacity(this.data.opacity, this.element, this.scene);
        S2DataUtils.applyTransform(this.data.transform, this.element, this.scene);

        if (curveDirty || this.data.pathFrom.isDirty() || this.data.pathTo.isDirty() || this.data.space.isDirty()) {
            S2DataUtils.applyPath(
                this.curve,
                this.data.space,
                this.data.pathFrom,
                this.data.pathTo,
                this.element,
                this.scene,
            );
        }
        this.element.setAttribute('fill', 'none');

        this.clearDirty();
    }
}
