import { type S2BaseScene } from '../s2-interface';
import { S2Container } from './s2-container';
import { type S2BaseElement } from './s2-element';

export class S2SVG extends S2Container<SVGSVGElement, S2BaseElement> {
    protected element: SVGSVGElement;
    constructor(scene: S2BaseScene, element: SVGSVGElement) {
        super(scene, element);
        this.element = element;
        this.update();
    }

    getSVGElement(): SVGSVGElement {
        return this.element;
    }

    update(): this {
        super.update();
        const camera = this.getActiveCamera();
        this.element.setAttribute('viewBox', `0 0 ${camera.viewport.width} ${camera.viewport.height}`);
        // this.element.setAttribute('width', camera.viewport.width.toString());
        // this.element.setAttribute('height', camera.viewport.height.toString());
        return this;
    }
}
