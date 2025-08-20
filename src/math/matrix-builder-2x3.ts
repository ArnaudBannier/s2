import { Matrix2x3 } from './matrix2x3';
import { Vector2 } from './vector2';

export class MatrixBuilder2x3 {
    protected matrix: Matrix2x3;
    protected tmp: Matrix2x3;

    constructor() {
        this.tmp = new Matrix2x3();
        this.matrix = this.tmp;
    }

    setTarget(matrix: Matrix2x3, makeIdentity: boolean = true): this {
        this.matrix = matrix;
        if (makeIdentity) this.matrix.identity();
        return this;
    }

    identity(): this {
        this.matrix.identity();
        return this;
    }

    rotateRad(angle: number): this {
        this.tmp.makeRotationRad(angle);
        this.matrix.premultiply(this.tmp);
        return this;
    }

    rotateDeg(angle: number): this {
        this.tmp.makeRotationDeg(angle);
        this.matrix.premultiply(this.tmp);
        return this;
    }

    translate(x: number, y: number): this {
        this.tmp.makeTranslation(x, y);
        this.matrix.premultiply(this.tmp);
        return this;
    }

    translateV(t: Vector2): this {
        this.tmp.makeTranslation(t.x, t.y);
        this.matrix.premultiply(this.tmp);
        return this;
    }

    scale(scaleX: number, scaleY: number): this {
        this.tmp.makeScale(scaleX, scaleY);
        this.matrix.premultiply(this.tmp);
        return this;
    }

    scaleFrom(scaleX: number, scaleY: number, centerX: number, centerY: number): this {
        this.tmp.makeScaleFrom(scaleX, scaleY, centerX, centerY);
        this.matrix.premultiply(this.tmp);
        return this;
    }

    scaleFromV(scaleX: number, scaleY: number, center: Vector2): this {
        return this.scaleFrom(scaleX, scaleY, center.x, center.y);
    }

    scaleUniform(value: number): this {
        this.tmp.makeScale(value, value);
        this.matrix.premultiply(this.tmp);
        return this;
    }

    scaleUniformFrom(value: number, centerX: number, centerY: number): this {
        return this.scaleFrom(value, value, centerX, centerY);
    }

    scaleUniformFromV(value: number, center: Vector2): this {
        return this.scaleFrom(value, value, center.x, center.y);
    }

    rotateFromRad(angle: number, centerX: number, centerY: number): this {
        this.tmp.makeRotationFromRad(angle, centerX, centerY);
        this.matrix.premultiply(this.tmp);
        return this;
    }

    rotateFromRadV(angle: number, center: Vector2): this {
        return this.rotateFromRad(angle, center.x, center.y);
    }

    rotateFromDeg(angle: number, centerX: number, centerY: number): this {
        this.tmp.makeRotationFromDeg(angle, centerX, centerY);
        this.matrix.premultiply(this.tmp);
        return this;
    }

    rotateFromDegV(angle: number, center: Vector2): this {
        return this.rotateFromDeg(angle, center.x, center.y);
    }
}
