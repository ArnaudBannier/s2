import { S2Vec2 } from './math/s2-vec2';
import { S2Camera } from './math/s2-camera';
import { S2MathUtils } from './math/s2-utils';
import { S2Mat2x3 } from './math/s2-mat2x3';

export type S2Space = 'world' | 'view';
export enum S2TypeState {
    Inactive = 'inactive',
    Active = 'active',
}

export abstract class S2BaseType {
    abstract readonly kind: string;
    public state: S2TypeState = S2TypeState.Active;
    public dirty: boolean = true;
}

export class S2Enum<T> extends S2BaseType {
    readonly kind = 'enum' as const;
    public parent: S2Enum<T> | null = null;
    public value: T;

    constructor(value: T, state: S2TypeState = S2TypeState.Active) {
        super();
        this.value = value;
        this.state = state;
    }

    setParent(parent: S2Enum<T> | null = null): this {
        this.state = parent ? S2TypeState.Inactive : S2TypeState.Active;
        this.parent = parent;
        this.dirty = true;
        return this;
    }

    clone(): S2Enum<T> {
        return new S2Enum(this.value, this.state);
    }

    copy(other: S2Enum<T>): this {
        this.value = other.value;
        this.state = other.state;
        this.dirty = true;
        return this;
    }

    set(value: T, state: S2TypeState = S2TypeState.Active): this {
        this.value = value;
        this.state = state;
        this.dirty = true;
        return this;
    }

    hasActiveHierarchy(): boolean {
        if (this.state === S2TypeState.Active) return true;
        if (this.parent === null) return false;
        return this.parent.hasActiveHierarchy();
    }

    getInherited(): T {
        if (this.state === S2TypeState.Active || this.parent === null) {
            return this.value;
        }
        return this.parent.getInherited();
    }
}

export class S2String extends S2BaseType {
    readonly kind = 'string' as const;
    public parent: S2String | null = null;
    public value: string;

    constructor(value: string = '', state: S2TypeState = S2TypeState.Active, parent: S2String | null = null) {
        super();
        this.value = value;
        this.state = state;
        this.parent = parent;
    }

    setParent(parent: S2String | null = null): this {
        this.state = parent ? S2TypeState.Inactive : S2TypeState.Active;
        this.parent = parent;
        this.dirty = true;
        return this;
    }

    clone(): S2String {
        return new S2String(this.value, this.state, this.parent);
    }

    copy(other: S2String): this {
        this.value = other.value;
        this.state = other.state;
        this.parent = other.parent;
        this.dirty = true;
        return this;
    }

    set(value: string, state: S2TypeState = S2TypeState.Active): this {
        this.value = value;
        this.state = state;
        this.dirty = true;
        return this;
    }

    hasActiveHierarchy(): boolean {
        if (this.state === S2TypeState.Active) return true;
        if (this.parent === null) return false;
        return this.parent.hasActiveHierarchy();
    }

    getInherited(): string {
        if (this.state === S2TypeState.Active || this.parent === null) {
            return this.value;
        }
        return this.parent.getInherited();
    }

    toString(): string {
        return this.value;
    }
}

export class S2Number extends S2BaseType {
    readonly kind = 'number' as const;
    public parent: S2Number | null = null;
    public value: number;

    constructor(value: number, state: S2TypeState = S2TypeState.Active, parent: S2Number | null = null) {
        super();
        this.value = value;
        this.state = state;
        this.parent = parent;
    }

    setParent(parent: S2Number | null = null): this {
        this.state = parent !== null ? S2TypeState.Inactive : S2TypeState.Active;
        this.parent = parent;
        this.dirty = true;
        return this;
    }

    clone(): S2Number {
        return new S2Number(this.value, this.state, this.parent);
    }

    copy(other: S2Number): this {
        this.value = other.value;
        this.state = other.state;
        this.parent = other.parent;
        this.dirty = true;
        return this;
    }

    lerp(state0: S2Number, state1: S2Number, t: number): this {
        const value0 = state0.getInherited();
        const value1 = state1.getInherited();
        this.value = S2MathUtils.lerp(value0, value1, t);
        this.state = S2TypeState.Active;
        this.dirty = true;
        return this;
    }

