import { S2MathUtils } from '../s2-math-utils';
import { S2Vec2 } from '../s2-vec2';
import type { S2CubicBezier } from './s2-cubic-curve';

export interface S2CurveLengthMapper {
    getLength(): number;
    getTFromLength(length: number): number;
    getTFromU(u: number): number;
    getUFromT(t: number): number;
    update(): void;
}

export abstract class S2BaseSamplerLengthMapper implements S2CurveLengthMapper {
    protected readonly sampleCount: number;
    protected readonly arcLengths: Float32Array;
    protected readonly sampleInputValues: Float32Array;
    protected length: number = 0;

    constructor(sampleCount: number = 8) {
        this.sampleCount = sampleCount;
        this.arcLengths = new Float32Array(this.sampleCount);
        this.sampleInputValues = new Float32Array(this.sampleCount);
        this.update();
    }

    abstract update(): void;

    getLength(): number {
        return this.length;
    }

    getTFromLength(targetLength: number): number {
        if (targetLength <= 0) return 0;
        if (targetLength >= this.length) return 1;

        const maxIndex = this.arcLengths.length - 1;
        let low = 0;
        let high = maxIndex;

        while (low < high) {
            const mid = Math.floor((low + high) / 2);
            const midLength = this.arcLengths[mid];
            if (midLength < targetLength) {
                low = mid + 1;
            } else if (midLength > targetLength) {
                high = mid - 1;
            } else {
                low = mid;
                break;
            }
        }

        if (this.arcLengths[low] > targetLength) {
            low--;
        }
        low = S2MathUtils.clamp(low, 0, maxIndex - 1);

        return S2MathUtils.remap(
            this.arcLengths[low],
            this.arcLengths[low + 1],
            low / maxIndex,
            (low + 1) / maxIndex,
            targetLength,
        );
    }

    getTFromU(u: number): number {
        return this.getTFromLength(u * this.length);
    }

    getUFromT(t: number): number {
        const maxIndex = this.arcLengths.length - 1;
        let low = 0;
        let high = maxIndex;

        while (low < high) {
            const mid = Math.floor((low + high) / 2);
            const midT = this.sampleInputValues[mid];
            if (midT < t) {
                low = mid + 1;
            } else if (midT > t) {
                high = mid - 1;
            } else {
                low = mid;
                break;
            }
        }
        if (this.sampleInputValues[low] > t) {
            low--;
        }
        low = S2MathUtils.clamp(low, 0, maxIndex - 1);

        return (
            S2MathUtils.remap(
                this.sampleInputValues[low],
                this.sampleInputValues[low + 1],
                this.arcLengths[low],
                this.arcLengths[low + 1],
                t,
            ) / this.length
        );
    }
}
//export class S2BezierLengthMapper implements S2CurveLengthMapper {}
//export class S2LineLengthMapper implements S2CurveLengthMapper {}
//export class S2CompositeCurveLengthMapper implements S2CurveLengthMapper {}

export class S2CurveSampler {
    protected readonly curve: S2CubicBezier;
    protected readonly sampleCount: number;
    protected readonly arcLengths: Float32Array;
    protected length: number = 0;

    constructor(curve: S2CubicBezier, sampleCount: number = 8) {
        this.curve = curve;
        this.sampleCount = sampleCount;
        this.arcLengths = new Float32Array(this.sampleCount);
        this.update();
    }

    update(): void {
        const prevPoint = _vec0;
        const currPoint = _vec1;
        this.curve.getPointInto(prevPoint, 0);
        this.arcLengths[0] = 0;

        for (let i = 1; i < this.sampleCount; i++) {
            this.curve.getPointInto(currPoint, i / (this.sampleCount - 1));
            this.arcLengths[i] = this.arcLengths[i - 1] + prevPoint.distance(currPoint);
            prevPoint.copy(currPoint);
        }

        this.length = this.arcLengths[this.sampleCount - 1];
    }

    getLength(): number {
        return this.length;
    }

    getTFromLength(targetLength: number): number {
        if (targetLength <= 0) return 0;
        if (targetLength >= this.length) return 1;

        const maxIndex = this.arcLengths.length - 1;
        let low = 0;
        let high = maxIndex;

        while (low < high) {
            const mid = Math.floor((low + high) / 2);
            const midLength = this.arcLengths[mid];
            if (midLength < targetLength) {
                low = mid + 1;
            } else if (midLength > targetLength) {
                high = mid - 1;
            } else {
                low = mid;
                break;
            }
        }

        if (this.arcLengths[low] > targetLength) {
            low--;
        }
        low = S2MathUtils.clamp(low, 0, maxIndex - 1);

        return S2MathUtils.remap(
            this.arcLengths[low],
            this.arcLengths[low + 1],
            low / maxIndex,
            (low + 1) / maxIndex,
            targetLength,
        );
    }

    getTFromU(u: number): number {
        return this.getTFromLength(u * this.length);
    }

    getUFromT(t: number): number {
        const maxIndex = this.arcLengths.length - 1;
        const index = S2MathUtils.clamp(Math.floor(t * maxIndex), 0, maxIndex - 1);

        const length = S2MathUtils.lerp(this.arcLengths[index], this.arcLengths[index + 1], t * maxIndex - index);

        return length / this.length;
    }
}

const _vec0 = new S2Vec2();
const _vec1 = new S2Vec2();
