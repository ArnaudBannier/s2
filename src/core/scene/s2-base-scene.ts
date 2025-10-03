import { S2Camera } from '../math/s2-camera';
import { S2SVG } from '../element/s2-svg';

export abstract class S2BaseScene {
    public readonly svg: S2SVG;
    protected activeCamera: S2Camera;
    private nextElementId: number;
    private nextUpdateId: number;

    constructor(element: SVGSVGElement, camera: S2Camera) {
        element.innerHTML = '';
        this.activeCamera = camera;
        this.svg = new S2SVG(this, element);
        this.svg.update();
        this.nextElementId = 0;
        this.nextUpdateId = 0;
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
}
