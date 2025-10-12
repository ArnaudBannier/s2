import type { S2Camera } from '../math/s2-camera';
import type { S2HasClone, S2HasCopy, S2HasLerpWithCamera, S2Space } from './s2-base-type';
import { S2BaseType } from './s2-base-type';
import { S2Vec2 } from '../math/s2-vec2';

export class S2Direction
    extends S2BaseType
    implements S2HasClone<S2Direction>, S2HasCopy<S2Direction>, S2HasLerpWithCamera<S2Direction>
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

    clone(): S2Direction {
        return new S2Direction(this.value.x, this.value.y, this.space, this.locked);
    }

    copyIfUnlocked(other: S2Direction): this {
        if (this.locked) return this;
        return this.copy(other);
    }

    copy(other: S2Direction): this {
        if (S2Vec2.eq(this.value, other.value) && this.space === other.space) return this;
        this.value.copy(other.value);
        this.space = other.space;
        this.markDirty();
        return this;
    }

    lerp(state0: S2Direction, state1: S2Direction, t: number, camera: S2Camera): this {
        const space = state1.space;
        const value0 = state0.get(space, camera);
        const value1 = state1.get(space, camera);
        this.setV(S2Vec2.lerp(value0, value1, t), space);
        return this;
    }

    static lerp(state0: S2Direction, state1: S2Direction, t: number, camera: S2Camera): S2Direction {
        return new S2Direction().lerp(state0, state1, t, camera);
    }

    set(x: number = 0, y: number = 0, space?: S2Space): this {
        if (this.value.x === x && this.value.y === y && this.space === space) return this;
        this.value.set(x, y);
        if (space) this.space = space;
        this.markDirty();
        return this;
    }

    setV(position: S2Vec2, space?: S2Space): this {
        if (S2Vec2.eq(this.value, position) && this.space === space) return this;
        this.value.copy(position);
        if (space) this.space = space;
        this.markDirty();
        return this;
    }

    setValueFromSpace(space: S2Space, camera: S2Camera, x: number, y: number): this {
        if (this.value.x === x && this.value.y === y && this.space === space) return this;
        if (this.space === space) {
            // this = other
            this.value.set(x, y);
        } else if (this.space === 'world') {
            // this: world, other: view
            camera.viewToWorldDirectionInto(x, y, this.value);
        } else {
            // this: view, other: world
            camera.worldToViewDirectionInto(x, y, this.value);
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
            camera.worldToViewDirectionInto(this.value.x, this.value.y, this.value);
        } else {
            // this: view, other: world
            camera.viewToWorldDirectionInto(this.value.x, this.value.y, this.value);
        }
        this.space = space;
        return this;
    }

    toSpace(space: S2Space, camera: S2Camera): S2Vec2 {
        return S2Direction.toSpace(this.value, this.space, space, camera);
    }

    static toSpace(direction: S2Vec2, currSpace: S2Space, nextSpace: S2Space, camera: S2Camera): S2Vec2 {
        if (currSpace === nextSpace) {
            // this = other
            return direction.clone();
        } else if (currSpace === 'world') {
            // this: world, other: view
            return camera.worldToViewDirectionV(direction);
        } else {
            // this: view, other: world
            return camera.viewToWorldDirectionV(direction);
        }
    }
}
