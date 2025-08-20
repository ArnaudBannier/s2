export class Matrix2 {
    // Row-major order of the elements.
    elements: Array<number> = [0, 0, 0, 0];

    constructor(a00 = 0, a01 = 0, a10 = 0, a11 = 0) {
        this.set(a00, a01, a10, a11);
    }

    set(a00 = 0, a01 = 0, a10 = 0, a11 = 0): this {
        this.elements[0] = a00;
        this.elements[2] = a01;
        this.elements[1] = a10;
        this.elements[3] = a11;
        return this;
    }

    fromArray(array: Array<number>, offset = 0): this {
        for (let i = 0; i < 4; i++) {
            this.elements[i] = array[i + offset];
        }
        return this;
    }

    identity(): this {
        return this.set(1, 0, 0, 1);
    }

    multiplyMatrices(a: Matrix2, b: Matrix2): this {
        const ae = a.elements;
        const be = b.elements;
        const te = this.elements;

        const a00 = ae[0],
            a01 = ae[2];
        const a10 = ae[1],
            a11 = ae[3];

        const b00 = be[0],
            b01 = be[2];
        const b10 = be[1],
            b11 = be[3];

        te[0] = a00 * b00 + a01 * b10;
        te[2] = a00 * b01 + a01 * b11;

        te[1] = a10 * b00 + a11 * b10;
        te[3] = a10 * b01 + a11 * b11;

        return this;
    }

    multiply(m: Matrix2): this {
        return this.multiplyMatrices(this, m);
    }

    premultiply(m: Matrix2): this {
        return this.multiplyMatrices(m, this);
    }

    copyFrom(m: Matrix2): this {
        for (let i = 0; i < 4; i++) {
            this.elements[i] = m.elements[i];
        }
        return this;
    }

    makeScale(sx: number, sy: number): this {
        return this.set(sx, 0, 0, sy);
    }

    makeRotation(angle: number): this {
        const s = Math.sin(angle);
        const c = Math.cos(angle);
        return this.set(c, -s, s, c);
    }
}
