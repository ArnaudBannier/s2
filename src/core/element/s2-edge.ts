import { S2Vec2 } from '../math/s2-vec2';
import { S2BaseScene } from '../s2-base-scene';
import { S2Node } from './s2-node';
import { S2Path } from './s2-path';
import { type S2Space, S2TypeState, S2Length, S2Number, S2Position } from '../s2-types';
import { S2Camera } from '../math/s2-camera';
import { S2Element } from './base/s2-element';
import { S2BaseData, S2StrokeData } from './base/s2-base-data';

// S2NodeArcManhattan

export class S2EdgeEndpoint {
    protected mode: 'node' | 'position';
    public node: S2Node | null;
    public position: S2Position;

    constructor() {
        this.mode = 'position';
        this.node = null;
        this.position = new S2Position(0, 0, 'world');
    }

    set(endpoint: S2Node | S2Position): this {
        if (endpoint instanceof S2Node) {
            this.mode = 'node';
            this.node = endpoint;
            this.position.copy(this.node.data.position);
        } else {
            this.mode = 'position';
            this.node = null;
            this.position.copy(endpoint);
        }
        return this;
    }

    copy(other: S2EdgeEndpoint): void {
        this.mode = other.mode;
        this.node = other.node;
        this.position.copy(other.position);
    }

    getCenter(space: S2Space, camera: S2Camera): S2Vec2 {
        if (this.mode === 'node' && this.node) {
            return this.node.getCenter(space);
        } else {
            return this.position.toSpace(space, camera);
        }
    }

    getPointInDirection(direction: S2Vec2, space: S2Space, camera: S2Camera, distance: S2Length): S2Vec2 {
        if (this.mode === 'node' && this.node) {
            if (distance.hasActiveHierarchy()) {
                return this.node.getPointInDirection(direction, space, distance);
            } else {
                return this.node.getCenter(space);
            }
        } else {
            const point = this.position.toSpace(space, camera);
            const d = distance.toSpace(space, camera);
            return point.addV(direction.clone().normalize().scale(d));
        }
    }
}

export class S2EdgeData extends S2BaseData {
    public readonly stroke: S2StrokeData;
    public readonly opacity: S2Number;
    public readonly pathFrom: S2Number;
    public readonly pathTo: S2Number;

    public readonly startDistance: S2Length;
    public readonly endDistance: S2Length;
    public readonly startAngle: S2Number;
    public readonly endAngle: S2Number;
    public readonly start: S2EdgeEndpoint;
    public readonly end: S2EdgeEndpoint;

    constructor() {
        super();
        this.stroke = new S2StrokeData();
        this.opacity = new S2Number(1, S2TypeState.Active);
        this.pathFrom = new S2Number(0);
        this.pathTo = new S2Number(1);
        this.startDistance = new S2Length(0, 'view', S2TypeState.Inactive);
        this.endDistance = new S2Length(0, 'view', S2TypeState.Inactive);
        this.startAngle = new S2Number(0, S2TypeState.Inactive);
        this.endAngle = new S2Number(0, S2TypeState.Inactive);
        this.start = new S2EdgeEndpoint();
        this.end = new S2EdgeEndpoint();

        this.stroke.width.set(4, 'view', S2TypeState.Active);
        this.stroke.color.set(0, 0, 0, S2TypeState.Active);
        this.opacity.set(1, S2TypeState.Inactive);
    }
}

