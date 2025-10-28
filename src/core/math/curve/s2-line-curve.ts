import type { S2Vec2 } from '../s2-vec2';
import type { S2Curve } from './s2-cubic-curve';

export class S2LineCurveNew implements S2Curve {
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

    getBoundingBoxInto(dstMin: S2Vec2, dstMax: S2Vec2): this {
        dstMin.set(Math.min(this.x0, this.x1), Math.min(this.y0, this.y1));
        dstMax.set(Math.max(this.x0, this.x1), Math.max(this.y0, this.y1));
        return this;
    }
}
