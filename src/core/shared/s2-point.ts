import type { S2HasClone, S2HasCopy, S2HasLerp } from './s2-base-type';
import type { S2Space } from '../math/s2-space';
import { S2BaseType } from './s2-base-type';
import { S2Vec2 } from '../math/s2-vec2';

export class S2Point extends S2BaseType implements S2HasClone<S2Point>, S2HasCopy<S2Point>, S2HasLerp<S2Point> {
    readonly kind = 'position' as const;
    public value: S2Vec2;
    public space: S2Space;

    constructor(x: number, y: number, space: S2Space, locked: boolean = false) {
        super();
        this.value = new S2Vec2(x, y);
        this.space = space;
        this.locked = locked;
    }

    clone(): S2Point {
        return new S2Point(this.value.x, this.value.y, this.space, this.locked);
    }

    copyIfUnlocked(other: S2Point): this {
        if (this.locked) return this;
        return this.copy(other);
    }

    copy(other: S2Point): this {
        if (S2Vec2.equalsV(this.value, other.value) && this.space === other.space) return this;
        this.value.copy(other.value);
        this.space = other.space;
        this.markDirty();
        return this;
    }

    lerp(state0: S2Point, state1: S2Point, t: number): this {
        const space = state1.space;
        const value0 = state0.get(space);
        const value1 = state1.get(space);
        this.setV(S2Vec2.lerpV(value0, value1, t), space);
        return this;
    }

    static lerp(state0: S2Point, state1: S2Point, t: number): S2Point {
        return new S2Point(0, 0, state1.space).lerp(state0, state1, t);
    }

    set(x: number = 0, y: number = 0, space?: S2Space): this {
        if (this.value.x === x && this.value.y === y && this.space === space) return this;
        this.value.set(x, y);
        if (space) this.space = space;
        this.markDirty();
        return this;
    }

    setV(point: S2Vec2, space?: S2Space): this {
        if (S2Vec2.equalsV(this.value, point) && this.space === space) return this;
        this.value.copy(point);
        if (space) this.space = space;
        this.markDirty();
        return this;
    }

    setValueFromSpace(x: number, y: number, space: S2Space): this {
        if (S2Vec2.equals(this.value.x, this.value.y, x, y) && this.space === space) return this;
        space.convertPointInto(this.value, x, y, this.space);
        this.markDirty();
        return this;
    }

    setValueFromSpaceV(point: S2Vec2, space: S2Space): this {
        return this.setValueFromSpace(point.x, point.y, space);
    }

    get(space: S2Space): S2Vec2 {
        const out = new S2Vec2();
        this.space.convertPointIntoV(out, this.value, space);
        return out;
    }

    getInto(dst: S2Vec2, space: S2Space): this {
        this.space.convertPointIntoV(dst, this.value, space);
        return this;
    }

    changeSpace(space: S2Space): this {
        if (this.space === space) return this;
        this.space.convertPointIntoV(this.value, this.value, space);
        this.space = space;
        // No markDirty() because the point value did not change
        return this;
    }
}
