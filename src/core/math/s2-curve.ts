import { S2Vec2 } from './s2-vec2';
import { invLerp, lerp, remap } from './s2-utils';

interface S2Curve {
    getStart(): S2Vec2;
    getEnd(): S2Vec2;
    getPointAt(t: number): S2Vec2;
    getTangentAt(t: number): S2Vec2;
    getStartTangent(): S2Vec2;
    getEndTangent(): S2Vec2;
    createPartialCurveTo(t: number): S2Curve;
    createPartialCurveFrom(t: number): S2Curve;
    createPartialCurveRange(from: number, to: number): S2Curve;
    getLength(): number;
    clone(): S2Curve;
}

export class S2PolyCurve implements S2Curve {
    protected curves: S2Curve[] = [];
    protected length: number = 0;
    protected cumulativeLengths: number[] = [];
    constructor() {}

    clone(): S2PolyCurve {
        const polyCurve = new S2PolyCurve();
        for (const curve of this.curves) {
            polyCurve.curves.push(curve.clone());
        }
        polyCurve.length = this.length;
        polyCurve.cumulativeLengths = this.cumulativeLengths.slice();
        return polyCurve;
    }

    clear(): this {
        this.curves.length = 0;
        this.length = 0;
        this.cumulativeLengths.length = 0;
        return this;
    }

    getCurve(index: number): S2Curve {
        return this.curves[index];
    }

    getCurveCount(): number {
        return this.curves.length;
    }

    getLastCurve(): S2Curve {
        return this.curves[this.curves.length - 1];
    }

    getCurveParam(t: number): { index: number; t: number } {
        const targetLength = t * this.length;
        for (let i = 0; i < this.cumulativeLengths.length; i++) {
            const cumule = this.cumulativeLengths[i];
            if (targetLength < cumule)
                return {
                    index: i,
                    t: invLerp(cumule - this.curves[i].getLength(), cumule, targetLength),
                };
        }
        return { index: this.curves.length - 1, t: 1.0 };
    }

    getStart(): S2Vec2 {
        return this.curves[0].getStart();
    }

    getEnd(): S2Vec2 {
        return this.curves[this.curves.length].getEnd();
    }

    getStartTangent(): S2Vec2 {
        return this.curves[0].getStartTangent();
    }

    getEndTangent(): S2Vec2 {
        return this.curves[this.curves.length - 1].getEndTangent();
    }

    updateLength(): this {
        this.cumulativeLengths.length = 0;
        this.length = 0;
        for (let i = 0; i < this.curves.length; i++) {
            this.length += this.curves[i].getLength();
            this.cumulativeLengths.push(this.length);
        }
        return this;
    }

    addLine(p0: S2Vec2, p1: S2Vec2): S2LineCurve {
        const curve = new S2LineCurve(p0, p1);
        this.length += curve.getLength();
        this.curves.push(curve);
        return curve;
    }

    addQuadratic(p0: S2Vec2, p1: S2Vec2, p2: S2Vec2, sampleCount: number = 0): S2QuadraticCurve {
        const curve = new S2QuadraticCurve(p0, p1, p2).computeLinearLUT(sampleCount);
        if (sampleCount > 0) curve.computeLinearLUT(sampleCount);
        this.length += curve.getLength();
        this.curves.push(curve);
        return curve;
    }

    addCubic(p0: S2Vec2, p1: S2Vec2, p2: S2Vec2, p3: S2Vec2, sampleCount: number = 0): S2CubicCurve {
        const curve = new S2CubicCurve(p0, p1, p2, p3);
        if (sampleCount > 0) curve.computeLinearLUT(sampleCount);
        this.length += curve.getLength();
        this.curves.push(curve);
        return curve;
    }

    getPointAt(t: number): S2Vec2 {
        if (this.curves.length === 0) return new S2Vec2(0, 0);
        const curveParam = this.getCurveParam(t);
        return this.curves[curveParam.index].getPointAt(curveParam.t);
    }

    getTangentAt(t: number): S2Vec2 {
        if (this.curves.length === 0) return new S2Vec2(0, 0);
        const curveParam = this.getCurveParam(t);
        return this.curves[curveParam.index].getTangentAt(curveParam.t);
    }

    createPartialCurveTo(t: number): S2PolyCurve {
        const partial = new S2PolyCurve();
        if (this.curves.length === 0) return partial;
        const curveParam = this.getCurveParam(t);
        for (let i = 0; i < curveParam.index; i++) {
            partial.curves.push(this.curves[i].clone());
        }
        partial.curves.push(this.curves[curveParam.index].createPartialCurveTo(curveParam.t));
        partial.updateLength();
        return partial;
    }

