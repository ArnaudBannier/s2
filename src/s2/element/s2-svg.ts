import { type S2SceneInterface } from '../s2-scene-interface';
import { S2Container } from './s2-container';
import { type S2BaseElement } from './s2-element';

export class S2SVG extends S2Container<SVGSVGElement, S2BaseElement> {
    constructor(element: SVGSVGElement, scene: S2SceneInterface) {
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
