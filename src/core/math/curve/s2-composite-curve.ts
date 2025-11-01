import { S2MathUtils } from '../s2-math-utils';
import { S2Vec2 } from '../s2-vec2';
import type { S2Curve } from './s2-curve';

export class S2CompositeCurve implements S2Curve {
    protected readonly curves: S2Curve[] = [];

    addCurve(curve: S2Curve): this {
        this.curves.push(curve);
        return this;
    }

    getCurveCount(): number {
        return this.curves.length;
    }

    getCurve(index: number): S2Curve {
        return this.curves[index];
    }

    getStartInto(dst: S2Vec2): this {
        if (this.curves.length === 0) {
            dst.set(0, 0);
            return this;
        }
        this.curves[0].getStartInto(dst);
        return this;
    }

    getEndInto(dst: S2Vec2): this {
        if (this.curves.length === 0) {
            dst.set(0, 0);
            return this;
        }
        this.curves[this.curves.length - 1].getEndInto(dst);
        return this;
    }

    getStartTangentInto(dst: S2Vec2): this {
        if (this.curves.length === 0) {
            dst.set(1, 0);
            return this;
        }
        this.curves[0].getStartTangentInto(dst);
        return this;
    }

    getEndTangentInto(dst: S2Vec2): this {
        if (this.curves.length === 0) {
            dst.set(1, 0);
            return this;
        }
        this.curves[this.curves.length - 1].getEndTangentInto(dst);
        return this;
    }

    getPointInto(dst: S2Vec2, t: number): this {
        const curveCount = this.curves.length;
        if (curveCount === 0) {
            dst.set(0, 0);
            return this;
        }
        const scaledT = t * curveCount;
        const curveIndex = S2MathUtils.clamp(Math.floor(scaledT), 0, curveCount - 1);
        const curve = this.curves[curveIndex];
        const localT = scaledT - curveIndex;
        curve.getPointInto(dst, localT);
        return this;
    }

    getTangentInto(dst: S2Vec2, t: number): this {
        const curveCount = this.curves.length;
        if (curveCount === 0) {
            dst.set(1, 0);
            return this;
        }
        const scaledT = t * curveCount;
        const curveIndex = S2MathUtils.clamp(Math.floor(scaledT), 0, curveCount - 1);
        const curve = this.curves[curveIndex];
        const localT = scaledT - curveIndex;
        curve.getTangentInto(dst, localT);
        return this;
    }

    getBoundingBoxInto(dstLower: S2Vec2, dstUpper: S2Vec2): this {
        if (this.curves.length === 0) {
            dstLower.set(0, 0);
            dstUpper.set(0, 0);
            return this;
        }
        this.curves[0].getBoundingBoxInto(dstLower, dstUpper);
        for (let i = 1; i < this.curves.length; i++) {
            const curve = this.curves[i];
            curve.getBoundingBoxInto(_vec0, _vec1);
            dstLower.minV(_vec0);
            dstUpper.maxV(_vec1);
        }
        return this;
    }
}

const _vec0 = new S2Vec2();
const _vec1 = new S2Vec2();
