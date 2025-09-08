import type { S2LineCap, S2LineJoin } from '../s2-globals';
import { type S2BaseScene } from '../s2-interface';
import { S2Color, S2TypeState, S2Length, S2Number, type S2Space, S2Enum } from '../s2-types';
import { S2FillData, S2LayerData, S2StrokeData } from './s2-base-data';
import { S2Element } from './s2-element';

/*
S2Stylable → stroke + fill + opacity
S2Transformable → ajoute les transformations
S2Shape → ajoute une géométrie (position, dimensions…)

S2Graphic → stroke + fill + opacity
S2GraphicTransform (ou TransformableGraphic) → + transform
S2ShapeGraphic (ou PlacedGraphic) → + position

MonoGraphic → ton niveau de base (stroke/fill/opacity)
TransformedGraphic → ajoute transform
ShapeGraphic → ajoute la position et devient un vrai "objet dessiné" (rect, circle, path…).

MonoGraphic
TransformGraphic
ShapeGraphic
*/

export class S2MonoGraphicData extends S2LayerData {
    public readonly stroke: S2StrokeData;
    public readonly fill: S2FillData;
    public readonly opacity: S2Number;

    constructor() {
        super();
        this.stroke = new S2StrokeData();
        this.fill = new S2FillData();
        this.opacity = new S2Number(1, S2TypeState.Inactive);

        this.fill.opacity.set(1, S2TypeState.Inactive);
        this.stroke.opacity.set(1, S2TypeState.Inactive);
    }

    setParent(parent: S2MonoGraphicData | null = null): void {
        this.stroke.setParent(parent ? parent.stroke : null);
        this.fill.setParent(parent ? parent.fill : null);
        this.opacity.setParent(parent ? parent.opacity : null);
    }

    copy(other: S2MonoGraphicData): void {
        super.copy(other);
        this.stroke.copy(other.stroke);
        this.fill.copy(other.fill);
        this.opacity.copy(other.opacity);
    }

    applyToElement(element: SVGElement, scene: S2BaseScene): void {
        super.applyToElement(element, scene);
        this.stroke.applyToElement(element, scene);
        this.fill.applyToElement(element, scene);

        if (this.opacity.state === S2TypeState.Active && this.opacity.value <= 1) {
            element.setAttribute('opacity', this.opacity.toString());
        } else {
            element.removeAttribute('opacity');
        }
    }
}

export abstract class S2MonoGraphic<Data extends S2MonoGraphicData> extends S2Element<Data> {
    constructor(scene: S2BaseScene, data: Data) {
        super(scene, data);
    }

    get fillColor(): S2Color {
        return this.data.fill.color;
    }

    get fillOpacity(): S2Number {
        return this.data.fill.opacity;
    }

    get opacity(): S2Number {
        return this.data.opacity;
    }

    get strokeColor(): S2Color {
        return this.data.stroke.color;
    }

    get strokeOpacity(): S2Number {
        return this.data.stroke.opacity;
    }

    get strokeWidth(): S2Length {
        return this.data.stroke.width;
    }

    get strokeLineCap(): S2Enum<S2LineCap> {
        return this.data.stroke.lineCap;
    }

    get strokeLineJoin(): S2Enum<S2LineJoin> {
        return this.data.stroke.lineJoin;
    }

    setFillColor(r: number, g: number, b: number, state: S2TypeState = S2TypeState.Active): this {
        this.data.fill.color.set(r, g, b, state);
        return this;
    }

    setFillColorHex(hex: string, state: S2TypeState = S2TypeState.Active): this {
        this.data.fill.color.setFromHex(hex, state);
        return this;
    }

    setFillOpacity(opacity: number, state: S2TypeState = S2TypeState.Active): this {
        this.data.fill.opacity.set(opacity, state);
        return this;
    }

    setOpacity(opacity: number, state: S2TypeState = S2TypeState.Active): this {
        this.data.opacity.set(opacity, state);
        return this;
    }

    setStrokeColor(r: number, g: number, b: number, state: S2TypeState = S2TypeState.Active): this {
        this.data.stroke.color.set(r, g, b, state);
        return this;
    }

    setStrokeColorHex(hex: string, state: S2TypeState = S2TypeState.Active): this {
        this.data.stroke.color.setFromHex(hex, state);
        return this;
    }

    setStrokeOpacity(opacity: number, state: S2TypeState = S2TypeState.Active): this {
        this.data.stroke.opacity.set(opacity, state);
        return this;
    }

    setStrokeWidth(width: number, space: S2Space, state: S2TypeState = S2TypeState.Active): this {
        this.data.stroke.width.set(width, space, state);
        return this;
    }

    setStrokeLineCap(lineCap: S2LineCap, state: S2TypeState = S2TypeState.Active): this {
        this.data.stroke.lineCap.set(lineCap, state);
        return this;
    }

    setStrokeLineJoin(lineJoin: S2LineJoin, state: S2TypeState = S2TypeState.Active): this {
        this.data.stroke.lineJoin.set(lineJoin, state);
        return this;
    }
}
