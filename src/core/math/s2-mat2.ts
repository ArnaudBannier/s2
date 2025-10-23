import type { S2AngleUnit } from './s2-math-utils';
import type { S2Vec2 } from './s2-vec2';

export class S2Mat2 {
    // Column-major order of the elements (columns contiguous).
    readonly elements: Float32Array = new Float32Array(4);

    constructor(a00 = 0, a01 = 0, a10 = 0, a11 = 0) {
        this.set(a00, a01, a10, a11);
    }

    static createIdentity(): S2Mat2 {
        return new S2Mat2(1, 0, 0, 1);
    }

    static lerp(matrix0: S2Mat2, matrix1: S2Mat2, t: number): S2Mat2 {
        return new S2Mat2().copy(matrix0).lerp(matrix1, t);
    }

    static equals(m1: S2Mat2, m2: S2Mat2, epsilon: number = 1e-4): boolean {
        const a = m1.elements;
        const b = m2.elements;
        return (
            Math.abs(a[0] - b[0]) <= epsilon &&
            Math.abs(a[1] - b[1]) <= epsilon &&
            Math.abs(a[2] - b[2]) <= epsilon &&
            Math.abs(a[3] - b[3]) <= epsilon
        );
    }

    static det(matrix: S2Mat2): number {
        const e = matrix.elements;
        return e[0] * e[3] - e[2] * e[1];
    }

    set(a00: number = 0, a01: number = 0, a10: number = 0, a11: number = 0): this {
        this.elements[0] = a00;
        this.elements[2] = a01;
        this.elements[1] = a10;
        this.elements[3] = a11;
        return this;
    }

    lerp(matrix: S2Mat2, t: number): this {
        const s = 1 - t;
        const te = this.elements;
        const me = matrix.elements;
        te[0] = s * te[0] + t * me[0];
        te[1] = s * te[1] + t * me[1];
        te[2] = s * te[2] + t * me[2];
        te[3] = s * te[3] + t * me[3];
        return this;
    }

    fromArray(array: Array<number>, offset = 0): this {
        for (let i = 0; i < 4; i++) {
            this.elements[i] = array[i + offset];
        }
        return this;
    }

    isIdentity(epsilon: number = 1e-4): boolean {
        const te = this.elements;
        if (
            Math.abs(te[0] - 1) <= epsilon &&
            Math.abs(te[1]) <= epsilon &&
            Math.abs(te[2]) <= epsilon &&
            Math.abs(te[3] - 1) <= epsilon
        ) {
            return true;
        }
        return false;
    }

    identity(): this {
        return this.set(1, 0, 0, 1);
    }

    multiplyMatrices(a: S2Mat2, b: S2Mat2): this {
        const ae = a.elements;
        const be = b.elements;
        const te = this.elements;
        const a00 = ae[0];
        const a10 = ae[1];
        const a01 = ae[2];
        const a11 = ae[3];
        const b00 = be[0];
        const b10 = be[1];
        const b01 = be[2];
        const b11 = be[3];
        te[0] = a00 * b00 + a01 * b10;
        te[2] = a00 * b01 + a01 * b11;
        te[1] = a10 * b00 + a11 * b10;
        te[3] = a10 * b01 + a11 * b11;
        return this;
    }

    private composeAfterCoefficients(a00: number, a01: number, a10: number, a11: number): this {
        const te = this.elements;
        const b00 = te[0];
        const b10 = te[1];
        const b01 = te[2];
        const b11 = te[3];
        te[0] = a00 * b00 + a01 * b10;
        te[1] = a10 * b00 + a11 * b10;
        te[2] = a00 * b01 + a01 * b11;
        te[3] = a10 * b01 + a11 * b11;
        return this;
    }

    composeAfter(m: S2Mat2): this {
        return this.multiplyMatrices(this, m);
    }

    composeBefore(m: S2Mat2): this {
        return this.multiplyMatrices(m, this);
    }

    invert(): this {
        const te = this.elements;
        const a00 = te[0];
        const a10 = te[1];
        const a01 = te[2];
        const a11 = te[3];
        const det = a00 * a11 - a01 * a10;

        if (det === 0) {
            console.warn('S2Mat2x3: .invert() can not invert matrix, determinant is 0');
            return this.makeIdentity();
        }

        const invDet = 1 / det;
        this.set(a11 * invDet, -a01 * invDet, -a10 * invDet, a00 * invDet);
        return this;
    }

    copy(m: S2Mat2): this {
        const te = this.elements;
        const me = m.elements;
        te[0] = me[0];
        te[1] = me[1];
        te[2] = me[2];
        te[3] = me[3];
        return this;
    }

    clone(): S2Mat2 {
        return new S2Mat2().copy(this);
    }

    det(): number {
        const te = this.elements;
        return te[0] * te[3] - te[2] * te[1];
    }

    makeIdentity(): this {
        return this.set(1, 0, 0, 1);
    }

    makeScale(scaleX: number, scaleY: number): this {
        return this.set(scaleX, 0, 0, scaleY);
    }

    makeScaleV(v: S2Vec2): this {
        return this.set(v.x, 0, 0, v.y);
    }

    makeRotation(angle: number, unit: S2AngleUnit = 'rad'): this {
        if (unit === 'deg') angle *= Math.PI / 180.0;
        const s = Math.sin(angle);
        const c = Math.cos(angle);
        return this.set(c, -s, s, c);
    }

    scale(scaleX: number, scaleY: number): this {
        const te = this.elements;
        te[0] *= scaleX;
        te[1] *= scaleY;
        te[2] *= scaleX;
        te[3] *= scaleY;
        return this;
    }

    rotate(angle: number, unit: S2AngleUnit = 'rad'): this {
        if (unit === 'deg') angle *= Math.PI / 180.0;
        const s = Math.sin(angle);
        const c = Math.cos(angle);
        return this.composeAfterCoefficients(c, -s, +s, c);
    }
}
