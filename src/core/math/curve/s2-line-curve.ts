import type { S2Vec2 } from '../s2-vec2';
import type { S2CurveNew } from './s2-curve-opt';

export class S2LineCurveNew implements S2CurveNew {
    protected x0: number;
    protected y0: number;
    protected x1: number;
    protected y1: number;

    constructor(x0: number = 0, y0: number = 0, x1: number = 0, y1: number = 0) {
        this.x0 = x0;
        this.y0 = y0;
        this.x1 = x1;
        this.y1 = y1;
    }

    setPoints(x0: number, y0: number, x1: number, y1: number): this {
        this.x0 = x0;
        this.y0 = y0;
        this.x1 = x1;
        this.y1 = y1;
        return this;
    }

    setPointsV(p0: S2Vec2, p1: S2Vec2): this {
        this.x0 = p0.x;
        this.y0 = p0.y;
        this.x1 = p1.x;
        this.y1 = p1.y;
        return this;
    }

    copy(src: S2LineCurveNew): this {
        this.x0 = src.x0;
        this.y0 = src.y0;
        this.x1 = src.x1;
        this.y1 = src.y1;
        return this;
    }
    getPointsIntoV(dst0: S2Vec2, dst1: S2Vec2): this {
        dst0.set(this.x0, this.y0);
        dst1.set(this.x1, this.y1);
        return this;
    }

    getStartInto(dst: S2Vec2): this {
        dst.set(this.x0, this.y0);
        return this;
    }

    getEndInto(dst: S2Vec2): this {
        dst.set(this.x1, this.y1);
        return this;
    }

    getStartTangentInto(dst: S2Vec2): this {
        dst.set(this.x1 - this.x0, this.y1 - this.y0);
        return this;
    }

    getEndTangentInto(dst: S2Vec2): this {
        dst.set(this.x1 - this.x0, this.y1 - this.y0);
        return this;
    }

    getPointAtInto(dst: S2Vec2, t: number): this {
        const s = 1 - t;
        dst.set(s * this.x0 + t * this.x1, s * this.y0 + t * this.y1);
        return this;
    }

    getTangentAtInto(dst: S2Vec2, t: number): this {
        void t;
        dst.set(this.x1 - this.x0, this.y1 - this.y0);
        return this;
    }

    // reduceToCasteljauInto(dst: S2LineCurveNew, t: number): this {
    //     const x01 = this.x0 + (this.x1 - this.x0) * t;
    //     const y01 = this.y0 + (this.y1 - this.y0) * t;
    //     const x12 = this.x1 + (this.x2 - this.x1) * t;
    //     const y12 = this.y1 + (this.y2 - this.y1) * t;
    //     const x23 = this.x2 + (this.x3 - this.x2) * t;
    //     const y23 = this.y2 + (this.y3 - this.y2) * t;
    //     const x012 = x01 + (x12 - x01) * t;
    //     const y012 = y01 + (y12 - y01) * t;
    //     const x123 = x12 + (x23 - x12) * t;
    //     const y123 = y12 + (y23 - y12) * t;
    //     const x0123 = x012 + (x123 - x012) * t;
    //     const y0123 = y012 + (y123 - y012) * t;
    //     dst.x0 = this.x0;
    //     dst.y0 = this.y0;
    //     dst.x1 = x01;
    //     dst.y1 = y01;
    //     dst.x2 = x012;
    //     dst.y2 = y012;
    //     dst.x3 = x0123;
    //     dst.y3 = y0123;
    //     return this;
    // }

    // reduceFromCasteljauInto(dst: S2LineCurveNew, t: number): this {
    //     const x01 = this.x0 + (this.x1 - this.x0) * t;
    //     const y01 = this.y0 + (this.y1 - this.y0) * t;
    //     const x12 = this.x1 + (this.x2 - this.x1) * t;
    //     const y12 = this.y1 + (this.y2 - this.y1) * t;
    //     const x23 = this.x2 + (this.x3 - this.x2) * t;
    //     const y23 = this.y2 + (this.y3 - this.y2) * t;
    //     const x012 = x01 + (x12 - x01) * t;
    //     const y012 = y01 + (y12 - y01) * t;
    //     const x123 = x12 + (x23 - x12) * t;
    //     const y123 = y12 + (y23 - y12) * t;
    //     const x0123 = x012 + (x123 - x012) * t;
    //     const y0123 = y012 + (y123 - y012) * t;
    //     dst.x0 = x0123;
    //     dst.y0 = y0123;
    //     dst.x1 = x123;
    //     dst.y1 = y123;
    //     dst.x2 = x23;
    //     dst.y2 = y23;
    //     dst.x3 = this.x3;
    //     dst.y3 = this.y3;
    //     return this;
    // }

    // subdivideCasteljauInto(dst1: S2LineCurveNew | null, dst2: S2LineCurveNew | null, t: number): this {
    //     const x01 = this.x0 + (this.x1 - this.x0) * t;
    //     const y01 = this.y0 + (this.y1 - this.y0) * t;
    //     const x12 = this.x1 + (this.x2 - this.x1) * t;
    //     const y12 = this.y1 + (this.y2 - this.y1) * t;
    //     const x23 = this.x2 + (this.x3 - this.x2) * t;
    //     const y23 = this.y2 + (this.y3 - this.y2) * t;
    //     const x012 = x01 + (x12 - x01) * t;
    //     const y012 = y01 + (y12 - y01) * t;
    //     const x123 = x12 + (x23 - x12) * t;
    //     const y123 = y12 + (y23 - y12) * t;
    //     const x0123 = x012 + (x123 - x012) * t;
    //     const y0123 = y012 + (y123 - y012) * t;
    //     if (dst1) {
    //         dst1.x0 = this.x0;
    //         dst1.y0 = this.y0;
    //         dst1.x1 = x01;
    //         dst1.y1 = y01;
    //         dst1.x2 = x012;
    //         dst1.y2 = y012;
    //         dst1.x3 = x0123;
    //         dst1.y3 = y0123;
    //     }
    //     if (dst2) {
    //         dst2.x0 = x0123;
    //         dst2.y0 = y0123;
    //         dst2.x1 = x123;
    //         dst2.y1 = y123;
    //         dst2.x2 = x23;
    //         dst2.y2 = y23;
    //         dst2.x3 = this.x3;
    //         dst2.y3 = this.y3;
    //     }
    //     return this;
    // }

    // reduceCasteljauInto(dst: S2LineCurveNew, t0: number, t1: number): this {
    //     this.reduceToCasteljauInto(dst, t1);
    //     dst.reduceFromCasteljauInto(dst, t0 / t1);
    //     return this;
    // }

    getBoundingBoxInto(dstMin: S2Vec2, dstMax: S2Vec2): this {
        dstMin.set(Math.min(this.x0, this.x1), Math.min(this.y0, this.y1));
        dstMax.set(Math.max(this.x0, this.x1), Math.max(this.y0, this.y1));
        return this;
    }
}
