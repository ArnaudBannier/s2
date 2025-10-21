import type { S2Camera } from '../math/s2-camera';
import type { S2Vec2 } from '../math/s2-vec2';
import type { S2Point } from '../shared/s2-point';
import { S2SVG } from '../element/s2-svg';
import { S2AbstractSpace } from '../math/s2-abstract-space';

export abstract class S2BaseScene {
    public readonly svg: S2SVG;
    private readonly worldSpace: S2AbstractSpace = new S2AbstractSpace();
    private readonly viewSpace: S2AbstractSpace = new S2AbstractSpace();
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

    getWorldSpace(): S2AbstractSpace {
        return this.worldSpace;
    }

    getViewSpace(): S2AbstractSpace {
        return this.viewSpace;
    }

    getSVG(): S2SVG {
        return this.svg;
    }

    update(): this {
        this.activeCamera.update();
        this.svg.update();
        this.activeCamera.update();
        return this;
    }

    convertDOMPoint(x: number, y: number, space: S2AbstractSpace): S2Vec2 {
        return this.svg.convertDOMPoint(x, y, space);
    }

    convertDOMPointInto(x: number, y: number, out: S2Point): void {
        this.svg.convertDOMPointInto(x, y, out);
    }
}
