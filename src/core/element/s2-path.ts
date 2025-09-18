import { S2Vec2 } from '../math/s2-vec2';
import { type S2BaseScene } from '../s2-base-scene';
import { S2TipTransform, svgNS, type S2Tipable } from '../s2-globals';
import { S2Enum, S2Length, S2Number, S2Position, S2Transform, S2TypeState, type S2Space } from '../s2-types';
import { S2CubicCurve, S2LineCurve, S2PolyCurve } from '../math/s2-curve';
import { S2Camera } from '../math/s2-camera';
import { S2Element } from './base/s2-element';
import { S2DataUtils } from './base/s2-data-utils';
import { S2FillData, S2BaseData, S2StrokeData } from './base/s2-base-data';

export class S2PathData extends S2BaseData {
    public readonly stroke: S2StrokeData;
    public readonly opacity: S2Number;
    public readonly fill: S2FillData;
    public readonly transform: S2Transform;
    public readonly space: S2Enum<S2Space>;
    public readonly polyCurve: S2PolyCurve;
    public readonly pathFrom: S2Number;
    public readonly pathTo: S2Number;

    constructor() {
        super();
        this.stroke = new S2StrokeData();
        this.opacity = new S2Number(1, S2TypeState.Inactive);
        this.fill = new S2FillData();
        this.transform = new S2Transform();
        this.space = new S2Enum<S2Space>('world');
        this.polyCurve = new S2PolyCurve();
        this.pathFrom = new S2Number(0);
        this.pathTo = new S2Number(1);

        this.transform.state = S2TypeState.Inactive;
        this.fill.opacity.set(0, S2TypeState.Active);
    }
}

export class S2PathUtils {
    static polyCurveToSVGPath(
        polyCurve: S2PolyCurve,
        pathFrom: number,
        pathTo: number,
        camera: S2Camera,
        space: S2Space,
    ): string {
        if (pathFrom > 0 && pathTo < 1) {
            polyCurve = polyCurve.createPartialCurveRange(pathFrom, pathTo);
        } else if (pathFrom > 0) {
            polyCurve = polyCurve.createPartialCurveFrom(pathFrom);
        } else if (pathTo < 1) {
            polyCurve = polyCurve.createPartialCurveTo(pathTo);
        }

        const curveCount = polyCurve.getCurveCount();
        if (curveCount <= 0 || pathFrom >= pathTo) return '';

        let svgPath = '';
        const currStart = polyCurve.getCurve(0).getStart();
        const prevEnd = new S2Vec2(Infinity, Infinity);

        for (let i = 0; i < curveCount; i++) {
            const curve = polyCurve.getCurve(i);

            if (!S2Vec2.eq(prevEnd, curve.getStart())) {
                const point = S2Position.toSpace(currStart, space, 'view', camera);
                svgPath += `M ${point.x},${point.y} `;
            }

            if (curve instanceof S2LineCurve) {
                const point = S2Position.toSpace(curve.getEnd(), space, 'view', camera);
                svgPath += `L ${point.x},${point.y} `;
            } else if (curve instanceof S2CubicCurve) {
                const bezierPoints = curve.getBezierPoints();
                svgPath += 'C ';
                for (let j = 1; j < bezierPoints.length; j++) {
                    const point = S2Position.toSpace(bezierPoints[j], space, 'view', camera);
                    svgPath += `${point.x},${point.y} `;
                }
            }
            const end = curve.getEnd();
            if (S2Vec2.eq(currStart, end)) {
                svgPath += 'Z ';
                currStart.copy(end);
            }
            prevEnd.copy(end);
        }
        return svgPath.trimEnd();
    }
}

export class S2Path extends S2Element<S2PathData> implements S2Tipable {
    protected element: SVGPathElement;
    protected sampleCount: number = 0;
    protected currStart: S2Vec2;
    protected endPosition: S2Vec2;

    getTipTransformAt(t: number): S2TipTransform {
        const from = this.data.pathFrom.getInherited();
        const to = this.data.pathTo.getInherited();
        t = t * (to - from) + from;
        const camera = this.scene.getActiveCamera();
        const transform = new S2TipTransform();
        transform.space = this.data.space.getInherited();
        transform.position = this.data.polyCurve.getPointAt(t);
        transform.tangent = this.data.polyCurve.getTangentAt(t);
        transform.pathLength = this.data.polyCurve.getLength() * (to - from);
        transform.strokeWidth = this.data.stroke.width.getInherited(transform.space, camera);
        return transform;
    }

    constructor(scene: S2BaseScene) {
        super(scene, new S2PathData());
        this.element = document.createElementNS(svgNS, 'path');
        this.endPosition = new S2Vec2(0, 0);
        this.currStart = new S2Vec2(0, 0);
    }

