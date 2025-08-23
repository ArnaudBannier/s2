import { type S2BaseScene, type S2HasStrokeWidth, S2Parameters } from '../s2-interface';
import { Vector2 } from '../../math/vector2';
import { Matrix2x3 } from '../../math/matrix2x3';
import { MatrixBuilder2x3 } from '../../math/matrix-builder-2x3';
import { type S2Space, S2Length } from '../s2-space';
import { S2Element } from './s2-element';
import { S2Color } from '../s2-globals';

export abstract class S2Graphics<T extends SVGGraphicsElement> extends S2Element<T> implements S2HasStrokeWidth {
    public transform: Matrix2x3;
    public fillColor: S2Color | undefined = undefined;
    public fillOpacity: number | undefined = undefined;
    public opacity: number | undefined = undefined;
    protected strokeWidth: S2Length;
    public strokeColor: S2Color | undefined = undefined;

    constructor(element: T, scene: S2BaseScene) {
        super(element, scene);
        this.transform = Matrix2x3.createIdentity();
        this.strokeWidth = new S2Length(0, 'view');
    }

    setParameters(params: S2Parameters): this {
        super.setParameters(params);
        if (params.strokeWidth) this.setStrokeWidth(params.strokeWidth.value, params.strokeWidth.space);
        if (params.fillColor) this.fillColor = params.fillColor;
        if (params.fillOpacity) this.fillOpacity = params.fillOpacity;
        if (params.opacity) this.opacity = params.opacity;
        if (params.strokeColor) this.strokeColor = params.strokeColor;
        return this;
    }

    getParameters(): S2Parameters {
        const parameters = super.getParameters();
        if (this.strokeColor !== undefined) parameters.strokeColor = this.strokeColor;
        if (this.strokeWidth.value > 0) parameters.strokeWidth = this.strokeWidth.clone();
        if (this.fillColor !== undefined) parameters.fillColor = this.fillColor;
        if (this.fillOpacity !== undefined) parameters.fillOpacity = this.fillOpacity;
        if (this.opacity !== undefined) parameters.opacity = this.opacity;
        return parameters;
    }

    setFillColor(color?: S2Color): this {
        this.fillColor = color ? color.clone() : undefined;
        return this;
    }

    setStrokeColor(color?: S2Color): this {
        this.strokeColor = color ? color.clone() : undefined;
        return this;
    }

    setOpacity(opacity: number): this {
        this.opacity = opacity;
        return this;
    }

    setStrokeWidth(strokeWidth: number, space?: S2Space): this {
        if (space) this.strokeWidth.space = space;
        this.strokeWidth.value = strokeWidth;
        return this;
    }

    getStrokeWidth(space: S2Space = this.strokeWidth.space): number {
        return this.strokeWidth.toSpace(space, this.getActiveCamera());
    }

    changeStrokeWidthSpace(space: S2Space): this {
        this.strokeWidth.changeSpace(space, this.getActiveCamera());
        return this;
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
        if (this.fillColor !== undefined) this.element.setAttribute('fill', this.fillColor.toRgb());
        if (this.fillOpacity !== undefined) this.element.setAttribute('fill-opacity', this.fillOpacity.toString());
        if (this.opacity !== undefined) this.element.setAttribute('opacity', this.opacity.toString());
        if (this.strokeColor !== undefined) this.element.setAttribute('stroke', this.strokeColor.toRgb());
        if (this.strokeWidth.value > 0) {
            const strokeWidth = this.getStrokeWidth('view');
            this.element.setAttribute('stroke-width', strokeWidth.toString());
        }
        return this;
    }
}
