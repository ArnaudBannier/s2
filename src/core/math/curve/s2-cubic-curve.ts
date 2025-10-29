import type { S2Curve, S2SubdividableCurve } from './s2-curve';
import { S2Vec2 } from '../s2-vec2';

export class S2CubicCurve implements S2Curve, S2SubdividableCurve<S2CubicCurve> {
    protected x0: number;
    protected y0: number;
    protected x1: number;
    protected y1: number;
    protected x2: number;
    protected y2: number;
    protected x3: number;
    protected y3: number;

    constructor(
        x0: number = 0,
        y0: number = 0,
        x1: number = 0,
        y1: number = 0,
        x2: number = 0,
        y2: number = 0,
        x3: number = 0,
        y3: number = 0,
    ) {
        this.x0 = x0;
        this.y0 = y0;
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.x3 = x3;
        this.y3 = y3;
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
        this.x0 = x0;
        this.y0 = y0;
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.x3 = x3;
        this.y3 = y3;
        return this;
    }

    setControlPointsV(p0: S2Vec2, p1: S2Vec2, p2: S2Vec2, p3: S2Vec2): this {
        this.x0 = p0.x;
        this.y0 = p0.y;
        this.x1 = p1.x;
        this.y1 = p1.y;
        this.x2 = p2.x;
        this.y2 = p2.y;
        this.x3 = p3.x;
        this.y3 = p3.y;
        return this;
    }

    setStart(x: number, y: number): this {
        this.x0 = x;
        this.y0 = y;
        return this;
    }

    setStartV(p: S2Vec2): this {
        this.x0 = p.x;
        this.y0 = p.y;
        return this;
    }

    setControl1(x: number, y: number): this {
        this.x1 = x;
        this.y1 = y;
        return this;
    }

    setControl1V(p: S2Vec2): this {
        this.x1 = p.x;
        this.y1 = p.y;
        return this;
    }

    setControl2(x: number, y: number): this {
        this.x2 = x;
        this.y2 = y;
        return this;
    }

    setControl2V(p: S2Vec2): this {
        this.x2 = p.x;
        this.y2 = p.y;
        return this;
    }

    setEnd(x: number, y: number): this {
        this.x3 = x;
        this.y3 = y;
        return this;
    }

    setEndV(p: S2Vec2): this {
        this.x3 = p.x;
        this.y3 = p.y;
        return this;
    }

    copy(src: S2CubicCurve): this {
        this.x0 = src.x0;
        this.y0 = src.y0;
        this.x1 = src.x1;
        this.y1 = src.y1;
        this.x2 = src.x2;
        this.y2 = src.y2;
        this.x3 = src.x3;
        this.y3 = src.y3;
        return this;
    }

    getControlPointsInto(dst0: S2Vec2, dst1: S2Vec2, dst2: S2Vec2, dst3: S2Vec2): this {
        dst0.set(this.x0, this.y0);
        dst1.set(this.x1, this.y1);
        dst2.set(this.x2, this.y2);
        dst3.set(this.x3, this.y3);
        return this;
    }

    getStartInto(dst: S2Vec2): this {
        dst.set(this.x0, this.y0);
        return this;
    }

    getEndInto(dst: S2Vec2): this {
        dst.set(this.x3, this.y3);
        return this;
    }

    getControl1Into(dst: S2Vec2): this {
        dst.set(this.x1, this.y1);
        return this;
    }
    getControl2Into(dst: S2Vec2): this {
        dst.set(this.x2, this.y2);
        return this;
    }

    getStartTangentInto(dst: S2Vec2): this {
        dst.set(this.x1 - this.x0, this.y1 - this.y0);
        return this;
    }

    getEndTangentInto(dst: S2Vec2): this {
        dst.set(this.x3 - this.x2, this.y3 - this.y2);
        return this;
    }

    getPointInto(dst: S2Vec2, t: number): this {
        const s = 1 - t;
        const c0 = s * s * s;
        const c1 = s * s * t * 3;
        const c2 = s * t * t * 3;
        const c3 = t * t * t;
        dst.set(
            c0 * this.x0 + c1 * this.x1 + c2 * this.x2 + c3 * this.x3,
            c0 * this.y0 + c1 * this.y1 + c2 * this.y2 + c3 * this.y3,
        );
        return this;
    }

    getTangentInto(dst: S2Vec2, t: number): this {
        const s = 1 - t;
        const c0 = s * s;
        const c1 = s * t * 2;
        const c2 = t * t;
        dst.set(
            c0 * (this.x1 - this.x0) + c1 * (this.x2 - this.x1) + c2 * (this.x3 - this.x2),
            c0 * (this.y1 - this.y0) + c1 * (this.y2 - this.y1) + c2 * (this.y3 - this.y2),
        );
        return this;
    }

