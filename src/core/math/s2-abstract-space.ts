import type { S2Dirtyable } from '../shared/s2-globals';
import { S2Mat2x3 } from './s2-mat2x3';
import { S2Vec2 } from './s2-vec2';

export class S2AbstractSpace implements S2Dirtyable {
    protected parent: S2AbstractSpace | null;
    protected spaceToParent: S2Mat2x3 = new S2Mat2x3(1, 0, 0, 0, 1, 0);
    protected parentToSpace: S2Mat2x3 = new S2Mat2x3(1, 0, 0, 0, 1, 0);
    protected spaceToWorld: S2Mat2x3 = new S2Mat2x3(1, 0, 0, 0, 1, 0);
    protected worldToSpace: S2Mat2x3 = new S2Mat2x3(1, 0, 0, 0, 1, 0);
    protected dirty: boolean = true;
    protected scaleToParent: number = 1.0;
    protected scaleToWorld: number = 1.0;

    constructor(parent: S2AbstractSpace | null = null) {
        this.parent = parent;
    }

    isDirty(): boolean {
        return this.dirty;
    }

    markDirty(): void {
        if (this.isDirty()) return;
        this.dirty = true;
        this.parent?.markDirty();
    }

    clearDirty(): void {
        this.dirty = false;
    }

    update(): void {
        if (!this.isDirty()) return;

        this.scaleToParent = Math.sqrt(Math.abs(S2Mat2x3.det(this.spaceToParent)));
        this.scaleToWorld = this.scaleToParent;
        this.parentToSpace.copy(this.spaceToParent).invert();
        if (this.parent) {
            this.parent.update();
            this.spaceToWorld.multiplyMatrices(this.parent.spaceToWorld, this.spaceToParent);
            this.worldToSpace.multiplyMatrices(this.parentToSpace, this.parent.worldToSpace);
            this.scaleToWorld *= this.parent.scaleToWorld;
        } else {
            this.spaceToWorld.copy(this.spaceToParent);
            this.worldToSpace.copy(this.parentToSpace);
        }

        this.clearDirty();
    }

    getSpaceToWorld(): S2Mat2x3 {
        return this.spaceToWorld;
    }

    getWorldToSpace(): S2Mat2x3 {
        return this.worldToSpace;
    }

    setFromSpace(space: S2AbstractSpace, origin: S2Vec2, basis0: S2Vec2, basis1: S2Vec2): void {
        const transform = new S2Mat2x3();
        transform.copy(space.getSpaceToWorld());
        if (this.parent) {
            transform.multiplyMatrices(this.parent.getWorldToSpace(), transform);
        }
        const c0 = basis0.clone().apply2x3Offset(transform);
        const c1 = basis1.clone().apply2x3Offset(transform);
        const o = origin.clone().apply2x3(transform);

        this.spaceToParent.set(c0.x, c1.x, o.x, c0.y, c1.y, o.y);
        this.markDirty();
        this.update();
    }

    setSpaceToParent(a00: number, a01: number, a02: number, a10: number, a11: number, a12: number): void {
        this.spaceToParent.set(a00, a01, a02, a10, a11, a12);
        this.markDirty();
        this.update();
    }

    setSpaceToParentMat(transform: S2Mat2x3): void {
        this.spaceToParent.copy(transform);
        this.markDirty();
        this.update();
    }

    convertPoint(x: number, y: number, space?: S2AbstractSpace, out?: S2Vec2): S2Vec2 {
        out = out ?? new S2Vec2();
        return this.convertPointInto(out, x, y, space);
    }

    convertPointV(point: S2Vec2, space?: S2AbstractSpace, out?: S2Vec2): S2Vec2 {
        out = out ?? new S2Vec2();
        return this.convertPointIntoV(out, point, space);
    }

    convertPointInto(dst: S2Vec2, x: number, y: number, space?: S2AbstractSpace): S2Vec2 {
        dst = dst.set(x, y);
        if (space === this) return dst;
        dst.apply2x3(this.spaceToWorld);
        if (space) dst.apply2x3(space.worldToSpace);
        return dst;
    }

    convertPointIntoV(dst: S2Vec2, point: S2Vec2, space?: S2AbstractSpace): S2Vec2 {
        return this.convertPointInto(dst, point.x, point.y, space);
    }

    convertOffset(x: number, y: number, space?: S2AbstractSpace, out?: S2Vec2): S2Vec2 {
        out = out ? out.set(x, y) : new S2Vec2(x, y);
        if (space === this) return out;
        out.apply2x3Offset(this.spaceToWorld);
        if (space) out.apply2x3Offset(space.getWorldToSpace());
        return out;
    }

    convertOffsetV(point: S2Vec2, space?: S2AbstractSpace, out?: S2Vec2): S2Vec2 {
        return this.convertOffset(point.x, point.y, space, out);
    }

    convertOffsetInto(dst: S2Vec2, x: number, y: number, space?: S2AbstractSpace): S2Vec2 {
        dst = dst.set(x, y);
        if (space === this) return dst;
        dst.apply2x3Offset(this.spaceToWorld);
        if (space) dst.apply2x3Offset(space.worldToSpace);
        return dst;
    }

    convertOffsetIntoV(dst: S2Vec2, point: S2Vec2, space?: S2AbstractSpace): S2Vec2 {
        return this.convertOffsetInto(dst, point.x, point.y, space);
    }

    convertLength(length: number, space: S2AbstractSpace): number {
        if (space === this) return Math.abs(length);
        length *= this.scaleToWorld;
        if (space) length /= space.scaleToWorld;
        return Math.abs(length);
    }

    convertExtentsInto(dst: S2Vec2, x: number, y: number, space?: S2AbstractSpace): S2Vec2 {
        return this.convertOffsetInto(dst, x, y, space).abs();
    }

    convertExtentsIntoV(dst: S2Vec2, point: S2Vec2, space?: S2AbstractSpace): S2Vec2 {
        return this.convertExtentsInto(dst, point.x, point.y, space);
    }

    convertExtents(x: number, y: number, space: S2AbstractSpace, out?: S2Vec2): S2Vec2 {
        return this.convertOffset(x, y, space, out).abs();
    }

    convertExtentsV(extent: S2Vec2, space: S2AbstractSpace, out?: S2Vec2): S2Vec2 {
        return this.convertExtents(extent.x, extent.y, space, out);
    }
}
