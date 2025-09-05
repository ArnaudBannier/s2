import { type S2BaseScene } from '../s2-interface';
import { svgNS } from '../s2-globals';
import { NewS2Element, S2Element, S2FillData, S2LayerData } from './s2-element';
import { S2Color, S2Number } from '../s2-types';
import { S2Attributes } from '../s2-attributes';

export class S2FillRectData extends S2LayerData {
    public fill: S2FillData;
    constructor() {
        super();
        this.fill = new S2FillData();
    }

    copy(other: S2FillRectData): void {
        super.copy(other);
        this.fill.copy(other.fill);
    }

    applyToElement(element: SVGElement, scene: S2BaseScene): void {
        super.applyToElement(element, scene);
        this.fill.applyToElement(element, scene);
    }
}

export class NewS2FillRect extends NewS2Element<S2FillRectData> {
    protected element: SVGRectElement;

    constructor(scene: S2BaseScene) {
        const data = new S2FillRectData();
        super(scene, data);
        this.element = document.createElementNS(svgNS, 'rect');
    }

    get color(): S2Color {
        return this.data.fill.color;
    }

    get opacity(): S2Number {
        return this.data.fill.opacity;
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    update(updateId?: number): this {
        if (this.shouldSkipUpdate(updateId)) return this;
        const data = this.data;
        const camera = this.getActiveCamera();
        this.element.setAttribute('x', '0');
        this.element.setAttribute('y', '0');
        this.element.setAttribute('width', camera.viewport.x.toString());
        this.element.setAttribute('height', camera.viewport.y.toString());
        this.element.setAttribute('fill', data.fill.color.toRgb());
        this.element.setAttribute('fill-opacity', data.fill.opacity.toString());
        return this;
    }
}

export class S2FillRect extends S2Element {
    protected element: SVGRectElement;
    public fillColor: S2Color = new S2Color(255, 255, 255);
    public fillOpacity?: number;
    constructor(scene: S2BaseScene) {
        super(scene);
        this.element = document.createElementNS(svgNS, 'rect');
        this.addClass('s2-fill-rect');
    }

    getSVGElement(): SVGRectElement {
        return this.element;
    }

    setAttributes(attributes: S2Attributes): this {
        super.setAttributes(attributes);
        if (attributes.fillColor) this.fillColor.copy(attributes.fillColor);
        if (attributes.fillOpacity) this.fillOpacity = attributes.fillOpacity;
        return this;
    }

    getAttributes(): S2Attributes {
        const attributes = super.getAttributes();
        if (this.fillColor !== undefined) attributes.fillColor = this.fillColor.clone();
        if (this.fillOpacity !== undefined) attributes.fillOpacity = this.fillOpacity;
        return attributes;
    }

    setFillColor(color: S2Color): this {
        this.fillColor.copy(color);
        return this;
    }

    update(): this {
        const camera = this.getActiveCamera();
        this.element.setAttribute('x', '0');
        this.element.setAttribute('y', '0');
        this.element.setAttribute('width', camera.viewport.x.toString());
        this.element.setAttribute('height', camera.viewport.y.toString());
        this.element.setAttribute('fill', this.fillColor.toRgb());
        if (this.fillOpacity !== undefined) this.element.setAttribute('fill-opacity', this.fillOpacity.toString());
        return this;
    }
}
