import type { S2HasClone, S2HasCopy } from './s2-base-type';
import { S2BaseType } from './s2-base-type';

export class S2Boolean extends S2BaseType implements S2HasClone<S2Boolean>, S2HasCopy<S2Boolean> {
    readonly kind = 'boolean' as const;
    public value: boolean;

    constructor(value: boolean = false, locked: boolean = false) {
        super();
        this.value = value;
        this.locked = locked;
    }

    clone(): S2Boolean {
        return new S2Boolean(this.value, this.locked);
    }

    copyIfUnlocked(other: S2Boolean): this {
        if (this.locked) return this;
        return this.copy(other);
    }

    copy(other: S2Boolean): this {
        if (this.value === other.value) return this;
        this.value = other.value;
        this.markDirty();
        return this;
    }

    set(value: boolean): this {
        if (this.value === value) return this;
        this.value = value;
        this.markDirty();
        return this;
    }

    get(): boolean {
        return this.value;
    }

    toString(): string {
        return this.value.toString();
    }
}
