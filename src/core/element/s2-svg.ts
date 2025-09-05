import { type S2BaseScene } from '../s2-interface';
import { NewS2Container } from './s2-container';
import { type S2BaseElement } from './s2-element';
import { S2SMonoGraphicData } from './s2-shape';

export class NewS2SVG extends NewS2Container<SVGElement, S2BaseElement, S2SMonoGraphicData> {
    constructor(scene: S2BaseScene, element: SVGSVGElement) {
        super(scene, new S2SMonoGraphicData(), element);
    }

    update(updateId?: number): this {
        if (this.shouldSkipUpdate(updateId)) return this;
        super.update(updateId);
        this.data.applyToElement(this.element, this.scene);
        const camera = this.getActiveCamera();
        this.element.setAttribute('viewBox', `0 0 ${camera.viewport.width} ${camera.viewport.height}`);
        return this;
    }
}
