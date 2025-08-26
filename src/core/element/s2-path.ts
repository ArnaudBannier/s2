import { S2Vec2 } from '../math/s2-vec2';
import { type S2HasPartialRendering, type S2BaseScene } from '../s2-interface';
import { svgNS } from '../s2-globals';
import { S2Shape } from './s2-shape';
import { S2Length, S2Position, type S2Space } from '../math/s2-space';
import { S2CubicCurve, S2LineCurve, S2PolyCurve } from '../math/s2-curve';
import type { S2Animatable, S2Attributes } from '../s2-attributes';

export class S2Path extends S2Shape implements S2HasPartialRendering {
    protected element: SVGPathElement;
    protected space: S2Space = 'world';
    protected sampleCount: number = 0;
    protected polyCurve: S2PolyCurve;
    protected endPosition: S2Vec2;
    protected shouldClose: boolean[] = [];
    protected pathFrom: number = -1;
    protected pathTo: number = 2;

    constructor(scene: S2BaseScene) {
        super(scene);
        this.element = document.createElementNS(svgNS, 'path');
        this.polyCurve = new S2PolyCurve();
        this.endPosition = new S2Vec2(0, 0);
        this.fillOpacity = 0;
    }

    getSVGElement(): SVGPathElement {
        return this.element;
    }

    setAnimatableAttributes(attributes: S2Animatable): this {
        super.setAnimatableAttributes(attributes);
        if (attributes.pathFrom !== undefined) this.pathFrom = attributes.pathFrom;
        if (attributes.pathTo !== undefined) this.pathTo = attributes.pathTo;
        return this;
    }

    getAnimatableAttributes(): S2Animatable {
        const attributes = super.getAnimatableAttributes();
        attributes.pathFrom = this.pathFrom;
        attributes.pathTo = this.pathTo;
        return attributes;
    }

    setAttributes(attributes: S2Attributes): this {
        super.setAttributes(attributes);
        if (attributes.pathFrom !== undefined) this.pathFrom = attributes.pathFrom;
        if (attributes.pathTo !== undefined) this.pathTo = attributes.pathTo;
        return this;
    }

    getAttributes(): S2Attributes {
        const attributes = super.getAttributes();
        attributes.pathFrom = this.pathFrom;
        attributes.pathTo = this.pathTo;
        return attributes;
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
        return this.setStartV(new S2Vec2(x, y));
    }

    setStartV(start: S2Vec2): this {
        this.position.space = this.space;
        this.position.value.copy(start);
        this.moveToV(start);
        return this;
    }

    getSampleCount(): number {
        return this.sampleCount;
    }

    getStart(space: S2Space = this.space): S2Vec2 {
        return this.position.toSpace(space, this.getActiveCamera());
    }

    getEnd(space: S2Space = this.space): S2Vec2 {
        return S2Position.toSpace(this.endPosition, this.space, space, this.getActiveCamera());
    }

    getPointAt(t: number, space: S2Space = this.space): S2Vec2 {
        return S2Position.toSpace(this.polyCurve.getPointAt(t), this.space, space, this.getActiveCamera());
    }

    getTangentAt(t: number, space: S2Space = this.space): S2Vec2 {
        return S2Position.toSpace(this.polyCurve.getTangentAt(t), this.space, space, this.getActiveCamera());
    }

    getStartTangent(space: S2Space = this.space): S2Vec2 {
        return S2Position.toSpace(this.polyCurve.getStartTangent(), this.space, space, this.getActiveCamera());
    }

    getEndTangent(space: S2Space = this.space): S2Vec2 {
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
        return this.moveToV(new S2Vec2(x, y));
    }

    moveToV(v: S2Vec2): this {
        this.endPosition.copy(v);
        return this;
    }

    lineTo(x: number, y: number): this {
        return this.lineToV(new S2Vec2(x, y));
    }

    lineToV(v: S2Vec2): this {
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
        return this.cubicToV(new S2Vec2(dx1, dy1), new S2Vec2(dx2, dy2), new S2Vec2(x, y), sampleCount);
    }

    cubicToV(dv1: S2Vec2, dv2: S2Vec2, v: S2Vec2, sampleCount: number = this.sampleCount): this {
        this.polyCurve.addCubic(
            this.endPosition,
            S2Vec2.add(this.endPosition, dv1),
            S2Vec2.add(v, dv2),
            v,
            sampleCount,
        );
        this.endPosition.copy(v);
        this.shouldClose.push(false);
        return this;
    }

    smoothCubicTo(dx: number, dy: number, x: number, y: number, sampleCount: number = this.sampleCount): this {
        return this.smoothCubicToV(new S2Vec2(dx, dy), new S2Vec2(x, y), sampleCount);
    }

    smoothCubicToV(dv: S2Vec2, v: S2Vec2, sampleCount: number = this.sampleCount): this {
        if (this.polyCurve.getCurveCount() <= 0) return this;
        const lastCurve = this.polyCurve.getLastCurve();
        if (lastCurve instanceof S2CubicCurve === false) return this;
        this.polyCurve.addCubic(
            this.endPosition,
            S2Vec2.sub(S2Vec2.scale(this.endPosition, 2), lastCurve.getBezierPoint(2)),
            S2Vec2.add(v, dv),
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

    setPathTo(t: number): this {
        this.pathTo = t;
        return this;
    }

    setPathFrom(t: number): this {
        this.pathFrom = t;
        return this;
    }

    setPathRange(from: number, to: number): this {
        this.pathFrom = from;
        this.pathTo = to;
        return this;
    }

    getPathFrom(): number {
        return this.pathFrom;
    }

    getPathTo(): number {
        return this.pathTo;
    }

    getPathRange(): [number, number] {
        return [this.pathFrom, this.pathTo];
    }

    private polyCurveToPath(polyCurve: S2PolyCurve): string {
        const curveCount = polyCurve.getCurveCount();
        if (curveCount === 0 || this.pathFrom >= this.pathTo) return '';
        const camera = this.getActiveCamera();
        let prevEnd: S2Vec2 | null = null;
        let d = '';
        for (let i = 0; i < curveCount; i++) {
            const curve = polyCurve.getCurve(i);
            const start = curve.getStart();
            if (prevEnd === null || !S2Vec2.eq(start, prevEnd)) {
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
        this.updateSVGTransform(this.element);
        this.updateSVGStyle(this.element);
        this.polyCurve.updateLength();
        let polyCurve = this.polyCurve;
        if (this.pathFrom > 0 && this.pathTo < 1) {
            polyCurve = this.polyCurve.createPartialCurveRange(this.pathFrom, this.pathTo);
        } else if (this.pathFrom > 0) {
            polyCurve = this.polyCurve.createPartialCurveFrom(this.pathFrom);
        } else if (this.pathTo < 1) {
            polyCurve = this.polyCurve.createPartialCurveTo(this.pathTo);
        }
        const d = this.polyCurveToPath(polyCurve);
        this.element.setAttribute('d', d);
        return this;
    }
}
