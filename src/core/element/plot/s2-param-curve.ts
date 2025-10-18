import type { S2HasCopy } from '../../shared/s2-base-type';
import { S2Vec2 } from '../../math/s2-vec2';
import { S2BaseType } from '../../shared/s2-base-type';

export class S2ParamCurve extends S2BaseType implements S2HasCopy<S2ParamCurve> {
    readonly kind = 'param-function' as const;
    public mapping: (t: number, out: S2Vec2) => void;

    constructor(locked: boolean = false) {
        super();
        this.mapping = (t: number, out: S2Vec2) => {
            out.set(t, t);
        };
        this.locked = locked;
    }

    copyIfUnlocked(other: S2ParamCurve): this {
        if (this.locked) return this;
        return this.copy(other);
    }

    copy(other: S2ParamCurve): this {
        if (this.mapping === other.mapping) return this;
        this.mapping = other.mapping;
        this.markDirty();
        return this;
    }

    set(mapping: (t: number, out: S2Vec2) => void): this {
        if (this.mapping === mapping) return this;
        this.mapping = mapping;
        this.markDirty();
        return this;
    }

    get(): (t: number, out: S2Vec2) => void {
        return this.mapping;
    }

    evaluate(t: number, out: S2Vec2): void {
        this.mapping(t, out);
    }
}
