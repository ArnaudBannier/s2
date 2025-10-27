import { S2Mat2x3 } from '../s2-mat2x3';
import { S2Vec2 } from '../s2-vec2';
import type { S2CubicCurveNew } from './s2-curve-opt';

export interface S2SDF {
    evaluateSDF(x: number, y: number): number;
    evaluateSDFV(p: S2Vec2): number;
}

export class S2CircleSDF implements S2SDF {
    protected center: S2Vec2;
    protected radius: number;

    constructor(x0: number, y0: number, radius: number) {
        this.center = new S2Vec2(x0, y0);
        this.radius = radius;
    }

    evaluateSDF(x: number, y: number): number {
        const dx = x - this.center.x;
        const dy = y - this.center.y;
        return Math.sqrt(dx * dx + dy * dy) - this.radius;
    }

    evaluateSDFV(p: S2Vec2): number {
        return this.evaluateSDF(p.x, p.y);
    }
}

export class S2RectSDF implements S2SDF {
    protected center: S2Vec2;
    protected extents: S2Vec2;

    constructor(x0: number, y0: number, extentsX: number, extentsY: number) {
        this.center = new S2Vec2(x0, y0);
        this.extents = new S2Vec2(extentsX, extentsY);
    }

    evaluateSDF(x: number, y: number): number {
        const dx = Math.abs(x - this.center.x) - this.extents.x;
        const dy = Math.abs(y - this.center.y) - this.extents.y;
        const ax = Math.max(dx, 0);
        const ay = Math.max(dy, 0);
        return Math.sqrt(ax * ax + ay * ay) + Math.min(Math.max(dx, dy), 0);
    }

    evaluateSDFV(p: S2Vec2): number {
        return this.evaluateSDF(p.x, p.y);
    }
}

export class S2RoundedRectSDF implements S2SDF {
    protected center: S2Vec2;
    protected extents: S2Vec2;
    protected radius: number;

    constructor(x0: number, y0: number, extentsX: number, extentsY: number, radius: number) {
        this.center = new S2Vec2(x0, y0);
        this.extents = new S2Vec2(extentsX, extentsY);
        this.radius = radius;
    }

    evaluateSDF(x: number, y: number): number {
        const dx = Math.abs(x - this.center.x) - (this.extents.x - this.radius);
        const dy = Math.abs(y - this.center.y) - (this.extents.y - this.radius);
        const ax = Math.max(dx, 0);
        const ay = Math.max(dy, 0);
        return Math.sqrt(ax * ax + ay * ay) + Math.min(Math.max(dx, dy), 0) - this.radius;
    }

    evaluateSDFV(p: S2Vec2): number {
        return this.evaluateSDF(p.x, p.y);
    }
}

export class S2SDFUtils {
    protected sdf: S2SDF;
    protected curve: S2CubicCurveNew;
    public transform: S2Mat2x3 = new S2Mat2x3(1, 0, 0, 0, 1, 0);
    protected tempPoint: S2Vec2 = new S2Vec2();

    constructor(sdf: S2SDF, curve: S2CubicCurveNew, transform?: S2Mat2x3) {
        this.sdf = sdf;
        this.curve = curve;
        if (transform) {
            this.transform.copy(transform);
        }
    }

    findPointAtDistance(
        distance: number,
        tMin: number,
        tMax: number,
        tolerance: number = 1e-2,
        maxIterations: number = 30,
    ): number {
        const point = this.tempPoint;
        this.curve.getPointAtCasteljauInto(point, tMin);
        point.apply2x3(this.transform);
        let valueMin = this.sdf.evaluateSDFV(point) - distance;
        this.curve.getPointAtCasteljauInto(point, tMax);
        point.apply2x3(this.transform);
        let valueMax = this.sdf.evaluateSDFV(point) - distance;
        if (valueMin * valueMax > 0) {
            return -1;
        }
        for (let i = 0; i < maxIterations; i++) {
            const tMid = (tMin + tMax) / 2;
            this.curve.getPointAtCasteljauInto(point, tMid);
            const valueMid = this.sdf.evaluateSDFV(point.apply2x3(this.transform)) - distance;

            if (Math.abs(valueMid) < tolerance) {
                return tMid;
            }
            if (valueMin * valueMid < 0) {
                tMax = tMid;
                valueMax = valueMid;
            } else {
                tMin = tMid;
                valueMin = valueMid;
            }
        }
        return (tMin + tMax) / 2;
    }
}
