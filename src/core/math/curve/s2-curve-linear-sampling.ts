import { S2MathUtils } from '../s2-math-utils';
import { S2Vec2 } from '../s2-vec2';
import type { S2CubicBezier } from './s2-cubic-curve';

export class S2CurveLinearSampling {
    protected readonly curve: S2CubicBezier;
    protected readonly sampleCount: number;
    protected readonly cumulativeLength: Float32Array;
    protected length: number = 0;

    constructor(curve: S2CubicBezier, sampleCount: number = 8) {
        this.curve = curve;
        this.sampleCount = sampleCount;
        this.cumulativeLength = new Float32Array(this.sampleCount);
        this.update();
    }

    update(): void {
        const prevPoint = _vec0;
        const currPoint = _vec1;
        this.curve.getPointAtInto(prevPoint, 0);
        this.cumulativeLength[0] = 0;

        for (let i = 1; i < this.sampleCount; i++) {
            this.curve.getPointAtInto(currPoint, i / (this.sampleCount - 1));
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
