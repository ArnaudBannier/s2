import type { S2Camera, S2Space } from '../math/s2-camera';
import type { S2Vec2 } from '../math/s2-vec2';
import type { S2Point } from '../shared/s2-point';
import { S2SVG } from '../element/s2-svg';

export abstract class S2BaseScene {
    public readonly svg: S2SVG;
    protected activeCamera: S2Camera;
    private nextElementId: number;
    private nextUpdateId: number;

    constructor(element: SVGSVGElement, camera: S2Camera) {
        this.activeCamera = camera;
        this.nextElementId = 0;
        this.nextUpdateId = 0;

        element.innerHTML = '';
        this.svg = new S2SVG(this, element);
        this.svg.update();
    }

    getNextElementId(): number {
        return this.nextElementId++;
    }

    getNextUpdateId(): number {
        return this.nextUpdateId++;
    }

    getActiveCamera(): S2Camera {
        return this.activeCamera;
    }

    getSVG(): S2SVG {
        return this.svg;
    }

    update(): this {
        this.svg.update();
        return this;
    }

    convertDOMPoint(x: number, y: number, space: S2Space): S2Vec2 {
        return this.svg.convertDOMPoint(x, y, space);
    }

    convertDOMPointInto(x: number, y: number, out: S2Point): void {
        this.svg.convertDOMPointInto(x, y, out);
    }
}
