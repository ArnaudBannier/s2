import { S2Vec2 } from './s2-vec2';
import { S2Camera } from './s2-camera';

export type S2Space = 'world' | 'view';

export class S2Position {
    public value: S2Vec2;
    public space: S2Space;

    constructor(x: number = 0, y: number = 0, space: S2Space = 'world') {
        this.value = new S2Vec2(x, y);
        this.space = space;
    }

    clone(): S2Position {
        return new S2Position(this.value.x, this.value.y, this.space);
    }

    copy(other?: S2Position): this {
        if (other) {
            this.value.copy(other.value);
            this.space = other.space;
        } else {
            this.value.set(0, 0);
            this.space = 'world';
        }
        return this;
    }

    setValueFromSpace(space: S2Space, camera: S2Camera, x: number, y: number): this {
        if (this.space === space) {
            // this = other
            this.value.set(x, y);
        } else if (this.space === 'world') {
            // this: world, other: view
            this.value.x = camera.viewToWorldX(x);
            this.value.y = camera.viewToWorldY(y);
        } else {
            // this: view, other: world
            this.value.x = camera.worldToViewX(x);
            this.value.y = camera.worldToViewY(y);
        }
        return this;
    }

    changeSpace(space: S2Space, camera: S2Camera): this {
        if (this.space === space) {
            // this = other
            return this;
        } else if (this.space === 'world') {
            // this: world, other: view
            this.value.x = camera.worldToViewX(this.value.x);
            this.value.y = camera.worldToViewY(this.value.y);
        } else {
            // this: view, other: world
            this.value.x = camera.viewToWorldX(this.value.x);
            this.value.y = camera.viewToWorldY(this.value.y);
        }
        this.space = space;
        return this;
    }

    toSpace(space: S2Space, camera: S2Camera): S2Vec2 {
        return S2Position.toSpace(this.value, this.space, space, camera);
    }

    static toSpace(position: S2Vec2, currSpace: S2Space, nextSpace: S2Space, camera: S2Camera): S2Vec2 {
        if (currSpace === nextSpace) {
            // this = other
            return position.clone();
        } else if (currSpace === 'world') {
            // this: world, other: view
            return camera.worldToViewV(position);
        } else {
            // this: view, other: world
            return camera.viewToWorldV(position);
        }
    }
}

export class S2Length {
    public value: number;
    public space: S2Space;

    constructor(value: number = 0, space: S2Space = 'world') {
        this.value = value;
        this.space = space;
    }

    clone(): S2Length {
        return new S2Length(this.value, this.space);
    }

    copy(other?: S2Length): this {
        this.value = other?.value ?? 0;
        this.space = other?.space ?? 'world';
        return this;
    }

    setValueFromSpace(space: S2Space, camera: S2Camera, value: number): this {
        if (this.space === space) {
            // this = other
            this.value = value;
        } else if (this.space === 'world') {
            // this: world, other: view
            this.value = camera.viewToWorldLength(value);
        } else {
            // this: view, other: world
            this.value = camera.worldToViewLength(value);
        }
        return this;
    }

    changeSpace(space: S2Space, camera: S2Camera): this {
        if (this.space === space) {
            // this = other
            return this;
        } else if (this.space === 'world') {
            // this: world, other: view
            this.value = camera.worldToViewLength(this.value);
        } else {
            // this: view, other: world
            this.value = camera.viewToWorldLength(this.value);
        }
        this.space = space;
        return this;
    }

    toSpace(space: S2Space, camera: S2Camera): number {
        return S2Length.toSpace(this.value, this.space, space, camera);
    }

    static toSpace(length: number, currSpace: S2Space, nextSpace: S2Space, camera: S2Camera): number {
        if (currSpace === nextSpace) {
            // this = other
            return length;
        } else if (currSpace === 'world') {
            // this: world, other: view
            return camera.worldToViewLength(length);
        } else {
            // this: view, other: world
            return camera.viewToWorldLength(length);
        }
    }
}

export class S2Extents {
    public value: S2Vec2;
    public space: S2Space;

    constructor(x: number, y: number, space: S2Space = 'world') {
        this.value = new S2Vec2(x, y);
        this.space = space;
    }

    clone(): S2Extents {
        return new S2Extents(this.value.x, this.value.y, this.space);
    }

    copy(other?: S2Extents): this {
        if (other) {
            this.value.copy(other.value);
            this.space = other.space;
        } else {
            this.value.set(0, 0);
            this.space = 'world';
        }
        return this;
    }

    setValueFromSpace(space: S2Space, camera: S2Camera, x: number, y: number): this {
        if (this.space === space) {
            // this = other
            this.value.set(x, y);
        } else if (this.space === 'world') {
            // this: world, other: view
            this.value.x = camera.viewToWorldLength(x);
            this.value.y = camera.viewToWorldLength(y);
        } else {
            // this: view, other: world
            this.value.x = camera.worldToViewLength(x);
            this.value.y = camera.worldToViewLength(y);
        }
        return this;
    }

    changeSpace(space: S2Space, camera: S2Camera): this {
        if (this.space === space) {
            // this = other
            return this;
        } else if (this.space === 'world') {
            // this: world, other: view
            this.value.x = camera.worldToViewLength(this.value.x);
            this.value.y = camera.worldToViewLength(this.value.y);
        } else {
            // this: view, other: world
            this.value.x = camera.viewToWorldLength(this.value.x);
            this.value.y = camera.viewToWorldLength(this.value.y);
        }
        this.space = space;
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
            return new S2Vec2(camera.worldToViewLength(extents.x), camera.worldToViewLength(extents.y));
        } else {
            // this: view, other: world
            return new S2Vec2(camera.viewToWorldLength(extents.x), camera.viewToWorldLength(extents.y));
        }
    }
}
