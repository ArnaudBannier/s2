import type { S2BaseScene } from '../../scene/s2-base-scene';
import type { S2Dirtyable, S2TipTransform } from '../../shared/s2-globals';
import type { S2BaseNode } from './s2-base-node';
import { S2BezierLengthMapper } from '../../math/curve/length-mapper/s2-bezier-length-mapper';
import { S2CubicCurve } from '../../math/curve/s2-cubic-curve';
import { S2SDFUtils } from '../../math/curve/s2-sdf';
import { S2Mat2x3 } from '../../math/s2-mat2x3';
import { S2Vec2 } from '../../math/s2-vec2';
import { S2Number } from '../../shared/s2-number';
import { S2StringPath } from '../base/s2-string-path';
import { S2Edge, S2EdgeData } from './s2-base-edge';

export class S2CubicEdgeData extends S2EdgeData {
    public readonly startAngle: S2Number;
    public readonly endAngle: S2Number;
    public readonly bendAngle: S2Number;
    public readonly startTension: S2Number;
    public readonly endTension: S2Number;

    constructor(scene: S2BaseScene) {
        super(scene);
        this.startAngle = new S2Number(-Infinity);
        this.endAngle = new S2Number(-Infinity);
        this.startTension = new S2Number(0.3);
        this.endTension = new S2Number(0.3);
        this.bendAngle = new S2Number(0);
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        super.setOwner(owner);
        this.startAngle.setOwner(owner);
        this.endAngle.setOwner(owner);
        this.startTension.setOwner(owner);
        this.endTension.setOwner(owner);
        this.bendAngle.setOwner(owner);
    }

    clearDirty(): void {
        super.clearDirty();
        this.startAngle.clearDirty();
        this.endAngle.clearDirty();
        this.startTension.clearDirty();
        this.endTension.clearDirty();
        this.bendAngle.clearDirty();
    }
}

export class S2CubicEdge extends S2Edge<S2CubicEdgeData> {
    protected readonly curve: S2CubicCurve;
    protected readonly lengthMapper: S2BezierLengthMapper;
    protected readonly path: S2StringPath;

    constructor(scene: S2BaseScene, start: S2BaseNode, end: S2BaseNode) {
        super(scene, new S2CubicEdgeData(scene), start, end);
        this.curve = new S2CubicCurve();
        this.path = new S2StringPath(scene);
        this.lengthMapper = new S2BezierLengthMapper(this.curve);
        this.path.setParent(this);

        start.attachEdge(this);
        end.attachEdge(this);
    }

    getTipTransformAtInto(dst: S2TipTransform, t: number): S2TipTransform {
        const space = this.scene.getWorldSpace();
        t = this.lengthMapper.getTFromU(t);
        dst.space = space;
        dst.pathLength = this.lengthMapper.getLength();
        dst.strokeWidth = this.data.stroke.width.get(space);
        this.curve.getPointInto(dst.position, t);
        this.curve.getTangentInto(dst.tangent, t);
        return dst;
    }

    protected updateCurve(): void {
        const space = this.scene.getWorldSpace();
        const p0 = _vec0;
        const p1 = _vec1;
        const p2 = _vec2;
        const p3 = _vec3;
        this.start.getCenterInto(p0, space);
        this.end.getCenterInto(p3, space);
        const distance = p0.distance(p3);
        p1.copy(p3).subV(p0);
        p1.scale(1 / distance);
        p2.copy(p1).negate();

        if (this.data.startAngle.get() !== -Infinity) {
            p1.setPolar(this.data.startAngle.get(), 1, 'deg');
        }
        if (this.data.endAngle.get() !== -Infinity) {
            p2.setPolar(this.data.endAngle.get(), 1, 'deg');
        }
        const bendAngle = this.data.bendAngle.get() !== -Infinity ? this.data.bendAngle.get() : 0;
        p1.rotate(-bendAngle, 'deg');
        p2.rotate(+bendAngle, 'deg');

        p1.scale(this.data.startTension.get() * distance).addV(p0);
        p2.scale(this.data.endTension.get() * distance).addV(p3);

        this.curve.setControlPointsV(p0, p1, p2, p3);

        const sdf0 = this.start.getSDF();
        const sdf1 = this.end.getSDF();
        const space0 = this.start.data.space.get();
        const space1 = this.end.data.space.get();
        const d0 = this.data.startDistance.get(space0);
        const d1 = this.data.endDistance.get(space1);
        space.getThisToSpaceInto(_mat, space0);
        let t0 = S2SDFUtils.findPointAtDistance(sdf0, this.curve, _mat, d0, 0, 1);
        space.getThisToSpaceInto(_mat, space1);
        let t1 = S2SDFUtils.findPointAtDistance(sdf1, this.curve, _mat, d1, 0, 1);
        const deltaT = t1 - t0;
        t0 += this.data.pathFrom.get() * deltaT;
        t1 -= (1 - this.data.pathTo.get()) * deltaT;

        this.curve.subdivideInto(this.curve, t0, t1);
        this.lengthMapper.update();
    }

    protected updatePath(): void {
        const space = this.scene.getWorldSpace();
        const viewSpace = this.scene.getViewSpace();
        const curve = this.curve;
        const point = _vec0;
        let svgPath = '';

        point.set(curve.x0, curve.y0);
        space.convertPointIntoV(point, point, viewSpace);
        svgPath += `M ${point.x.toFixed(2)},${point.y.toFixed(2)} `;
        point.set(curve.x1, curve.y1);
        space.convertPointIntoV(point, point, viewSpace);
        svgPath += `C ${point.x.toFixed(2)},${point.y.toFixed(2)} `;
        point.set(curve.x2, curve.y2);
        space.convertPointIntoV(point, point, viewSpace);
        svgPath += `${point.x.toFixed(2)},${point.y.toFixed(2)} `;
        point.set(curve.x3, curve.y3);
        space.convertPointIntoV(point, point, viewSpace);
        svgPath += `${point.x.toFixed(2)},${point.y.toFixed(2)} `;

        this.path.data.path.set(svgPath);
        this.path.data.stroke.copyIfUnlocked(this.data.stroke);
        this.path.data.opacity.copyIfUnlocked(this.data.opacity);
        this.path.data.fill.opacity.set(0);
        this.path.update();
    }

    update(): void {
        if (this.skipUpdate()) return;

        this.updateSVGChildren();
        this.updateCurve();
        this.updatePath();
        this.updateArrowTips();

        this.clearDirty();
    }
}

const _mat = new S2Mat2x3();
const _vec0 = new S2Vec2();
const _vec1 = new S2Vec2();
const _vec2 = new S2Vec2();
const _vec3 = new S2Vec2();
