import { S2Vec2 } from './s2-vec2.ts';

export class S2Camera {
    position: S2Vec2;
    viewExtents: S2Vec2;
    viewScale: number;
    viewport: S2Vec2;

    private worldToViewScale: S2Vec2 = new S2Vec2(1, 1);
    private viewToWorldScale: S2Vec2 = new S2Vec2(1, 1);

    constructor(position: S2Vec2, extents: S2Vec2, viewport: S2Vec2, viewScale: number = 1.0) {
        this.position = position;
        this.viewExtents = extents;
        this.viewport = viewport;
        this.viewScale = viewScale;
        this.updateScales();
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
        return new S2Vec2(this.viewToWorldX(x), this.viewToWorldY(y));
    }

    viewToWorldV(v: S2Vec2): S2Vec2 {
        return this.viewToWorld(v.x, v.y);
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
        return new S2Vec2(this.viewToWorldDirectionX(x), this.viewToWorldDirectionY(y));
    }

    viewToWorldDirectionV(v: S2Vec2): S2Vec2 {
        return new S2Vec2(this.viewToWorldDirectionX(v.x), this.viewToWorldDirectionY(v.y));
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
        return new S2Vec2(this.worldToViewX(x), this.worldToViewY(y));
    }

    worldToViewV(v: S2Vec2): S2Vec2 {
        return this.worldToView(v.x, v.y);
    }

    worldToViewDirectionX(x: number): number {
        return +x * this.getWorldToViewScaleX();
    }

    worldToViewDirectionY(y: number): number {
        return -y * this.getWorldToViewScaleY();
    }

    worldToViewDirection(x: number, y: number): S2Vec2 {
        return new S2Vec2(this.worldToViewDirectionX(x), this.worldToViewDirectionY(y));
    }

    worldToViewDirectionV(v: S2Vec2): S2Vec2 {
        return new S2Vec2(this.worldToViewDirectionX(v.x), this.worldToViewDirectionY(v.y));
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
}
