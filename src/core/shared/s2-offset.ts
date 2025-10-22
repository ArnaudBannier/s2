import type { S2HasClone, S2HasCopy, S2HasLerp } from './s2-base-type';
import { S2BaseType } from './s2-base-type';
import { S2Vec2 } from '../math/s2-vec2';
import type { S2AbstractSpace } from '../math/s2-abstract-space';

export class S2Offset extends S2BaseType implements S2HasClone<S2Offset>, S2HasCopy<S2Offset>, S2HasLerp<S2Offset> {
    readonly kind = 'direction' as const;
    public value: S2Vec2;
    public space: S2AbstractSpace;

    constructor(x: number, y: number, space: S2AbstractSpace, locked: boolean = false) {
        super();
        this.value = new S2Vec2(x, y);
        this.space = space;
        this.locked = locked;
    }

    clone(): S2Offset {
        return new S2Offset(this.value.x, this.value.y, this.space, this.locked);
    }

    copyIfUnlocked(other: S2Offset): this {
        if (this.locked) return this;
        return this.copy(other);
    }

    copy(other: S2Offset): this {
        if (S2Vec2.eqV(this.value, other.value) && this.space === other.space) return this;
        this.value.copy(other.value);
        this.space = other.space;
        this.markDirty();
        return this;
    }

    lerp(state0: S2Offset, state1: S2Offset, t: number): this {
        const space = state1.space;
        const value0 = state0.get(space);
        const value1 = state1.get(space);
        this.setV(S2Vec2.lerpV(value0, value1, t), space);
        return this;
    }

    static lerp(state0: S2Offset, state1: S2Offset, t: number): S2Offset {
        return new S2Offset(0, 0, state1.space).lerp(state0, state1, t);
    }

    set(x: number = 0, y: number = 0, space?: S2AbstractSpace): this {
        if (this.value.x === x && this.value.y === y && this.space === space) return this;
        this.value.set(x, y);
        if (space) this.space = space;
        this.markDirty();
        return this;
    }

    setV(offset: S2Vec2, space?: S2AbstractSpace): this {
        if (S2Vec2.eqV(this.value, offset) && this.space === space) return this;
        this.value.copy(offset);
        if (space) this.space = space;
        this.markDirty();
        return this;
    }

    setValueFromSpace(x: number, y: number, space: S2AbstractSpace): this {
        if (S2Vec2.eq(this.value.x, this.value.y, x, y) && this.space === space) return this;
        space.convertOffset(x, y, this.space, this.value);
        this.markDirty();
        return this;
    }

    setValueFromSpaceV(offset: S2Vec2, space: S2AbstractSpace): this {
        return this.setValueFromSpace(offset.x, offset.y, space);
    }

    get(space: S2AbstractSpace, out?: S2Vec2): S2Vec2 {
        return this.space.convertOffsetV(this.value, space, out);
    }

    changeSpace(space: S2AbstractSpace): this {
        if (this.space === space) return this;
        this.space.convertOffsetV(this.value, space, this.value);
        this.space = space;
        // No markDirty() because the point value did not change
        return this;
    }
}
