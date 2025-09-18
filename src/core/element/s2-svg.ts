import { S2BaseScene } from '../s2-base-scene';
import { S2BaseData } from './base/s2-base-data';
import { S2Element } from './base/s2-element';
//import { S2TransformableElementData } from './base/s2-transformable-element';

export class S2SVG extends S2Element<S2BaseData> {
    protected element: SVGGElement;

    constructor(scene: S2BaseScene, element: SVGSVGElement) {
        super(scene, new S2BaseData());
        this.element = element;
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    update(): void {
        const camera = this.scene.getActiveCamera();
        this.element.setAttribute('viewBox', `0 0 ${camera.viewport.width} ${camera.viewport.height}`);
        for (const child of this.children) {
            child.update();
        }
        this.updateSVGChildren();
    }
}
