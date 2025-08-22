import { Vector2 } from '../../math/vector2';
import { type S2BaseScene } from '../s2-interface';
import { S2Node } from './s2-node';
import { S2Path } from './s2-path';
import { S2Shape } from './s2-shape';
import { type S2Space, S2Length, S2Position } from '../s2-space';

// S2NodeArcManhattan

export interface S2EdgeOptions {
    startDistance?: S2Length;
    endDistance?: S2Length;
    startAngle?: number;
    endAngle?: number;
}

export abstract class S2Edge<T extends S2EdgeOptions> extends S2Shape<SVGPathElement> {
    protected start: S2Node | S2Position;
    protected end: S2Node | S2Position;
    protected path: S2Path;
    public options: T;

    constructor(scene: S2BaseScene, start: S2Node | S2Position, end: S2Node | S2Position, options: T) {
        const path = new S2Path(scene);
        super(path.getElement(), scene);

        this.path = path;
        this.start = start;
        this.end = end;
        this.options = options;
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
        direction?: Vector2,
    ): Vector2 {
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

    protected getStartToEnd(space: S2Space): Vector2 {
        const start = this.getPointCenter(this.start, space);
        const end = this.getPointCenter(this.end, space);
        return end.subV(start);
    }
}

export class S2LineEdge extends S2Edge<S2EdgeOptions> {
    constructor(scene: S2BaseScene, start: S2Node | S2Position, end: S2Node | S2Position, options: S2EdgeOptions) {
        super(scene, start, end, options);
        this.addClass('s2-line-edge');
    }

    update(): this {
        super.update();
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
        super.update();
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
