import { type S2BaseScene, type S2HasStrokeWidth } from '../s2-interface';
import { S2Vec2 } from '../math/s2-vec2';
import { S2Mat2x3 } from '../math/s2-mat2x3';
import { S2Mat2x3Builder } from '../math/s2-mat2x3-builder';
import { type S2Space, S2Length } from '../math/s2-space';
import { S2Element } from './s2-element';
import { S2Color, type S2LineCap, type S2LineJoin } from '../s2-globals';
import { S2Animatable, S2Attributes } from '../s2-attributes';

export abstract class S2Graphics extends S2Element implements S2HasStrokeWidth {
    public transform: S2Mat2x3;
    protected strokeWidth: S2Length;

    public fillColor?: S2Color;
    public fillOpacity?: number;
    public opacity?: number;
    public strokeColor?: S2Color;
    public lineCap?: S2LineCap;
    public lineJoin?: S2LineJoin;

    constructor(scene: S2BaseScene) {
        super(scene);
        this.transform = S2Mat2x3.createIdentity();
        this.strokeWidth = new S2Length(0, 'view');
    }

    setAnimatableAttributes(attributes: S2Animatable): this {
        super.setAnimatableAttributes(attributes);
        this.setFillColor(attributes.fillColor)
            .setFillOpacity(attributes.fillOpacity)
            .setOpacity(attributes.opacity)
            .setStrokeColor(attributes.strokeColor)
            .setStrokeWidthL(attributes.strokeWidth);
        return this;
    }

    getAnimatableAttributes(): S2Animatable {
        const attributes = super.getAnimatableAttributes();
        if (this.strokeColor !== undefined) attributes.strokeColor = this.strokeColor;
        if (this.strokeWidth.value > 0) attributes.strokeWidth = this.strokeWidth;
        if (this.fillColor !== undefined) attributes.fillColor = this.fillColor;
        if (this.fillOpacity !== undefined) attributes.fillOpacity = this.fillOpacity;
        if (this.opacity !== undefined) attributes.opacity = this.opacity;
        return attributes;
    }

    setAttributes(attributes: S2Attributes): this {
        super.setAttributes(attributes);
        this.setFillColor(attributes.fillColor)
            .setFillOpacity(attributes.fillOpacity)
            .setOpacity(attributes.opacity)
            .setLineCap(attributes.lineCap)
            .setLineJoin(attributes.lineJoin)
            .setStrokeColor(attributes.strokeColor)
            .setStrokeWidthL(attributes.strokeWidth);
        return this;
    }

    getAttributes(): S2Attributes {
        const attributes = super.getAttributes();
        if (this.strokeColor !== undefined) attributes.strokeColor = this.strokeColor;
        if (this.strokeWidth.value > 0) attributes.strokeWidth = this.strokeWidth;
        if (this.fillColor !== undefined) attributes.fillColor = this.fillColor;
        if (this.fillOpacity !== undefined) attributes.fillOpacity = this.fillOpacity;
        if (this.opacity !== undefined) attributes.opacity = this.opacity;
        if (this.lineCap !== undefined) attributes.lineCap = this.lineCap;
        if (this.lineJoin !== undefined) attributes.lineJoin = this.lineJoin;
        return attributes;
    }

    setFillOpacity(fillOpacity?: number): this {
        this.fillOpacity = fillOpacity;
        return this;
    }

    setLineCap(lineCap?: S2LineCap): this {
        this.lineCap = lineCap;
        return this;
    }

    setLineJoin(lineJoin?: S2LineJoin): this {
        this.lineJoin = lineJoin;
        return this;
    }

    setFillColor(color?: S2Color): this {
        this.fillColor = color ? color.clone() : undefined;
        return this;
    }

    setStrokeColor(color?: S2Color): this {
        this.strokeColor = color ? color.clone() : undefined;
        return this;
    }

    setOpacity(opacity?: number): this {
        this.opacity = opacity;
        return this;
    }

    setStrokeWidth(strokeWidth?: number, space?: S2Space): this {
        if (space) this.strokeWidth.space = space;
        this.strokeWidth.value = strokeWidth ?? 0;
        return this;
    }

    setStrokeWidthL(strokeWidth?: S2Length): this {
        this.strokeWidth.copy(strokeWidth);
        return this;
    }

    getStrokeWidth(space: S2Space = this.strokeWidth.space): number {
        return this.strokeWidth.toSpace(space, this.getActiveCamera());
    }

    changeStrokeWidthSpace(space: S2Space): this {
        this.strokeWidth.changeSpace(space, this.getActiveCamera());
        return this;
    }

    buildTransform(builder?: S2Mat2x3Builder, makeIdentity: boolean = true): S2Mat2x3Builder {
        builder = builder ?? new S2Mat2x3Builder();
        return builder.setTarget(this.transform, makeIdentity);
    }

    setTranslation(x: number, y: number): this {
        this.transform.makeTranslation(x, y);
        return this;
    }

    setTranslationV(t: S2Vec2): this {
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

    setScaleFromV(scaleX: number, scaleY: number, center: S2Vec2): this {
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

    setRotationFromRadV(angle: number, center: S2Vec2): this {
        this.transform.makeRotationFromRad(angle, center.x, center.y);
        return this;
    }

    setRotationFromDeg(angle: number, centerX: number, centerY: number): this {
        this.transform.makeRotationFromDeg(angle, centerX, centerY);
        return this;
    }

    setRotationFromDegV(angle: number, center: S2Vec2): this {
        this.transform.makeRotationFromDeg(angle, center.x, center.y);
        return this;
    }

    protected updateSVGStyle(element: SVGElement): void {
        if (this.fillColor !== undefined) element.setAttribute('fill', this.fillColor.toRgb());
        if (this.fillOpacity !== undefined) element.setAttribute('fill-opacity', this.fillOpacity.toString());
        if (this.opacity !== undefined) element.setAttribute('opacity', this.opacity.toString());
        if (this.strokeColor !== undefined) element.setAttribute('stroke', this.strokeColor.toRgb());
        if (this.lineCap !== undefined) element.setAttribute('stroke-linecap', this.lineCap);
        if (this.lineJoin !== undefined) element.setAttribute('stroke-linejoin', this.lineJoin);
        if (this.strokeWidth.value > 0) {
            const strokeWidth = this.getStrokeWidth('view');
            element.setAttribute('stroke-width', strokeWidth.toString());
        }
    }

    protected updateSVGTransform(element: SVGElement): void {
        if (this.transform.isIdentity()) return;
        const te = this.transform.elements;
        element.setAttribute('transform', `matrix(${te[0]}, ${te[1]}, ${te[2]}, ${te[3]}, ${te[4]}, ${te[5]})`);
    }
}
