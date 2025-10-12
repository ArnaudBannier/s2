import type { S2HasClone, S2HasCopy } from './s2-base-type';
import { S2BaseType } from './s2-base-type';

export class S2Enum<T> extends S2BaseType implements S2HasClone<S2Enum<T>>, S2HasCopy<S2Enum<T>> {
    readonly kind = 'enum' as const;
    public value: T;

    constructor(value: T, locked: boolean = false) {
        super();
        this.value = value;
        this.locked = locked;
    }

    clone(): S2Enum<T> {
        return new S2Enum(this.value, this.locked);
    }

    copyIfUnlocked(other: S2Enum<T>): this {
        if (this.locked) return this;
        return this.copy(other);
    }

    copy(other: S2Enum<T>): this {
        if (this.value === other.value) return this;
        this.value = other.value;
        this.markDirty();
        return this;
    }

    set(value: T): this {
        if (this.value === value) return this;
        this.value = value;
        this.markDirty();
        return this;
    }

    get(): T {
        return this.value;
    }
}
