import { S2Mat2 } from './s2-mat2';
import { S2Mat2x3 } from './s2-mat2x3';

export class S2Vec2 {
    public x: number;
    public y: number;

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    static fromPolarRad(theta: number, r: number = 1.0): S2Vec2 {
        return new S2Vec2(r * Math.cos(theta), r * Math.sin(theta));
    }

    static fromPolarDeg(theta: number, r: number = 1.0): S2Vec2 {
        theta *= Math.PI / 180.0;
        return new S2Vec2(r * Math.cos(theta), r * Math.sin(theta));
    }

    static add(v1: S2Vec2, v2: S2Vec2): S2Vec2 {
        return new S2Vec2(v1.x + v2.x, v1.y + v2.y);
    }

    static sub(v1: S2Vec2, v2: S2Vec2): S2Vec2 {
        return new S2Vec2(v1.x - v2.x, v1.y - v2.y);
    }

    static mul(v1: S2Vec2, v2: S2Vec2): S2Vec2 {
        return new S2Vec2(v1.x * v2.x, v1.y * v2.y);
    }

    static scale(v: S2Vec2, s: number): S2Vec2 {
        return new S2Vec2(v.x * s, v.y * s);
    }

    static lerp(v1: S2Vec2, v2: S2Vec2, t: number): S2Vec2 {
        const s = 1 - t;
        return new S2Vec2(s * v1.x + t * v2.x, s * v1.y + t * v2.y);
    }

    static eq(v1: S2Vec2, v2: S2Vec2, epsilon: number = 1e-4): boolean {
        return Math.abs(v1.x - v2.x) < epsilon && Math.abs(v1.y - v2.y) < epsilon;
    }

    get width(): number {
        return this.x;
    }

    set width(value: number) {
        this.x = value;
    }

    get height(): number {
        return this.y;
    }

    set height(value: number) {
        this.y = value;
    }

    set(x: number, y: number): this {
        this.x = x;
        this.y = y;
        return this;
    }

    setX(x: number): this {
        this.x = x;
        return this;
    }

    setY(y: number): this {
        this.y = y;
        return this;
    }

    setFromPolarRad(theta: number, r: number = 1.0): S2Vec2 {
        return this.set(r * Math.cos(theta), r * Math.sin(theta));
    }

    setFromPolarDeg(theta: number, r: number = 1.0): S2Vec2 {
        theta *= Math.PI / 180.0;
        return this.set(r * Math.cos(theta), r * Math.sin(theta));
    }

    shiftX(dx: number): this {
        this.x += dx;
        return this;
    }

    shiftY(dy: number): this {
        this.y += dy;
        return this;
    }

    setComponent(index: number, value: number): this {
        switch (index) {
            case 0:
                this.x = value;
                break;
            case 1:
                this.y = value;
                break;
            default:
                throw new Error('index is out of range: ' + index);
        }
        return this;
    }

    getComponent(index: number): number {
        switch (index) {
            case 0:
                return this.x;
            case 1:
                return this.y;
            default:
                throw new Error('index is out of range: ' + index);
        }
    }

    clone(): S2Vec2 {
        return new S2Vec2(this.x, this.y);
    }

    copy(v: S2Vec2): this {
        this.x = v.x;
        this.y = v.y;
        return this;
    }

    add(x: number, y: number): this {
        this.x += x;
        this.y += y;
        return this;
    }

    addV(v: S2Vec2): this {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    sub(x: number, y: number): this {
        this.x -= x;
        this.y -= y;
        return this;
    }

    subV(v: S2Vec2): this {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    mul(x: number, y: number): this {
        this.x *= x;
        this.y *= y;
        return this;
    }

    mulV(v: S2Vec2): this {
        this.x *= v.x;
        this.y *= v.y;
        return this;
    }

    scale(s: number): this {
        this.x *= s;
        this.y *= s;
        return this;
    }

    negate(): this {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    }

    min(x: number, y: number): this {
        this.x = Math.min(this.x, x);
        this.y = Math.min(this.y, y);
        return this;
    }

    minV(v: S2Vec2): this {
        this.x = Math.min(this.x, v.x);
        this.y = Math.min(this.y, v.y);
        return this;
    }

    max(x: number, y: number): this {
        this.x = Math.max(this.x, x);
        this.y = Math.max(this.y, y);
        return this;
    }

    maxV(v: S2Vec2): this {
        this.x = Math.max(this.x, v.x);
        this.y = Math.max(this.y, v.y);
        return this;
    }

    apply2x2(matrix: S2Mat2): this {
        const me = matrix.elements;
        const x = this.x,
            y = this.y;
        this.x = me[0] * x + me[2] * y;
        this.y = me[1] * x + me[3] * y;
        return this;
    }

    apply2x3(matrix: S2Mat2x3): this {
        const me = matrix.elements;
        const x = this.x,
            y = this.y;
        this.x = me[0] * x + me[2] * y + me[4];
        this.y = me[1] * x + me[3] * y + me[5];
        return this;
    }

    dot(v: S2Vec2): number {
        return this.x * v.x + this.y * v.y;
    }

    det(v: S2Vec2): number {
        return this.x * v.y - this.y * v.x;
    }

    lengthSq(): number {
        return this.x * this.x + this.y * this.y;
    }

    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    distanceSq(v: S2Vec2): number {
        const dx = v.x - this.x;
        const dy = v.y - this.y;
        return dx * dx + dy * dy;
    }

    distance(v: S2Vec2): number {
        return Math.sqrt(this.distanceSq(v));
    }

    normalize(): this {
        return this.scale(1.0 / this.length());
    }

    setLength(length: number): this {
        return this.scale(length / this.length());
    }

    fromArray(array: Array<number>, offset: number = 0): this {
        this.x = array[offset];
        this.y = array[offset + 1];
        return this;
    }

    toArray(array: Array<number> = [], offset: number = 0): Array<number> {
        array[offset] = this.x;
        array[offset + 1] = this.y;
        return array;
    }

    angle(): number {
        return Math.atan2(-this.y, this.x);
    }

    angleTo(v: S2Vec2): number {
        const s = this.det(v);
        const c = this.dot(v);
        return Math.atan2(s, c);
    }

    perp(flip: boolean = false): this {
        const x = this.x;
        const sign = flip ? -1 : 1;
        this.x = -sign * this.y;
        this.y = sign * x;
        return this;
    }

    rotateRad(angle: number): this {
        const s = Math.sin(angle);
        const c = Math.cos(angle);
        const x = this.x,
            y = this.y;
        this.x = c * x - s * y;
        this.y = s * x + c * y;
        return this;
    }

    rotateDeg(angle: number): this {
        return this.rotateRad((angle * Math.PI) / 180.0);
    }

    *[Symbol.iterator]() {
        yield this.x;
        yield this.y;
    }
}
