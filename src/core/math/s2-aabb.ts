import { S2Vec2 } from './s2-vec2';

export class S2AABB {
    public lower: S2Vec2;
    public upper: S2Vec2;

    constructor() {
        this.lower = new S2Vec2();
        this.upper = new S2Vec2();
    }

    setFromPoints(points: S2Vec2[]): this {
        if (points.length === 0) {
            this.lower.set(0, 0);
            this.upper.set(0, 0);
            return this;
        }

        this.lower.set(+Infinity, +Infinity);
        this.upper.set(-Infinity, -Infinity);

        for (const point of points) {
            this.lower.minV(point);
            this.upper.maxV(point);
        }
        return this;
    }

    setEmpty(): this {
        this.lower.set(+Infinity, +Infinity);
        this.upper.set(-Infinity, -Infinity);
        return this;
    }

    expandToInclude(point: S2Vec2): this {
        this.lower.minV(point);
        this.upper.maxV(point);
        return this;
    }

    getCenter(): S2Vec2 {
        return this.lower.clone().addV(this.upper).scale(0.5);
    }

    getExtents(): S2Vec2 {
        return this.upper.clone().subV(this.lower).scale(0.5);
    }

    isPointInside(point: S2Vec2): boolean {
        return point.x >= this.lower.x && point.x <= this.upper.x && point.y >= this.lower.y && point.y <= this.upper.y;
    }

    expand(amount: number): this {
        this.lower.x -= amount;
        this.lower.y -= amount;
        this.upper.x += amount;
        this.upper.y += amount;
        return this;
    }

    clone(): S2AABB {
        const aabb = new S2AABB();
        aabb.lower.copy(this.lower);
        aabb.upper.copy(this.upper);
        return aabb;
    }

    copy(aabb: S2AABB): this {
        this.lower.copy(aabb.lower);
        this.upper.copy(aabb.upper);
        return this;
    }
}