    createPartialCurveFrom(t: number): S2PolyCurve {
        const partial = new S2PolyCurve();
        if (this.curves.length === 0) return partial;
        const curveParam = this.getCurveParam(t);
        partial.curves.push(this.curves[curveParam.index].createPartialCurveFrom(curveParam.t));
        for (let i = curveParam.index + 1; i < this.curves.length; i++) {
            partial.curves.push(this.curves[i].clone());
        }
        partial.updateLength();
        return partial;
    }

    createPartialCurveRange(from: number, to: number): S2PolyCurve {
        const partial = new S2PolyCurve();
        if (this.curves.length === 0 || from >= to) return partial;
        const curveParamF = this.getCurveParam(from);
        const curveParamT = this.getCurveParam(to);
        if (curveParamF.index == curveParamT.index) {
            partial.curves.push(this.curves[curveParamF.index].createPartialCurveRange(curveParamF.t, curveParamT.t));
        } else {
            partial.curves.push(this.curves[curveParamF.index].createPartialCurveFrom(curveParamF.t));
            for (let i = curveParamF.index + 1; i < curveParamT.index; i++) {
                partial.curves.push(this.curves[i].clone());
            }
            partial.curves.push(this.curves[curveParamT.index].createPartialCurveTo(curveParamT.t));
        }
        partial.updateLength();
        return partial;
    }

    getLength(): number {
        return this.length;
    }
}

export class S2LineCurve implements S2Curve {
    public p0: S2Vec2;
    public p1: S2Vec2;
    protected length: number;

    constructor(p0: S2Vec2, p1: S2Vec2) {
        this.p0 = p0.clone();
        this.p1 = p1.clone();
        this.length = this.p0.distance(this.p1);
    }

    getTangentAt(t: number): S2Vec2 {
        void t;
        return S2Vec2.sub(this.p1, this.p0);
    }

    getStartTangent(): S2Vec2 {
        return S2Vec2.sub(this.p1, this.p0);
    }

    getEndTangent(): S2Vec2 {
        return S2Vec2.sub(this.p1, this.p0);
    }

    clone(): S2Curve {
        return new S2LineCurve(this.p0, this.p1);
    }

    getLength(): number {
        return this.length;
    }

    getStart(): S2Vec2 {
        return this.p0.clone();
    }

    getEnd(): S2Vec2 {
        return this.p1.clone();
    }

    getPointAt(t: number): S2Vec2 {
        return S2Vec2.lerp(this.p0, this.p1, t);
    }

    createPartialCurveTo(t: number): S2LineCurve {
        return new S2LineCurve(this.p0, this.getPointAt(t));
    }

    createPartialCurveFrom(t: number): S2LineCurve {
        return new S2LineCurve(this.getPointAt(t), this.p1);
    }

    createPartialCurveRange(from: number, to: number): S2LineCurve {
        return new S2LineCurve(this.getPointAt(from), this.getPointAt(to));
    }
}

abstract class S2BezierCurve {
    protected points: S2Vec2[] = [];
    protected linearLUT: number[] | null = null;
    protected sampleCount: number = 0;
    protected length: number = 0;

    getLength(): number {
        return this.length;
    }

    linearize(t: number): number {
        if (this.linearLUT === null) return t;
        const realIndex = t * (this.sampleCount + 0);
        const index = Math.floor(realIndex);
        if (index < 0) return 0;
        if (index >= this.linearLUT.length - 1) return 1;
        return lerp(this.linearLUT[index], this.linearLUT[index + 1], realIndex - index);
    }

    computeLinearLUT(sampleCount: number = 8): this {
        const progress: number[] = [0];
        let prevPoint = this.getPointAtCasteljau(0);
        let length = 0;
        for (let i = 1; i <= sampleCount; i++) {
            const currPoint = this.getPointAtCasteljau(i / sampleCount);
            length += prevPoint.distance(currPoint);
            progress.push(length);
            prevPoint = currPoint;
        }
        this.length = length;
        this.sampleCount = sampleCount;
        progress.forEach((val, i, array) => {
            array[i] = val / length;
        });

        this.linearLUT = [0];
        let index = 1;
        for (let i = 1; i <= sampleCount; i++) {
            const t = i / sampleCount;
            while (progress[index] < t && index < progress.length - 1) index++;
            this.linearLUT.push(
                remap(progress[index - 1], progress[index], (index - 1) / sampleCount, index / sampleCount, t),
            );
        }
        return this;
    }

    getPointAt(t: number): S2Vec2 {
        return this.getPointAtCasteljau(this.linearize(t));
    }

    getBezierPoint(index: number): S2Vec2 {
        return this.points[index];
    }

    getBezierPoints(): S2Vec2[] {
        return this.points.map((value) => value.clone());
    }

