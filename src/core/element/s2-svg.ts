import type { S2BaseScene } from '../scene/s2-base-scene';
import type { S2AbstractSpace } from '../math/s2-abstract-space';
import type { S2Point } from '../shared/s2-point';
import { S2Vec2 } from '../math/s2-vec2';
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

    convertDOMPoint(x: number, y: number, space: S2AbstractSpace): S2Vec2 {
        const pt = new DOMPoint(x, y);
        const ctm = this.element.getScreenCTM();
        if (!ctm) return new S2Vec2(0, 0);

        const local = pt.matrixTransform(ctm.inverse());
        const viewPoint = new S2Vec2(local.x, local.y);
        return this.scene.getViewSpace().convertPointV(viewPoint, space, viewPoint);
    }

    convertDOMPointInto(dst: S2Point, x: number, y: number): void {
        const pt = new DOMPoint(x, y);
        const ctm = this.element.getScreenCTM();
        if (!ctm) {
            dst.set(0, 0);
            return;
        }
        const local = pt.matrixTransform(ctm.inverse());
        dst.setValueFromSpace(local.x, local.y, this.scene.getViewSpace());
    }

    update(): void {
        if (this.skipUpdate()) return;

        const viewport = this.scene.getViewportSize();
        this.element.setAttribute('viewBox', `0 0 ${viewport.x} ${viewport.y}`);

        this.updateSVGChildren();
        S2DataUtils.applyPointerEvents(this.data.pointerEvents, this.element, this.scene);
        for (const child of this.children) {
            child.update();
        }

        this.clearDirty();
    }
}
