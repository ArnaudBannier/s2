import type { S2Camera, S2Space } from '../math/s2-camera';
import type { S2HasClone, S2HasCopy, S2HasLerpWithCamera } from './s2-base-type';
import { S2BaseType } from './s2-base-type';
import { S2Vec2 } from '../math/s2-vec2';

export class S2Offset
    extends S2BaseType
    implements S2HasClone<S2Offset>, S2HasCopy<S2Offset>, S2HasLerpWithCamera<S2Offset>
{
    readonly kind = 'direction' as const;
    public value: S2Vec2;
    public space: S2Space;

    constructor(x: number = 0, y: number = 0, space: S2Space = 'world', locked: boolean = false) {
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
        if (S2Vec2.eq(this.value, other.value) && this.space === other.space) return this;
        this.value.copy(other.value);
        this.space = other.space;
        this.markDirty();
        return this;
    }

    lerp(state0: S2Offset, state1: S2Offset, t: number, camera: S2Camera): this {
        const space = state1.space;
        const value0 = state0.get(space, camera);
        const value1 = state1.get(space, camera);
        this.setV(S2Vec2.lerp(value0, value1, t), space);
        return this;
    }

    static lerp(state0: S2Offset, state1: S2Offset, t: number, camera: S2Camera): S2Offset {
        return new S2Offset().lerp(state0, state1, t, camera);
    }

    set(x: number = 0, y: number = 0, space?: S2Space): this {
        if (this.value.x === x && this.value.y === y && this.space === space) return this;
        this.value.set(x, y);
        if (space) this.space = space;
        this.markDirty();
        return this;
    }

    setV(offset: S2Vec2, space?: S2Space): this {
        if (S2Vec2.eq(this.value, offset) && this.space === space) return this;
        this.value.copy(offset);
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
            camera.viewToWorldOffset(x, y, this.value);
        } else {
            // this: view, other: world
            camera.worldToViewOffset(x, y, this.value);
        }
        this.markDirty();
        return this;
    }

    setValueFromSpaceV(offset: S2Vec2, space: S2Space, camera: S2Camera): this {
        return this.setValueFromSpace(offset.x, offset.y, space, camera);
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
            camera.worldToViewOffset(this.value.x, this.value.y, this.value);
        } else {
            // this: view, other: world
            camera.viewToWorldOffset(this.value.x, this.value.y, this.value);
        }
        this.space = space;
        return this;
    }

    toSpace(space: S2Space, camera: S2Camera): S2Vec2 {
        return S2Offset.toSpace(this.value, this.space, space, camera);
    }

    static toSpace(offset: S2Vec2, currSpace: S2Space, nextSpace: S2Space, camera: S2Camera): S2Vec2 {
        if (currSpace === nextSpace) {
            // this = other
            return offset.clone();
        } else if (currSpace === 'world') {
            // this: world, other: view
            return camera.worldToViewOffsetV(offset);
        } else {
            // this: view, other: world
            return camera.viewToWorldOffsetV(offset);
        }
    }
}
