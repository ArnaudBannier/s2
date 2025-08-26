import { S2Mat2x3 } from './s2-mat2x3';
import { S2Vec2 } from './s2-vec2';

export class S2Mat2x3Builder {
    protected matrix: S2Mat2x3;
    protected tmp: S2Mat2x3;

    constructor() {
        this.tmp = new S2Mat2x3();
        this.matrix = this.tmp;
    }

    setTarget(matrix: S2Mat2x3, makeIdentity: boolean = true): this {
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

    translateV(t: S2Vec2): this {
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

    scaleFromV(scaleX: number, scaleY: number, center: S2Vec2): this {
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

    scaleUniformFromV(value: number, center: S2Vec2): this {
        return this.scaleFrom(value, value, center.x, center.y);
    }

    rotateFromRad(angle: number, centerX: number, centerY: number): this {
        this.tmp.makeRotationFromRad(angle, centerX, centerY);
        this.matrix.premultiply(this.tmp);
        return this;
    }

    rotateFromRadV(angle: number, center: S2Vec2): this {
        return this.rotateFromRad(angle, center.x, center.y);
    }

    rotateFromDeg(angle: number, centerX: number, centerY: number): this {
        this.tmp.makeRotationFromDeg(angle, centerX, centerY);
        this.matrix.premultiply(this.tmp);
        return this;
    }

    rotateFromDegV(angle: number, center: S2Vec2): this {
        return this.rotateFromDeg(angle, center.x, center.y);
    }
}
