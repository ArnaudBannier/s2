import { Vector2 } from '../../math/vector2';
import { type S2HasPartialRendering, type S2BaseScene, type S2Parameters } from '../s2-interface';
import { svgNS } from '../s2-globals';
import { S2Shape } from './s2-shape';
import { S2Length, S2Position, type S2Space } from '../s2-space';
import { S2CubicCurve, S2LineCurve, S2PolyCurve } from '../math/s2-curve';

export class S2Path extends S2Shape<SVGPathElement> implements S2HasPartialRendering {
    protected space: S2Space = 'world';
    protected sampleCount: number = 0;
    protected polyCurve: S2PolyCurve;
    protected endPosition: Vector2;
    protected shouldClose: boolean[] = [];
    protected paramFrom: number = -1;
    protected paramTo: number = 2;

    constructor(scene: S2BaseScene) {
        const element = document.createElementNS(svgNS, 'path');
        super(element, scene);
        this.polyCurve = new S2PolyCurve();
        this.endPosition = new Vector2(0, 0);
        this.fillOpacity = 0;
    }

    getParameters(): S2Parameters {
        const parameters = super.getParameters();
        parameters.pathFrom = this.paramFrom;
        parameters.pathTo = this.paramTo;
        return parameters;
    }

    setParameters(params: S2Parameters): this {
        super.setParameters(params);
        if (params.pathFrom !== undefined) this.paramFrom = params.pathFrom;
        if (params.pathTo !== undefined) this.paramTo = params.pathTo;
        return this;
    }

    setSampleCount(sampleCount: number): this {
        this.sampleCount = sampleCount;
        return this;
    }

    setSpace(space: S2Space): this {
        this.space = space;
        return this;
    }

    setStart(x: number, y: number): this {
        return this.setStartV(new Vector2(x, y));
    }

    setStartV(start: Vector2): this {
        this.position.space = this.space;
        this.position.value.copy(start);
        this.moveToV(start);
        return this;
    }

    getSampleCount(): number {
        return this.sampleCount;
    }

    getStart(space: S2Space = this.space): Vector2 {
        return this.position.toSpace(space, this.getActiveCamera());
    }

    getEnd(space: S2Space = this.space): Vector2 {
        return S2Position.toSpace(this.endPosition, this.space, space, this.getActiveCamera());
    }

    getPointAt(t: number, space: S2Space = this.space): Vector2 {
        return S2Position.toSpace(this.polyCurve.getPointAt(t), this.space, space, this.getActiveCamera());
    }

    getTangentAt(t: number, space: S2Space = this.space): Vector2 {
        return S2Position.toSpace(this.polyCurve.getTangentAt(t), this.space, space, this.getActiveCamera());
    }

    getStartTangent(space: S2Space = this.space): Vector2 {
        return S2Position.toSpace(this.polyCurve.getStartTangent(), this.space, space, this.getActiveCamera());
    }

    getEndTangent(space: S2Space = this.space): Vector2 {
        return S2Position.toSpace(this.polyCurve.getEndTangent(), this.space, space, this.getActiveCamera());
    }

    getLength(space: S2Space = this.space): number {
        return S2Length.toSpace(this.polyCurve.getLength(), this.space, space, this.getActiveCamera());
    }

    clear(): this {
        this.polyCurve.clear();
        this.shouldClose.length = 0;
        this.endPosition.set(0, 0);
        return this;
    }

    moveTo(x: number, y: number): this {
        return this.moveToV(new Vector2(x, y));
    }

    moveToV(v: Vector2): this {
        this.endPosition.copy(v);
        return this;
    }

    lineTo(x: number, y: number): this {
        return this.lineToV(new Vector2(x, y));
    }

    lineToV(v: Vector2): this {
        this.polyCurve.addLine(this.endPosition, v);
        this.endPosition.copy(v);
        this.shouldClose.push(false);
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
        return this.cubicToV(new Vector2(dx1, dy1), new Vector2(dx2, dy2), new Vector2(x, y), sampleCount);
    }

