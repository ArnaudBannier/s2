import type { S2HasClone, S2HasCopy, S2HasLerpWithCamera } from './s2-base-type';
import { S2BaseType } from './s2-base-type';
import { S2Mat2x3 } from '../math/s2-mat2x3';

export class S2Transform
    extends S2BaseType
    implements S2HasClone<S2Transform>, S2HasCopy<S2Transform>, S2HasLerpWithCamera<S2Transform>
{
    readonly kind = 'transform' as const;
    public value: S2Mat2x3;

    constructor(
        a00: number = 1,
        a01: number = 0,
        a02: number = 0,
        a10: number = 0,
        a11: number = 1,
        a12: number = 0,
        locked: boolean = false,
    ) {
        super();
        this.value = new S2Mat2x3(a00, a01, a02, a10, a11, a12);
        this.locked = locked;
    }

    clone(): S2Transform {
        const t = new S2Transform(
            this.value.elements[0],
            this.value.elements[1],
            this.value.elements[2],
            this.value.elements[3],
            this.value.elements[4],
            this.value.elements[5],
            this.locked,
        );
        return t;
    }

    copyIfUnlocked(other: S2Transform): this {
        if (this.locked) return this;
        return this.copy(other);
    }

    copy(other: S2Transform): this {
        if (S2Mat2x3.eq(this.value, other.value)) return this;
        this.value.copy(other.value);
        this.markDirty();
        return this;
    }

    lerp(state0: S2Transform, state1: S2Transform, t: number): this {
        const value0 = state0.get();
        const value1 = state1.get();
        this.set(S2Mat2x3.lerp(value0, value1, t));
        return this;
    }

    static lerp(state0: S2Transform, state1: S2Transform, t: number): S2Transform {
        return new S2Transform().lerp(state0, state1, t);
    }

    set(value: S2Mat2x3): this {
        if (S2Mat2x3.eq(this.value, value)) return this;
        this.value.copy(value);
        this.markDirty();
        return this;
    }

    get(): S2Mat2x3 {
        return this.value;
    }

    toFixed(precision: number = 2): string {
        return 'matrix(' + this.value.elements.map((v) => v.toFixed(precision)).join(', ') + ')';
    }
}
