import { type S2BaseScene } from '../s2-interface';
import { svgNS } from '../s2-globals';
import { S2Element } from './s2-element';
import { S2Color } from '../s2-globals';
import { S2Parameters } from '../s2-interface';

export class S2FillRect extends S2Element<SVGRectElement> {
    public fillColor: S2Color = new S2Color(255, 255, 255);
    public fillOpacity: number = 1;
    constructor(scene: S2BaseScene) {
        const element = document.createElementNS(svgNS, 'rect');
        super(element, scene);
        this.addClass('s2-fill-rect');
    }
    setParameters(params: S2Parameters): this {
        super.setParameters(params);
        if (params.fillColor) this.fillColor = params.fillColor;
        if (params.fillOpacity) this.fillOpacity = params.fillOpacity;
        return this;
    }

    getParameters(): S2Parameters {
        const parameters = super.getParameters();
        if (this.fillColor !== undefined) parameters.fillColor = this.fillColor;
        if (this.fillOpacity !== undefined) parameters.fillOpacity = this.fillOpacity;
        return parameters;
    }

    setFillColor(color: S2Color): this {
        this.fillColor.copy(color);
        return this;
    }

    update(): this {
        super.update();
        const camera = this.getActiveCamera();
        this.element.setAttribute('x', '0');
        this.element.setAttribute('y', '0');
        this.element.setAttribute('width', camera.viewport.x.toString());
        this.element.setAttribute('height', camera.viewport.y.toString());
        if (this.fillColor !== undefined) this.element.setAttribute('fill', this.fillColor.toRgb());
        if (this.fillOpacity !== undefined) this.element.setAttribute('fill-opacity', this.fillOpacity.toString());
        return this;
    }
}