    static lerp(state0: S2Number, state1: S2Number, t: number): S2Number {
        return new S2Number(0).lerp(state0, state1, t);
    }

    set(value: number, state: S2TypeState = S2TypeState.Active): this {
        this.value = value;
        this.state = state;
        this.dirty = true;
        return this;
    }

    hasActiveHierarchy(): boolean {
        if (this.state === S2TypeState.Active) return true;
        if (this.parent === null) return false;
        return this.parent.hasActiveHierarchy();
    }

    getInherited(): number {
        if (this.state === S2TypeState.Active || this.parent === null) {
            return this.value;
        }
        return this.parent.getInherited();
    }

    toFixed(precision: number = 2): string {
        return this.value.toFixed(precision);
    }
}

export class S2Color extends S2BaseType {
    readonly kind = 'color' as const;
    public parent: S2Color | null = null;
    public r: number;
    public g: number;
    public b: number;

    constructor(
        r: number = 0,
        g: number = 0,
        b: number = 0,
        state: S2TypeState = S2TypeState.Active,
        parent: S2Color | null = null,
    ) {
        super();
        this.r = r;
        this.g = g;
        this.b = b;
        this.state = state;
        this.parent = parent;
    }

    setParent(parent: S2Color | null = null): this {
        this.state = parent !== null ? S2TypeState.Inactive : S2TypeState.Active;
        this.parent = parent;
        this.dirty = true;
        return this;
    }

    clone(): S2Color {
        return new S2Color(this.r, this.g, this.b, this.state, this.parent);
    }

    copy(color: S2Color): this {
        this.r = color.r;
        this.g = color.g;
        this.b = color.b;
        this.state = color.state;
        this.parent = color.parent;
        this.dirty = true;
        return this;
    }

    lerp(state0: S2Color, state1: S2Color, t: number): this {
        const value0 = state0.getInherited();
        const value1 = state1.getInherited();
        this.r = S2MathUtils.lerp(value0.r, value1.r, t);
        this.g = S2MathUtils.lerp(value0.g, value1.g, t);
        this.b = S2MathUtils.lerp(value0.b, value1.b, t);
        this.state = S2TypeState.Active;
        this.dirty = true;
        return this;
    }

    static lerp(color0: S2Color, color1: S2Color, t: number): S2Color {
        return new S2Color().lerp(color0, color1, t);
    }

    set(r: number, g: number, b: number, state: S2TypeState = S2TypeState.Active): this {
        this.r = r;
        this.g = g;
        this.b = b;
        this.state = state;
        this.dirty = true;
        return this;
    }

    setFromHex(hex: string, state: S2TypeState = S2TypeState.Active): this {
        const num = parseInt(hex.substring(1), 16);
        this.r = (num >> 16) & 0xff;
        this.g = (num >> 8) & 0xff;
        this.b = num & 0xff;
        this.state = state;
        this.dirty = true;
        return this;
    }

    static fromHex(hex: string, state: S2TypeState = S2TypeState.Active): S2Color {
        return new S2Color().setFromHex(hex, state);
    }

    toHex(): string {
        return '#' + [this.r, this.g, this.b].map((c) => c.toString(16).padStart(2, '0')).join('');
    }

    toRgb(): string {
        return `rgb(${Math.floor(this.r)}, ${Math.floor(this.g)}, ${Math.floor(this.b)})`;
    }

    hasActiveHierarchy(): boolean {
        if (this.state === S2TypeState.Active) return true;
        if (this.parent === null) return false;
        return this.parent.hasActiveHierarchy();
    }

    getInherited(): { r: number; g: number; b: number } {
        if (this.state === S2TypeState.Active || this.parent === null) {
            return { r: this.r, g: this.g, b: this.b };
        }
        return this.parent.getInherited();
    }

    getInheritedRgb(): string {
        if (this.state === S2TypeState.Active || this.parent === null) {
            return this.toRgb();
        }
        return this.parent.getInheritedRgb();
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
        state: S2TypeState = S2TypeState.Active,
        parent: S2Position | null = null,
    ) {
        super();
        this.value = new S2Vec2(x, y);
        this.space = space;
        this.state = state;
        this.parent = parent;
    }