    subdivideLowerInto(dst: S2CubicCurve, t: number): this {
        const x01 = this.x0 + (this.x1 - this.x0) * t;
        const y01 = this.y0 + (this.y1 - this.y0) * t;
        const x12 = this.x1 + (this.x2 - this.x1) * t;
        const y12 = this.y1 + (this.y2 - this.y1) * t;
        const x23 = this.x2 + (this.x3 - this.x2) * t;
        const y23 = this.y2 + (this.y3 - this.y2) * t;
        const x012 = x01 + (x12 - x01) * t;
        const y012 = y01 + (y12 - y01) * t;
        const x123 = x12 + (x23 - x12) * t;
        const y123 = y12 + (y23 - y12) * t;
        const x0123 = x012 + (x123 - x012) * t;
        const y0123 = y012 + (y123 - y012) * t;
        dst.x0 = this.x0;
        dst.y0 = this.y0;
        dst.x1 = x01;
        dst.y1 = y01;
        dst.x2 = x012;
        dst.y2 = y012;
        dst.x3 = x0123;
        dst.y3 = y0123;
        return this;
    }

    subdivideUpperInto(dst: S2CubicCurve, t: number): this {
        const x01 = this.x0 + (this.x1 - this.x0) * t;
        const y01 = this.y0 + (this.y1 - this.y0) * t;
        const x12 = this.x1 + (this.x2 - this.x1) * t;
        const y12 = this.y1 + (this.y2 - this.y1) * t;
        const x23 = this.x2 + (this.x3 - this.x2) * t;
        const y23 = this.y2 + (this.y3 - this.y2) * t;
        const x012 = x01 + (x12 - x01) * t;
        const y012 = y01 + (y12 - y01) * t;
        const x123 = x12 + (x23 - x12) * t;
        const y123 = y12 + (y23 - y12) * t;
        const x0123 = x012 + (x123 - x012) * t;
        const y0123 = y012 + (y123 - y012) * t;
        dst.x0 = x0123;
        dst.y0 = y0123;
        dst.x1 = x123;
        dst.y1 = y123;
        dst.x2 = x23;
        dst.y2 = y23;
        dst.x3 = this.x3;
        dst.y3 = this.y3;
        return this;
    }

    subdivideAtInto(dstLower: S2CubicCurve | null, dstUpper: S2CubicCurve | null, t: number): this {
        const x01 = this.x0 + (this.x1 - this.x0) * t;
        const y01 = this.y0 + (this.y1 - this.y0) * t;
        const x12 = this.x1 + (this.x2 - this.x1) * t;
        const y12 = this.y1 + (this.y2 - this.y1) * t;
        const x23 = this.x2 + (this.x3 - this.x2) * t;
        const y23 = this.y2 + (this.y3 - this.y2) * t;
        const x012 = x01 + (x12 - x01) * t;
        const y012 = y01 + (y12 - y01) * t;
        const x123 = x12 + (x23 - x12) * t;
        const y123 = y12 + (y23 - y12) * t;
        const x0123 = x012 + (x123 - x012) * t;
        const y0123 = y012 + (y123 - y012) * t;
        if (dstLower) {
            dstLower.x0 = this.x0;
            dstLower.y0 = this.y0;
            dstLower.x1 = x01;
            dstLower.y1 = y01;
            dstLower.x2 = x012;
            dstLower.y2 = y012;
            dstLower.x3 = x0123;
            dstLower.y3 = y0123;
        }
        if (dstUpper) {
            dstUpper.x0 = x0123;
            dstUpper.y0 = y0123;
            dstUpper.x1 = x123;
            dstUpper.y1 = y123;
            dstUpper.x2 = x23;
            dstUpper.y2 = y23;
            dstUpper.x3 = this.x3;
            dstUpper.y3 = this.y3;
        }
        return this;
    }

    subdivideInto(dst: S2CubicCurve, t0: number, t1: number): this {
        this.subdivideLowerInto(dst, t1);
        dst.subdivideUpperInto(dst, t0 / t1);
        return this;
    }

    getBezierPointInto(dst: S2Vec2, index: number): this {
        switch (index) {
            case 0:
                dst.set(this.x0, this.y0);
                break;
            case 1:
                dst.set(this.x1, this.y1);
                break;
            case 2:
                dst.set(this.x2, this.y2);
                break;
            default:
            case 3:
                dst.set(this.x3, this.y3);
                break;
        }
        return this;
    }

    getBoundingBoxInto(dstMin: S2Vec2, dstMax: S2Vec2): this {
        dstMin.set(Math.min(this.x0, this.x1, this.x2, this.x3), Math.min(this.y0, this.y1, this.y2, this.y3));
        dstMax.set(Math.max(this.x0, this.x1, this.x2, this.x3), Math.max(this.y0, this.y1, this.y2, this.y3));
        return this;
    }

    controlPointsFlatness(): number {
        const dx = this.x3 - this.x0;
        const dy = this.y3 - this.y0;
        const denom = Math.max(Math.hypot(dx, dy), 1e-12); // éviter div0

        const d1 = Math.abs(dx * (this.y0 - this.y1) - (this.x0 - this.x1) * dy) / denom;
        const d2 = Math.abs(dx * (this.y0 - this.y2) - (this.x0 - this.x2) * dy) / denom;

        return Math.max(d1, d2); // distance maximale aux points de contrôle
    }
}
