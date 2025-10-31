import type { S2CubicCurve } from '../s2-cubic-curve';
import { S2Vec2 } from '../../s2-vec2';
import { S2SamplerLengthMapper } from './s2-sampler-length-mapper';

export class S2BezierLengthMapper extends S2SamplerLengthMapper {
    protected readonly curve: S2CubicCurve;

    constructor(curve: S2CubicCurve, sampleCount: number = 8) {
        super(sampleCount);
        this.curve = curve;
        this.update();
    }

    update(): void {
        const prevPoint = _vec0;
        const currPoint = _vec1;
        this.curve.getPointInto(prevPoint, 0);
        this.arcLengths[0] = 0;
        this.sampleInputValues[0] = 0;

        let currLength = 0;
        for (let i = 1; i < this.sampleCount; i++) {
            const t = i / (this.sampleCount - 1);
            this.sampleInputValues[i] = t;
            this.curve.getPointInto(currPoint, t);
            currLength += prevPoint.distance(currPoint);
            this.arcLengths[i] = currLength;
            prevPoint.copy(currPoint);
        }

        this.length = currLength;
    }
}

const _vec0 = new S2Vec2();
const _vec1 = new S2Vec2();