    abstract getPointAtCasteljau(t: number): S2Vec2;
    abstract getTangentAtCasteljau(t: number): S2Vec2;
    abstract reduceToCasteljau(t: number): S2BezierCurve;
    abstract reduceFromCasteljau(t: number): S2BezierCurve;
    abstract makePartialCasteljau(from: number, to: number): S2BezierCurve;
}

export class S2QuadraticCurve extends S2BezierCurve implements S2Curve {
    constructor(p0: S2Vec2, p1: S2Vec2, p2: S2Vec2) {
        super();
        this.points.push(p0.clone());
        this.points.push(p1.clone());
        this.points.push(p2.clone());
        this.length = p0.distance(p2);
    }

    clone(): S2QuadraticCurve {
        const p = this.points;
        const curve = new S2QuadraticCurve(p[0], p[1], p[2]);
        if (this.linearLUT) {
            curve.linearLUT = this.linearLUT.slice();
            curve.length = this.length;
            curve.sampleCount = this.sampleCount;
        }
        return curve;
    }

    getStart(): S2Vec2 {
        return this.points[0].clone();
    }

    getEnd(): S2Vec2 {
        return this.points[2].clone();
    }

    getPointAtCasteljau(t: number): S2Vec2 {
        const p = this.points;
        const s = 1 - t;
        const c0 = s * s;
        const c1 = s * t * 2;
        const c2 = t * t;
        return new S2Vec2(c0 * p[0].x + c1 * p[1].x + c2 * p[2].x, c0 * p[0].y + c1 * p[1].y + c2 * p[2].y);
    }

    getTangentAtCasteljau(t: number): S2Vec2 {
        const p = this.points;
        return new S2Vec2(
            (1 - t) * (p[1].x - p[0].x) + t * (p[2].x - p[1].x),
            (1 - t) * (p[1].y - p[0].y) + t * (p[2].y - p[1].y),
        );
    }

    getTangentAt(t: number): S2Vec2 {
        return this.getTangentAtCasteljau(this.linearize(t));
    }

    getStartTangent(): S2Vec2 {
        return S2Vec2.sub(this.points[1], this.points[0]);
    }

    getEndTangent(): S2Vec2 {
        return S2Vec2.sub(this.points[2], this.points[1]);
    }

    reduceToCasteljau(t: number): S2QuadraticCurve {
        const q0 = S2Vec2.lerp(this.points[0], this.points[1], t);
        const q1 = S2Vec2.lerp(this.points[1], this.points[2], t);
        const r0 = S2Vec2.lerp(q0, q1, t);
        return new S2QuadraticCurve(this.points[0], q0, r0);
    }

    createPartialCurveTo(t: number): S2QuadraticCurve {
        return this.reduceToCasteljau(this.linearize(t));
    }

    reduceFromCasteljau(t: number): S2QuadraticCurve {
        const q0 = S2Vec2.lerp(this.points[0], this.points[1], t);
        const q1 = S2Vec2.lerp(this.points[1], this.points[2], t);
        const r0 = S2Vec2.lerp(q0, q1, t);
        return new S2QuadraticCurve(r0, q1, this.points[2]);
    }

    createPartialCurveFrom(t: number): S2QuadraticCurve {
        return this.reduceFromCasteljau(this.linearize(t));
    }

    makePartialCasteljau(from: number, to: number): S2QuadraticCurve {
        return this.reduceToCasteljau(to).reduceFromCasteljau(from / to);
    }

    createPartialCurveRange(from: number, to: number): S2QuadraticCurve {
        to = this.linearize(to);
        from = this.linearize(from);
        return this.reduceToCasteljau(to).reduceFromCasteljau(from / to);
    }
}

export class S2CubicCurve extends S2BezierCurve implements S2Curve {
    constructor(p0: S2Vec2, p1: S2Vec2, p2: S2Vec2, p3: S2Vec2) {
        super();
        this.points.push(p0.clone());
        this.points.push(p1.clone());
        this.points.push(p2.clone());
        this.points.push(p3.clone());
        this.length = p0.distance(p3);
    }

    clone(): S2CubicCurve {
        const p = this.points;
        const cubicCurve = new S2CubicCurve(p[0], p[1], p[2], p[3]);
        if (this.linearLUT) {
            cubicCurve.linearLUT = this.linearLUT.slice();
            cubicCurve.length = this.length;
            cubicCurve.sampleCount = this.sampleCount;
        }
        return cubicCurve;
    }

    getStart(): S2Vec2 {
        return this.points[0].clone();
    }

    getEnd(): S2Vec2 {
        return this.points[3].clone();
    }

