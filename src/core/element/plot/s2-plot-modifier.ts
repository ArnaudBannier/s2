import type { S2HasCopy } from '../../shared/s2-base-type';
import { S2Vec2 } from '../../math/s2-vec2';
import { S2BaseType } from '../../shared/s2-base-type';

export class S2PlotModifier extends S2BaseType implements S2HasCopy<S2PlotModifier> {
    readonly kind = 'plot-modifier' as const;
    public modifier: (v: S2Vec2) => void;

    constructor(locked: boolean = false) {
        super();
        this.modifier = (v: S2Vec2) => {
            void v;
        };
        this.locked = locked;
    }

    copyIfUnlocked(other: S2PlotModifier): this {
        if (this.locked) return this;
        return this.copy(other);
    }

    copy(other: S2PlotModifier): this {
        if (this.modifier === other.modifier) return this;
        this.modifier = other.modifier;
        this.markDirty();
        return this;
    }

    set(modifier: (v: S2Vec2) => void): this {
        if (this.modifier === modifier) return this;
        this.modifier = modifier;
        this.markDirty();
        return this;
    }

    get(): (v: S2Vec2) => void {
        return this.modifier;
    }

    evaluate(v: S2Vec2): void {
        this.modifier(v);
    }
}
