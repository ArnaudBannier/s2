import { S2Mat2x3 } from '../s2-mat2x3';
import { S2Vec2 } from '../s2-vec2';
import type { S2Curve } from './s2-curve';

export interface S2SDF {
    evaluateSDF(x: number, y: number): number;
    evaluateSDFV(p: S2Vec2): number;
}

export class S2SDFUtils {
    private static evaluateSDF(sdf: S2SDF, curve: S2Curve, curveTransform: S2Mat2x3, t: number): number {
        curve.getPointInto(_vec0, t);
        _vec0.apply2x3(curveTransform);
        return sdf.evaluateSDFV(_vec0);
    }

    static findPointAtDistance(
        sdf: S2SDF,
        curve: S2Curve,
        curveTransform: S2Mat2x3,
        distance: number,
        tMin: number,
        tMax: number,
        tolerance: number = 1e-2,
        maxIterations: number = 30,
    ): number {
        let valueMin = this.evaluateSDF(sdf, curve, curveTransform, tMin) - distance;
        let valueMax = this.evaluateSDF(sdf, curve, curveTransform, tMax) - distance;
        if (valueMin * valueMax > 0) {
            return -1;
        }
        for (let i = 0; i < maxIterations; i++) {
            const tMid = (tMin + tMax) / 2;
            const valueMid = this.evaluateSDF(sdf, curve, curveTransform, tMid) - distance;

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

const _vec0 = new S2Vec2();

// export class S2CircleSDF implements S2SDF {
//     protected center: S2Vec2;
//     protected radius: number;

//     constructor(x0: number, y0: number, radius: number) {
//         this.center = new S2Vec2(x0, y0);
//         this.radius = radius;
//     }

//     evaluateSDF(x: number, y: number): number {
//         const dx = x - this.center.x;
//         const dy = y - this.center.y;
//         return Math.sqrt(dx * dx + dy * dy) - this.radius;
//     }

//     evaluateSDFV(p: S2Vec2): number {
//         return this.evaluateSDF(p.x, p.y);
//     }
// }

// export class S2RectSDF implements S2SDF {
//     protected center: S2Vec2;
//     protected extents: S2Vec2;

//     constructor(x0: number, y0: number, extentsX: number, extentsY: number) {
//         this.center = new S2Vec2(x0, y0);
//         this.extents = new S2Vec2(extentsX, extentsY);
//     }

//     evaluateSDF(x: number, y: number): number {
//         const dx = Math.abs(x - this.center.x) - this.extents.x;
//         const dy = Math.abs(y - this.center.y) - this.extents.y;
//         const ax = Math.max(dx, 0);
//         const ay = Math.max(dy, 0);
//         return Math.sqrt(ax * ax + ay * ay) + Math.min(Math.max(dx, dy), 0);
//     }

//     evaluateSDFV(p: S2Vec2): number {
//         return this.evaluateSDF(p.x, p.y);
//     }
// }

// export class S2RoundedRectSDF implements S2SDF {
//     protected center: S2Vec2;
//     protected extents: S2Vec2;
//     protected radius: number;

//     constructor(x0: number, y0: number, extentsX: number, extentsY: number, radius: number) {
//         this.center = new S2Vec2(x0, y0);
//         this.extents = new S2Vec2(extentsX, extentsY);
//         this.radius = radius;
//     }

//     evaluateSDF(x: number, y: number): number {
//         const dx = Math.abs(x - this.center.x) - (this.extents.x - this.radius);
//         const dy = Math.abs(y - this.center.y) - (this.extents.y - this.radius);
//         const ax = Math.max(dx, 0);
//         const ay = Math.max(dy, 0);
//         return Math.sqrt(ax * ax + ay * ay) + Math.min(Math.max(dx, dy), 0) - this.radius;
//     }

//     evaluateSDFV(p: S2Vec2): number {
//         return this.evaluateSDF(p.x, p.y);
//     }
// }
