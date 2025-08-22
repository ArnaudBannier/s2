import { type S2BaseScene } from '../s2-interface';
import { S2Container } from './s2-container';
import { type S2BaseElement } from './s2-element';

export class S2SVG extends S2Container<SVGSVGElement, S2BaseElement> {
    constructor(element: SVGSVGElement, scene: S2BaseScene) {
        super(element, scene);
        this.update();
    }

    update(): this {
        super.update();
        const camera = this.getActiveCamera();
        this.element.setAttribute('width', camera.viewport.width.toString());
        this.element.setAttribute('height', camera.viewport.height.toString());
        return this;
    }
}