export abstract class S2Edge<Data extends S2EdgeData> extends S2Element<Data> {
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
            return nodeOrPos.toSpace(space, this.scene.getActiveCamera());
        }
    }

    protected getPoint(nodeOrPos: S2Node | S2Position, space: S2Space, distance: S2Length, direction: S2Vec2): S2Vec2 {
        if (nodeOrPos instanceof S2Node) {
            if (distance.hasActiveHierarchy()) {
                return nodeOrPos.getPointInDirection(direction, space, distance);
            }
            return nodeOrPos.getCenter(space);
        } else {
            const camera = this.scene.getActiveCamera();
            const point = nodeOrPos.toSpace(space, camera);
            if (distance.hasActiveHierarchy()) {
                const d = distance.toSpace(space, camera);
                point.addV(direction.clone().normalize().scale(d));
            }
            return point;
        }
    }

    protected getStartToEnd(space: S2Space): S2Vec2 {
        const camera = this.scene.getActiveCamera();
        const start = this.data.start.getCenter(space, camera);
        const end = this.data.end.getCenter(space, camera);
        return end.subV(start);
    }

    protected applyStyleToPath(): void {
        this.path.data.pathFrom.copy(this.data.pathFrom);
        this.path.data.pathTo.copy(this.data.pathTo);
        this.path.data.stroke.copy(this.data.stroke);
        this.path.data.opacity.copy(this.data.opacity);
    }
}

export class S2LineEdge extends S2Edge<S2EdgeData> {
    constructor(scene: S2BaseScene) {
        super(scene, new S2EdgeData());
    }

    protected updateImpl(updateId?: number): void {
        const space: S2Space = 'world';
        const camera = this.scene.getActiveCamera();
        const startDirection = this.getStartToEnd(space).normalize();
        const endDirection = startDirection.clone().negate();
        if (this.data.startAngle.hasActiveHierarchy()) {
            startDirection.setFromPolarDeg(this.data.startAngle.value);
        }
        if (this.data.endAngle.hasActiveHierarchy()) {
            endDirection.setFromPolarDeg(this.data.endAngle.value);
        }

        const start = this.data.start.getPointInDirection(startDirection, space, camera, this.data.startDistance);
        const end = this.data.end.getPointInDirection(endDirection, space, camera, this.data.endDistance);

        this.applyStyleToPath();
        this.path.data.space.set(space);
        this.path.clear().moveToV(start).lineToV(end).update(updateId);
    }
}

export class S2CubicEdgeData extends S2EdgeData {
    public readonly curveBendAngle: S2Number;
    public readonly curveStartTension: S2Number;
    public readonly curveEndTension: S2Number;

    constructor() {
        super();
        this.curveStartTension = new S2Number(0.3, S2TypeState.Inactive);
        this.curveEndTension = new S2Number(0.3, S2TypeState.Inactive);
        this.curveBendAngle = new S2Number(0, S2TypeState.Inactive);
    }
}

export class S2CubicEdge extends S2Edge<S2CubicEdgeData> {
    constructor(scene: S2BaseScene) {
        super(scene, new S2CubicEdgeData());
    }

    protected updateImpl(updateId?: number): void {
        const space: S2Space = 'world';
        const camera = this.scene.getActiveCamera();
        const sign = -1;
        const startDirection = this.getStartToEnd(space).normalize();
        const endDirection = startDirection.clone().negate();
        if (this.data.startAngle.hasActiveHierarchy()) {
            startDirection.setFromPolarDeg(this.data.startAngle.value);
        }
        if (this.data.endAngle.hasActiveHierarchy()) {
            endDirection.setFromPolarDeg(this.data.endAngle.value);
        }
        const curveBendAngle = this.data.curveBendAngle.hasActiveHierarchy()
            ? this.data.curveBendAngle.getInherited()
            : 0;
        startDirection.rotateDeg(+sign * curveBendAngle);
        endDirection.rotateDeg(-sign * curveBendAngle);

        const start = this.data.start.getPointInDirection(startDirection, space, camera, this.data.startDistance);
        const end = this.data.end.getPointInDirection(endDirection, space, camera, this.data.endDistance);

        const distance = start.distance(end);
        const startTension = this.data.curveStartTension.hasActiveHierarchy()
            ? this.data.curveStartTension.getInherited()
            : 0.3;
        const endTension = this.data.curveEndTension.hasActiveHierarchy()
            ? this.data.curveEndTension.getInherited()
            : 0.3;
        startDirection.scale(startTension * distance);
        endDirection.scale(endTension * distance);

        this.applyStyleToPath();
        this.path.data.space.set(space);
        this.path.clear().moveToV(start).cubicToV(startDirection, endDirection, end).update(updateId);
    }
}
