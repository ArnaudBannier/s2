import { Vector2 } from '../../math/vector2.ts';

export class S2Camera {
    position: Vector2;
    viewExtents: Vector2;
    viewScale: number;
    viewport: Vector2;

    constructor(position: Vector2, extents: Vector2, viewport: Vector2, viewScale: number = 1.0) {
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

    viewToWorld(x: number, y: number): Vector2 {
        return new Vector2(this.viewToWorldX(x), this.viewToWorldY(y));
    }

    viewToWorldV(v: Vector2): Vector2 {
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

    worldToView(x: number, y: number): Vector2 {
        return new Vector2(this.worldToViewX(x), this.worldToViewY(y));
    }

    worldToViewV(v: Vector2): Vector2 {
        return this.worldToView(v.x, v.y);
    }

    worldToViewLength(length: number): number {
        return length * this.getWorldToViewScaleX();
    }

    getLower(): Vector2 {
        return Vector2.sub(this.position, Vector2.scale(this.viewExtents, this.viewScale));
    }

    getUpper(): Vector2 {
        return Vector2.add(this.position, Vector2.scale(this.viewExtents, this.viewScale));
    }
}
