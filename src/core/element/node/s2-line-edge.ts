import type { S2BaseScene } from '../../scene/s2-base-scene';
import type { S2TipTransform } from '../../shared/s2-globals';
import type { S2BaseNode } from './s2-base-node';
import { S2LineCurve } from '../../math/curve/s2-line-curve';
import { S2SDFUtils } from '../../math/curve/s2-sdf';
import { S2Mat2x3 } from '../../math/s2-mat2x3';
import { S2Vec2 } from '../../math/s2-vec2';
import { S2Line } from '../s2-line';
import { S2Edge, S2EdgeData } from './s2-base-edge';

export class S2LineEdge extends S2Edge<S2EdgeData> {
    protected readonly lineCurve: S2LineCurve;
    protected readonly line: S2Line;

    constructor(scene: S2BaseScene, start: S2BaseNode, end: S2BaseNode) {
        super(scene, new S2EdgeData(scene), start, end);
        this.lineCurve = new S2LineCurve();
        this.line = new S2Line(scene);
        this.line.setParent(this);
    }

    getTipTransformAtInto(dst: S2TipTransform, t: number): S2TipTransform {
        return this.line.getTipTransformAtInto(dst, t);
    }

    update(): void {
        if (this.skipUpdate()) return;

        this.updateSVGChildren();
        const space = this.scene.getWorldSpace();

        const start = _vec0;
        const end = _vec1;
        this.start.getCenterInto(start, space);
        this.end.getCenterInto(end, space);
        this.lineCurve.setPointsV(start, end);

        const startDistance = this.data.startDistance.get(space);
        const endDistance = this.data.endDistance.get(space);
        space.getThisToSpaceInto(_mat, this.start.data.space.get());
        let t0 = S2SDFUtils.findPointAtDistance(this.start.getSDF(), this.lineCurve, _mat, startDistance, 0, 1);
        space.getThisToSpaceInto(_mat, this.end.data.space.get());
        let t1 = S2SDFUtils.findPointAtDistance(this.end.getSDF(), this.lineCurve, _mat, endDistance, 0, 1);
        const deltaT = t1 - t0;
        t0 += this.data.pathFrom.get() * deltaT;
        t1 -= (1 - this.data.pathTo.get()) * deltaT;

        this.lineCurve.subdivideInto(this.lineCurve, t0, t1);

        this.lineCurve.getStartInto(start);
        this.lineCurve.getEndInto(end);
        this.line.data.startPosition.setV(start, space);
        this.line.data.endPosition.setV(end, space);

        if (t1 <= t0) {
            this.line.data.opacity.set(0);
        } else {
            this.line.data.stroke.copyIfUnlocked(this.data.stroke);
            this.line.data.opacity.copyIfUnlocked(this.data.opacity);
            this.line.data.startPadding.set(0);
            this.line.data.endPadding.set(0);
        }
        this.line.update();

        this.updateArrowTips();
        this.clearDirty();
    }
}

const _mat = new S2Mat2x3();
const _vec0 = new S2Vec2();
const _vec1 = new S2Vec2();
