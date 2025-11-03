import type { S2BaseScene } from '../../scene/s2-base-scene';
import type { S2Dirtyable } from '../../shared/s2-globals';
import { S2Point } from '../../shared/s2-point';
import { S2BaseData } from '../base/s2-base-data';
import { S2DraggableContainer } from './s2-draggable-container';
import { S2MathUtils } from '../../math/s2-math-utils';
import { S2SpaceRef } from '../../shared/s2-space-ref';

export class S2DraggableContainerLineData extends S2BaseData {
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

export class S2DraggableContainerLine extends S2DraggableContainer<S2DraggableContainerLineData> {
    constructor(scene: S2BaseScene) {
        super(scene, new S2DraggableContainerLineData(scene));
    }

    updatePosition(position: S2Point): void {
        const space = this.data.space.get();
        const boundA = this.scene.acquireVec2();
        const vecAB = this.scene.acquireVec2();
        const vecAP = this.scene.acquireVec2();

        this.data.boundA.getInto(boundA, space);
        this.data.boundB.getInto(vecAB, space);
        position.getInto(vecAP, space);
        vecAB.subV(boundA);
        vecAP.subV(boundA);
        const t = S2MathUtils.clamp01(vecAP.dot(vecAB) / vecAB.lengthSq());
        position.setV(boundA.addV(vecAB.scale(t)), space);

        this.scene.releaseVec2(boundA);
        this.scene.releaseVec2(vecAB);
        this.scene.releaseVec2(vecAP);

        this.clearDirty();
    }
}
