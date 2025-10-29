import { S2MathUtils } from '../../s2-math-utils';
import { S2Vec2 } from '../../s2-vec2';
import type { S2LineCurve } from '../s2-line-curve';
import type { S2CurveLengthMapper } from './s2-curve-length-mapper';

export class S2LineLengthMapper implements S2CurveLengthMapper {
    protected readonly curve: S2LineCurve;
    protected length: number = 0;

    constructor(curve: S2LineCurve) {
        this.curve = curve;
    }

    update(): void {
        const start = _vec0;
        const end = _vec1;
        this.curve.getStartInto(start);
        this.curve.getEndInto(end);
        this.length = start.distance(end);
    }

    getLength(): number {
        return this.length;
    }

    getTFromLength(length: number): number {
        if (this.length === 0) return 0;
        return S2MathUtils.clamp(length / this.length, 0, 1);
    }

    getTFromU(u: number): number {
        return S2MathUtils.clamp(u, 0, 1);
    }

    getUFromT(t: number): number {
        return S2MathUtils.clamp(t, 0, 1);
    }
}

const _vec0 = new S2Vec2();
const _vec1 = new S2Vec2();
