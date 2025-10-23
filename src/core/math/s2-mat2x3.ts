import type { S2AngleUnit } from './s2-math-utils';
import type { S2Vec2 } from './s2-vec2';

export class S2Mat2x3 {
    // Column-major order of the elements (columns contiguous).
    readonly elements: Float32Array = new Float32Array(6);

    constructor(a00: number = 0, a01: number = 0, a02: number = 0, a10: number = 0, a11: number = 0, a12: number = 0) {
        this.set(a00, a01, a02, a10, a11, a12);
    }

    static createIdentity(): S2Mat2x3 {
        return new S2Mat2x3(1, 0, 0, 0, 1, 0);
    }

    static lerp(matrix0: S2Mat2x3, matrix1: S2Mat2x3, t: number): S2Mat2x3 {
        return new S2Mat2x3().copy(matrix0).lerp(matrix1, t);
    }

    static equals(m1: S2Mat2x3, m2: S2Mat2x3, epsilon: number = 1e-4): boolean {
        const a = m1.elements;
        const b = m2.elements;
        return (
            Math.abs(a[0] - b[0]) <= epsilon &&
            Math.abs(a[1] - b[1]) <= epsilon &&
            Math.abs(a[2] - b[2]) <= epsilon &&
            Math.abs(a[3] - b[3]) <= epsilon &&
            Math.abs(a[4] - b[4]) <= epsilon &&
            Math.abs(a[5] - b[5]) <= epsilon
        );
    }

    static det(matrix: S2Mat2x3): number {
        const e = matrix.elements;
        return e[0] * e[3] - e[2] * e[1];
    }

    set(a00: number = 0, a01: number = 0, a02: number = 0, a10: number = 0, a11: number = 0, a12: number = 0): this {
        this.elements[0] = a00;
        this.elements[2] = a01;
        this.elements[4] = a02;
        this.elements[1] = a10;
        this.elements[3] = a11;
        this.elements[5] = a12;
        return this;
    }

    lerp(matrix: S2Mat2x3, t: number): this {
        const s = 1 - t;
        const te = this.elements;
        const me = matrix.elements;
        te[0] = s * te[0] + t * me[0];
        te[1] = s * te[1] + t * me[1];
        te[2] = s * te[2] + t * me[2];
        te[3] = s * te[3] + t * me[3];
        te[4] = s * te[4] + t * me[4];
        te[5] = s * te[5] + t * me[5];
        return this;
    }

    fromArray(array: Array<number>, offset = 0): this {
        for (let i = 0; i < 6; i++) {
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
            Math.abs(te[3] - 1) <= epsilon &&
            Math.abs(te[4]) <= epsilon &&
            Math.abs(te[5]) <= epsilon
        ) {
            return true;
        }
        return false;
    }

    multiplyMatrices(a: S2Mat2x3, b: S2Mat2x3): this {
        const ae = a.elements;
        const be = b.elements;
        const te = this.elements;
        const a00 = ae[0];
        const a10 = ae[1];
        const a01 = ae[2];
        const a11 = ae[3];
        const a02 = ae[4];
        const a12 = ae[5];
        const b00 = be[0];
        const b10 = be[1];
        const b01 = be[2];
        const b11 = be[3];
        const b02 = be[4];
        const b12 = be[5];
        te[0] = a00 * b00 + a01 * b10;
        te[1] = a10 * b00 + a11 * b10;
        te[2] = a00 * b01 + a01 * b11;
        te[3] = a10 * b01 + a11 * b11;
        te[4] = a00 * b02 + a01 * b12 + a02;
        te[5] = a10 * b02 + a11 * b12 + a12;
        return this;
    }

    private composeAfterCoefficients(
        a00: number,
        a01: number,
        a02: number,
        a10: number,
        a11: number,
        a12: number,
    ): this {
        const te = this.elements;
        const b00 = te[0];
        const b10 = te[1];
        const b01 = te[2];
        const b11 = te[3];
        const b02 = te[4];
        const b12 = te[5];
        te[0] = a00 * b00 + a01 * b10;
        te[1] = a10 * b00 + a11 * b10;
        te[2] = a00 * b01 + a01 * b11;
        te[3] = a10 * b01 + a11 * b11;
        te[4] = a00 * b02 + a01 * b12 + a02;
        te[5] = a10 * b02 + a11 * b12 + a12;
        return this;
    }

    composeAfter(m: S2Mat2x3): this {
        return this.multiplyMatrices(this, m);
    }

    composeBefore(m: S2Mat2x3): this {
        return this.multiplyMatrices(m, this);
    }

