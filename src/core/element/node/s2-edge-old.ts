import type { S2BaseScene } from '../../scene/s2-base-scene';
import type { S2Dirtyable } from '../../shared/s2-globals';
import { S2Number } from '../../shared/s2-number';
import { S2EdgeOLD, S2EdgeDataOLD } from './s2-base-edge-old';

// S2NodeArcManhattan

export class S2LineEdgeOLD extends S2EdgeOLD<S2EdgeDataOLD> {
    constructor(scene: S2BaseScene) {
        super(scene, new S2EdgeDataOLD(scene));
    }

    update(): void {
        if (this.skipUpdate()) return;

        const space = this.scene.getWorldSpace();
        const startDirection = this.getStartToEnd(space).normalize();
        const endDirection = startDirection.clone().negate();
        if (this.data.startAngle.value !== -Infinity) {
            startDirection.setPolar(this.data.startAngle.value, 1, 'deg');
        }
        if (this.data.endAngle.value !== -Infinity) {
            endDirection.setPolar(this.data.endAngle.value, 1, 'deg');
        }

        const start = this.data.start.getPointInDirection(startDirection, space, this.data.startDistance);
        const end = this.data.end.getPointInDirection(endDirection, space, this.data.endDistance);

        this.applyStyleToPath();
        this.path.data.space.set(space);
        this.path.clear().moveToV(start).lineToV(end).update();

        this.clearDirty();
    }
}

export class S2CubicEdgeDataOLD extends S2EdgeDataOLD {
    public readonly curveBendAngle: S2Number;
    public readonly curveStartTension: S2Number;
    public readonly curveEndTension: S2Number;

    constructor(scene: S2BaseScene) {
        super(scene);
        this.curveStartTension = new S2Number(0.3);
        this.curveEndTension = new S2Number(0.3);
        this.curveBendAngle = new S2Number(0);
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

export class S2CubicEdgeOLD extends S2EdgeOLD<S2CubicEdgeDataOLD> {
    constructor(scene: S2BaseScene) {
        super(scene, new S2CubicEdgeDataOLD(scene));
    }

    update(): void {
        if (this.skipUpdate()) return;

        const space = this.scene.getWorldSpace();
        const sign = -1;
        const startDirection = this.getStartToEnd(space).normalize();
        const endDirection = startDirection.clone().negate();
        if (this.data.startAngle.value !== -Infinity) {
            startDirection.setPolar(this.data.startAngle.value, 1, 'deg');
        }
        if (this.data.endAngle.value !== -Infinity) {
            endDirection.setPolar(this.data.endAngle.value, 1, 'deg');
        }
        const curveBendAngle = this.data.curveBendAngle.value !== -Infinity ? this.data.curveBendAngle.get() : 0;
        startDirection.rotate(+sign * curveBendAngle, 'deg');
        endDirection.rotate(-sign * curveBendAngle, 'deg');

        const start = this.data.start.getPointInDirection(startDirection, space, this.data.startDistance);
        const end = this.data.end.getPointInDirection(endDirection, space, this.data.endDistance);

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
