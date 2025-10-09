import type { S2BaseScene } from '../scene/s2-base-scene';
import { S2ElementData } from './base/s2-base-data';
import { S2Element } from './base/s2-element';

export class S2SVG extends S2Element<S2ElementData> {
    protected element: SVGGElement;

    constructor(scene: S2BaseScene, element: SVGSVGElement) {
        super(scene, new S2ElementData());
        this.element = element;
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    update(): void {
        if (this.skipUpdate()) return;

        const camera = this.scene.getActiveCamera();
        this.element.setAttribute('viewBox', `0 0 ${camera.viewport.width} ${camera.viewport.height}`);

        this.updateSVGChildren();
        for (const child of this.children) {
            child.update();
        }

        this.clearDirty();
    }
}
