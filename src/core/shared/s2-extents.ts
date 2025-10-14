import type { S2Camera, S2Space } from '../math/s2-camera';
import type { S2HasClone, S2HasCopy, S2HasLerpWithCamera } from './s2-base-type';
import { S2BaseType } from './s2-base-type';
import { S2Vec2 } from '../math/s2-vec2';

export class S2Extents
    extends S2BaseType
    implements S2HasClone<S2Extents>, S2HasCopy<S2Extents>, S2HasLerpWithCamera<S2Extents>
{
    readonly kind = 'extents' as const;
    public value: S2Vec2;
    public space: S2Space;

    constructor(x: number = 0, y: number = 0, space: S2Space = 'world', locked: boolean = false) {
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
        if (S2Vec2.eq(this.value, other.value) && this.space === other.space) return this;
        this.value.copy(other.value);
        this.space = other.space;
        this.markDirty();
        return this;
    }

    lerp(state0: S2Extents, state1: S2Extents, t: number, camera: S2Camera): this {
        const space = state1.space;
        const value0 = state0.get(space, camera);
        const value1 = state1.get(space, camera);
        this.setV(S2Vec2.lerp(value0, value1, t), space);
        return this;
    }

    static lerp(state0: S2Extents, state1: S2Extents, t: number, camera: S2Camera): S2Extents {
        return new S2Extents().lerp(state0, state1, t, camera);
    }

    set(x: number, y: number, space?: S2Space): this {
        if (this.value.x === x && this.value.y === y && this.space === space) return this;
        this.value.set(x, y);
        if (space) this.space = space;
        this.markDirty();
        return this;
    }

    setV(extents: S2Vec2, space?: S2Space): this {
        if (S2Vec2.eq(this.value, extents) && this.space === space) return this;
        this.value.copy(extents);
        if (space) this.space = space;
        this.markDirty();
        return this;
    }

    setValueFromSpace(x: number, y: number, space: S2Space, camera: S2Camera): this {
        if (this.value.x === x && this.value.y === y && this.space === space) return this;
        if (this.space === space) {
            // this = other
            this.value.set(x, y);
        } else if (this.space === 'world') {
            // this: world, other: view
            this.value.set(x, y).mulV(camera.getViewToWorldScale());
        } else {
            // this: view, other: world
            this.value.set(x, y).mulV(camera.getWorldToViewScale());
        }
        this.markDirty();
        return this;
    }

    get(space: S2Space, camera: S2Camera): S2Vec2 {
        return this.toSpace(space, camera);
    }

    changeSpace(space: S2Space, camera: S2Camera): this {
        if (this.space === space) {
            // this = other
            return this;
        } else if (this.space === 'world') {
            // this: world, other: view
            this.value.mulV(camera.getWorldToViewScale());
        } else {
            // this: view, other: world
            this.value.mulV(camera.getViewToWorldScale());
        }
        this.space = space;
        this.markDirty();
        return this;
    }

    toSpace(space: S2Space, camera: S2Camera): S2Vec2 {
        return S2Extents.toSpace(this.value, this.space, space, camera);
    }

    static toSpace(extents: S2Vec2, currSpace: S2Space, nextSpace: S2Space, camera: S2Camera): S2Vec2 {
        if (currSpace === nextSpace) {
            // this = other
            return extents.clone();
        } else if (currSpace === 'world') {
            // this: world, other: view
            return extents.clone().mulV(camera.getWorldToViewScale());
        } else {
            // this: view, other: world
            return extents.clone().mulV(camera.getViewToWorldScale());
        }
    }
}
