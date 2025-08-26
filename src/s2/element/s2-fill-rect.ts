import { type S2BaseScene } from '../s2-interface';
import { svgNS } from '../s2-globals';
import { S2Element } from './s2-element';
import { S2Color } from '../s2-globals';
import { S2Attributes } from '../s2-attributes';

export class S2FillRect extends S2Element<SVGRectElement> {
    protected element: SVGRectElement;
    public fillColor: S2Color = new S2Color(255, 255, 255);
    public fillOpacity: number = 1;
    constructor(scene: S2BaseScene) {
        const element = document.createElementNS(svgNS, 'rect');
        super(scene, element);
        this.element = element;
        this.addClass('s2-fill-rect');
    }

    getSVGElements(): SVGElement[] {
        return [this.element];
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
        if (this.oldElement === undefined) return this;
        this.oldElement.setAttribute('x', '0');
        this.oldElement.setAttribute('y', '0');
        this.oldElement.setAttribute('width', camera.viewport.x.toString());
        this.oldElement.setAttribute('height', camera.viewport.y.toString());
        if (this.fillColor !== undefined) this.oldElement.setAttribute('fill', this.fillColor.toRgb());
        if (this.fillOpacity !== undefined) this.oldElement.setAttribute('fill-opacity', this.fillOpacity.toString());
        return this;
    }
}
