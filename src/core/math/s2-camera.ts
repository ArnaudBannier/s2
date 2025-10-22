import type { S2BaseScene } from '../scene/s2-base-scene.ts';
import type { S2Dirtyable } from '../shared/s2-globals.ts';
import { S2Vec2 } from './s2-vec2.ts';

export type S2Space = 'world' | 'view';

export class S2Camera implements S2Dirtyable {
    protected scene: S2BaseScene;
    protected position: S2Vec2 = new S2Vec2();
    protected extents: S2Vec2 = new S2Vec2();
    protected scaleFactor: number = 1.0;
    protected rotation: number = 0;
    protected dirty: boolean = true;

    constructor(scene: S2BaseScene) {
        this.scene = scene;
        const aspectRatio = scene.getViewportAspectRatio();
        this.position.set(0, 0);
        this.extents = new S2Vec2(8.0, 8.0 / aspectRatio);
        this.update();
    }

    isDirty(): boolean {
        return this.dirty;
    }

    markDirty(): void {
        if (this.isDirty()) return;
        this.dirty = true;
    }

    clearDirty(): void {
        this.dirty = false;
    }

    getRotationRad(): number {
        return this.rotation;
    }

    getRotationDeg(): number {
        return (this.rotation * 180.0) / Math.PI;
    }

    getLower(): S2Vec2 {
        const result = new S2Vec2();
        this.getLowerInto(result);
        return result;
    }

    getLowerInto(dst: S2Vec2): this {
        dst.copy(this.extents).scale(-this.scaleFactor).addV(this.position);
        return this;
    }

    getUpper(): S2Vec2 {
        const result = new S2Vec2();
        this.getUpperInto(result);
        return result;
    }

    getUpperInto(dst: S2Vec2): this {
        dst.copy(this.extents).scale(+this.scaleFactor).addV(this.position);
        return this;
    }

    setPosition(x: number, y: number): this {
        this.position.set(x, y);
        this.markDirty();
        return this;
    }

    setExtents(x: number, y: number): this {
        this.extents.set(x, y);
        this.markDirty();
        return this;
    }

    setZoom(zoom: number): this {
        this.scaleFactor = 1.0 / zoom;
        this.markDirty();
        return this;
    }

    setRotationRad(angleRad: number): this {
        this.rotation = angleRad;
        this.markDirty();
        return this;
    }

    setRotationDeg(angleDeg: number): this {
        this.rotation = (angleDeg * Math.PI) / 180.0;
        this.markDirty();
        return this;
    }

    update(): void {
        if (!this.isDirty()) return;

        const viewportX = this.scene.getViewportWidth();
        const viewportY = this.scene.getViewportHeight();
        const cx = viewportX / 2;
        const cy = viewportY / 2;
        const cos = Math.cos(-this.rotation);
        const sin = Math.sin(-this.rotation);
        const px = this.position.x;
        const py = this.position.y;
        const sx = +(2.0 * (this.extents.x * this.scaleFactor)) / viewportX;
        const sy = -(2.0 * (this.extents.y * this.scaleFactor)) / viewportY;

        const viewSpace = this.scene.getViewSpace();
        viewSpace.setSpaceToParent(
            +sx * cos,
            +sy * sin,
            -cx * cos * sx - cy * sin * sy + px,
            -sx * sin,
            +sy * cos,
            +cx * sin * sx - cy * cos * sy + py,
        );

        this.clearDirty();
    }
}
