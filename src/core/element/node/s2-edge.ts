import { S2BaseScene } from '../../scene/s2-base-scene';
import { type S2Space, S2Number, S2TypePriority } from '../../shared/s2-types';
import { type S2Dirtyable } from '../../shared/s2-globals';
import { S2Edge, S2EdgeData } from './s2-base-edge';

// S2NodeArcManhattan

export class S2LineEdge extends S2Edge<S2EdgeData> {
    constructor(scene: S2BaseScene) {
        super(scene, new S2EdgeData());
    }

    update(): void {
        if (this.skipUpdate()) return;

        const space: S2Space = 'world';
        const camera = this.scene.getActiveCamera();
        const startDirection = this.getStartToEnd(space).normalize();
        const endDirection = startDirection.clone().negate();
        if (this.data.startAngle.value !== -Infinity) {
            startDirection.setFromPolarDeg(this.data.startAngle.value);
        }
        if (this.data.endAngle.value !== -Infinity) {
            endDirection.setFromPolarDeg(this.data.endAngle.value);
        }

        const start = this.data.start.getPointInDirection(startDirection, space, camera, this.data.startDistance);
        const end = this.data.end.getPointInDirection(endDirection, space, camera, this.data.endDistance);

        this.applyStyleToPath();
        this.path.data.space.set(space);
        this.path.clear().moveToV(start).lineToV(end).update();

        this.clearDirty();
    }
}

export class S2CubicEdgeData extends S2EdgeData {
    public readonly curveBendAngle: S2Number;
    public readonly curveStartTension: S2Number;
    public readonly curveEndTension: S2Number;

    constructor() {
        super();
        this.curveStartTension = new S2Number(0.3, S2TypePriority.Normal);
        this.curveEndTension = new S2Number(0.3, S2TypePriority.Normal);
        this.curveBendAngle = new S2Number(0, S2TypePriority.Normal);
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        super.setOwner(owner);
        this.curveStartTension.setOwner(owner);
        this.curveEndTension.setOwner(owner);
        this.curveBendAngle.setOwner(owner);
    }

    clearDirty(): void {
        super.clearDirty();
        this.curveStartTension.clearDirty();
        this.curveEndTension.clearDirty();
        this.curveBendAngle.clearDirty();
    }
}

export class S2CubicEdge extends S2Edge<S2CubicEdgeData> {
    constructor(scene: S2BaseScene) {
        super(scene, new S2CubicEdgeData());
    }

    update(): void {
        if (this.skipUpdate()) return;

        const space: S2Space = 'world';
        const camera = this.scene.getActiveCamera();
        const sign = -1;
        const startDirection = this.getStartToEnd(space).normalize();
        const endDirection = startDirection.clone().negate();
        if (this.data.startAngle.value !== -Infinity) {
            startDirection.setFromPolarDeg(this.data.startAngle.value);
        }
        if (this.data.endAngle.value !== -Infinity) {
            endDirection.setFromPolarDeg(this.data.endAngle.value);
        }
        const curveBendAngle = this.data.curveBendAngle.value !== -Infinity ? this.data.curveBendAngle.get() : 0;
        startDirection.rotateDeg(+sign * curveBendAngle);
        endDirection.rotateDeg(-sign * curveBendAngle);

        const start = this.data.start.getPointInDirection(startDirection, space, camera, this.data.startDistance);
        const end = this.data.end.getPointInDirection(endDirection, space, camera, this.data.endDistance);

        const distance = start.distance(end);
        const startTension = this.data.curveStartTension.value !== -Infinity ? this.data.curveStartTension.get() : 0.3;
        const endTension = this.data.curveEndTension.value !== -Infinity ? this.data.curveEndTension.get() : 0.3;
        startDirection.scale(startTension * distance);
        endDirection.scale(endTension * distance);

        this.applyStyleToPath();
        this.path.data.space.set(space);
        this.path.clear().moveToV(start).cubicToV(startDirection, endDirection, end).update();

        this.clearDirty();
    }
}
