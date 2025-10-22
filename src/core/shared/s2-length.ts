import type { S2HasClone, S2HasCopy, S2HasLerp } from './s2-base-type';
import type { S2Space } from '../math/s2-space';
import { S2BaseType } from './s2-base-type';
import { S2MathUtils } from '../math/s2-math-utils';

export class S2Length extends S2BaseType implements S2HasClone<S2Length>, S2HasCopy<S2Length>, S2HasLerp<S2Length> {
    readonly kind = 'length' as const;
    public value: number;
    public space: S2Space;

    constructor(value: number = 0, space: S2Space, locked: boolean = false) {
        super();
        this.value = value;
        this.space = space;
        this.locked = locked;
    }

    clone(): S2Length {
        return new S2Length(this.value, this.space, this.locked);
    }

    copyIfUnlocked(other: S2Length): this {
        if (this.locked) return this;
        return this.copy(other);
    }

    copy(other: S2Length): this {
        if (this.value === other.value && this.space === other.space) return this;
        this.value = other.value;
        this.space = other.space;
        this.markDirty();
        return this;
    }

    lerp(state0: S2Length, state1: S2Length, t: number): this {
        const space = state1.space;
        const value0 = state0.get(space);
        const value1 = state1.get(space);
        this.set(S2MathUtils.lerp(value0, value1, t), space);
        return this;
    }

    static lerp(state0: S2Length, state1: S2Length, t: number): S2Length {
        return new S2Length(0, state1.space).lerp(state0, state1, t);
    }

    set(value: number, space?: S2Space): this {
        if (this.value === value && this.space === space) return this;
        this.value = value;
        if (space) this.space = space;
        this.markDirty();
        return this;
    }

    setValueFromSpace(value: number, space: S2Space): this {
        if (this.value === value && this.space === space) return this;
        this.value = space.convertLength(value, this.space);
        this.markDirty();
        return this;
    }

    get(space: S2Space): number {
        return this.space.convertLength(this.value, space);
    }

    changeSpace(space: S2Space): this {
        if (this.space === space) return this;
        this.value = this.space.convertLength(this.value, space);
        this.space = space;
        // No markDirty() because the point value did not change
        return this;
    }
}
