import type { S2BaseScene } from '../../scene/s2-base-scene';
import type { S2Dirtyable } from '../../shared/s2-globals';
import type { S2Point } from '../../shared/s2-point';
import type { S2BaseData } from '../base/s2-base-data';

export type S2BaseDraggableContainer = S2DraggableContainer<S2BaseData>;

export abstract class S2DraggableContainer<Data extends S2BaseData> implements S2Dirtyable {
    public readonly data: Data;

    protected readonly scene: S2BaseScene;
    protected dirty: boolean = true;
    protected owner: S2Dirtyable | null = null;

    constructor(scene: S2BaseScene, data: Data) {
        this.scene = scene;
        this.data = data;
        this.data.setOwner(this);
    }

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
        if (this.isDirty()) return;
        this.dirty = true;
        this.owner?.markDirty();
    }

    clearDirty(): void {
        this.dirty = false;
        this.data.clearDirty();
    }

    abstract updatePosition(position: S2Point): void;
}
