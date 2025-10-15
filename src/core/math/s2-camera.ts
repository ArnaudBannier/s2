import type { S2Dirtyable } from '../shared/s2-globals.ts';
import { S2Mat2x3 } from './s2-mat2x3.ts';
import { S2Vec2 } from './s2-vec2.ts';

export type S2Space = 'world' | 'view';

export class S2Camera implements S2Dirtyable {
    protected position: S2Vec2;
    protected extents: S2Vec2;
    protected scaleFactor: number = 1.0;
    protected viewportSize: S2Vec2;

    protected worldToViewScale: S2Vec2 = new S2Vec2(1, 1);
    protected viewToWorldScale: S2Vec2 = new S2Vec2(1, 1);

    protected worldToViewMat: S2Mat2x3 = new S2Mat2x3();
    protected viewToWorldMat: S2Mat2x3 = new S2Mat2x3();

    protected dirty: boolean = true;
    protected rotation: number = 0 * Math.PI; // en radians

    constructor(position: S2Vec2, extents: S2Vec2, viewport: S2Vec2) {
        this.position = position;
        this.extents = extents;
        this.viewportSize = viewport;
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

    getViewportSize(): S2Vec2 {
        return this.viewportSize;
    }

    getRotationRad(): number {
        return this.rotation;
    }

    getRotationDeg(): number {
        return (this.rotation * 180.0) / Math.PI;
    }

    getWorldToViewMatrix(): S2Mat2x3 {
        this.update();
        return this.worldToViewMat;
    }

    getViewToWorldMatrix(): S2Mat2x3 {
        this.update();
        return this.viewToWorldMat;
    }

    getWorldToViewScale(): S2Vec2 {
        this.update();
        return this.worldToViewScale;
    }

    getViewToWorldScale(): S2Vec2 {
        this.update();
        return this.viewToWorldScale;
    }

    getLower(): S2Vec2 {
        this.update();
        return S2Vec2.subV(this.position, S2Vec2.scaleV(this.extents, this.scaleFactor));
    }

    getUpper(): S2Vec2 {
        this.update();
        return S2Vec2.addV(this.position, S2Vec2.scaleV(this.extents, this.scaleFactor));
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

        this.worldToViewScale.set(
            (0.5 * this.viewportSize.x) / (this.extents.x * this.scaleFactor),
            (0.5 * this.viewportSize.y) / (this.extents.y * this.scaleFactor),
        );
        this.viewToWorldScale.set(
            (2.0 * (this.extents.x * this.scaleFactor)) / this.viewportSize.x,
            (2.0 * (this.extents.y * this.scaleFactor)) / this.viewportSize.y,
        );

        const cx = this.viewportSize.x / 2;
        const cy = this.viewportSize.y / 2;
        const sx = +this.worldToViewScale.x;
        const sy = -this.worldToViewScale.y;
        const cos = Math.cos(-this.rotation);
        const sin = Math.sin(-this.rotation);
        const px = this.position.x;
        const py = this.position.y;

        // Translate(cx,cy) * Scale(sx,-sy) * Rotate(-a) * Translate(-px,-py)
        this.worldToViewMat.set(
            +sx * cos,
            -sx * sin,
            -px * sx * cos + py * sx * sin + cx,
            +sy * sin,
            +sy * cos,
            -px * sy * sin - py * sy * cos + cy,
        );

        // Translate(px, py) * Rotate(+a) * Scale(1/sx, -1/sy) * Translate(-cx,-cy)
        const isx = +this.viewToWorldScale.x;
        const isy = -this.viewToWorldScale.y;
        this.viewToWorldMat.set(
            +isx * cos,
            +isy * sin,
            -cx * cos * isx - cy * sin * isy + px,
            -isx * sin,
            +isy * cos,
            +cx * sin * isx - cy * cos * isy + py,
        );

        this.clearDirty();
    }

    viewToWorld(x: number, y: number, out?: S2Vec2): S2Vec2 {
        out = out ?? new S2Vec2();
        return out.set(x, y).apply2x3(this.viewToWorldMat);
    }

    viewToWorldV(v: S2Vec2, out?: S2Vec2): S2Vec2 {
        return this.viewToWorld(v.x, v.y, out);
    }

    viewToWorldOffset(x: number, y: number, out?: S2Vec2): S2Vec2 {
        out = out ?? new S2Vec2();
        return out.set(x, y).apply2x3Offset(this.viewToWorldMat);
    }

    viewToWorldOffsetV(v: S2Vec2, out?: S2Vec2): S2Vec2 {
        return this.viewToWorldOffset(v.x, v.y, out);
    }

    worldToView(x: number, y: number, out?: S2Vec2): S2Vec2 {
        out = out ?? new S2Vec2();
        return out.set(x, y).apply2x3(this.worldToViewMat);
    }

    worldToViewV(v: S2Vec2, out?: S2Vec2): S2Vec2 {
        return this.worldToView(v.x, v.y, out);
    }

    worldToViewOffset(x: number, y: number, out?: S2Vec2): S2Vec2 {
        out = out ?? new S2Vec2();
        return out.set(x, y).apply2x3Offset(this.worldToViewMat);
    }

    worldToViewOffsetV(v: S2Vec2, out?: S2Vec2): S2Vec2 {
        return this.worldToViewOffset(v.x, v.y, out);
    }

    convertPoint(x: number, y: number, currSpace: S2Space, nextSpace: S2Space, out?: S2Vec2): S2Vec2 {
        out = out ?? new S2Vec2();
        if (currSpace === nextSpace) return out.set(x, y);
        switch (currSpace) {
            case 'world':
                return this.worldToView(x, y, out);
            case 'view':
                return this.viewToWorld(x, y, out);
        }
    }

    convertPointV(point: S2Vec2, currSpace: S2Space, nextSpace: S2Space, out?: S2Vec2): S2Vec2 {
        return this.convertPoint(point.x, point.y, currSpace, nextSpace, out);
    }

    convertOffset(x: number, y: number, currSpace: S2Space, nextSpace: S2Space, out?: S2Vec2): S2Vec2 {
        out = out ?? new S2Vec2();
        if (currSpace === nextSpace) return out.set(x, y);
        switch (currSpace) {
            case 'world':
                return this.worldToViewOffset(x, y, out);
            case 'view':
                return this.viewToWorldOffset(x, y, out);
        }
    }

    convertOffsetV(point: S2Vec2, currSpace: S2Space, nextSpace: S2Space, out?: S2Vec2): S2Vec2 {
        return this.convertOffset(point.x, point.y, currSpace, nextSpace, out);
    }

    convertExtents(x: number, y: number, currSpace: S2Space, nextSpace: S2Space, out?: S2Vec2): S2Vec2 {
        out = out ?? new S2Vec2();
        if (currSpace === nextSpace) return out.set(x, y);
        switch (currSpace) {
            case 'world':
                return out.set(x, y).mulV(this.worldToViewScale);
            case 'view':
                return out.set(x, y).mulV(this.viewToWorldScale);
        }
    }

    convertExtentsV(point: S2Vec2, currSpace: S2Space, nextSpace: S2Space, out?: S2Vec2): S2Vec2 {
        return this.convertExtents(point.x, point.y, currSpace, nextSpace, out);
    }

    convertLength(length: number, currSpace: S2Space, nextSpace: S2Space): number {
        if (currSpace === nextSpace) return length;
        switch (currSpace) {
            case 'world':
                return length * this.worldToViewScale.x;
            case 'view':
                return length * this.viewToWorldScale.x;
        }
    }
}
