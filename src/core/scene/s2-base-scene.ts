import type { S2Point } from '../shared/s2-point';
import { S2Camera } from '../math/s2-camera';
import { S2SVG } from '../element/s2-svg';
import { S2Vec2 } from '../math/s2-vec2';
import { S2Space } from '../math/s2-space';

export abstract class S2BaseScene {
    protected readonly svg: S2SVG;
    protected readonly worldSpace: S2Space = new S2Space();
    protected readonly viewSpace: S2Space = new S2Space();
    protected readonly viewportSize: S2Vec2 = new S2Vec2(640.0, 360.0);
    protected readonly spaces: S2Space[] = [];
    protected readonly camera: S2Camera;
    protected readonly vecPool: S2Vec2[] = [];

    private nextElementId: number;
    private nextUpdateId: number;

    constructor(element: SVGSVGElement) {
        this.camera = new S2Camera(this);
        this.spaces.push(this.worldSpace, this.viewSpace);
        this.nextElementId = 0;
        this.nextUpdateId = 0;

        element.innerHTML = '';
        this.svg = new S2SVG(this, element);
        this.svg.update();
    }

    acquireVec2(): S2Vec2 {
        const vec = this.vecPool.pop();
        return vec ? vec : new S2Vec2();
    }

    releaseVec2(vec: S2Vec2): void {
        this.vecPool.push(vec);
    }

    getViewportSizeInto(dst: S2Vec2): this {
        dst.set(this.viewportSize.x, this.viewportSize.y);
        return this;
    }

    getViewportSize(): S2Vec2 {
        return this.viewportSize.clone();
    }

    getViewportWidth(): number {
        return this.viewportSize.x;
    }

    getViewportHeight(): number {
        return this.viewportSize.y;
    }

    getViewportAspectRatio(): number {
        return this.viewportSize.x / this.viewportSize.y;
    }

    getNextElementId(): number {
        return this.nextElementId++;
    }

    getNextUpdateId(): number {
        return this.nextUpdateId++;
    }

    getCamera(): S2Camera {
        return this.camera;
    }

    getWorldSpace(): S2Space {
        return this.worldSpace;
    }

    getViewSpace(): S2Space {
        return this.viewSpace;
    }

    getSVG(): S2SVG {
        return this.svg;
    }

    setViewportSize(width: number, height: number): this {
        this.viewportSize.set(width, height);
        this.camera.markDirty();
        this.camera.update();
        return this;
    }

    setViewportSizeV(size: S2Vec2): this {
        return this.setViewportSize(size.x, size.y);
    }

    createSpace(parent: S2Space = this.worldSpace): S2Space {
        const space = new S2Space(parent);
        this.spaces.push(space);
        return space;
    }

    detachSpace(space: S2Space): this {
        const index = this.spaces.indexOf(space);
        if (index !== -1) {
            this.spaces.splice(index, 1);
        }
        return this;
    }

    update(): this {
        this.camera.update();
        for (const space of this.spaces) {
            space.update();
        }
        this.svg.update();
        this.camera.update();
        return this;
    }

    convertDOMPoint(x: number, y: number, space: S2Space): S2Vec2 {
        return this.svg.convertDOMPoint(x, y, space);
    }

    convertDOMPointInto(dst: S2Point, x: number, y: number): void {
        this.svg.convertDOMPointInto(dst, x, y);
    }
}