    setParent(parent: S2Position | null = null): this {
        this.state = parent !== null ? S2TypeState.Inactive : S2TypeState.Active;
        this.parent = parent;
        this.dirty = true;
        return this;
    }

    clone(): S2Position {
        return new S2Position(this.value.x, this.value.y, this.space, this.state, this.parent);
    }

    copy(other: S2Position): this {
        this.value.copy(other.value);
        this.space = other.space;
        this.state = other.state;
        this.parent = other.parent;
        this.dirty = true;
        return this;
    }

    lerp(state0: S2Position, state1: S2Position, t: number, camera: S2Camera): this {
        const space = state1.space;
        const value0 = state0.getInherited(space, camera);
        const value1 = state1.getInherited(space, camera);
        this.value = S2Vec2.lerp(value0, value1, t);
        this.state = S2TypeState.Active;
        this.space = space;
        this.dirty = true;
        return this;
    }

    static lerp(state0: S2Position, state1: S2Position, t: number, camera: S2Camera): S2Position {
        return new S2Position().lerp(state0, state1, t, camera);
    }

    set(x: number = 0, y: number = 0, space?: S2Space, state: S2TypeState = S2TypeState.Active): this {
        this.value.set(x, y);
        if (space) this.space = space;
        this.state = state;
        this.dirty = true;
        return this;
    }

    setV(position: S2Vec2, space?: S2Space, state: S2TypeState = S2TypeState.Active): this {
        this.value.copy(position);
        if (space) this.space = space;
        this.state = state;
        this.dirty = true;
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
        this.dirty = true;
        return this;
    }

    hasActiveHierarchy(): boolean {
        if (this.state === S2TypeState.Active) return true;
        if (this.parent === null) return false;
        return this.parent.hasActiveHierarchy();
    }

