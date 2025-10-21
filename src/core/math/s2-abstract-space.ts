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

    setLocalTransform(transform: S2Mat2x3): void {
        this.spaceToParent.copy(transform);
        this.markDirty();
        this.update();
    }

    convertPointTo(x: number, y: number, space?: S2AbstractSpace, out?: S2Vec2): S2Vec2 {
        out = out ? out.set(x, y) : new S2Vec2(x, y);
        if (space === this) return out;
        out.apply2x3(this.spaceToWorld);
        if (space) out.apply2x3(space.getWorldToSpace());
        return out;
    }

    convertPointToV(point: S2Vec2, space?: S2AbstractSpace, out?: S2Vec2): S2Vec2 {
        return this.convertPointTo(point.x, point.y, space, out);
    }

    convertOffsetTo(x: number, y: number, space?: S2AbstractSpace, out?: S2Vec2): S2Vec2 {
        out = out ? out.set(x, y) : new S2Vec2(x, y);
        if (space === this) return out;
        out.apply2x3Offset(this.spaceToWorld);
        if (space) out.apply2x3Offset(space.getWorldToSpace());
        return out;
    }

    convertOffsetToV(point: S2Vec2, space?: S2AbstractSpace, out?: S2Vec2): S2Vec2 {
        return this.convertOffsetTo(point.x, point.y, space, out);
    }

    convertLengthTo(length: number, space: S2AbstractSpace): number {
        if (space === this) return Math.abs(length);
        length *= this.scaleToWorld;
        if (space) length /= space.scaleToWorld;
        return Math.abs(length);
    }

    convertExtentsTo(x: number, y: number, space: S2AbstractSpace, out?: S2Vec2): S2Vec2 {
        return this.convertOffsetTo(x, y, space, out).abs();
    }

    convertExtentsToV(extent: S2Vec2, space: S2AbstractSpace, out?: S2Vec2): S2Vec2 {
        return this.convertExtentsTo(extent.x, extent.y, space, out);
    }
}
