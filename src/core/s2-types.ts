import { S2Vec2 } from './math/s2-vec2';
import { S2Camera } from './math/s2-camera';
import { S2MathUtils } from './math/s2-utils';

// TODO : Ajouter S2Transform ?

export type S2Space = 'world' | 'view';
export enum S2Inheritance {
    Inherited = 'inherited',
    Explicit = 'explicit',
}

export abstract class S2BaseType {
    abstract readonly kind: string;
    public inheritance: S2Inheritance = S2Inheritance.Explicit;

    setInherited(): this {
        this.inheritance = S2Inheritance.Inherited;
        return this;
    }
}

export class S2Number extends S2BaseType {
    readonly kind = 'number' as const;
    public parent: S2Number | null = null;
    public value: number;

    constructor(value: number, inherit: S2Inheritance = S2Inheritance.Explicit) {
        super();
        this.value = value;
        this.inheritance = inherit;
    }

    setInherited(parent: S2Number | null = null): this {
        super.setInherited();
        this.parent = parent;
        return this;
    }

    clone(): S2Number {
        return new S2Number(this.value, this.inheritance);
    }

    copy(other: S2Number): this {
        this.value = other.value;
        this.inheritance = other.inheritance;
        return this;
    }

    lerp(state0: S2Number, state1: S2Number, t: number): this {
        const value0 = state0.getInherited();
        const value1 = state1.getInherited();
        this.value = S2MathUtils.lerp(value0, value1, t);
        this.inheritance = S2Inheritance.Explicit;
        return this;
    }

    static lerp(state0: S2Number, state1: S2Number, t: number): S2Number {
        return new S2Number(0).lerp(state0, state1, t);
    }

    set(value: number, inherit: S2Inheritance = S2Inheritance.Explicit): this {
        this.value = value;
        this.inheritance = inherit;
        return this;
    }

    getInherited(): number {
        if (this.inheritance === S2Inheritance.Explicit || this.parent === null) {
            return this.value;
        }
        return this.parent.getInherited();
    }

    toString(precision: number = 2): string {
        return this.value.toFixed(precision);
    }
}

export class S2Color extends S2BaseType {
    readonly kind = 'color' as const;
    public parent: S2Color | null = null;
    public r: number;
    public g: number;
    public b: number;

    constructor(r: number = 0, g: number = 0, b: number = 0, inherit: S2Inheritance = S2Inheritance.Explicit) {
        super();
        this.r = r;
        this.g = g;
        this.b = b;
        this.inheritance = inherit;
    }

    setInherited(parent: S2Color | null = null): this {
        super.setInherited();
        this.parent = parent;
        return this;
    }

    clone(): S2Color {
        return new S2Color(this.r, this.g, this.b, this.inheritance);
    }

    copy(color?: S2Color): this {
        if (!color) return this;
        this.r = color.r;
        this.g = color.g;
        this.b = color.b;
        this.inheritance = color.inheritance;
        return this;
    }

    lerp(state0: S2Color, state1: S2Color, t: number): this {
        const value0 = state0.getInherited();
        const value1 = state1.getInherited();
        this.r = S2MathUtils.lerp(value0.r, value1.r, t);
        this.g = S2MathUtils.lerp(value0.g, value1.g, t);
        this.b = S2MathUtils.lerp(value0.b, value1.b, t);
        this.inheritance = S2Inheritance.Explicit;
        return this;
    }

    static lerp(color0: S2Color, color1: S2Color, t: number): S2Color {
        return new S2Color().lerp(color0, color1, t);
    }

    set(r: number, g: number, b: number, inherit: S2Inheritance = S2Inheritance.Explicit): this {
        this.r = r;
        this.g = g;
        this.b = b;
        this.inheritance = inherit;
        return this;
    }

    setFromHex(hex: string, inherit: S2Inheritance = S2Inheritance.Explicit): this {
        const num = parseInt(hex.substring(1), 16);
        this.r = (num >> 16) & 0xff;
        this.g = (num >> 8) & 0xff;
        this.b = num & 0xff;
        this.inheritance = inherit;
        return this;
    }

    static fromHex(hex: string, inherit: S2Inheritance = S2Inheritance.Explicit): S2Color {
        return new S2Color().setFromHex(hex, inherit);
    }

    toHex(): string {
        return '#' + [this.r, this.g, this.b].map((c) => c.toString(16).padStart(2, '0')).join('');
    }

    toRgb(): string {
        return `rgb(${Math.floor(this.r)}, ${Math.floor(this.g)}, ${Math.floor(this.b)})`;
    }

    getInherited(): { r: number; g: number; b: number } {
        if (this.inheritance === S2Inheritance.Explicit || this.parent === null) {
            return { r: this.r, g: this.g, b: this.b };
        }
        return this.parent.getInherited();
    }
}

export class S2Position extends S2BaseType {
    readonly kind = 'position' as const;
    public parent: S2Position | null = null;
    public value: S2Vec2;
    public space: S2Space;

    constructor(
        x: number = 0,
        y: number = 0,
        space: S2Space = 'world',
        inherit: S2Inheritance = S2Inheritance.Explicit,
    ) {
        super();
        this.value = new S2Vec2(x, y);
        this.space = space;
        this.inheritance = inherit;
    }

    setInherited(parent: S2Position | null = null): this {
        super.setInherited();
        this.parent = parent;
        return this;
    }

