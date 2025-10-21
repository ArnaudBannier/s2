import type { S2BaseScene } from '../../scene/s2-base-scene';
import type { S2AbstractSpace } from '../../math/s2-abstract-space';
import type { S2Dirtyable, S2Tipable } from '../../shared/s2-globals';
import type { S2Point } from '../../shared/s2-point';
import { S2Vec2 } from '../../math/s2-vec2';
import { S2Node } from './s2-node';
import { S2Path } from '../s2-path';
import { S2Element } from '../base/s2-element';
import { S2ElementData, S2StrokeData } from '../base/s2-base-data';
import { S2TipTransform, svgNS } from '../../shared/s2-globals';
import { S2ArrowTip } from '../s2-arrow-tip';
import { S2EdgeEndpoint } from './s2-edge-endpoint';
import { S2Number } from '../../shared/s2-number';
import { S2Length } from '../../shared/s2-length';

// S2NodeArcManhattan

export type S2BaseEdge = S2Edge<S2EdgeData>;

export class S2EdgeData extends S2ElementData {
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

    constructor(scene: S2BaseScene) {
        super();
        const viewSpace = scene.getViewSpace();
        this.stroke = new S2StrokeData(scene);
        this.opacity = new S2Number(1);
        this.pathFrom = new S2Number(0);
        this.pathTo = new S2Number(1);
        this.startDistance = new S2Length(-Infinity, viewSpace);
        this.endDistance = new S2Length(-Infinity, viewSpace);
        this.startAngle = new S2Number(-Infinity);
        this.endAngle = new S2Number(-Infinity);
        this.start = new S2EdgeEndpoint(scene);
        this.end = new S2EdgeEndpoint(scene);

        this.stroke.width.set(4, viewSpace);
        this.stroke.color.set(0, 0, 0);
        this.opacity.set(1);
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        this.stroke.setOwner(owner);
        this.opacity.setOwner(owner);
        this.pathFrom.setOwner(owner);
        this.pathTo.setOwner(owner);
        this.startDistance.setOwner(owner);
        this.endDistance.setOwner(owner);
        this.startAngle.setOwner(owner);
        this.endAngle.setOwner(owner);
        this.start.setOwner(owner);
        this.end.setOwner(owner);
    }

    clearDirty(): void {
        super.clearDirty();
        this.stroke.clearDirty();
        this.opacity.clearDirty();
        this.pathFrom.clearDirty();
        this.pathTo.clearDirty();
        this.startDistance.clearDirty();
        this.endDistance.clearDirty();
        this.startAngle.clearDirty();
        this.endAngle.clearDirty();
        this.start.clearDirty();
        this.end.clearDirty();
    }
}

export abstract class S2Edge<Data extends S2EdgeData> extends S2Element<Data> implements S2Tipable {
    protected element: SVGGElement;
    protected path: S2Path;

    constructor(scene: S2BaseScene, data: Data) {
        super(scene, data);
        this.element = document.createElementNS(svgNS, 'g');
        this.path = new S2Path(scene);
        this.element.appendChild(this.path.getSVGElement());
        this.element.dataset.role = 'edge';
        this.data.start.edge = this;
        this.data.end.edge = this;
    }

    createArrowTip(): S2ArrowTip {
        return this.path.createArrowTip();
    }

    getTip(index: number): S2ArrowTip {
        return this.path.getTip(index);
    }

    getTipCount(): number {
        return this.path.getTipCount();
    }

    detachTip(index: number): this {
        this.path.detachTip(index);
        return this;
    }

    detachTipElement(tip: S2ArrowTip): this {
        this.path.detachTipElement(tip);
        return this;
    }

    detachTipElements(): this {
        this.path.detachTipElements();
        return this;
    }

    getTipTransformAt(t: number): S2TipTransform {
        return this.path.getTipTransformAt(t);
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    protected getPointCenter(nodeOrPos: S2Node | S2Point, space: S2AbstractSpace) {
        if (nodeOrPos instanceof S2Node) {
            return nodeOrPos.getCenter(space);
        } else {
            return nodeOrPos.get(space);
        }
    }

    protected getPoint(
        nodeOrPos: S2Node | S2Point,
        space: S2AbstractSpace,
        distance: S2Length,
        direction: S2Vec2,
    ): S2Vec2 {
        if (nodeOrPos instanceof S2Node) {
            if (distance.value !== -Infinity) {
                return nodeOrPos.getPointInDirection(direction, space, distance);
            }
            return nodeOrPos.getCenter(space);
        } else {
            const point = nodeOrPos.get(space);
            if (distance.value !== -Infinity) {
                const d = distance.get(space);
                point.addV(direction.clone().normalize().scale(d));
            }
            return point;
        }
    }

    protected getStartToEnd(space: S2AbstractSpace): S2Vec2 {
        const start = this.data.start.getCenter(space);
        const end = this.data.end.getCenter(space);
        return end.subV(start);
    }

    protected applyStyleToPath(): void {
        this.path.data.pathFrom.copyIfUnlocked(this.data.pathFrom);
        this.path.data.pathTo.copyIfUnlocked(this.data.pathTo);
        this.path.data.stroke.copyIfUnlocked(this.data.stroke);
        this.path.data.opacity.copyIfUnlocked(this.data.opacity);
    }
}
