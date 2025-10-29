import { S2Vec2 } from '../s2-vec2';
import { S2CubicCurve } from './s2-cubic-curve';
import type { S2LineCurve } from './s2-line-curve';

export interface CurveIntersection {
    t: number;
    s: number;
}

export class S2BezierIntersection {
    protected cubicPool: S2CubicCurve[] = [];
    protected points: S2Vec2[] = [];
    protected pointCount: number = 0;
    private _tmpVec0 = new S2Vec2();
    private _tmpVec1 = new S2Vec2();
    private _tmpVec2 = new S2Vec2();
    private _tmpVec3 = new S2Vec2();

    protected tolerance: number;
    protected maxDepth: number;

    constructor(tolerance: number = 1e-2, maxDepth: number = 20) {
        this.tolerance = tolerance;
        this.maxDepth = maxDepth;
        for (let i = 0; i < 16; i++) this.cubicPool.push(new S2CubicCurve());
    }

    setTolerance(tolerance: number): this {
        this.tolerance = tolerance;
        return this;
    }

    setMaxDepth(maxDepth: number): this {
        this.maxDepth = maxDepth;
        return this;
    }

    protected aquireCubic(): S2CubicCurve {
        const cubic = this.cubicPool.pop();
        return cubic ? cubic : new S2CubicCurve();
    }

    protected releaseCubic(cubic: S2CubicCurve): void {
        this.cubicPool.push(cubic);
    }

    protected boxOverlap(lower1: S2Vec2, upper1: S2Vec2, lower2: S2Vec2, upper2: S2Vec2): boolean {
        return !(upper1.x < lower2.x || upper2.x < lower1.x || upper1.y < lower2.y || upper2.y < lower1.y);
    }

    private intersectCubicCubicRec(
        c1: S2CubicCurve,
        t0: number,
        t1: number,
        c2: S2CubicCurve,
        s0: number,
        s1: number,
        depth: number,
        intersections: CurveIntersection[],
    ): void {
        const lower1 = this._tmpVec0;
        const upper1 = this._tmpVec1;
        const lower2 = this._tmpVec2;
        const upper2 = this._tmpVec3;
        c1.getBoundingBoxInto(lower1, upper1);
        c2.getBoundingBoxInto(lower2, upper2);

        if (this.boxOverlap(lower1, upper1, lower2, upper2) === false) {
            return;
        }

        const size1 = Math.max(upper1.x - lower1.x, upper1.y - lower1.y);
        const size2 = Math.max(upper2.x - lower2.x, upper2.y - lower2.y);

        if (Math.max(size1, size2) < this.tolerance || depth >= this.maxDepth) {
            const tm = 0.5 * (t0 + t1);
            const sm = 0.5 * (s0 + s1);
            const point = this._tmpVec0;
            c1.getPointInto(point, tm);

            if (this.addPoint(point)) {
                intersections.push({ t: tm, s: sm });
            }
            return;
        }

        const c11 = this.aquireCubic();
        const c12 = this.aquireCubic();
        const c21 = this.aquireCubic();
        const c22 = this.aquireCubic();
        c1.subdivideAtInto(c11, c12, 0.5);
        c2.subdivideAtInto(c21, c22, 0.5);
        const tm = 0.5 * (t0 + t1);
        const sm = 0.5 * (s0 + s1);
        this.intersectCubicCubicRec(c11, t0, tm, c21, s0, sm, depth + 1, intersections);
        this.intersectCubicCubicRec(c11, t0, tm, c22, sm, s1, depth + 1, intersections);
        this.intersectCubicCubicRec(c12, tm, t1, c21, s0, sm, depth + 1, intersections);
        this.intersectCubicCubicRec(c12, tm, t1, c22, sm, s1, depth + 1, intersections);
        this.releaseCubic(c11);
        this.releaseCubic(c12);
        this.releaseCubic(c21);
        this.releaseCubic(c22);
    }

    intersectCubicCubic(c1: S2CubicCurve, c2: S2CubicCurve, intersections: CurveIntersection[]): void {
        this.intersectCubicCubicRec(c1, 0, 1, c2, 0, 1, 0, intersections);
        intersections.sort((a, b) => a.t - b.t);
        this.pointCount = 0;
    }

    private addPoint(point: S2Vec2): boolean {
        let isDuplicate = false;
        for (let i = 0; i < this.pointCount; i++) {
            const p = this.points[i];
            if (Math.abs(p.x - point.x) < this.tolerance && Math.abs(p.y - point.y) < this.tolerance) {
                isDuplicate = true;
                break;
            }
        }
        if (isDuplicate === false) {
            if (this.pointCount >= this.points.length) {
                this.points.push(new S2Vec2());
            }
            this.points[this.pointCount].copy(point);
            this.pointCount++;
            return true;
        }
        return false;
    }

    intersectCubicSegment(curve: S2CubicCurve, segment: S2LineCurve, intersections: CurveIntersection[]): void {
        this.intersectCubicSegmentRec(curve, 0, 1, segment, 0, intersections);
        intersections.sort((a, b) => a.t - b.t);
        this.pointCount = 0;
    }

    intersectCubicSegmentRec(
        curve: S2CubicCurve,
        t0: number,
        t1: number,
        segment: S2LineCurve,
        depth: number,
        intersections: CurveIntersection[],
    ): void {
        const lower1 = this._tmpVec0;
        const upper1 = this._tmpVec1;
        const lower2 = this._tmpVec2;
        const upper2 = this._tmpVec3;
        curve.getBoundingBoxInto(lower1, upper1);
        segment.getBoundingBoxInto(lower2, upper2);

        if (this.boxOverlap(lower1, upper1, lower2, upper2) === false) {
            return;
        }

        const flatness = curve.controlPointsFlatness();
        if (flatness < 1e-2 || depth > 10) {
            // Approxime la courbe par le segment [P0, P3]
            curve.getBezierPointInto(this._tmpVec0, 0);
            curve.getBezierPointInto(this._tmpVec1, 3);

            const cx1 = this._tmpVec0.x;
            const cy1 = this._tmpVec0.y;
            const cx2 = this._tmpVec1.x;
            const cy2 = this._tmpVec1.y;

            segment.getStartInto(this._tmpVec0);
            const ax = this._tmpVec0.x;
            const ay = this._tmpVec0.y;
            segment.getEndInto(this._tmpVec1);
            const bx = this._tmpVec1.x;
            const by = this._tmpVec1.y;

            const denom = (bx - ax) * (cy2 - cy1) - (by - ay) * (cx2 - cx1);
            if (Math.abs(denom) < 1e-12) return; // segments parallèles

            const ua = ((cx2 - cx1) * (ay - cy1) - (cy2 - cy1) * (ax - cx1)) / denom;
            const ub = ((bx - ax) * (ay - cy1) - (by - ay) * (ax - cx1)) / denom;

            if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
                const t = t0 + (t1 - t0) * ub; // approx. paramètre Bézier

                const point = this._tmpVec0;
                curve.getPointInto(point, t);

                if (this.addPoint(point)) {
                    intersections.push({ t: t, s: 0 });
                }
                return;
            }
        }

        const c1 = this.aquireCubic();
        const c2 = this.aquireCubic();
        c1.subdivideAtInto(c1, c2, 0.5);
        const tm = 0.5 * (t0 + t1);
        this.intersectCubicSegmentRec(c1, t0, tm, segment, depth + 1, intersections);
        this.intersectCubicSegmentRec(c2, tm, t1, segment, depth + 1, intersections);
        this.releaseCubic(c1);
        this.releaseCubic(c2);
    }
}
