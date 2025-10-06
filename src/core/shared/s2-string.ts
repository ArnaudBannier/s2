import { S2BaseType, type S2HasClone, type S2HasCopy } from './s2-base-type';

export class S2String extends S2BaseType implements S2HasClone<S2String>, S2HasCopy<S2String> {
    readonly kind = 'string' as const;
    public value: string;

    constructor(value: string = '', locked: boolean = false) {
        super();
        this.value = value;
        this.locked = locked;
    }

    clone(): S2String {
        return new S2String(this.value, this.locked);
    }

    copyIfUnlocked(other: S2String): this {
        if (this.locked) return this;
        return this.copy(other);
    }

    copy(other: S2String): this {
        if (this.value === other.value) return this;
        this.value = other.value;
        this.markDirty();
        return this;
    }

    set(value: string): this {
        if (this.value === value) return this;
        this.value = value;
        this.markDirty();
        return this;
    }

    get(): string {
        return this.value;
    }

    toString(): string {
        return this.value;
    }
}
