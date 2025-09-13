export class S2Mat2x3 {
    // Row-major order of the elements.
    elements: Array<number> = [0, 0, 0, 0, 0, 0];

    constructor(a00: number = 0, a01: number = 0, a02: number = 0, a10: number = 0, a11: number = 0, a12: number = 0) {
        this.set(a00, a01, a02, a10, a11, a12);
    }

    static createIdentity(): S2Mat2x3 {
        return new S2Mat2x3(1, 0, 0, 0, 1, 0);
    }

    static lerp(matrix0: S2Mat2x3, matrix1: S2Mat2x3, t: number): S2Mat2x3 {
        const s = 1 - t;
        return new S2Mat2x3(
            s * matrix0.elements[0] + t * matrix1.elements[0],
            s * matrix0.elements[1] + t * matrix1.elements[1],
            s * matrix0.elements[2] + t * matrix1.elements[2],
            s * matrix0.elements[3] + t * matrix1.elements[3],
            s * matrix0.elements[4] + t * matrix1.elements[4],
            s * matrix0.elements[5] + t * matrix1.elements[5],
        );
    }

    lerp(matrix0: S2Mat2x3, matrix1: S2Mat2x3, t: number): this {
        const s = 1 - t;
        for (let i = 0; i < 6; i++) {
            this.elements[i] = s * matrix0.elements[i] + t * matrix1.elements[i];
        }
        return this;
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

    fromArray(array: Array<number>, offset = 0): this {
        for (let i = 0; i < 6; i++) {
            this.elements[i] = array[i + offset];
        }
        return this;
    }

    isIdentity(): boolean {
        const te = this.elements;
        if (te[0] === 1 && te[2] === 0 && te[4] === 0 && te[1] === 0 && te[3] === 1 && te[5] === 0) {
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

    multiply(m: S2Mat2x3): this {
        return this.multiplyMatrices(this, m);
    }

    premultiply(m: S2Mat2x3): this {
        return this.multiplyMatrices(m, this);
    }

    copy(m: S2Mat2x3): this {
        for (let i = 0; i < 6; i++) {
            this.elements[i] = m.elements[i];
        }
        return this;
    }

    clone(): S2Mat2x3 {
        return new S2Mat2x3().copy(this);
    }

    makeIdentity(): this {
        return this.set(1, 0, 0, 0, 1, 0);
    }

    makeTranslation(x: number, y: number): this {
        return this.set(1, 0, x, 0, 1, y);
    }

    makeScale(sx: number, sy: number): this {
        return this.set(sx, 0, 0, 0, sy, 0);
    }

    makeScaleFrom(scaleX: number, scaleY: number, centerX: number, centerY: number): this {
        return this.set(scaleX, 0, -scaleX * centerX + centerX, 0, scaleY, -scaleY * centerY + centerY);
    }

    makeRotationRad(angle: number): this {
        const s = Math.sin(angle);
        const c = Math.cos(angle);
        return this.set(c, -s, 0, +s, c, 0);
    }

    makeRotationDeg(angle: number): this {
        return this.makeRotationRad((angle * Math.PI) / 180.0);
    }

    makeRotationFromRad(angle: number, centerX: number, centerY: number): this {
        const s = Math.sin(angle);
        const c = Math.cos(angle);
        return this.set(c, -s, -centerX * c + centerY * s + centerX, +s, c, -centerY * c - centerX * s + centerY);
    }

    makeRotationFromDeg(angle: number, centerX: number, centerY: number): this {
        return this.makeRotationFromRad((angle * Math.PI) / 180.0, centerX, centerY);
    }
}
