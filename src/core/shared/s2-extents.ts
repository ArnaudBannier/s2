import type { S2HasClone, S2HasCopy, S2HasLerp } from './s2-base-type';
import type { S2Space } from '../math/s2-space';
import { S2BaseType } from './s2-base-type';
import { S2Vec2 } from '../math/s2-vec2';

export class S2Extents extends S2BaseType implements S2HasClone<S2Extents>, S2HasCopy<S2Extents>, S2HasLerp<S2Extents> {
    readonly kind = 'extents' as const;
    public value: S2Vec2;
    public space: S2Space;

    constructor(x: number, y: number, space: S2Space, locked: boolean = false) {
        super();
        this.value = new S2Vec2(x, y);
        this.space = space;
        this.locked = locked;
    }

    clone(): S2Extents {
        return new S2Extents(this.value.x, this.value.y, this.space, this.locked);
    }

    copyIfUnlocked(other: S2Extents): this {
        if (this.locked) return this;
        return this.copy(other);
    }

    copy(other: S2Extents): this {
        if (S2Vec2.eqV(this.value, other.value) && this.space === other.space) return this;
        this.value.copy(other.value);
        this.space = other.space;
        this.markDirty();
        return this;
    }

    lerp(state0: S2Extents, state1: S2Extents, t: number): this {
        const space = state1.space;
        const value0 = state0.get(space);
        const value1 = state1.get(space);
        this.setV(S2Vec2.lerpV(value0, value1, t), space);
        return this;
    }

    static lerp(state0: S2Extents, state1: S2Extents, t: number): S2Extents {
        return new S2Extents(0, 0, state1.space).lerp(state0, state1, t);
    }

    set(x: number, y: number, space?: S2Space): this {
        if (this.value.x === x && this.value.y === y && this.space === space) return this;
        this.value.set(x, y);
        if (space) this.space = space;
        this.markDirty();
        return this;
    }

    setV(extents: S2Vec2, space?: S2Space): this {
        if (S2Vec2.eqV(this.value, extents) && this.space === space) return this;
        this.value.copy(extents);
        if (space) this.space = space;
        this.markDirty();
        return this;
    }

    setValueFromSpace(x: number, y: number, space: S2Space): this {
        if (S2Vec2.eq(this.value.x, this.value.y, x, y) && this.space === space) return this;
        space.convertExtents(x, y, this.space, this.value);
        this.markDirty();
        return this;
    }

    setValueFromSpaceV(extents: S2Vec2, space: S2Space): this {
        return this.setValueFromSpace(extents.x, extents.y, space);
    }

    get(space: S2Space, out?: S2Vec2): S2Vec2 {
        return this.space.convertExtentsV(this.value, space, out);
    }

    changeSpace(space: S2Space): this {
        if (this.space === space) return this;
        this.space.convertExtentsV(this.value, space, this.value);
        this.space = space;
        // No markDirty() because the point value did not change
        return this;
    }
}