    getPointAtCasteljau(t: number): S2Vec2 {
        const p = this.points;
        const s = 1 - t;
        const c0 = s * s * s;
        const c1 = s * s * t * 3;
        const c2 = s * t * t * 3;
        const c3 = t * t * t;
        return new S2Vec2(
            c0 * p[0].x + c1 * p[1].x + c2 * p[2].x + c3 * p[3].x,
            c0 * p[0].y + c1 * p[1].y + c2 * p[2].y + c3 * p[3].y,
        );
    }

    getTangentAtCasteljau(t: number): S2Vec2 {
        const p = this.points;
        const s = 1 - t;
        const c0 = s * s;
        const c1 = s * t * 2;
        const c2 = t * t;
        return new S2Vec2(
            c0 * (p[1].x - p[0].x) + c1 * (p[2].x - p[1].x) + c2 * (p[3].x - p[2].x),
            c0 * (p[1].y - p[0].y) + c1 * (p[2].y - p[1].y) + c2 * (p[3].y - p[2].y),
        );
    }

    getTangentAt(t: number): S2Vec2 {
        return this.getTangentAtCasteljau(this.linearize(t));
    }

    getStartTangent(): S2Vec2 {
        return S2Vec2.sub(this.points[1], this.points[0]);
    }

    getEndTangent(): S2Vec2 {
        return S2Vec2.sub(this.points[3], this.points[2]);
    }

    reduceToCasteljau(t: number): S2CubicCurve {
        const q0 = S2Vec2.lerp(this.points[0], this.points[1], t);
        const q1 = S2Vec2.lerp(this.points[1], this.points[2], t);
        const q2 = S2Vec2.lerp(this.points[2], this.points[3], t);
        const r0 = S2Vec2.lerp(q0, q1, t);
        const r1 = S2Vec2.lerp(q1, q2, t);
        const s0 = S2Vec2.lerp(r0, r1, t);
        return new S2CubicCurve(this.points[0], q0, r0, s0);
    }

    createPartialCurveTo(t: number): S2CubicCurve {
        return this.reduceToCasteljau(this.linearize(t));
    }

    reduceFromCasteljau(t: number): S2CubicCurve {
        const q0 = S2Vec2.lerp(this.points[0], this.points[1], t);
        const q1 = S2Vec2.lerp(this.points[1], this.points[2], t);
        const q2 = S2Vec2.lerp(this.points[2], this.points[3], t);
        const r0 = S2Vec2.lerp(q0, q1, t);
        const r1 = S2Vec2.lerp(q1, q2, t);
        const s0 = S2Vec2.lerp(r0, r1, t);
        return new S2CubicCurve(s0, r1, q2, this.points[3]);
    }

    createPartialCurveFrom(t: number): S2CubicCurve {
        return this.reduceFromCasteljau(this.linearize(t));
    }

    makePartialCasteljau(from: number, to: number): S2CubicCurve {
        return this.reduceToCasteljau(to).reduceFromCasteljau(from / to);
    }

    createPartialCurveRange(from: number, to: number): S2CubicCurve {
        to = this.linearize(to);
        from = this.linearize(from);
        return this.reduceToCasteljau(to).reduceFromCasteljau(from / to);
    }
}

// aabbOverlap(lower1: Vector2, upper1: Vector2, lower2: Vector2, upper2: Vector2): boolean {
//     const d1x = lower2.x - upper1.x;
//     const d1y = lower2.y - upper1.y;
//     const d2x = lower1.x - upper2.x;
//     const d2y = lower1.y - upper2.y;
//     if (d1x > 0.0 || d1y > 0.0) return false;
//     if (d2x > 0.0 || d2y > 0.0) return false;
//     return true;
// }

// private getRoots(a: number, b: number, c: number, roots: number[]): void {
//     // Solve at^2 + bt + c = 0 in [0,1]
//     const discriminant = b * b - 4 * a * c;
//     if (Math.abs(a) < 1e-8) {
//         if (Math.abs(b) > 1e-8) {
//             const t = -c / b;
//             if (t >= 0 && t <= 1) roots.push(t);
//         }
//     } else if (discriminant >= 0) {
//         const sqrtD = Math.sqrt(discriminant);
//         const t1 = (-b + sqrtD) / (2 * a);
//         const t2 = (-b - sqrtD) / (2 * a);
//         if (0 <= t1 && t1 <= 1) roots.push(t1);
//         if (0 <= t2 && t2 <= 1) roots.push(t2);
//     }
// };

// getAABB(): void {
//     const aX = -this.p0.x + 3 * this.p1.x - 3 * this.p2.x + this.p3.x;
//     const bX = 2 * this.p0.x - 4 * this.p1.x + 2 * this.p2.x;
//     const cX = this.p1.x - this.p0.x;

//     const tValues: number[] = [];
//     this.getRoots(aX, bX, cX, tValues);
// }
