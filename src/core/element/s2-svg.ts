import { S2Vec2 } from '../math/s2-vec2';
import type { S2BaseScene } from '../scene/s2-base-scene';
import type { S2Space } from '../shared/s2-base-type';
import type { S2Position } from '../shared/s2-position';
import { S2ElementData } from './base/s2-base-data';
import { S2DataUtils } from './base/s2-data-utils';
import { S2Element } from './base/s2-element';

export class S2SVG extends S2Element<S2ElementData> {
    protected element: SVGSVGElement;

    constructor(scene: S2BaseScene, element: SVGSVGElement) {
        super(scene, new S2ElementData());
        this.element = element;
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    convertDOMPoint(x: number, y: number, space: S2Space): S2Vec2 {
        const pt = new DOMPoint(x, y);
        const ctm = this.element.getScreenCTM();
        if (!ctm) return new S2Vec2(0, 0);

        const local = pt.matrixTransform(ctm.inverse());
        if (space == 'world') {
            const camera = this.scene.getActiveCamera();
            return camera.viewToWorld(local.x, local.y);
        }
        return new S2Vec2(local.x, local.y);
    }

    convertDOMPointInto(x: number, y: number, out: S2Position): void {
        const pt = new DOMPoint(x, y);
        const ctm = this.element.getScreenCTM();
        if (!ctm) {
            out.set(0, 0, 'view');
            return;
        }
        const local = pt.matrixTransform(ctm.inverse());
        out.set(local.x, local.y, 'view');
    }

    update(): void {
        if (this.skipUpdate()) return;

        const camera = this.scene.getActiveCamera();
        this.element.setAttribute('viewBox', `0 0 ${camera.viewport.width} ${camera.viewport.height}`);

        this.updateSVGChildren();
        S2DataUtils.applyPointerEvents(this.data.pointerEvents, this.element, this.scene);
        for (const child of this.children) {
            child.update();
        }

        this.clearDirty();
    }
}
