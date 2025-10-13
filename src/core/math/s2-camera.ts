import type { S2Dirtyable } from '../shared/s2-globals.ts';
import { S2Mat2x3 } from './s2-mat2x3.ts';
import { S2Vec2 } from './s2-vec2.ts';

export type S2Space = 'world' | 'view';

export class S2Camera implements S2Dirtyable {
    position: S2Vec2;
    viewExtents: S2Vec2;
    viewScale: number;
    viewport: S2Vec2;

    private worldToViewScale: S2Vec2 = new S2Vec2(1, 1);
    private viewToWorldScale: S2Vec2 = new S2Vec2(1, 1);

    private worldToViewMat: S2Mat2x3 = new S2Mat2x3();
    private viewToWorldMat: S2Mat2x3 = new S2Mat2x3();

    protected dirty: boolean = true;
    private rotation: number = Math.PI; // en radians

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

    constructor(position: S2Vec2, extents: S2Vec2, viewport: S2Vec2, viewScale: number = 1.0) {
        this.position = position;
        this.viewExtents = extents;
        this.viewport = viewport;
        this.viewScale = viewScale;
        this.updateScales();
        this.updateMatrices();
    }

    setPosition(x: number, y: number): this {
        this.position.set(x, y);
        return this;
    }

    setExtents(x: number, y: number): this {
        this.viewExtents.set(x, y);
        this.updateScales();
        return this;
    }

    setExtentsScale(scale: number): this {
        this.viewScale = scale;
        this.updateScales();
        return this;
    }

    private updateMatrices(): void {
        if (!this.isDirty()) return;

        const cx = this.viewport.x / 2;
        const cy = this.viewport.y / 2;
        const sx = (+0.5 * this.viewport.x) / (this.viewExtents.x * this.viewScale);
        const sy = (-0.5 * this.viewport.y) / (this.viewExtents.y * this.viewScale);
        const cos = Math.cos(this.rotation);
        const sin = Math.sin(this.rotation);
        const px = this.position.x;
        const py = this.position.y;

        // Translate(cx,cy) * Scale(sx,-sy) * Rotate(a) * Translate(-px,-py)
        this.worldToViewMat.set(
            +sx * cos,
            -sx * sin,
            -px * sx * cos + py * sx * sin + cx,
            +sy * sin,
            +sy * cos,
            -px * sy * sin - py * sy * cos + cy,
        );

        // Translate(px, py) * Rotate(-a) * Scale(1/sx, -1/sy) * Translate(-cx,-cy)
        const isx = (+2.0 * (this.viewExtents.x * this.viewScale)) / this.viewport.x;
        const isy = (-2.0 * (this.viewExtents.y * this.viewScale)) / this.viewport.y;
        this.viewToWorldMat.set(
            +isx * cos,
            +isy * sin,
            -cx * cos * isx - cy * sin * isy + px,
            -isx * sin,
            +isy * cos,
            +cx * sin * isx - cy * cos * isy + py,
        );

        // A = ([[1,0,(c subindex_operator(x))],[0,1,(c subindex_operator(y))],[0,0,1]]*[[(s subindex_operator(x)),0,0],[0,(s subindex_operator(y)),0],[0,0,1]]*[[cos(a),(-sin(a)),0],[sin(a),cos(a),0],[0,0,1]]*[[1,0,(-(p subindex_operator(x)))],[0,1,(-(p subindex_operator(y)))],[0,0,1]])
        // B = ([[1,0,(p subindex_operator(x))],[0,1,(p subindex_operator(y))],[0,0,1]]*[[cos(a),sin(a),0],[(-sin(a)),cos(a),0],[0,0,1]]*[[((s subindex_operator(x))^(-1)),0,0],[0,((s subindex_operator(y))^(-1)),0],[0,0,1]]*[[1,0,0],[0,1,0],[0,0,1]]*[[1,0,(-(c subindex_operator(x)))],[0,1,(-(c subindex_operator(y)))],[0,0,1]])

        this.clearDirty();
    }

    private updateScales(): void {
        this.worldToViewScale.set(
            (0.5 * this.viewport.x) / (this.viewExtents.x * this.viewScale),
            (0.5 * this.viewport.y) / (this.viewExtents.y * this.viewScale),
        );
        this.viewToWorldScale.set(
            (2.0 * (this.viewExtents.x * this.viewScale)) / this.viewport.x,
            (2.0 * (this.viewExtents.y * this.viewScale)) / this.viewport.y,
        );
    }

    getWorldToViewScaleX(): number {
        return this.worldToViewScale.x;
    }

    getWorldToViewScaleY(): number {
        return this.worldToViewScale.y;
    }

    getViewToWorldScaleX(): number {
        return this.viewToWorldScale.x;
    }

