import { S2Vec2 } from '../math/s2-vec2';
import { type S2BaseScene } from '../s2-interface';
import { S2Graphics } from './s2-graphics';
import { type S2Space, S2Color, S2Length, S2Number, S2Position } from '../s2-types';
import { type S2HasPosition } from '../s2-interface';
import { S2Animatable, S2Attributes } from '../s2-attributes';
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

export abstract class NewS2SimpleShape<D extends S2SMonoGraphicData> extends NewS2Element<D> {
    constructor(scene: S2BaseScene, data: D) {
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

export abstract class S2Shape extends S2Graphics implements S2HasPosition {
    protected position: S2Position;

    constructor(scene: S2BaseScene) {
        super(scene);
        this.position = new S2Position(0, 0, 'world');
    }

    setAnimatableAttributes(attributes: S2Animatable): this {
        super.setAnimatableAttributes(attributes);
        if (attributes.position) this.position.copy(attributes.position);
        return this;
    }

    getAnimatableAttributes(): S2Animatable {
        const attributes = super.getAnimatableAttributes();
        attributes.position = this.position.clone();
        return attributes;
    }

    setAttributes(attributes: S2Attributes): this {
        super.setAttributes(attributes);
        if (attributes.position) this.position.copy(attributes.position);
        return this;
    }

    getAttributes(): S2Attributes {
        const attributes = super.getAttributes();
        attributes.position = this.position.clone();
        return attributes;
    }

    setPosition(x: number, y: number, space?: S2Space): this {
        if (space) this.position.space = space;
        this.position.value.set(x, y);
        return this;
    }

    setPositionV(position: S2Vec2, space?: S2Space): this {
        if (space) this.position.space = space;
        this.position.value.copy(position);
        return this;
    }

    getPosition(space: S2Space = this.position.space): S2Vec2 {
        return this.position.toSpace(space, this.getActiveCamera());
    }

    getS2Position(): S2Position {
        return this.position.clone();
    }

    changePositionSpace(space: S2Space): this {
        this.position.changeSpace(space, this.getActiveCamera());
        return this;
    }
}
