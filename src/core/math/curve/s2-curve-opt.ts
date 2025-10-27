import { S2MathUtils } from '../s2-math-utils';
import { S2Vec2 } from '../s2-vec2';
import type { S2LineCurveNew } from './s2-line-curve';

export interface S2CurveNew {
    getStartInto(dst: S2Vec2): this;
    getEndInto(dst: S2Vec2): this;
    getStartTangentInto(dst: S2Vec2): this;
    getEndTangentInto(dst: S2Vec2): this;
    // getPointAtInto(dst: S2Vec2, t: number): this;
    // getTangentAtInto(dst: S2Vec2, t: number): this;
}

export class S2CubicCurveNew implements S2CurveNew {
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

    copy(src: S2CubicCurveNew): this {
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

    getControlPointsInto(dst: S2Vec2[]): this {
        dst[0].set(this.x0, this.y0);
        dst[1].set(this.x1, this.y1);
        dst[2].set(this.x2, this.y2);
        dst[3].set(this.x3, this.y3);
        return this;
    }

    getControlPointsIntoV(dst0: S2Vec2, dst1: S2Vec2, dst2: S2Vec2, dst3: S2Vec2): this {
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

    getStartTangentInto(dst: S2Vec2): this {
        dst.set(this.x1 - this.x0, this.y1 - this.y0);
        return this;
    }

    getEndTangentInto(dst: S2Vec2): this {
        dst.set(this.x3 - this.x2, this.y3 - this.y2);
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

    reduceToCasteljauInto(dst: S2CubicCurveNew, t: number): this {
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

    reduceFromCasteljauInto(dst: S2CubicCurveNew, t: number): this {
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

    subdivideCasteljauInto(dst1: S2CubicCurveNew | null, dst2: S2CubicCurveNew | null, t: number): this {
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
        if (dst1) {
            dst1.x0 = this.x0;
            dst1.y0 = this.y0;
            dst1.x1 = x01;
            dst1.y1 = y01;
            dst1.x2 = x012;
            dst1.y2 = y012;
            dst1.x3 = x0123;
            dst1.y3 = y0123;
        }
        if (dst2) {
            dst2.x0 = x0123;
            dst2.y0 = y0123;
            dst2.x1 = x123;
            dst2.y1 = y123;
            dst2.x2 = x23;
            dst2.y2 = y23;
            dst2.x3 = this.x3;
            dst2.y3 = this.y3;
        }
        return this;
    }

    reduceCasteljauInto(dst: S2CubicCurveNew, t0: number, t1: number): this {
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

    getBoundingBoxInto(dstMin: S2Vec2, dstMax: S2Vec2): this {
        dstMin.set(Math.min(this.x0, this.x1, this.x2, this.x3), Math.min(this.y0, this.y1, this.y2, this.y3));
        dstMax.set(Math.max(this.x0, this.x1, this.x2, this.x3), Math.max(this.y0, this.y1, this.y2, this.y3));
        return this;
    }

    getThirdDerivativeInto(dst: S2Vec2): this {
        dst.set(
            6 * (this.x0 - 3 * this.x1 + 3 * this.x2 - this.x3),
            6 * (this.y0 - 3 * this.y1 + 3 * this.y2 - this.y3),
        );
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

export class S2CurveLinearMapping {
    protected readonly curve: S2CubicCurveNew;
    protected readonly sampleCount: number;
    protected readonly cumulativeLength: Float32Array;
    protected length: number = 0;

    constructor(curve: S2CubicCurveNew, sampleCount: number = 8) {
        this.curve = curve;
        this.sampleCount = sampleCount;
        this.cumulativeLength = new Float32Array(this.sampleCount);
        this.updateLength();
    }

    protected updateLength(): void {
        const prevPoint = _vec0;
        const currPoint = _vec1;
        this.curve.getPointAtCasteljauInto(prevPoint, 0);
        this.cumulativeLength[0] = 0;

        for (let i = 1; i < this.sampleCount; i++) {
            this.curve.getPointAtCasteljauInto(currPoint, i / (this.sampleCount - 1));
            this.cumulativeLength[i] = this.cumulativeLength[i - 1] + prevPoint.distance(currPoint);
            prevPoint.copy(currPoint);
        }

        this.length = this.cumulativeLength[this.sampleCount - 1];
    }

    getLength(): number {
        return this.length;
    }

    getTFromLength(targetLength: number): number {
        if (targetLength <= 0) return 0;
        if (targetLength >= this.length) return 1;

        const maxIndex = this.cumulativeLength.length - 1;
        let low = 0;
        let high = maxIndex;

        while (low < high) {
            const mid = Math.floor((low + high) / 2);
            const midLength = this.cumulativeLength[mid];
            if (midLength < targetLength) {
                low = mid + 1;
            } else if (midLength > targetLength) {
                high = mid - 1;
            } else {
                low = mid;
                break;
            }
        }

        if (this.cumulativeLength[low] > targetLength) {
            low--;
        }
        low = S2MathUtils.clamp(low, 0, maxIndex - 1);

        return S2MathUtils.remap(
            this.cumulativeLength[low],
            this.cumulativeLength[low + 1],
            low / maxIndex,
            (low + 1) / maxIndex,
            targetLength,
        );
    }

    getTFromU(u: number): number {
        return this.getTFromLength(u * this.length);
    }
}

const _vec0 = new S2Vec2();
const _vec1 = new S2Vec2();

export interface CurveIntersection {
    t: number;
    s: number;
}

export class S2BezierIntersection {
    protected cubicPool: S2CubicCurveNew[] = [];
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
        for (let i = 0; i < 16; i++) this.cubicPool.push(new S2CubicCurveNew());
    }

    setTolerance(tolerance: number): this {
        this.tolerance = tolerance;
        return this;
    }

    setMaxDepth(maxDepth: number): this {
        this.maxDepth = maxDepth;
        return this;
    }

    protected aquireCubic(): S2CubicCurveNew {
        const cubic = this.cubicPool.pop();
        return cubic ? cubic : new S2CubicCurveNew();
    }

    protected releaseCubic(cubic: S2CubicCurveNew): void {
        this.cubicPool.push(cubic);
    }

    protected boxOverlap(lower1: S2Vec2, upper1: S2Vec2, lower2: S2Vec2, upper2: S2Vec2): boolean {
        return !(upper1.x < lower2.x || upper2.x < lower1.x || upper1.y < lower2.y || upper2.y < lower1.y);
    }

    private intersectCubicCubicRec(
        c1: S2CubicCurveNew,
        t0: number,
        t1: number,
        c2: S2CubicCurveNew,
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
            c1.getPointAtCasteljauInto(point, tm);

            if (this.addPoint(point)) {
                intersections.push({ t: tm, s: sm });
            }
            return;
        }

        const c11 = this.aquireCubic();
        const c12 = this.aquireCubic();
        const c21 = this.aquireCubic();
        const c22 = this.aquireCubic();
        c1.subdivideCasteljauInto(c11, c12, 0.5);
        c2.subdivideCasteljauInto(c21, c22, 0.5);
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

    intersectCubicCubic(c1: S2CubicCurveNew, c2: S2CubicCurveNew, intersections: CurveIntersection[]): void {
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

    intersectCubicSegment(curve: S2CubicCurveNew, segment: S2LineCurveNew, intersections: CurveIntersection[]): void {
        this.intersectCubicSegmentRec(curve, 0, 1, segment, 0, intersections);
        intersections.sort((a, b) => a.t - b.t);
        this.pointCount = 0;
    }

    intersectCubicSegmentRec(
        curve: S2CubicCurveNew,
        t0: number,
        t1: number,
        segment: S2LineCurveNew,
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
                curve.getPointAtCasteljauInto(point, t);

                if (this.addPoint(point)) {
                    intersections.push({ t: t, s: 0 });
                }
                return;
            }
        }

        const c1 = this.aquireCubic();
        const c2 = this.aquireCubic();
        c1.subdivideCasteljauInto(c1, c2, 0.5);
        const tm = 0.5 * (t0 + t1);
        this.intersectCubicSegmentRec(c1, t0, tm, segment, depth + 1, intersections);
        this.intersectCubicSegmentRec(c2, tm, t1, segment, depth + 1, intersections);
        this.releaseCubic(c1);
        this.releaseCubic(c2);
    }
}

// function intersectCubicSegment(
//     curve: S2CubicCurveNew,
//     ax: number,
//     ay: number,
//     bx: number,
//     by: number,
//     out: { t: number; x: number; y: number }[],
//     t0 = 0,
//     t1 = 1,
//     depth = 0,
// ): void {
//     // --- Étape 1 : test de BBox
//     const cMin = new S2Vec2(),
//         cMax = new S2Vec2();
//     curve.getBoundingBoxInto(cMin, cMax);
//     const segMinX = Math.min(ax, bx),
//         segMaxX = Math.max(ax, bx);
//     const segMinY = Math.min(ay, by),
//         segMaxY = Math.max(ay, by);

//     if (cMax.x < segMinX || cMin.x > segMaxX || cMax.y < segMinY || cMin.y > segMaxY) return; // pas de chevauchement

//     // --- Étape 2 : critère de platitude
//     const flatness =
//         Math.abs(curve.x0 - 3 * curve.x1 + 3 * curve.x2 - curve.x3) +
//         Math.abs(curve.y0 - 3 * curve.y1 + 3 * curve.y2 - curve.y3);

//     if (flatness < 1e-3 || depth > 10) {
//         // Approxime la courbe par le segment [P0, P3]
//         const x1 = curve.x0,
//             y1 = curve.y0;
//         const x2 = curve.x3,
//             y2 = curve.y3;

//         const denom = (bx - ax) * (y2 - y1) - (by - ay) * (x2 - x1);
//         if (Math.abs(denom) < 1e-12) return; // segments parallèles

//         const ua = ((x2 - x1) * (ay - y1) - (y2 - y1) * (ax - x1)) / denom;
//         const ub = ((bx - ax) * (ay - y1) - (by - ay) * (ax - x1)) / denom;

//         if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
//             const t = t0 + (t1 - t0) * ub; // approx. paramètre Bézier
//             const p = new S2Vec2();
//             curve.getPointAtCasteljauInto(p, ub);
//             out.push({ t, x: p.x, y: p.y });
//         }
//         return;
//     }

//     // --- Étape 3 : subdivision récursive
//     const left = acquireCurve(),
//         right = acquireCurve();
//     curve.subdivideCasteljauInto(left, right, 0.5);

//     const mid = (t0 + t1) * 0.5;
//     intersectCubicSegment(left, ax, ay, bx, by, out, t0, mid, depth + 1);
//     intersectCubicSegment(right, ax, ay, bx, by, out, mid, t1, depth + 1);

//     releaseCurve(left);
//     releaseCurve(right);
// }

// /** Raffine un point d'intersection (Newton) */
// function newtonRefine(
//     c1: S2CubicCurveNew,
//     c2: S2CubicCurveNew,
//     t0: number,
//     s0: number,
//     tol = 1e-10,
//     maxIter = 20,
// ): BezierIntersection | null {
//     const P = new S2Vec2();
//     const Q = new S2Vec2();
//     const Ft = new S2Vec2();
//     const Fs = new S2Vec2();

//     let t = t0;
//     let s = s0;

//     for (let i = 0; i < maxIter; i++) {
//         evalPoint(c1, t, P);
//         evalPoint(c2, s, Q);
//         const Fx = P.x - Q.x;
//         const Fy = P.y - Q.y;
//         const err = Math.hypot(Fx, Fy);
//         if (err < tol) {
//             return { t, s, point: P.clone() };
//         }

//         evalTangent(c1, t, Ft);
//         evalTangent(c2, s, Fs);

//         // Jacobian: [Ft, -Fs]
//         const det = Ft.x * -Fs.y - Ft.y * -Fs.x;
//         if (Math.abs(det) < 1e-14) return null;

//         const inv00 = -Fs.y / det;
//         const inv01 = Fs.x / det;
//         const inv10 = Ft.y / det;
//         const inv11 = -Ft.x / det;

//         const dt = inv00 * -Fx + inv01 * -Fy;
//         const ds = inv10 * -Fx + inv11 * -Fy;

//         t += dt;
//         s += ds;

//         if (t < -1e-4 || t > 1.0001 || s < -1e-4 || s > 1.0001) return null;
//     }
//     return null;
// }
