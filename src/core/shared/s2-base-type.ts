import type { S2Camera } from '../math/s2-camera';
import type { S2Dirtyable } from './s2-globals';

export interface S2HasClone<T> {
    clone(): T;
}

export interface S2HasCopy<T> {
    copy(other: T): this;
    copyIfUnlocked(other: T): this;
}

export interface S2HasLerp<T> {
    lerp(state0: T, state1: T, t: number): this;
}

export interface S2HasLerpWithCamera<T> {
    lerp(state0: T, state1: T, t: number, camera: S2Camera): this;
}

export abstract class S2BaseType implements S2Dirtyable {
    abstract readonly kind: string;
    protected dirty: boolean = true;
    protected owner: S2Dirtyable | null = null;
    protected locked: boolean = false;

    setOwner(owner: S2Dirtyable | null = null): void {
        this.owner = owner;
    }

    getOwner(): S2Dirtyable | null {
        return this.owner;
    }

    isDirty(): boolean {
        return this.dirty;
    }

    markDirty(): void {
        //if (this.isDirty()) return;
        this.dirty = true;
        this.owner?.markDirty();
    }

    clearDirty(): void {
        this.dirty = false;
    }

    isLocked(): boolean {
        return this.locked;
    }

    lock(): this {
        if (!this.locked) {
            this.locked = true;
            // No markDirty: we don't change the value
        }
        return this;
    }

    unlock(): this {
        if (this.locked) {
            this.locked = false;
            // No markDirty: we don't change the value
        }
        return this;
    }
}
