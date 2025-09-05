import { S2Vec2 } from '../math/s2-vec2';
import { type S2BaseScene } from '../s2-interface';
import { S2Node } from './s2-node';
import { NewS2Path, S2Path } from './s2-path';
import { NewS2SimpleShape, S2Shape, S2SMonoGraphicData } from './s2-shape';
import { type S2Space, S2Length, S2Number, S2Position } from '../s2-types';
import type { S2Animatable, S2Attributes } from '../s2-attributes';

// S2NodeArcManhattan

export class S2EdgeData extends S2SMonoGraphicData {
    public pathFrom: S2Number;
    public pathTo: S2Number;
    public startDistance?: S2Length;
    public endDistance?: S2Length;
    public startAngle?: S2Number;
    public endAngle?: S2Number;
    public start: S2Node | S2Position;
    public end: S2Node | S2Position;

    constructor() {
        super();
        this.pathFrom = new S2Number(-1);
        this.pathTo = new S2Number(2);
        this.start = new S2Position(-1, 0, 'world');
        this.end = new S2Position(+1, 0, 'world');
    }

    copy(other: S2EdgeData): void {
        super.copy(other);
        this.pathFrom.copy(other.pathFrom);
        this.pathTo.copy(other.pathTo);
        if (other.start instanceof S2Node) {
            this.start = other.start;
        } else {
            this.start = other.start.clone();
        }
        if (other.end instanceof S2Node) {
            this.end = other.end;
        } else {
            this.end = other.end.clone();
        }
        this.startDistance = other.startDistance?.clone() ?? undefined;
        this.endDistance = other.endDistance?.clone() ?? undefined;
        this.startAngle = other.startAngle?.clone() ?? undefined;
        this.endAngle = other.endAngle?.clone() ?? undefined;
    }

    applyToElement(element: SVGElement, scene: S2BaseScene): void {
        super.applyToElement(element, scene);
    }
}

export abstract class NewS2Edge<Data extends S2EdgeData> extends NewS2SimpleShape<Data> {
    protected path: NewS2Path;
    constructor(scene: S2BaseScene, data: Data) {
        super(scene, data);
        this.path = new NewS2Path(scene);
    }

    getSVGElement(): SVGElement {
        return this.path.getSVGElement();
    }

    protected getPointCenter(nodeOrPos: S2Node | S2Position, space: S2Space) {
        if (nodeOrPos instanceof S2Node) {
            return nodeOrPos.getCenter(space);
        } else {
            return nodeOrPos.toSpace(space, this.getActiveCamera());
        }
    }

    protected getPoint(
        nodeOrPos: S2Node | S2Position,
        space: S2Space,
        distance?: S2Length,
        direction?: S2Vec2,
    ): S2Vec2 {
        if (nodeOrPos instanceof S2Node) {
            if (distance !== undefined && direction !== undefined) {
                return nodeOrPos.getPointInDirection(direction, space, distance);
            }
            return nodeOrPos.getCenter(space);
        } else {
            const point = nodeOrPos.toSpace(space, this.getActiveCamera());
            if (distance && direction) {
                const d = distance.toSpace(space, this.getActiveCamera());
                point.addV(direction.clone().normalize().scale(d));
            }
            return point;
        }
    }

    protected getStartToEnd(space: S2Space): S2Vec2 {
        const start = this.getPointCenter(this.data.start, space);
        const end = this.getPointCenter(this.data.end, space);
        return end.subV(start);
    }

    protected applyStyleToPath(): void {
        this.path.data.pathFrom.copy(this.data.pathFrom);
        this.path.data.pathTo.copy(this.data.pathTo);
        this.path.data.fill.copy(this.data.fill);
        this.path.data.stroke.copy(this.data.stroke);
        this.path.data.transform.copy(this.data.transform);
        this.path.data.opacity.copy(this.data.opacity);
    }
}

export class NewS2LineEdge extends NewS2Edge<S2EdgeData> {
    constructor(scene: S2BaseScene) {
        super(scene, new S2EdgeData());
    }

    update(updateId?: number): this {
        if (this.shouldSkipUpdate(updateId)) return this;
        const space: S2Space = 'world';
        const direction = this.getStartToEnd(space).normalize();
        const startDirection = direction.clone();
        if (this.data.startAngle !== undefined) {
            startDirection.setFromPolarDeg(this.data.startAngle.value);
        }
        const endDirection = direction.clone().negate();
        if (this.data.endAngle !== undefined) {
            endDirection.setFromPolarDeg(this.data.endAngle.value);
        }
        const start = this.getPoint(this.data.start, space, this.data.startDistance, startDirection);
        const end = this.getPoint(this.data.end, space, this.data.endDistance, endDirection);

        this.applyStyleToPath();
        this.path.data.space = space;
        this.path.clear().setStartV(start).lineToV(end).update(updateId);
        return this;
    }
}