    invert(): this {
        const te = this.elements;
        const a00 = te[0];
        const a10 = te[1];
        const a01 = te[2];
        const a11 = te[3];
        const a02 = te[4];
        const a12 = te[5];
        const det = a00 * a11 - a01 * a10;

        if (det === 0) {
            console.warn('S2Mat2x3: .invert() can not invert matrix, determinant is 0');
            return this.makeIdentity();
        }

        const invDet = 1 / det;
        this.set(
            a11 * invDet,
            -a01 * invDet,
            (a01 * a12 - a11 * a02) * invDet,
            -a10 * invDet,
            a00 * invDet,
            (a10 * a02 - a00 * a12) * invDet,
        );
        return this;
    }

    copy(m: S2Mat2x3): this {
        const te = this.elements;
        const me = m.elements;
        te[0] = me[0];
        te[1] = me[1];
        te[2] = me[2];
        te[3] = me[3];
        te[4] = me[4];
        te[5] = me[5];
        return this;
    }

    clone(): S2Mat2x3 {
        return new S2Mat2x3().copy(this);
    }

    det(): number {
        const te = this.elements;
        return te[0] * te[3] - te[2] * te[1];
    }

    makeIdentity(): this {
        return this.set(1, 0, 0, 0, 1, 0);
    }

    makeTranslation(x: number, y: number): this {
        return this.set(1, 0, x, 0, 1, y);
    }

    makeTranslationV(v: S2Vec2): this {
        return this.makeTranslation(v.x, v.y);
    }

    makeScale(scaleX: number, scaleY: number): this {
        return this.set(scaleX, 0, 0, 0, scaleY, 0);
    }

    makeScaleV(v: S2Vec2): this {
        return this.makeScale(v.x, v.y);
    }

    makeScaleFrom(scaleX: number, scaleY: number, centerX: number, centerY: number): this {
        return this.set(scaleX, 0, -scaleX * centerX + centerX, 0, scaleY, -scaleY * centerY + centerY);
    }

    makeScaleFromV(scaleX: number, scaleY: number, center: S2Vec2): this {
        return this.makeScaleFrom(scaleX, scaleY, center.x, center.y);
    }

    makeRotation(angle: number, unit: S2AngleUnit): this {
        if (unit === 'deg') angle *= Math.PI / 180.0;
        const s = Math.sin(angle);
        const c = Math.cos(angle);
        return this.set(c, -s, 0, +s, c, 0);
    }

    makeRotationFrom(angle: number, unit: S2AngleUnit, centerX: number, centerY: number): this {
        if (unit === 'deg') angle *= Math.PI / 180.0;
        const s = Math.sin(angle);
        const c = Math.cos(angle);
        return this.set(c, -s, -centerX * c + centerY * s + centerX, +s, c, -centerY * c - centerX * s + centerY);
    }

    makeRotationFromV(angle: number, unit: S2AngleUnit, center: S2Vec2): this {
        return this.makeRotationFrom(angle, unit, center.x, center.y);
    }

    translate(x: number, y: number): this {
        const te = this.elements;
        te[4] += x;
        te[5] += y;
        return this;
    }

    translateV(v: S2Vec2): this {
        return this.translate(v.x, v.y);
    }

    scale(scaleX: number, scaleY: number): this {
        const te = this.elements;
        te[0] *= scaleX;
        te[1] *= scaleY;
        te[2] *= scaleX;
        te[3] *= scaleY;
        te[4] *= scaleX;
        te[5] *= scaleY;
        return this;
    }

    scaleV(v: S2Vec2): this {
        return this.scale(v.x, v.y);
    }

    scaleFrom(scaleX: number, scaleY: number, centerX: number, centerY: number): this {
        return this.composeAfterCoefficients(
            scaleX,
            0,
            -scaleX * centerX + centerX,
            0,
            scaleY,
            -scaleY * centerY + centerY,
        );
    }

    scaleFromV(scaleX: number, scaleY: number, center: S2Vec2): this {
        return this.scaleFrom(scaleX, scaleY, center.x, center.y);
    }

    rotate(angle: number, unit: S2AngleUnit = 'rad'): this {
        if (unit === 'deg') angle *= Math.PI / 180.0;
        const s = Math.sin(angle);
        const c = Math.cos(angle);
        return this.composeAfterCoefficients(c, -s, 0, +s, c, 0);
    }

    rotateFrom(angle: number, unit: S2AngleUnit, centerX: number, centerY: number): this {
        if (unit === 'deg') angle *= Math.PI / 180.0;
        const s = Math.sin(angle);
        const c = Math.cos(angle);
        return this.composeAfterCoefficients(
            c,
            -s,
            -centerX * c + centerY * s + centerX,
            +s,
            c,
            -centerY * c - centerX * s + centerY,
        );
    }

    rotateFromV(angle: number, unit: S2AngleUnit, center: S2Vec2): this {
        return this.rotateFrom(angle, unit, center.x, center.y);
    }
}
