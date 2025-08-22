import { type S2BaseScene } from '../s2-interface';
import { svgNS } from '../s2-globals';
import { S2Element } from './s2-element';

export class S2FillRect extends S2Element<SVGRectElement> {
    constructor(scene: S2BaseScene) {
        const element = document.createElementNS(svgNS, 'rect');
        super(element, scene);
        this.addClass('s2-fill-rect');
    }

    update(): this {
        super.update();
        const camera = this.getActiveCamera();
        this.element.setAttribute('x', '0');
        this.element.setAttribute('y', '0');
        this.element.setAttribute('width', camera.viewport.x.toString());
        this.element.setAttribute('height', camera.viewport.y.toString());
        return this;
    }
}
