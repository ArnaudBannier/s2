import type { S2Space } from '../../math/s2-camera';
import type { S2BaseScene } from '../../scene/s2-base-scene';
import type { S2Dirtyable } from '../../shared/s2-globals';
import { S2Enum } from '../../shared/s2-enum';
import { S2OldPoint } from '../../shared/s2-point';
import { S2BaseData } from '../base/s2-base-data';
import { S2DraggableContainer } from './s2-draggable-container';

export class S2DraggableContainerBoxData extends S2BaseData {
    public readonly boundA: S2OldPoint = new S2OldPoint(-Infinity, -Infinity, 'world');
    public readonly boundB: S2OldPoint = new S2OldPoint(+Infinity, +Infinity, 'world');
    public readonly space: S2Enum<S2Space> = new S2Enum<S2Space>('world');

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
        super(scene, new S2DraggableContainerBoxData());
    }

    updatePosition(position: S2OldPoint): void {
        const space = this.data.space.get();
        const camera = this.scene.getActiveCamera();
        const currPosition = position.get(space, camera);
        const boundA = this.data.boundA.get(space, camera);
        const boundB = this.data.boundB.get(space, camera);
        const lowerX = Math.min(boundA.x, boundB.x);
        const upperX = Math.max(boundA.x, boundB.x);
        const lowerY = Math.min(boundA.y, boundB.y);
        const upperY = Math.max(boundA.y, boundB.y);
        currPosition.max(lowerX, lowerY);
        currPosition.min(upperX, upperY);
        position.setV(currPosition, space);
        this.clearDirty();
    }
}