export interface S2EdgeOptions {
    startDistance?: S2Length;
    endDistance?: S2Length;
    startAngle?: number;
    endAngle?: number;
}

export abstract class S2Edge<T extends S2EdgeOptions> extends S2Shape {
    protected start: S2Node | S2Position;
    protected end: S2Node | S2Position;
    protected path: S2Path;
    public options: T;

    constructor(scene: S2BaseScene, start: S2Node | S2Position, end: S2Node | S2Position, options: T) {
        const path = new S2Path(scene);
        super(scene);

        this.path = path;
        this.start = start;
        this.end = end;
        this.options = options;
    }

    setAttributes(attributes: S2Attributes): this {
        this.path.setAttributes(attributes);
        return this;
    }

    getAttributes(): S2Attributes {
        return this.path.getAttributes();
    }

    setAnimatableAttributes(attributes: S2Animatable): this {
        // super.setAnimatableAttributes(attributes);
        this.path.setAnimatableAttributes(attributes);
        return this;
    }

    getAnimatableAttributes(): S2Animatable {
        // const attributes = super.getAnimatableAttributes();
        const attributes = this.path.getAnimatableAttributes();
        return attributes;
    }

    protected getPointCenter(nodeOrPos: S2Node | S2Position, space: S2Space) {
        if (nodeOrPos instanceof S2Node) {
            return nodeOrPos.getCenter(space);
        } else {
            return nodeOrPos.toSpace(space, this.getActiveCamera());
        }
    }

    protected getPoint(
        nodeOrPos: S2Node | S2Position,
        space: S2Space,
        distance?: S2Length,
        direction?: S2Vec2,
    ): S2Vec2 {
        if (nodeOrPos instanceof S2Node) {
            if (distance !== undefined && direction !== undefined) {
                return nodeOrPos.getPointInDirection(direction, space, distance);
            }
            return nodeOrPos.getCenter(space);
        } else {
            const point = nodeOrPos.toSpace(space, this.getActiveCamera());
            if (distance && direction) {
                const d = distance.toSpace(space, this.getActiveCamera());
                point.addV(direction.clone().normalize().scale(d));
            }
            return point;
        }
    }

    protected getStartToEnd(space: S2Space): S2Vec2 {
        const start = this.getPointCenter(this.start, space);
        const end = this.getPointCenter(this.end, space);
        return end.subV(start);
    }

    getPath(): S2Path {
        return this.path;
    }

    setPathTo(t: number): this {
        this.path.setPathTo(t);
        return this;
    }

    setPathFrom(t: number): this {
        this.path.setPathFrom(t);
        return this;
    }

    setPathRange(from: number, to: number): this {
        this.path.setPathRange(from, to);
        return this;
    }

    getPathFrom(): number {
        return this.path.getPathFrom();
    }

    getPathTo(): number {
        return this.path.getPathTo();
    }

    getPathRange(): [number, number] {
        return this.path.getPathRange();
    }

    getSVGElement(): SVGPathElement {
        return this.path.getSVGElement();
    }
}

export class S2LineEdge extends S2Edge<S2EdgeOptions> {
    constructor(scene: S2BaseScene, start: S2Node | S2Position, end: S2Node | S2Position, options: S2EdgeOptions) {
        super(scene, start, end, options);
        this.addClass('s2-line-edge');
    }

    update(): this {
        const direction = this.getStartToEnd('world').normalize();
        const startDirection = direction.clone();
        if (this.options.startAngle !== undefined) {
            startDirection.setFromPolarDeg(this.options.startAngle);
        }
        const endDirection = direction.clone().negate();
        if (this.options.endAngle !== undefined) {
            endDirection.setFromPolarDeg(this.options.endAngle);
        }
        const start = this.getPoint(this.start, 'world', this.options.startDistance, startDirection);
        const end = this.getPoint(this.end, 'world', this.options.endDistance, endDirection);

        this.path.clear().setSpace('world').setStartV(start).lineToV(end).update();
        return this;
    }
}

