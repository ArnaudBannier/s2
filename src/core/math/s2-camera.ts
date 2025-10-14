import type { S2Dirtyable } from '../shared/s2-globals.ts';
import { S2Mat2x3 } from './s2-mat2x3.ts';
import { S2Vec2 } from './s2-vec2.ts';

export type S2Space = 'world' | 'view';

export class S2Camera implements S2Dirtyable {
    position: S2Vec2;
    viewExtents: S2Vec2;
    viewScale: number;
    viewportSize: S2Vec2;

    private worldToViewScale: S2Vec2 = new S2Vec2(1, 1);
    private viewToWorldScale: S2Vec2 = new S2Vec2(1, 1);

    private worldToViewMat: S2Mat2x3 = new S2Mat2x3();
    private viewToWorldMat: S2Mat2x3 = new S2Mat2x3();

    protected dirty: boolean = true;
    private rotation: number = 0.2 * Math.PI; // en radians

    constructor(position: S2Vec2, extents: S2Vec2, viewport: S2Vec2, viewScale: number = 1.0) {
        this.position = position;
        this.viewExtents = extents;
        this.viewportSize = viewport;
        this.viewScale = viewScale;
        this.updateMatrices();
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

    getRotation(): number {
        return this.rotation;
    }

    getWorldToViewMatrix(): S2Mat2x3 {
        this.updateMatrices();
        return this.worldToViewMat;
    }

    getViewToWorldMatrix(): S2Mat2x3 {
        this.updateMatrices();
        return this.viewToWorldMat;
    }

    setPosition(x: number, y: number): this {
        this.position.set(x, y);
        this.updateMatrices();
        return this;
    }

    setExtents(x: number, y: number): this {
        this.viewExtents.set(x, y);
        this.updateMatrices();
        return this;
    }

    setExtentsScale(scale: number): this {
        this.viewScale = scale;
        this.updateMatrices();
        return this;
    }

    private updateMatrices(): void {
        if (!this.isDirty()) return;

        this.worldToViewScale.set(
            (0.5 * this.viewportSize.x) / (this.viewExtents.x * this.viewScale),
            (0.5 * this.viewportSize.y) / (this.viewExtents.y * this.viewScale),
        );
        this.viewToWorldScale.set(
            (2.0 * (this.viewExtents.x * this.viewScale)) / this.viewportSize.x,
            (2.0 * (this.viewExtents.y * this.viewScale)) / this.viewportSize.y,
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

    getWorldToViewScale(): S2Vec2 {
        this.updateMatrices();
        return this.worldToViewScale;
    }

    getViewToWorldScale(): S2Vec2 {
        this.updateMatrices();
        return this.viewToWorldScale;
    }

    viewToWorld(x: number, y: number, out?: S2Vec2): S2Vec2 {
        this.updateMatrices();
        out = out ?? new S2Vec2();
        return out.set(x, y).apply2x3(this.viewToWorldMat);
    }

    viewToWorldV(v: S2Vec2, out?: S2Vec2): S2Vec2 {
        this.updateMatrices();
        out = out ?? new S2Vec2();
        return out.copy(v).apply2x3(this.viewToWorldMat);
    }

    viewToWorldOffset(x: number, y: number, out?: S2Vec2): S2Vec2 {
        this.updateMatrices();
        out = out ?? new S2Vec2();
        return out.set(x, y).apply2x3Offset(this.viewToWorldMat);
    }

    viewToWorldOffsetV(v: S2Vec2, out?: S2Vec2): S2Vec2 {
        this.updateMatrices();
        out = out ?? new S2Vec2();
        return out.copy(v).apply2x3Offset(this.viewToWorldMat);
    }

    worldToView(x: number, y: number, out?: S2Vec2): S2Vec2 {
        this.updateMatrices();
        out = out ?? new S2Vec2();
        return out.set(x, y).apply2x3(this.worldToViewMat);
    }

    worldToViewV(v: S2Vec2, out?: S2Vec2): S2Vec2 {
        this.updateMatrices();
        out = out ?? new S2Vec2();
        return out.copy(v).apply2x3(this.worldToViewMat);
    }

    worldToViewOffset(x: number, y: number, out?: S2Vec2): S2Vec2 {
        this.updateMatrices();
        out = out ?? new S2Vec2();
        return out.set(x, y).apply2x3Offset(this.worldToViewMat);
    }

    worldToViewOffsetV(v: S2Vec2, out?: S2Vec2): S2Vec2 {
        this.updateMatrices();
        out = out ?? new S2Vec2();
        return out.copy(v).apply2x3Offset(this.worldToViewMat);
    }

    getLower(): S2Vec2 {
        this.updateMatrices();
        return S2Vec2.sub(this.position, S2Vec2.scale(this.viewExtents, this.viewScale));
    }

    getUpper(): S2Vec2 {
        this.updateMatrices();
        return S2Vec2.add(this.position, S2Vec2.scale(this.viewExtents, this.viewScale));
    }

    convertPosition(x: number, y: number, currSpace: S2Space, nextSpace: S2Space): S2Vec2 {
        this.updateMatrices();
        if (currSpace === nextSpace) return new S2Vec2(x, y);
        switch (currSpace) {
            case 'world':
                return this.worldToView(x, y);
            case 'view':
                return this.viewToWorld(x, y);
        }
    }

    convertPositionV(position: S2Vec2, currSpace: S2Space, nextSpace: S2Space): S2Vec2 {
        this.updateMatrices();
        if (currSpace === nextSpace) return position.clone();
        switch (currSpace) {
            case 'world':
                return this.worldToViewV(position);
            case 'view':
                return this.viewToWorldV(position);
        }
    }
}
