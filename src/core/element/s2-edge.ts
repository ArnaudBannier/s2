import { S2Vec2 } from '../math/s2-vec2';
import { type S2BaseScene } from '../s2-interface';
import { S2Node } from './s2-node';
import { S2Path } from './s2-path';
import { S2MonoGraphic, S2MonoGraphicData } from './s2-shape';
import { type S2Space, S2Length, S2Number, S2Position } from '../s2-types';

// S2NodeArcManhattan

export class S2EdgeData extends S2MonoGraphicData {
    public readonly pathFrom: S2Number;
    public readonly pathTo: S2Number;
    public startDistance?: S2Length;
    public endDistance?: S2Length;
    public startAngle?: S2Number;
    public endAngle?: S2Number;
    public start: S2Node | S2Position; // TODO Créer une classe S2EdgeEndpoint ?
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

export abstract class S2Edge<Data extends S2EdgeData> extends S2MonoGraphic<Data> {
    protected path: S2Path;
    constructor(scene: S2BaseScene, data: Data) {
        super(scene, data);
        this.path = new S2Path(scene);
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
        this.path.data.opacity.copy(this.data.opacity);
    }
}

export class S2LineEdge extends S2Edge<S2EdgeData> {
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

export class S2CubicEdge extends S2Edge<S2CubicEdgeData> {
    constructor(scene: S2BaseScene) {
        super(scene, new S2CubicEdgeData());
        this.data.fill.opacity.set(0);
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
        this.path.clear().setStartV(start).cubicToV(startDirection, endDirection, end).update(updateId);
        return this;
    }
}
