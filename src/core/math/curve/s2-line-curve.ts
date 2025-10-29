import type { S2Vec2 } from '../s2-vec2';
import type { S2Curve, S2SubdividableCurve } from './s2-curve';

export class S2LineCurve implements S2Curve, S2SubdividableCurve<S2LineCurve> {
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

    setEnd(x: number, y: number): this {
        this.x1 = x;
        this.y1 = y;
        return this;
    }

    setEndV(p: S2Vec2): this {
        this.x1 = p.x;
        this.y1 = p.y;
        return this;
    }

    copy(src: S2LineCurve): this {
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

    getPointInto(dst: S2Vec2, t: number): this {
        const s = 1 - t;
        dst.set(s * this.x0 + t * this.x1, s * this.y0 + t * this.y1);
        return this;
    }

    getTangentInto(dst: S2Vec2, t: number): this {
        void t;
        dst.set(this.x1 - this.x0, this.y1 - this.y0);
        return this;
    }

    getBoundingBoxInto(dstLower: S2Vec2, dstUpper: S2Vec2): this {
        dstLower.set(Math.min(this.x0, this.x1), Math.min(this.y0, this.y1));
        dstUpper.set(Math.max(this.x0, this.x1), Math.max(this.y0, this.y1));
        return this;
    }

    subdivideLowerInto(dst: S2LineCurve, t: number): this {
        const s = 1 - t;
        const x = s * this.x0 + t * this.x1;
        const y = s * this.y0 + t * this.y1;
        dst.setPoints(this.x0, this.y0, x, y);
        return this;
    }

    subdivideUpperInto(dst: S2LineCurve, t: number): this {
        const s = 1 - t;
        const x = s * this.x0 + t * this.x1;
        const y = s * this.y0 + t * this.y1;
        dst.setPoints(x, y, this.x1, this.y1);
        return this;
    }

    subdivideAtInto(dstLower: S2LineCurve | null, dstUpper: S2LineCurve | null, t: number): this {
        const s = 1 - t;
        const x = s * this.x0 + t * this.x1;
        const y = s * this.y0 + t * this.y1;
        if (dstLower) {
            dstLower.setPoints(this.x0, this.y0, x, y);
        }
        if (dstUpper) {
            dstUpper.setPoints(x, y, this.x1, this.y1);
        }
        return this;
    }

    subdivideInto(dst: S2LineCurve, t0: number, t1: number): this {
        const s0 = 1 - t0;
        const s1 = 1 - t1;
        const x0 = s0 * this.x0 + t0 * this.x1;
        const y0 = s0 * this.y0 + t0 * this.y1;
        const x1 = s1 * this.x0 + t1 * this.x1;
        const y1 = s1 * this.y0 + t1 * this.y1;
        dst.setPoints(x0, y0, x1, y1);
        return this;
    }
}
