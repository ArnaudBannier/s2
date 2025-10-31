import type { S2Dirtyable } from '../shared/s2-globals';
import { S2Mat2x3 } from './s2-mat2x3';
import { S2Vec2 } from './s2-vec2';

export class S2Space implements S2Dirtyable {
    protected parent: S2Space | null;
    protected dirty: boolean = true;
    protected readonly spaceToParent: S2Mat2x3 = new S2Mat2x3(1, 0, 0, 0, 1, 0);
    protected readonly parentToSpace: S2Mat2x3 = new S2Mat2x3(1, 0, 0, 0, 1, 0);
    protected readonly spaceToWorld: S2Mat2x3 = new S2Mat2x3(1, 0, 0, 0, 1, 0);
    protected readonly worldToSpace: S2Mat2x3 = new S2Mat2x3(1, 0, 0, 0, 1, 0);
    protected readonly extentsScaleToParent: S2Vec2 = new S2Vec2(1.0, 1.0);
    protected readonly extentsScaleToWorld: S2Vec2 = new S2Vec2(1.0, 1.0);
    protected lengthScaleToParent: number = 1.0;
    protected lengthScaleToWorld: number = 1.0;
    protected isDirect: boolean = true;

    constructor(parent: S2Space | null = null) {
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

        // Assume spaceToParent is updated
        const e0x = this.spaceToParent.elements[0];
        const e0y = this.spaceToParent.elements[1];
        const e1x = this.spaceToParent.elements[2];
        const e1y = this.spaceToParent.elements[3];

        this.lengthScaleToParent = Math.sqrt(Math.abs(S2Mat2x3.det(this.spaceToParent)));
        this.extentsScaleToParent.set(Math.sqrt(e0x * e0x + e0y * e0y), Math.sqrt(e1x * e1x + e1y * e1y));
        this.parentToSpace.copy(this.spaceToParent).invert();

        if (this.parent) {
            this.parent.update();
            this.spaceToWorld.multiplyMatrices(this.parent.spaceToWorld, this.spaceToParent);
            this.worldToSpace.multiplyMatrices(this.parentToSpace, this.parent.worldToSpace);
            this.lengthScaleToWorld = this.lengthScaleToParent * this.parent.lengthScaleToWorld;
            this.extentsScaleToWorld.copy(this.extentsScaleToParent).mulV(this.parent.extentsScaleToWorld);
        } else {
            this.spaceToWorld.copy(this.spaceToParent);
            this.worldToSpace.copy(this.parentToSpace);
            this.lengthScaleToWorld = this.lengthScaleToParent;
            this.extentsScaleToWorld.copy(this.extentsScaleToParent);
        }

        this.isDirect = this.spaceToWorld.det() > 0;

        this.clearDirty();
    }

    isDirectSpace(): boolean {
        return this.isDirect;
    }

    getSpaceToParentInto(dst: S2Mat2x3): this {
        dst.copy(this.spaceToParent);
        return this;
    }

    getParentToSpaceInto(dst: S2Mat2x3): this {
        dst.copy(this.parentToSpace);
        return this;
    }

    getSpaceToWorldInto(dst: S2Mat2x3): this {
        dst.copy(this.spaceToWorld);
        return this;
    }

    getWorldToSpaceInto(dst: S2Mat2x3): this {
        dst.copy(this.worldToSpace);
        return this;
    }

    getSpaceToWorld(): S2Mat2x3 {
        return this.spaceToWorld;
    }

    getWorldToSpace(): S2Mat2x3 {
        return this.worldToSpace;
    }

    getThisToSpaceInto(dst: S2Mat2x3, space: S2Space): this {
        dst.copy(this.spaceToWorld);
        dst.multiplyMatrices(space.getWorldToSpace(), dst);
        return this;
    }

    getSpaceToThisInto(dst: S2Mat2x3, space: S2Space): this {
        dst.copy(this.worldToSpace);
        dst.multiplyMatrices(dst, space.getSpaceToWorld());
        return this;
    }

    setFromSpace(space: S2Space, origin: S2Vec2, basis0: S2Vec2, basis1: S2Vec2): void {
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

    setSpaceToParentMat(matrix: S2Mat2x3): void {
        this.spaceToParent.copy(matrix);
        this.markDirty();
        this.update();
    }

    convertPointInto(dst: S2Vec2, x: number, y: number, space: S2Space): this {
        dst = dst.set(x, y);
        if (space === this) return this;
        dst.apply2x3(this.spaceToWorld).apply2x3(space.worldToSpace);
        return this;
    }

    convertPointIntoV(dst: S2Vec2, point: S2Vec2, space: S2Space): this {
        return this.convertPointInto(dst, point.x, point.y, space);
    }

    convertOffsetInto(dst: S2Vec2, x: number, y: number, space: S2Space): this {
        dst = dst.set(x, y);
        if (space === this) return this;
        dst.apply2x3Offset(this.spaceToWorld).apply2x3Offset(space.worldToSpace);
        return this;
    }

    convertOffsetIntoV(dst: S2Vec2, point: S2Vec2, space: S2Space): this {
        return this.convertOffsetInto(dst, point.x, point.y, space);
    }

    convertLength(length: number, space: S2Space): number {
        if (space === this) return Math.abs(length);
        length *= this.lengthScaleToWorld;
        if (space) length /= space.lengthScaleToWorld;
        return Math.abs(length);
    }

    convertExtentsInto(dst: S2Vec2, x: number, y: number, space: S2Space): this {
        dst = dst.set(x, y);
        if (space === this) return this;
        dst.mulV(this.extentsScaleToWorld);
        if (space) dst.divV(space.extentsScaleToWorld);
        return this;
    }

    convertExtentsIntoV(dst: S2Vec2, point: S2Vec2, space: S2Space): this {
        return this.convertExtentsInto(dst, point.x, point.y, space);
    }
}
