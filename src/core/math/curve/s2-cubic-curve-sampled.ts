import type { S2Vec2 } from '../s2-vec2';
import type { S2CubicBezier, S2CubicCurveNew } from './s2-cubic-curve';
import { S2CurveLinearSampling } from './s2-curve-linear-sampling';

export class S2CubicCurveSampled implements S2CubicBezier {
    protected readonly baseCurve: S2CubicCurveNew;
    protected readonly mapping: S2CurveLinearSampling;

    constructor(baseCurve: S2CubicCurveNew, sampleCount: number = 8) {
        this.baseCurve = baseCurve;
        this.mapping = new S2CurveLinearSampling(baseCurve, sampleCount);
    }

    getBaseCurve(): S2CubicCurveNew {
        return this.baseCurve;
    }

    getStartInto(dst: S2Vec2): this {
        this.baseCurve.getStartInto(dst);
        return this;
    }

    getEndInto(dst: S2Vec2): this {
        this.baseCurve.getEndInto(dst);
        return this;
    }

    getStartTangentInto(dst: S2Vec2): this {
        this.baseCurve.getStartTangentInto(dst);
        return this;
    }

    getEndTangentInto(dst: S2Vec2): this {
        this.baseCurve.getEndTangentInto(dst);
        return this;
    }

    getPointAtInto(dst: S2Vec2, t: number): this {
        const mappedT = this.mapping.getTFromU(t);
        this.baseCurve.getPointAtInto(dst, mappedT);
        return this;
    }

    getTangentAtInto(dst: S2Vec2, t: number): this {
        const mappedT = this.mapping.getTFromU(t);
        this.baseCurve.getTangentAtInto(dst, mappedT);
        return this;
    }

    getLength(): number {
        return this.mapping.getLength();
    }

    setControlPoints(
        x0: number,
        y0: number,
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        x3: number,
        y3: number,
    ): this {
        this.baseCurve.setControlPoints(x0, y0, x1, y1, x2, y2, x3, y3);
        this.mapping.update();
        return this;
    }

    setControlPointsV(p0: S2Vec2, p1: S2Vec2, p2: S2Vec2, p3: S2Vec2): this {
        this.baseCurve.setControlPointsV(p0, p1, p2, p3);
        this.mapping.update();
        return this;
    }

    setStart(x: number, y: number): this {
        this.baseCurve.setStart(x, y);
        this.mapping.update();
        return this;
    }

    setStartV(p: S2Vec2): this {
        this.baseCurve.setStartV(p);
        this.mapping.update();
        return this;
    }

    setControl1(x: number, y: number): this {
        this.baseCurve.setControl1(x, y);
        this.mapping.update();
        return this;
    }

    setControl1V(p: S2Vec2): this {
        this.baseCurve.setControl1V(p);
        this.mapping.update();
        return this;
    }

    setControl2(x: number, y: number): this {
        this.baseCurve.setControl2(x, y);
        this.mapping.update();
        return this;
    }

    setControl2V(p: S2Vec2): this {
        this.baseCurve.setControl2V(p);
        this.mapping.update();
        return this;
    }

    setEnd(x: number, y: number): this {
        this.baseCurve.setEnd(x, y);
        this.mapping.update();
        return this;
    }

    setEndV(p: S2Vec2): this {
        this.baseCurve.setEndV(p);
        this.mapping.update();
        return this;
    }

    getControlPointsInto(dst0: S2Vec2, dst1: S2Vec2, dst2: S2Vec2, dst3: S2Vec2): this {
        this.baseCurve.getControlPointsInto(dst0, dst1, dst2, dst3);
        return this;
    }

    getControl1Into(dst: S2Vec2): this {
        this.baseCurve.getControl1Into(dst);
        return this;
    }

    getControl2Into(dst: S2Vec2): this {
        this.baseCurve.getControl2Into(dst);
        return this;
    }
}
