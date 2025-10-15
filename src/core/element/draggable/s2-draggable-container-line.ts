import type { S2Space } from '../../math/s2-camera';
import type { S2BaseScene } from '../../scene/s2-base-scene';
import type { S2Dirtyable } from '../../shared/s2-globals';
import { S2Enum } from '../../shared/s2-enum';
import { S2Point } from '../../shared/s2-point';
import { S2BaseData } from '../base/s2-base-data';
import { S2DraggableContainer } from './s2-draggable-container';
import { S2MathUtils } from '../../math/s2-math-utils';

export class S2DraggableContainerLineData extends S2BaseData {
    public readonly boundA: S2Point = new S2Point(-Infinity, -Infinity, 'world');
    public readonly boundB: S2Point = new S2Point(+Infinity, +Infinity, 'world');
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

export class S2DraggableContainerLine extends S2DraggableContainer<S2DraggableContainerLineData> {
    constructor(scene: S2BaseScene) {
        super(scene, new S2DraggableContainerLineData());
    }

    updatePosition(position: S2Point): void {
        const space = this.data.space.get();
        const camera = this.scene.getActiveCamera();
        const boundA = this.data.boundA.get(space, camera);
        const vecAB = this.data.boundB.get(space, camera).subV(boundA);
        const vecAP = position.get(space, camera).subV(boundA);
        const t = S2MathUtils.clamp01(vecAP.dot(vecAB) / vecAB.lengthSq());
        position.setV(boundA.addV(vecAB.scale(t)), space);
        this.clearDirty();
    }
}
