import { type S2BaseScene } from '../s2-interface';
import { S2Container } from './s2-container';
import { type S2BaseElement } from './s2-element';
import { S2TransformGraphicData } from './s2-transform-graphic';

export class S2SVG extends S2Container<SVGElement, S2BaseElement, S2TransformGraphicData> {
    constructor(scene: S2BaseScene, element: SVGSVGElement) {
        super(scene, new S2TransformGraphicData(), element);
    }

    protected updateImpl(updateId?: number): void {
        void updateId;
        //super.updateImpl(updateId);
        this.data.applyToElement(this.element, this.scene);
        const camera = this.scene.getActiveCamera();
        this.element.setAttribute('viewBox', `0 0 ${camera.viewport.width} ${camera.viewport.height}`);
    }
}
