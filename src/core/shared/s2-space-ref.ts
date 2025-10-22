import type { S2Space } from '../math/s2-space';
import type { S2HasClone, S2HasCopy } from './s2-base-type';
import { S2BaseType } from './s2-base-type';

export class S2SpaceRef extends S2BaseType implements S2HasClone<S2SpaceRef>, S2HasCopy<S2SpaceRef> {
    readonly kind = 'space-ref' as const;
    public value: S2Space;

    constructor(value: S2Space, locked: boolean = false) {
        super();
        this.value = value;
        this.locked = locked;
    }

    clone(): S2SpaceRef {
        return new S2SpaceRef(this.value, this.locked);
    }

    copyIfUnlocked(other: S2SpaceRef): this {
        if (this.locked) return this;
        return this.copy(other);
    }

    copy(other: S2SpaceRef): this {
        if (this.value === other.value) return this;
        this.value = other.value;
        this.markDirty();
        return this;
    }

    set(value: S2Space): this {
        if (this.value === value) return this;
        this.value = value;
        this.markDirty();
        return this;
    }

    get(): S2Space {
        return this.value;
    }
}