    getInherited(space: S2Space, camera: S2Camera): S2Vec2 {
        if (this.state === S2TypeState.Active || this.parent === null) {
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

    constructor(
        value: number = 0,
        space: S2Space = 'world',
        state: S2TypeState = S2TypeState.Active,
        parent: S2Length | null = null,
    ) {
        super();
        this.value = value;
        this.space = space;
        this.state = state;
        this.parent = parent;
    }

    setParent(parent: S2Length | null = null): this {
        this.state = parent !== null ? S2TypeState.Inactive : S2TypeState.Active;
        this.parent = parent;
        this.dirty = true;
        return this;
    }

    clone(): S2Length {
        return new S2Length(this.value, this.space, this.state, this.parent);
    }

    copy(other: S2Length): this {
        this.value = other.value;
        this.space = other.space;
        this.state = other.state;
        this.parent = other.parent;
        this.dirty = true;
        return this;
    }

    lerp(state0: S2Length, state1: S2Length, t: number, camera: S2Camera): this {
        const space = state1.space;
        const value0 = state0.getInherited(space, camera);
        const value1 = state1.getInherited(space, camera);
        this.value = S2MathUtils.lerp(value0, value1, t);
        this.state = S2TypeState.Active;
        this.space = space;
        this.dirty = true;
        return this;
    }

    static lerp(state0: S2Length, state1: S2Length, t: number, camera: S2Camera): S2Length {
        return new S2Length().lerp(state0, state1, t, camera);
    }

    set(value: number, space?: S2Space, state: S2TypeState = S2TypeState.Active): this {
        this.value = value;
        if (space) this.space = space;
        this.state = state;
        this.dirty = true;
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
        this.dirty = true;
        return this;
    }

    hasActiveHierarchy(): boolean {
        if (this.state === S2TypeState.Active) return true;
        if (this.parent === null) return false;
        return this.parent.hasActiveHierarchy();
    }

    getInherited(space: S2Space, camera: S2Camera): number {
        if (this.state === S2TypeState.Active || this.parent === null) {
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
        state: S2TypeState = S2TypeState.Active,
        parent: S2Extents | null = null,
    ) {
        super();
        this.value = new S2Vec2(x, y);
        this.space = space;
        this.state = state;
        this.parent = parent;
    }

    setParent(parent: S2Extents | null = null): this {
        this.state = parent !== null ? S2TypeState.Inactive : S2TypeState.Active;
        this.parent = parent;
        this.dirty = true;
        return this;
    }

    clone(): S2Extents {
        return new S2Extents(this.value.x, this.value.y, this.space, this.state, this.parent);
    }

    copy(other: S2Extents): this {
        this.value.copy(other.value);
        this.space = other.space;
        this.state = other.state;
        this.parent = other.parent;
        this.dirty = true;
        return this;
    }

    lerp(state0: S2Extents, state1: S2Extents, t: number, camera: S2Camera): this {
        const space = state1.space;
        const value0 = state0.getInherited(space, camera);
        const value1 = state1.getInherited(space, camera);
        this.value = S2Vec2.lerp(value0, value1, t);
        this.state = S2TypeState.Active;
        this.space = space;
        this.dirty = true;
        return this;
    }

    static lerp(state0: S2Extents, state1: S2Extents, t: number, camera: S2Camera): S2Extents {
        return new S2Extents().lerp(state0, state1, t, camera);
    }

    set(x: number, y: number, space?: S2Space, state: S2TypeState = S2TypeState.Active): this {
        this.value.set(x, y);
        if (space) this.space = space;
        this.state = state;
        this.dirty = true;
        return this;
    }

    setV(extents: S2Vec2, space?: S2Space, state: S2TypeState = S2TypeState.Active): this {
        this.value.copy(extents);
        if (space) this.space = space;
        this.state = state;
        this.dirty = true;
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
        this.dirty = true;
        return this;
    }

    getInherited(space: S2Space, camera: S2Camera): S2Vec2 {
        if (this.state === S2TypeState.Active || this.parent === null) {
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
        this.dirty = true;
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

export class S2Transform extends S2BaseType {
    readonly kind = 'transform' as const;
    public parent: S2Transform | null = null;
    public value: S2Mat2x3;

    constructor(
        a00: number = 1,
        a01: number = 0,
        a02: number = 0,
        a10: number = 0,
        a11: number = 1,
        a12: number = 0,
        state: S2TypeState = S2TypeState.Active,
        parent: S2Transform | null = null,
    ) {
        super();
        this.value = new S2Mat2x3(a00, a01, a02, a10, a11, a12);
        this.state = state;
        this.parent = parent;
    }

    setParent(parent: S2Transform | null = null): this {
        this.state = parent !== null ? S2TypeState.Inactive : S2TypeState.Active;
        this.parent = parent;
        this.dirty = true;
        return this;
    }

    clone(): S2Transform {
        return new S2Transform().copy(this);
    }

    copy(other: S2Transform): this {
        this.value.copy(other.value);
        this.state = other.state;
        this.parent = other.parent;
        this.dirty = true;
        return this;
    }

    lerp(state0: S2Transform, state1: S2Transform, t: number): this {
        const value0 = state0.getInherited();
        const value1 = state1.getInherited();
        this.value.lerp(value0, value1, t);
        this.state = S2TypeState.Active;
        this.dirty = true;
        return this;
    }

    static lerp(state0: S2Transform, state1: S2Transform, t: number): S2Transform {
        return new S2Transform().lerp(state0, state1, t);
    }

    set(value: S2Mat2x3, state: S2TypeState = S2TypeState.Active): this {
        this.value.copy(value);
        this.state = state;
        this.dirty = true;
        return this;
    }

    hasActiveHierarchy(): boolean {
        if (this.state === S2TypeState.Active) return true;
        if (this.parent === null) return false;
        return this.parent.hasActiveHierarchy();
    }

    getInherited(): S2Mat2x3 {
        if (this.state === S2TypeState.Active || this.parent === null) {
            return this.value;
        }
        return this.parent.getInherited();
    }

    toFixed(precision: number = 2): string {
        return 'matrix(' + this.value.elements.map((v) => v.toFixed(precision)).join(', ') + ')';
    }
}

export class S2LocalBBox {
    protected position: S2Position;
    protected extents: S2Extents;
    protected dirty: boolean;

    constructor() {
        this.position = new S2Position(0, 0, 'view');
        this.extents = new S2Extents(0, 0, 'view');
        this.dirty = false;
    }

    // set()
}