    getViewToWorldScaleY(): number {
        return this.viewToWorldScale.y;
    }

    viewToWorldX(x: number): number {
        const ratio = x / this.viewport.x;
        const worldW = 2.0 * this.viewExtents.x * this.viewScale;
        return this.position.x - this.viewExtents.x * this.viewScale + ratio * worldW;
    }

    viewToWorldY(y: number): number {
        const ratio = 1.0 - y / this.viewport.y;
        const worldH = 2.0 * this.viewExtents.y * this.viewScale;
        return this.position.y - this.viewExtents.y * this.viewScale + ratio * worldH;
    }

    viewToWorld(x: number, y: number): S2Vec2 {
        return new S2Vec2(x, y).apply2x3(this.viewToWorldMat);
        //return new S2Vec2(this.viewToWorldX(x), this.viewToWorldY(y));
    }

    viewToWorldV(v: S2Vec2): S2Vec2 {
        return v.clone().apply2x3(this.viewToWorldMat);
        //return this.viewToWorld(v.x, v.y);
    }

    viewToWorldInto(x: number, y: number, out: S2Vec2): void {
        out.set(this.viewToWorldX(x), this.viewToWorldY(y));
    }

    viewToWorldDirectionX(x: number): number {
        return +x * this.viewToWorldScale.x;
    }

    viewToWorldDirectionY(y: number): number {
        return -y * this.viewToWorldScale.y;
    }

    viewToWorldDirection(x: number, y: number): S2Vec2 {
        return new S2Vec2(x, y).apply2x3Direction(this.viewToWorldMat);
        //return new S2Vec2(this.viewToWorldDirectionX(x), this.viewToWorldDirectionY(y));
    }

    viewToWorldDirectionV(v: S2Vec2): S2Vec2 {
        return v.clone().apply2x3Direction(this.viewToWorldMat);
        //return new S2Vec2(this.viewToWorldDirectionX(v.x), this.viewToWorldDirectionY(v.y));
    }

    viewToWorldDirectionInto(x: number, y: number, out: S2Vec2): void {
        out.set(this.viewToWorldDirectionX(x), this.viewToWorldDirectionY(y));
    }

    viewToWorldLength(length: number): number {
        return length * this.getViewToWorldScaleX();
    }

    worldToViewX(x: number): number {
        const scale = this.getWorldToViewScaleX();
        return (x - (this.position.x - this.viewExtents.x * this.viewScale)) * scale;
    }

    worldToViewY(y: number): number {
        const scale = this.getWorldToViewScaleY();
        return (this.position.y + this.viewExtents.y * this.viewScale - y) * scale;
    }

    worldToView(x: number, y: number): S2Vec2 {
        return new S2Vec2(x, y).apply2x3(this.worldToViewMat);
        //return new S2Vec2(this.worldToViewX(x), this.worldToViewY(y));
    }

    worldToViewV(v: S2Vec2): S2Vec2 {
        return v.clone().apply2x3(this.worldToViewMat);
        //return this.worldToView(v.x, v.y);
    }

    worldToViewDirectionX(x: number): number {
        return +x * this.getWorldToViewScaleX();
    }

    worldToViewDirectionY(y: number): number {
        return -y * this.getWorldToViewScaleY();
    }

    worldToViewDirection(x: number, y: number): S2Vec2 {
        return new S2Vec2(x, y).apply2x3Direction(this.worldToViewMat);
        //return new S2Vec2(this.worldToViewDirectionX(x), this.worldToViewDirectionY(y));
    }

    worldToViewDirectionV(v: S2Vec2): S2Vec2 {
        return v.clone().apply2x3Direction(this.worldToViewMat);
        //return new S2Vec2(this.worldToViewDirectionX(v.x), this.worldToViewDirectionY(v.y));
    }

    worldToViewDirectionInto(x: number, y: number, out: S2Vec2): void {
        out.set(this.worldToViewDirectionX(x), this.worldToViewDirectionY(y));
    }

    worldToViewLength(length: number): number {
        return length * this.getWorldToViewScaleX();
    }

    getLower(): S2Vec2 {
        return S2Vec2.sub(this.position, S2Vec2.scale(this.viewExtents, this.viewScale));
    }

    getUpper(): S2Vec2 {
        return S2Vec2.add(this.position, S2Vec2.scale(this.viewExtents, this.viewScale));
    }

    convertPosition(position: S2Vec2, currSpace: S2Space, nextSpace: S2Space): S2Vec2 {
        if (currSpace === nextSpace) return position.clone();
        switch (currSpace) {
            case 'world':
                return this.worldToViewV(position);
            case 'view':
                return this.viewToWorldV(position);
        }
    }
}
