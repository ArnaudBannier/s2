import type { S2Vec2 } from './s2-vec2';

export class S2CubicCurveOPT {
    protected x0: number;
    protected y0: number;
    protected x1: number;
    protected y1: number;
    protected x2: number;
    protected y2: number;
    protected x3: number;
    protected y3: number;

    protected readonly linearLUT: Float32Array = new Float32Array(8);

    constructor(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) {
        this.x0 = x0;
        this.y0 = y0;
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.x3 = x3;
        this.y3 = y3;
    }

    copy(src: S2CubicCurveOPT): this {
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

    getPointAtCasteljauInto(dst: S2Vec2, t: number): this {
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

    getTangentAtCasteljauInto(dst: S2Vec2, t: number): this {
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

    reduceToCasteljauInto(dst: S2CubicCurveOPT, t: number): this {
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

    reduceFromCasteljauInto(dst: S2CubicCurveOPT, t: number): this {
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

    reduceCasteljauInto(dst: S2CubicCurveOPT, t0: number, t1: number): this {
        this.reduceToCasteljauInto(dst, t1);
        dst.reduceFromCasteljauInto(dst, t0 / t1);
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
}