    clone(): S2Position {
        return new S2Position(this.value.x, this.value.y, this.space, this.inheritance);
    }

    copy(other: S2Position): this {
        this.value.copy(other.value);
        this.space = other.space;
        this.inheritance = other.inheritance;
        return this;
    }

    lerp(state0: S2Position, state1: S2Position, t: number, camera: S2Camera): this {
        const value0 = state0.getInherited(state1.space, camera);
        const value1 = state1.getInherited(state1.space, camera);
        this.value = S2Vec2.lerp(value0, value1, t);
        this.inheritance = S2Inheritance.Explicit;
        return this;
    }

    static lerp(state0: S2Position, state1: S2Position, t: number, camera: S2Camera): S2Position {
        return new S2Position().lerp(state0, state1, t, camera);
    }

    set(x: number = 0, y: number = 0, space?: S2Space, inherit: S2Inheritance = S2Inheritance.Explicit): this {
        this.value.set(x, y);
        if (space) this.space = space;
        this.inheritance = inherit;
        return this;
    }

    setV(position: S2Vec2, space?: S2Space, inherit: S2Inheritance = S2Inheritance.Explicit): this {
        this.value.copy(position);
        if (space) this.space = space;
        this.inheritance = inherit;
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

    getInherited(space: S2Space, camera: S2Camera): S2Vec2 {
        if (this.inheritance === S2Inheritance.Explicit || this.parent === null) {
            return this.toSpace(space, camera);
        }
        return this.parent.getInherited(space, camera);
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

export class S2Length extends S2BaseType {
    readonly kind = 'length' as const;
    public parent: S2Length | null = null;
    public value: number;
    public space: S2Space;

    constructor(value: number = 0, space: S2Space = 'world', inherit: S2Inheritance = S2Inheritance.Explicit) {
        super();
        this.value = value;
        this.space = space;
        this.inheritance = inherit;
    }

    setInherited(parent: S2Length | null = null): this {
        super.setInherited();
        this.parent = parent;
        return this;
    }

    clone(): S2Length {
        return new S2Length(this.value, this.space, this.inheritance);
    }

    copy(other: S2Length): this {
        this.value = other.value;
        this.space = other.space;
        this.inheritance = other.inheritance;
        return this;
    }

    lerp(state0: S2Length, state1: S2Length, t: number, camera: S2Camera): this {
        const value0 = state0.getInherited(state1.space, camera);
        const value1 = state1.getInherited(state1.space, camera);
        this.value = S2MathUtils.lerp(value0, value1, t);
        this.inheritance = S2Inheritance.Explicit;
        return this;
    }

    static lerp(state0: S2Length, state1: S2Length, t: number, camera: S2Camera): S2Length {
        return new S2Length().lerp(state0, state1, t, camera);
    }

    set(value: number, space?: S2Space, inherit: S2Inheritance = S2Inheritance.Explicit): this {
        this.value = value;
        if (space) this.space = space;
        this.inheritance = inherit;
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

    getInherited(space: S2Space, camera: S2Camera): number {
        if (this.inheritance === S2Inheritance.Explicit || this.parent === null) {
            return this.toSpace(space, camera);
        }
        return this.parent.getInherited(space, camera);
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

export class S2Extents extends S2BaseType {
    readonly kind = 'extents' as const;
    public parent: S2Extents | null = null;
    public value: S2Vec2;
    public space: S2Space;

    constructor(
        x: number = 0,
        y: number = 0,
        space: S2Space = 'world',
        inherit: S2Inheritance = S2Inheritance.Explicit,
    ) {
        super();
        this.value = new S2Vec2(x, y);
        this.space = space;
        this.inheritance = inherit;
    }

    setInherited(parent: S2Extents | null = null): this {
        super.setInherited();
        this.parent = parent;
        return this;
    }

    clone(): S2Extents {
        return new S2Extents(this.value.x, this.value.y, this.space, this.inheritance);
    }

    copy(other: S2Extents): this {
        this.value.copy(other.value);
        this.space = other.space;
        this.inheritance = other.inheritance;
        return this;
    }

    lerp(state0: S2Extents, state1: S2Extents, t: number, camera: S2Camera): this {
        const value0 = state0.getInherited(state1.space, camera);
        const value1 = state1.getInherited(state1.space, camera);
        this.value = S2Vec2.lerp(value0, value1, t);
        this.inheritance = S2Inheritance.Explicit;
        return this;
    }

    static lerp(state0: S2Extents, state1: S2Extents, t: number, camera: S2Camera): S2Extents {
        return new S2Extents().lerp(state0, state1, t, camera);
    }

    set(x: number, y: number, space?: S2Space, inherit: S2Inheritance = S2Inheritance.Explicit): this {
        this.value.set(x, y);
        if (space) this.space = space;
        this.inheritance = inherit;
        return this;
    }

    setV(extents: S2Vec2, space?: S2Space, inherit: S2Inheritance = S2Inheritance.Explicit): this {
        this.value.copy(extents);
        if (space) this.space = space;
        this.inheritance = inherit;
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

    getInherited(space: S2Space, camera: S2Camera): S2Vec2 {
        if (this.inheritance === S2Inheritance.Explicit || this.parent === null) {
            return this.toSpace(space, camera);
        }
        return this.parent.getInherited(space, camera);
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