    setSampleCount(sampleCount: number): this {
        this.sampleCount = sampleCount;
        return this;
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    getStart(space: S2Space): S2Vec2 {
        return S2Position.toSpace(
            this.data.polyCurve.getStart(),
            this.data.space.getInherited(),
            space,
            this.scene.getActiveCamera(),
        );
    }

    getEnd(space: S2Space): S2Vec2 {
        return S2Position.toSpace(
            this.data.polyCurve.getEnd(),
            this.data.space.getInherited(),
            space,
            this.scene.getActiveCamera(),
        );
    }

    getPointAt(t: number, space: S2Space): S2Vec2 {
        return S2Position.toSpace(
            this.data.polyCurve.getPointAt(t),
            this.data.space.getInherited(),
            space,
            this.scene.getActiveCamera(),
        );
    }

    getTangentAt(t: number, space: S2Space): S2Vec2 {
        return S2Position.toSpace(
            this.data.polyCurve.getTangentAt(t),
            this.data.space.getInherited(),
            space,
            this.scene.getActiveCamera(),
        );
    }

    getStartTangent(space: S2Space): S2Vec2 {
        return S2Position.toSpace(
            this.data.polyCurve.getStartTangent(),
            this.data.space.getInherited(),
            space,
            this.scene.getActiveCamera(),
        );
    }

    getEndTangent(space: S2Space): S2Vec2 {
        return S2Position.toSpace(
            this.data.polyCurve.getEndTangent(),
            this.data.space.getInherited(),
            space,
            this.scene.getActiveCamera(),
        );
    }

    getLength(space: S2Space): number {
        return S2Length.toSpace(
            this.data.polyCurve.getLength(),
            this.data.space.getInherited(),
            space,
            this.scene.getActiveCamera(),
        );
    }

    clear(): this {
        this.data.polyCurve.clear();
        this.endPosition.set(0, 0);
        return this;
    }

    moveTo(x: number, y: number): this {
        return this.moveToV(new S2Vec2(x, y));
    }

    moveToV(v: S2Vec2): this {
        this.currStart.copy(v);
        this.endPosition.copy(v);
        return this;
    }

    lineTo(x: number, y: number): this {
        return this.lineToV(new S2Vec2(x, y));
    }

    lineToV(v: S2Vec2): this {
        this.data.polyCurve.addLine(this.endPosition, v);
        this.endPosition.copy(v);
        return this;
    }

    cubicTo(
        dx1: number,
        dy1: number,
        dx2: number,
        dy2: number,
        x: number,
        y: number,
        sampleCount: number = this.sampleCount,
    ): this {
        return this.cubicToV(new S2Vec2(dx1, dy1), new S2Vec2(dx2, dy2), new S2Vec2(x, y), sampleCount);
    }

    cubicToV(dv1: S2Vec2, dv2: S2Vec2, v: S2Vec2, sampleCount: number = this.sampleCount): this {
        this.data.polyCurve.addCubic(
            this.endPosition,
            S2Vec2.add(this.endPosition, dv1),
            S2Vec2.add(v, dv2),
            v,
            sampleCount,
        );
        this.endPosition.copy(v);
        return this;
    }

    smoothCubicTo(dx: number, dy: number, x: number, y: number, sampleCount: number = this.sampleCount): this {
        return this.smoothCubicToV(new S2Vec2(dx, dy), new S2Vec2(x, y), sampleCount);
    }

    smoothCubicToV(dv: S2Vec2, v: S2Vec2, sampleCount: number = this.sampleCount): this {
        if (this.data.polyCurve.getCurveCount() <= 0) return this;
        const lastCurve = this.data.polyCurve.getLastCurve();
        if (lastCurve instanceof S2CubicCurve === false) return this;
        this.data.polyCurve.addCubic(
            this.endPosition,
            S2Vec2.sub(S2Vec2.scale(this.endPosition, 2), lastCurve.getBezierPoint(2)),
            S2Vec2.add(v, dv),
            v,
            sampleCount,
        );
        this.endPosition.copy(v);
        return this;
    }

    close(): this {
        if (S2Vec2.eq(this.currStart, this.endPosition)) return this;
        this.data.polyCurve.addLine(this.endPosition, this.currStart);
        return this;
    }

    update(): void {
        S2DataUtils.applyFill(this.data.fill, this.element, this.scene);
        S2DataUtils.applyStroke(this.data.stroke, this.element, this.scene);
        S2DataUtils.applyOpacity(this.data.opacity, this.element, this.scene);
        S2DataUtils.applyTransform(this.data.transform, this.element, this.scene);
        S2DataUtils.applyPath(
            this.data.polyCurve,
            this.data.space,
            this.data.pathFrom,
            this.data.pathTo,
            this.element,
            this.scene,
        );
    }
}
