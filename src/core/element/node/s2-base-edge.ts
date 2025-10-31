import type { S2BaseScene } from '../../scene/s2-base-scene';
import type { S2BaseNode } from './s2-base-node';
import type { S2Dirtyable, S2Tipable } from '../../shared/s2-globals';
import { S2TipTransform, svgNS } from '../../shared/s2-globals';
import { S2Element } from '../base/s2-element';
import { S2ElementData, S2StrokeData } from '../base/s2-base-data';
import { S2Number } from '../../shared/s2-number';
import { S2Length } from '../../shared/s2-length';
import { S2ArrowTip } from '../s2-arrow-tip';

// S2NodeArcManhattan

export type S2BaseEdge = S2Edge<S2EdgeData>;

export class S2EdgeData extends S2ElementData {
    public readonly stroke: S2StrokeData;
    public readonly opacity: S2Number;
    public readonly pathFrom: S2Number;
    public readonly pathTo: S2Number;
    public readonly startDistance: S2Length;
    public readonly endDistance: S2Length;

    constructor(scene: S2BaseScene) {
        super();
        const viewSpace = scene.getViewSpace();
        this.stroke = new S2StrokeData(scene);
        this.opacity = new S2Number(1);
        this.pathFrom = new S2Number(0);
        this.pathTo = new S2Number(1);
        this.startDistance = new S2Length(0, viewSpace);
        this.endDistance = new S2Length(0, viewSpace);

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
    }

    clearDirty(): void {
        super.clearDirty();
        this.stroke.clearDirty();
        this.opacity.clearDirty();
        this.pathFrom.clearDirty();
        this.pathTo.clearDirty();
        this.startDistance.clearDirty();
        this.endDistance.clearDirty();
    }
}

export abstract class S2Edge<Data extends S2EdgeData> extends S2Element<Data> implements S2Tipable {
    protected readonly element: SVGGElement;
    protected readonly start: S2BaseNode;
    protected readonly end: S2BaseNode;
    protected arrowTips: S2ArrowTip[] = [];

    constructor(scene: S2BaseScene, data: Data, start: S2BaseNode, end: S2BaseNode) {
        super(scene, data);
        this.element = document.createElementNS(svgNS, 'g');
        this.element.dataset.role = 'edge';
        this.start = start;
        this.end = end;
    }

    abstract getTipTransformAtInto(dst: S2TipTransform, t: number): S2TipTransform;

    createArrowTip(): S2ArrowTip {
        const arrowTip = new S2ArrowTip(this.scene);
        arrowTip.setParent(this);
        arrowTip.setTipableReference(this);
        arrowTip.data.pathPosition.set(1);
        arrowTip.data.layer.set(1);
        this.arrowTips.push(arrowTip);
        this.markDirty();
        return arrowTip;
    }

    getTip(index: number): S2ArrowTip {
        return this.arrowTips[index];
    }

    getTipCount(): number {
        return this.arrowTips.length;
    }

    detachTip(index: number): this {
        if (index >= 0 && index < this.arrowTips.length) {
            this.arrowTips.splice(index, 1);
        }
        this.markDirty();
        return this;
    }

    detachTipElement(arrowTip: S2ArrowTip): this {
        const index = this.arrowTips.indexOf(arrowTip);
        if (index >= 0) {
            this.arrowTips.splice(index, 1);
        }
        this.markDirty();
        return this;
    }

    detachTipElements(): this {
        this.arrowTips.length = 0;
        this.markDirty();
        return this;
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    protected updateArrowTips(): void {
        for (const arrowTip of this.arrowTips) {
            arrowTip.data.fill.color.copyIfUnlocked(this.data.stroke.color);
            arrowTip.data.fill.opacity.copyIfUnlocked(this.data.stroke.opacity);
            arrowTip.markDirty();
            arrowTip.update();
        }
    }
}
