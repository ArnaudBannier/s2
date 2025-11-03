import type { S2BaseScene } from '../../scene/s2-base-scene';
import type { S2Dirtyable } from '../../shared/s2-globals';
import { S2Point } from '../../shared/s2-point';
import { S2BaseData } from '../base/s2-base-data';
import { S2DraggableContainer } from './s2-draggable-container';
import { S2SpaceRef } from '../../shared/s2-space-ref';

export class S2DraggableContainerBoxData extends S2BaseData {
    public readonly boundA: S2Point;
    public readonly boundB: S2Point;
    public readonly space: S2SpaceRef;

    constructor(scene: S2BaseScene) {
        super();
        const worldSpace = scene.getWorldSpace();
        this.boundA = new S2Point(-Infinity, -Infinity, worldSpace);
        this.boundB = new S2Point(+Infinity, +Infinity, worldSpace);
        this.space = new S2SpaceRef(worldSpace);
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        this.boundA.setOwner(owner);
        this.boundB.setOwner(owner);
        this.space.setOwner(owner);
    }

    clearDirty(): void {
        this.boundA.clearDirty();
        this.boundB.clearDirty();
        this.space.clearDirty();
    }
}

export class S2DraggableContainerBox extends S2DraggableContainer<S2DraggableContainerBoxData> {
    constructor(scene: S2BaseScene) {
        super(scene, new S2DraggableContainerBoxData(scene));
    }

    updatePosition(position: S2Point): void {
        const space = this.data.space.get();
        const currPosition = this.scene.acquireVec2();
        const boundA = this.scene.acquireVec2();
        const boundB = this.scene.acquireVec2();

        position.getInto(currPosition, space);
        this.data.boundA.getInto(boundA, space);
        this.data.boundB.getInto(boundB, space);

        const lowerX = Math.min(boundA.x, boundB.x);
        const upperX = Math.max(boundA.x, boundB.x);
        const lowerY = Math.min(boundA.y, boundB.y);
        const upperY = Math.max(boundA.y, boundB.y);
        currPosition.max(lowerX, lowerY);
        currPosition.min(upperX, upperY);
        position.setV(currPosition, space);

        this.scene.releaseVec2(currPosition);
        this.scene.releaseVec2(boundA);
        this.scene.releaseVec2(boundB);

        this.clearDirty();
    }
}
