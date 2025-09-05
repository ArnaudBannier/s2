import { type S2BaseScene } from '../s2-interface';
import { S2Color, S2Length, S2Number } from '../s2-types';
import { NewS2Element, S2FillData, S2LayerData, S2StrokeData, S2TransformData } from './s2-element';

export class S2SMonoGraphicData extends S2LayerData {
    public transform: S2TransformData;
    public stroke: S2StrokeData;
    public fill: S2FillData;
    public opacity: S2Number;

    constructor() {
        super();
        this.transform = new S2TransformData();
        this.fill = new S2FillData();
        this.stroke = new S2StrokeData();
        this.opacity = new S2Number(2);
    }

    copy(other: S2SMonoGraphicData): void {
        super.copy(other);
        this.transform.copy(other.transform);
        this.stroke.copy(other.stroke);
        this.fill.copy(other.fill);
        this.opacity.copy(other.opacity);
    }

    applyToElement(element: SVGElement, scene: S2BaseScene): void {
        super.applyToElement(element, scene);
        this.transform.applyToElement(element, scene);
        this.stroke.applyToElement(element, scene);
        this.fill.applyToElement(element, scene);
        if (this.opacity.value <= 1) element.setAttribute('opacity', this.opacity.toString());
    }
}

export abstract class NewS2SimpleShape<Data extends S2SMonoGraphicData> extends NewS2Element<Data> {
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

    get transform(): S2TransformData {
        return this.data.transform;
    }
}
