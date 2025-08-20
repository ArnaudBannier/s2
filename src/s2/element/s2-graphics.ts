import { type S2SceneInterface } from '../s2-scene-interface';
import { Vector2 } from '../../math/vector2';
import { Matrix2x3 } from '../../math/matrix2x3';
import { MatrixBuilder2x3 } from '../../math/matrix-builder-2x3';
import { S2Element } from './s2-element';

export abstract class S2Graphics<T extends SVGGraphicsElement> extends S2Element<T> {
    public transform: Matrix2x3;

    constructor(element: T, scene: S2SceneInterface) {
        super(element, scene);
        this.transform = Matrix2x3.createIdentity();
    }

    buildTransform(builder?: MatrixBuilder2x3, makeIdentity: boolean = true): MatrixBuilder2x3 {
        builder = builder ?? new MatrixBuilder2x3();
        return builder.setTarget(this.transform, makeIdentity);
    }

    setTranslation(x: number, y: number): this {
        this.transform.makeTranslation(x, y);
        return this;
    }

    setTranslationV(t: Vector2): this {
        this.transform.makeTranslation(t.x, t.y);
        return this;
    }

    setScale(scaleX: number, scaleY: number): this {
        this.transform.makeScale(scaleX, scaleY);
        return this;
    }

    setScaleFrom(scaleX: number, scaleY: number, centerX: number, centerY: number): this {
        this.transform.makeScaleFrom(scaleX, scaleY, centerX, centerY);
        return this;
    }

    setScaleFromV(scaleX: number, scaleY: number, center: Vector2): this {
        this.transform.makeScaleFrom(scaleX, scaleY, center.x, center.y);
        return this;
    }

    setRotationRad(angle: number): this {
        this.transform.makeRotationRad(angle);
        return this;
    }

    setRotationDeg(angle: number): this {
        this.transform.makeRotationDeg(angle);
        return this;
    }

    setRotationFromRad(angle: number, centerX: number, centerY: number): this {
        this.transform.makeRotationFromRad(angle, centerX, centerY);
        return this;
    }

    setRotationFromRadV(angle: number, center: Vector2): this {
        this.transform.makeRotationFromRad(angle, center.x, center.y);
        return this;
    }

    setRotationFromDeg(angle: number, centerX: number, centerY: number): this {
        this.transform.makeRotationFromDeg(angle, centerX, centerY);
        return this;
    }

    setRotationFromDegV(angle: number, center: Vector2): this {
        this.transform.makeRotationFromDeg(angle, center.x, center.y);
        return this;
    }

    update(): this {
        super.update();
        if (!this.transform.isIdentity()) {
            const te = this.transform.elements;
            this.element.setAttribute(
                'transform',
                `matrix(${te[0]}, ${te[1]}, ${te[2]}, ${te[3]}, ${te[4]}, ${te[5]})`,
            );
        }
        return this;
    }
}
