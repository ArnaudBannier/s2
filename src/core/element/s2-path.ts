import { S2Vec2 } from '../math/s2-vec2';
import { type S2BaseScene } from '../s2-interface';
import { svgNS } from '../s2-globals';
import { S2TransformGraphic, S2TransformGraphicData } from './s2-transform-graphic';
import { S2Enum, S2Length, S2Number, S2Position, type S2Space } from '../s2-types';
import { S2CubicCurve, S2LineCurve, S2PolyCurve } from '../math/s2-curve';
import type { S2Camera } from '../math/s2-camera';

export class S2PathData extends S2TransformGraphicData {
    public readonly space: S2Enum<S2Space>;
    public readonly polyCurve: S2PolyCurve;
    public readonly pathFrom: S2Number;
    public readonly pathTo: S2Number;

    constructor() {
        super();
        this.polyCurve = new S2PolyCurve();
        this.pathFrom = new S2Number(-1);
        this.pathTo = new S2Number(2);
        this.space = new S2Enum<S2Space>('world');
    }

    copy(other: S2PathData): void {
        super.copy(other);
        this.pathFrom.copy(other.pathFrom);
        this.pathTo.copy(other.pathTo);
        this.polyCurve.copy(other.polyCurve);
        this.space.copy(other.space);
    }

    applyToElement(element: SVGElement, scene: S2BaseScene): void {
        super.applyToElement(element, scene);
        this.polyCurve.updateLength();
        const d = S2PathUtils.polyCurveToSVGPath(
            this.polyCurve,
            this.pathFrom.value,
            this.pathTo.value,
            scene.getActiveCamera(),
            this.space.getInherited(),
        );
        element.setAttribute('d', d);
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
        const curveCount = polyCurve.getCurveCount();
        if (curveCount === 0 || pathFrom >= pathTo) return '';
        if (pathFrom > 0 && pathTo < 1) {
            polyCurve = polyCurve.createPartialCurveRange(pathFrom, pathTo);
        } else if (pathFrom > 0) {
            polyCurve = polyCurve.createPartialCurveFrom(pathFrom);
        } else if (pathTo < 1) {
            polyCurve = polyCurve.createPartialCurveTo(pathTo);
        }

        let prevEnd: S2Vec2 | null = null;
        let svgPath = '';
        for (let i = 0; i < curveCount; i++) {
            const curve = polyCurve.getCurve(i);
            const start = curve.getStart();
            if (prevEnd === null || !S2Vec2.eq(start, prevEnd)) {
                const point = S2Position.toSpace(start, space, 'view', camera);
                svgPath += ` M ${point.x} ${point.y}`;
            } else if (S2Vec2.eq(start, prevEnd)) {
                svgPath += ' Z';
            }

            if (curve instanceof S2LineCurve) {
                const point = S2Position.toSpace(curve.getEnd(), space, 'view', camera);
                svgPath += ` L ${point.x} ${point.y}`;
            } else if (curve instanceof S2CubicCurve) {
                const bezierPoints = curve.getBezierPoints();
                svgPath += ' C';
                for (let j = 1; j < bezierPoints.length; j++) {
                    const point = S2Position.toSpace(bezierPoints[j], space, 'view', camera);
                    svgPath += ` ${point.x} ${point.y}`;
                }
            }
            prevEnd = curve.getEnd();
        }
        return svgPath;
    }
}

export class S2Path extends S2TransformGraphic<S2PathData> {
    protected element: SVGPathElement;
    protected sampleCount: number = 0;
    protected currStart: S2Vec2;
    protected endPosition: S2Vec2;

    constructor(scene: S2BaseScene) {
        super(scene, new S2PathData());
        this.element = document.createElementNS(svgNS, 'path');
        this.endPosition = new S2Vec2(0, 0);
        this.currStart = new S2Vec2(0, 0);
        this.fillOpacity.set(0);
    }

    setSampleCount(sampleCount: number): this {
        this.sampleCount = sampleCount;
        return this;
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    setStart(x: number, y: number): this {
        return this.setStartV(new S2Vec2(x, y));
    }

    setStartV(start: S2Vec2): this {
        this.moveToV(start);
        return this;
    }

    getStart(space: S2Space = this.data.space.getInherited()): S2Vec2 {
        return S2Position.toSpace(
            this.data.polyCurve.getStart(),
            this.data.space.getInherited(),
            space,
            this.scene.getActiveCamera(),
        );
    }

    getEnd(space: S2Space = this.data.space.getInherited()): S2Vec2 {
        return S2Position.toSpace(
            this.data.polyCurve.getEnd(),
            this.data.space.getInherited(),
            space,
            this.scene.getActiveCamera(),
        );
    }

    getPointAt(t: number, space: S2Space = 'world'): S2Vec2 {
        return S2Position.toSpace(
            this.data.polyCurve.getPointAt(t),
            this.data.space.getInherited(),
            space,
            this.scene.getActiveCamera(),
        );
    }

    getTangentAt(t: number, space: S2Space = 'world'): S2Vec2 {
        return S2Position.toSpace(
            this.data.polyCurve.getTangentAt(t),
            this.data.space.getInherited(),
            space,
            this.scene.getActiveCamera(),
        );
    }

    getStartTangent(space: S2Space = 'world'): S2Vec2 {
        return S2Position.toSpace(
            this.data.polyCurve.getStartTangent(),
            this.data.space.getInherited(),
            space,
            this.scene.getActiveCamera(),
        );
    }

    getEndTangent(space: S2Space = 'world'): S2Vec2 {
        return S2Position.toSpace(
            this.data.polyCurve.getEndTangent(),
            this.data.space.getInherited(),
            space,
            this.scene.getActiveCamera(),
        );
    }

    getLength(space: S2Space = 'world'): number {
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

    protected updateImpl(updateId?: number): void {
        void updateId;
        this.data.applyToElement(this.element, this.scene);
    }
}
