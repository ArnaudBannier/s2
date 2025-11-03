import type { S2HasClone, S2HasCopy, S2HasLerp } from './s2-base-type';
import { S2BaseType } from './s2-base-type';
import { S2Vec2 } from '../math/s2-vec2';
import type { S2Space } from '../math/s2-space';
import type { S2Point } from './s2-point';
import type { S2Extents } from './s2-extents';

/**
 * Décrit comment un rectangle est ancré à sa position de référence.
 * Les coordonnées (x, y) indiquent l’ancrage relatif :
 *  - (-1, -1) -> coin inférieur gauche
 *  - (+0, +0) -> centre
 *  - (+1, +1) -> coin supérieur droit
 */
export class S2Anchor extends S2BaseType implements S2HasClone<S2Anchor>, S2HasCopy<S2Anchor>, S2HasLerp<S2Anchor> {
    readonly kind = 'anchor' as const;
    public value: S2Vec2;

    constructor(x: number, y: number, locked: boolean = false) {
        super();
        this.value = new S2Vec2(x, y);
        this.locked = locked;
    }

    clone(): S2Anchor {
        return new S2Anchor(this.value.x, this.value.y, this.locked);
    }

    copyIfUnlocked(other: S2Anchor): this {
        if (this.locked) return this;
        return this.copy(other);
    }

    copy(other: S2Anchor): this {
        if (S2Vec2.equalsV(this.value, other.value)) return this;
        this.value.copy(other.value);
        this.markDirty();
        return this;
    }

    lerp(state0: S2Anchor, state1: S2Anchor, t: number): this {
        this.value.copy(state0.value).lerpV(state1.value, t);
        return this;
    }

    static lerp(state0: S2Anchor, state1: S2Anchor, t: number): S2Anchor {
        return new S2Anchor(0, 0).lerp(state0, state1, t);
    }

    set(x: number = 0, y: number = 0): this {
        if (this.value.x === x && this.value.y === y) return this;
        this.value.set(x, y);
        this.markDirty();
        return this;
    }

    setV(offset: S2Vec2): this {
        if (S2Vec2.equalsV(this.value, offset)) return this;
        this.value.copy(offset);
        this.markDirty();
        return this;
    }

    get(): S2Vec2 {
        return new S2Vec2(this.value.x, this.value.y);
    }

    getInto(dst: S2Vec2): this {
        dst.copy(this.value);
        return this;
    }

    getRectPoint(space: S2Space, position: S2Point, extents: S2Extents, anchorX: number, anchorY: number): S2Vec2 {
        const out = new S2Vec2();
        this.getRectPointInto(out, space, position, extents, anchorX, anchorY);
        return out;
    }

    getRectPointIntoF(
        dst: S2Vec2,
        positionX: number,
        positionY: number,
        extentsX: number,
        extentsY: number,
        anchorX: number,
        anchorY: number,
    ): this {
        dst.set(positionX - (this.value.x - anchorX) * extentsX, positionY - (this.value.y - anchorY) * extentsY);
        return this;
    }

    getRectPointIntoV(dst: S2Vec2, position: S2Vec2, extents: S2Vec2, anchor: S2Vec2): this {
        dst.set(position.x - (this.value.x - anchor.x) * extents.x, position.y - (this.value.y - anchor.y) * extents.y);
        return this;
    }

    getRectPointInto(
        dst: S2Vec2,
        space: S2Space,
        position: S2Point,
        extents: S2Extents,
        anchorX: number,
        anchorY: number,
    ): this {
        position.getInto(dst, space);
        const posX = dst.x;
        const posY = dst.y;
        extents.getInto(dst, space);
        const extX = dst.x;
        const extY = dst.y;
        dst.set(posX - (this.value.x - anchorX) * extX, posY - (this.value.y - anchorY) * extY);
        return this;
    }

    getCenter(space: S2Space, position: S2Point, extents: S2Extents): S2Vec2 {
        const center = new S2Vec2();
        this.getCenterInto(center, space, position, extents);
        return center;
    }

    getCenterIntoF(dst: S2Vec2, positionX: number, positionY: number, extentsX: number, extentsY: number): this {
        dst.set(positionX - this.value.x * extentsX, positionY - this.value.y * extentsY);
        return this;
    }

    getCenterIntoV(dst: S2Vec2, position: S2Vec2, extents: S2Vec2): this {
        dst.set(position.x - this.value.x * extents.x, position.y - this.value.y * extents.y);
        return this;
    }

    getCenterInto(dst: S2Vec2, space: S2Space, position: S2Point, extents: S2Extents): this {
        return this.getRectPointInto(dst, space, position, extents, 0, 0);
    }

    getLower(space: S2Space, position: S2Point, extents: S2Extents): S2Vec2 {
        const lower = new S2Vec2();
        this.getLowerInto(lower, space, position, extents);
        return lower;
    }

    getLowerInto(dst: S2Vec2, space: S2Space, position: S2Point, extents: S2Extents): this {
        return this.getRectPointInto(dst, space, position, extents, -1, -1);
    }

    getUpper(space: S2Space, position: S2Point, extents: S2Extents): S2Vec2 {
        const upper = new S2Vec2();
        this.getUpperInto(upper, space, position, extents);
        return upper;
    }

    getUpperInto(dst: S2Vec2, space: S2Space, position: S2Point, extents: S2Extents): this {
        return this.getRectPointInto(dst, space, position, extents, +1, +1);
    }
}
