import { type S2BaseScene } from '../s2-interface';
import type { S2LayerData } from './base/s2-base-data';
import { S2Container } from './base/s2-container';
import { S2Element } from './base/s2-element';
import { S2TransformableElementData } from './base/s2-transformable-element';

export class S2SVG extends S2Container<SVGElement, S2LayerData, S2Element<S2LayerData>> {
    constructor(scene: S2BaseScene, element: SVGSVGElement) {
        super(scene, new S2TransformableElementData(), element);
    }

    protected updateImpl(updateId?: number): void {
        void updateId;
        super.updateImpl(updateId);
        this.data.applyToElement(this.element, this.scene);
        const camera = this.scene.getActiveCamera();
        this.element.setAttribute('viewBox', `0 0 ${camera.viewport.width} ${camera.viewport.height}`);
    }
}
