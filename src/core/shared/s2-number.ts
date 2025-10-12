import type { S2HasClone, S2HasCopy, S2HasLerp } from './s2-base-type';
import { S2BaseType } from './s2-base-type';
import { S2MathUtils } from '../math/s2-math-utils';

export class S2Number extends S2BaseType implements S2HasClone<S2Number>, S2HasCopy<S2Number>, S2HasLerp<S2Number> {
    readonly kind = 'number' as const;
    public value: number;

    constructor(value: number, locked: boolean = false) {
        super();
        this.value = value;
        this.locked = locked;
    }

    clone(): S2Number {
        return new S2Number(this.value, this.locked);
    }

    copyIfUnlocked(other: S2Number): this {
        if (this.locked) return this;
        return this.copy(other);
    }

    copy(other: S2Number): this {
        if (this.value === other.value) return this;
        this.value = other.value;
        this.markDirty();
        return this;
    }

    lerp(state0: S2Number, state1: S2Number, t: number): this {
        const value0 = state0.get();
        const value1 = state1.get();
        this.set(S2MathUtils.lerp(value0, value1, t));
        return this;
    }

    static lerp(state0: S2Number, state1: S2Number, t: number): S2Number {
        return new S2Number(0).lerp(state0, state1, t);
    }

    set(value: number): this {
        if (this.value === value) return this;
        this.value = value;
        this.markDirty();
        return this;
    }

    get(): number {
        return this.value;
    }

    toFixed(precision: number = 2): string {
        return this.value.toFixed(precision);
    }
}
