import type { S2Vec2 } from '../s2-vec2';

export interface S2Curve {
    getStartInto(dst: S2Vec2): this;
    getEndInto(dst: S2Vec2): this;
    getStartTangentInto(dst: S2Vec2): this;
    getEndTangentInto(dst: S2Vec2): this;
    getPointInto(dst: S2Vec2, t: number): this;
    getTangentInto(dst: S2Vec2, t: number): this;
    getBoundingBoxInto(dstLower: S2Vec2, dstUpper: S2Vec2): this;
}

export interface S2SubdividableCurve<T extends S2Curve> {
    subdivideLowerInto(dst: T, t: number): this;
    subdivideUpperInto(dst: T, t: number): this;
    subdivideAtInto(dstLower: T | null, dstUpper: T | null, t: number): this;
    subdivideInto(dst: T, t0: number, t1: number): this;
}
