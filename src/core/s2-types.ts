import { S2Vec2 } from './math/s2-vec2';
import { S2Camera } from './math/s2-camera';
import { S2MathUtils } from './math/s2-utils';

export type S2Space = 'world' | 'view';

export abstract class S2BaseType<T extends S2BaseType<T>> {
    abstract readonly kind: string;
    abstract clone(): T;
    abstract copy(other: T): this;
    abstract lerp(state0: T, state1: T, t: number): this;
}

export class S2Number extends S2BaseType<S2Number> {
    readonly kind = 'number' as const;
    public value: number;

    constructor(value: number) {
        super();
        this.value = value;
    }

    clone(): S2Number {
        return new S2Number(this.value);
    }

    copy(other: S2Number): this {
        this.value = other.value;
        return this;
    }

    lerp(state0: S2Number, state1: S2Number, t: number): this {
        this.value = S2MathUtils.lerp(state0.value, state1.value, t);
        return this;
    }

    static lerp(state0: S2Number, state1: S2Number, t: number): S2Number {
        return new S2Number(0).lerp(state0, state1, t);
    }

    set(value: number): this {
        this.value = value;
        return this;
    }

    toString(precision: number = 2): string {
        return this.value.toFixed(precision);
    }
}

export class S2Color extends S2BaseType<S2Color> {
    readonly kind = 'color' as const;
    public r: number;
    public g: number;
    public b: number;

    static fromHex(hex: string): S2Color {
        const color = new S2Color();
        const num = parseInt(hex.substring(1), 16);
        color.r = (num >> 16) & 0xff;
        color.g = (num >> 8) & 0xff;
        color.b = num & 0xff;
        return color;
    }

    constructor(r: number = 0, g: number = 0, b: number = 0) {
        super();
        this.r = r;
        this.g = g;
        this.b = b;
    }

    clone(): S2Color {
        return new S2Color(this.r, this.g, this.b);
    }

    copy(color?: S2Color): this {
        if (!color) return this;
        this.r = color.r;
        this.g = color.g;
        this.b = color.b;
        return this;
    }

    lerp(state0: S2Color, state1: S2Color, t: number): this {
        this.r = S2MathUtils.lerp(state0.r, state1.r, t);
        this.g = S2MathUtils.lerp(state0.g, state1.g, t);
        this.b = S2MathUtils.lerp(state0.b, state1.b, t);
        return this;
    }

    static lerp(color0: S2Color, color1: S2Color, t: number): S2Color {
        return new S2Color().lerp(color0, color1, t);
    }

    set(r: number, g: number, b: number): this {
        this.r = r;
        this.g = g;
        this.b = b;
        return this;
    }

    toHex(): string {
        return '#' + [this.r, this.g, this.b].map((c) => c.toString(16).padStart(2, '0')).join('');
    }

    toRgb(): string {
        return `rgb(${Math.floor(this.r)}, ${Math.floor(this.g)}, ${Math.floor(this.b)})`;
    }
}

export class S2Position extends S2BaseType<S2Position> {
    readonly kind = 'position' as const;
    public value: S2Vec2;
    public space: S2Space;

    constructor(x: number = 0, y: number = 0, space: S2Space = 'world') {
        super();
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

    lerp(state0: S2Position, state1: S2Position, t: number): this {
        this.value = S2Vec2.lerp(state0.value, state1.value, t);
        return this;
    }

    static lerp(state0: S2Position, state1: S2Position, t: number): S2Position {
        return new S2Position().lerp(state0, state1, t);
    }

    set(x: number = 0, y: number = 0, space?: S2Space): this {
        this.value.set(x, y);
        if (space) this.space = space;
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

export class S2Length extends S2BaseType<S2Length> {
    readonly kind = 'length' as const;
    public value: number;
    public space: S2Space;

    constructor(value: number = 0, space: S2Space = 'world') {
        super();
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

    lerp(state0: S2Length, state1: S2Length, t: number): this {
        this.value = S2MathUtils.lerp(state0.value, state1.value, t);
        return this;
    }

    static lerp(state0: S2Length, state1: S2Length, t: number): S2Length {
        return new S2Length().lerp(state0, state1, t);
    }

    set(value: number, space?: S2Space): this {
        this.value = value;
        if (space) this.space = space;
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

export class S2Extents extends S2BaseType<S2Extents> {
    readonly kind = 'extents' as const;
    public value: S2Vec2;
    public space: S2Space;

    constructor(x: number = 0, y: number = 0, space: S2Space = 'world') {
        super();
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

    lerp(state0: S2Extents, state1: S2Extents, t: number): this {
        this.value = S2Vec2.lerp(state0.value, state1.value, t);
        return this;
    }

    static lerp(state0: S2Extents, state1: S2Extents, t: number): S2Extents {
        return new S2Extents().lerp(state0, state1, t);
    }

    set(x: number, y: number, space?: S2Space): this {
        this.value.set(x, y);
        if (space) this.space = space;
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
