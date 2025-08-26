import { S2Vec2 } from './s2-vec2.ts';

export class S2Camera {
    position: S2Vec2;
    viewExtents: S2Vec2;
    viewScale: number;
    viewport: S2Vec2;

    constructor(position: S2Vec2, extents: S2Vec2, viewport: S2Vec2, viewScale: number = 1.0) {
        this.position = position;
        this.viewExtents = extents;
        this.viewport = viewport;
        this.viewScale = viewScale;
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
        return new S2Vec2(this.viewToWorldX(x), this.viewToWorldY(y));
    }

    viewToWorldV(v: S2Vec2): S2Vec2 {
        return this.viewToWorld(v.x, v.y);
    }

    viewToWorldLength(length: number): number {
        return length * this.getViewToWorldScaleX();
    }

    getWorldToViewScaleX(): number {
        return (0.5 * this.viewport.x) / (this.viewExtents.x * this.viewScale);
    }

    getWorldToViewScaleY(): number {
        return (0.5 * this.viewport.y) / (this.viewExtents.y * this.viewScale);
    }

    getViewToWorldScaleX(): number {
        return (2.0 * (this.viewExtents.x * this.viewScale)) / this.viewport.x;
    }

    getViewToWorldScaleY(): number {
        return (2.0 * (this.viewExtents.y * this.viewScale)) / this.viewport.y;
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
        return new S2Vec2(this.worldToViewX(x), this.worldToViewY(y));
    }

    worldToViewV(v: S2Vec2): S2Vec2 {
        return this.worldToView(v.x, v.y);
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
}
