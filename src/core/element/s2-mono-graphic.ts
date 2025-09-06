import { type S2BaseScene } from '../s2-interface';
import { S2Color, S2Inheritance, S2Length, S2Number } from '../s2-types';
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
        this.opacity = new S2Number(1, S2Inheritance.Inherited);

        this.fill.opacity.set(1, S2Inheritance.Inherited);
        this.stroke.opacity.set(1, S2Inheritance.Inherited);
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

        if (this.opacity.inheritance === S2Inheritance.Explicit && this.opacity.value <= 1) {
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
}
