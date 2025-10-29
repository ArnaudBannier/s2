import type { S2CurveLengthMapper } from './s2-curve-length-mapper';
import { S2MathUtils } from '../../s2-math-utils';

export abstract class S2SamplerLengthMapper implements S2CurveLengthMapper {
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
            this.sampleInputValues[low],
            this.sampleInputValues[low + 1],
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
