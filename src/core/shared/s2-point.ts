import type { S2HasClone, S2HasCopy, S2HasLerpWithCamera } from './s2-base-type';
import type { S2Camera, S2Space } from '../math/s2-camera';
import { S2BaseType } from './s2-base-type';
import { S2Vec2 } from '../math/s2-vec2';

export class S2Point
    extends S2BaseType
    implements S2HasClone<S2Point>, S2HasCopy<S2Point>, S2HasLerpWithCamera<S2Point>
{
    readonly kind = 'position' as const;
    public value: S2Vec2;
    public space: S2Space;

    constructor(x: number = 0, y: number = 0, space: S2Space = 'world', locked: boolean = false) {
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
        if (S2Vec2.eq(this.value, other.value) && this.space === other.space) return this;
        this.value.copy(other.value);
        this.space = other.space;
        this.markDirty();
        return this;
    }

    lerp(state0: S2Point, state1: S2Point, t: number, camera: S2Camera): this {
        const space = state1.space;
        const value0 = state0.get(space, camera);
        const value1 = state1.get(space, camera);
        this.setV(S2Vec2.lerp(value0, value1, t), space);
        return this;
    }

    static lerp(state0: S2Point, state1: S2Point, t: number, camera: S2Camera): S2Point {
        return new S2Point().lerp(state0, state1, t, camera);
    }

    set(x: number = 0, y: number = 0, space?: S2Space): this {
        if (this.value.x === x && this.value.y === y && this.space === space) return this;
        this.value.set(x, y);
        if (space) this.space = space;
        this.markDirty();
        return this;
    }

    setV(point: S2Vec2, space?: S2Space): this {
        if (S2Vec2.eq(this.value, point) && this.space === space) return this;
        this.value.copy(point);
        if (space) this.space = space;
        this.markDirty();
        return this;
    }

    // setXFromSpace(x: number, space: S2Space, camera: S2Camera): this {
    //     if (space === 'world' && this.space === 'view') x = camera.worldToViewX(x);
    //     if (space === 'view' && this.space === 'world') x = camera.viewToWorldX(x);
    //     if (this.value.x === x) return this;
    //     this.value.x = x;
    //     this.markDirty();
    //     return this;
    // }

    // setYFromSpace(y: number, space: S2Space, camera: S2Camera): this {
    //     if (space === 'world' && this.space === 'view') y = camera.worldToViewY(y);
    //     if (space === 'view' && this.space === 'world') y = camera.viewToWorldY(y);
    //     if (this.value.y === y) return this;
    //     this.value.y = y;
    //     this.markDirty();
    //     return this;
    // }

    setValueFromSpace(x: number, y: number, space: S2Space, camera: S2Camera): this {
        if (this.value.x === x && this.value.y === y && this.space === space) return this;
        if (this.space === space) {
            // this = other
            this.value.set(x, y);
        } else if (this.space === 'world') {
            // this: world, other: view
            camera.viewToWorld(x, y, this.value);
            // this.value.x = camera.viewToWorldX(x);
            // this.value.y = camera.viewToWorldY(y);
        } else {
            // this: view, other: world
            camera.worldToView(x, y, this.value);
            // this.value.x = camera.worldToViewX(x);
            // this.value.y = camera.worldToViewY(y);
        }
        this.markDirty();
        return this;
    }

    setValueFromSpaceV(point: S2Vec2, space: S2Space, camera: S2Camera): this {
        return this.setValueFromSpace(point.x, point.y, space, camera);
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
            camera.worldToView(this.value.x, this.value.y, this.value);
            // this.value.x = camera.worldToViewX(this.value.x);
            // this.value.y = camera.worldToViewY(this.value.y);
        } else {
            // this: view, other: world
            camera.viewToWorld(this.value.x, this.value.y, this.value);
            // this.value.x = camera.viewToWorldX(this.value.x);
            // this.value.y = camera.viewToWorldY(this.value.y);
        }
        this.space = space;
        return this;
    }

    toSpace(space: S2Space, camera: S2Camera): S2Vec2 {
        return S2Point.toSpace(this.value, this.space, space, camera);
    }

    static toSpace(point: S2Vec2, currSpace: S2Space, nextSpace: S2Space, camera: S2Camera): S2Vec2 {
        if (currSpace === nextSpace) return point.clone();
        switch (currSpace) {
            case 'world':
                return camera.worldToViewV(point);
            case 'view':
                return camera.viewToWorldV(point);
        }
    }
}