export class S2CubicEdgeData extends S2EdgeData {
    curveAngle?: S2Number;
    curveStartAngle?: S2Number;
    curveEndAngle?: S2Number;
    curveTension?: S2Number;
    curveStartTension?: S2Number;
    curveEndTension?: S2Number;

    constructor() {
        super();
    }

    copy(other: S2CubicEdgeData): void {
        super.copy(other);
        this.curveAngle = other.curveAngle?.clone() ?? undefined;
        this.curveStartAngle = other.curveStartAngle?.clone() ?? undefined;
        this.curveEndAngle = other.curveEndAngle?.clone() ?? undefined;
        this.curveTension = other.curveTension?.clone() ?? undefined;
        this.curveStartTension = other.curveStartTension?.clone() ?? undefined;
        this.curveEndTension = other.curveEndTension?.clone() ?? undefined;
    }

    applyToElement(element: SVGElement, scene: S2BaseScene): void {
        super.applyToElement(element, scene);
    }
}

export class NewS2CubicEdge extends NewS2Edge<S2CubicEdgeData> {
    constructor(scene: S2BaseScene) {
        super(scene, new S2CubicEdgeData());
    }

    update(updateId?: number): this {
        if (this.shouldSkipUpdate(updateId)) return this;

        const space: S2Space = 'view';
        const sign = -1;
        const startToEnd = this.getStartToEnd(space);
        const startDirection = startToEnd.clone().normalize();
        const endDirection = startDirection.clone().negate();

        if (this.data.startAngle !== undefined) {
            startDirection.setFromPolarDeg(sign * this.data.startAngle.value);
        }
        if (this.data.endAngle !== undefined) {
            endDirection.setFromPolarDeg(sign * this.data.endAngle.value);
        }
        const curveAngle = this.data.curveAngle?.value ?? 0;
        startDirection.rotateDeg(sign * (this.data.curveStartAngle?.value ?? curveAngle));
        endDirection.rotateDeg(sign * (this.data.curveEndAngle?.value ?? -curveAngle));

        const start = this.getPoint(this.data.start, space, this.data.startDistance, startDirection);
        const end = this.getPoint(this.data.end, space, this.data.endDistance, endDirection);

        const distance = start.distance(end);
        const tension = this.data.curveTension?.value ?? 0.3;
        const startTension = this.data.curveStartTension?.value ?? tension;
        const endTension = this.data.curveEndTension?.value ?? tension;
        startDirection.scale(startTension * distance);
        endDirection.scale(endTension * distance);

        this.applyStyleToPath();
        this.path.data.space = space;
        this.path.clear().setStartV(start).cubicToV(startDirection, endDirection, end).update();
        return this;
    }
}

export interface S2CubicEdgeOptions extends S2EdgeOptions {
    curveAngle?: number;
    curveStartAngle?: number;
    curveEndAngle?: number;
    curveTension?: number;
    curveStartTension?: number;
    curveEndTension?: number;
}

export class S2CubicEdge extends S2Edge<S2CubicEdgeOptions> {
    constructor(scene: S2BaseScene, start: S2Node | S2Position, end: S2Node | S2Position, options: S2CubicEdgeOptions) {
        super(scene, start, end, options);
        this.addClass('s2-cubic-edge');
    }

    update(): this {
        const space: S2Space = 'view';
        const sign = -1;
        const startToEnd = this.getStartToEnd(space);
        const startDirection = startToEnd.clone().normalize();
        const endDirection = startDirection.clone().negate();

        if (this.options.startAngle !== undefined) {
            startDirection.setFromPolarDeg(sign * this.options.startAngle);
        }
        if (this.options.endAngle !== undefined) {
            endDirection.setFromPolarDeg(sign * this.options.endAngle);
        }
        const curveAngle = this.options.curveAngle ?? 0;
        startDirection.rotateDeg(sign * (this.options.curveStartAngle ?? curveAngle));
        endDirection.rotateDeg(sign * (this.options.curveEndAngle ?? -curveAngle));

        const start = this.getPoint(this.start, space, this.options.startDistance, startDirection);
        const end = this.getPoint(this.end, space, this.options.endDistance, endDirection);

        const distance = start.distance(end);
        const tension = this.options.curveTension ?? 0.3;
        const startTension = this.options.curveStartTension ?? tension;
        const endTension = this.options.curveEndTension ?? tension;
        startDirection.scale(startTension * distance);
        endDirection.scale(endTension * distance);

        this.path.clear().setSpace(space).setStartV(start).cubicToV(startDirection, endDirection, end).update();
        return this;
    }
}