    cubicToV(dv1: Vector2, dv2: Vector2, v: Vector2, sampleCount: number = this.sampleCount): this {
        this.polyCurve.addCubic(
            this.endPosition,
            Vector2.add(this.endPosition, dv1),
            Vector2.add(v, dv2),
            v,
            sampleCount,
        );
        this.endPosition.copy(v);
        this.shouldClose.push(false);
        return this;
    }

    smoothCubicTo(dx: number, dy: number, x: number, y: number, sampleCount: number = this.sampleCount): this {
        return this.smoothCubicToV(new Vector2(dx, dy), new Vector2(x, y), sampleCount);
    }

    smoothCubicToV(dv: Vector2, v: Vector2, sampleCount: number = this.sampleCount): this {
        if (this.polyCurve.getCurveCount() <= 0) return this;
        const lastCurve = this.polyCurve.getLastCurve();
        if (lastCurve instanceof S2CubicCurve === false) return this;
        this.polyCurve.addCubic(
            this.endPosition,
            Vector2.sub(Vector2.scale(this.endPosition, 2), lastCurve.getBezierPoint(2)),
            Vector2.add(v, dv),
            v,
            sampleCount,
        );
        this.endPosition.copy(v);
        this.shouldClose.push(false);
        return this;
    }

    close(): this {
        this.shouldClose[this.shouldClose.length - 1] = true;
        return this;
    }

    reduceTo(t: number): this {
        this.paramFrom = -1;
        this.paramTo = t;
        return this;
    }

    reduceFrom(t: number): this {
        this.paramFrom = t;
        this.paramTo = 2;
        return this;
    }

    makePartial(from: number, to: number): this {
        this.paramFrom = from;
        this.paramTo = to;
        return this;
    }

    getPartialFrom(): number {
        return this.paramFrom;
    }

    getPartialTo(): number {
        return this.paramTo;
    }

    getPartialRange(): [number, number] {
        return [this.paramFrom, this.paramTo];
    }

    private polyCurveToPath(polyCurve: S2PolyCurve): string {
        const curveCount = polyCurve.getCurveCount();
        if (curveCount === 0) return '';
        const camera = this.getActiveCamera();
        let prevEnd: Vector2 | null = null;
        let d = '';
        for (let i = 0; i < curveCount; i++) {
            const curve = polyCurve.getCurve(i);
            const start = curve.getStart();
            if (prevEnd === null || !Vector2.eq(start, prevEnd)) {
                const point = S2Position.toSpace(start, this.space, 'view', camera);
                d += ` M ${point.x} ${point.y}`;
            }
            if (curve instanceof S2LineCurve) {
                const point = S2Position.toSpace(curve.getEnd(), this.space, 'view', camera);
                d += ` L ${point.x} ${point.y}`;
            } else if (curve instanceof S2CubicCurve) {
                const bezierPoints = curve.getBezierPoints();
                d += ' C';
                for (let j = 1; j < bezierPoints.length; j++) {
                    const point = S2Position.toSpace(bezierPoints[j], this.space, 'view', camera);
                    d += ` ${point.x} ${point.y}`;
                }
            }
            if (this.shouldClose[i]) {
                d += ' Z';
            }
            prevEnd = curve.getEnd();
        }
        return d;
    }

    update(): this {
        super.update();
        this.polyCurve.updateLength();
        let polyCurve = this.polyCurve;
        if (this.paramFrom > 0 && this.paramTo < 1) {
            polyCurve = this.polyCurve.makePartial(this.paramFrom, this.paramTo);
        } else if (this.paramFrom > 0) {
            polyCurve = this.polyCurve.reduceFrom(this.paramFrom);
        } else if (this.paramTo < 1) {
            polyCurve = this.polyCurve.reduceTo(this.paramTo);
        }
        const d = this.polyCurveToPath(polyCurve);
        this.element.setAttribute('d', d);
        return this;
    }
}
