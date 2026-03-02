import type { S2BaseScene } from '../../scene/s2-base-scene';
import type { S2BaseNode } from './s2-base-node';
import type { S2Dirtyable, S2Tipable } from '../../shared/s2-globals';
import { S2TipTransform, svgNS } from '../../shared/s2-globals';
import { S2Element } from '../base/s2-element';
import { S2ElementData, S2StrokeData } from '../base/s2-base-data';
import { S2Number } from '../../shared/s2-number';
import { S2Length } from '../../shared/s2-length';
import { S2ArrowTip } from '../s2-arrow-tip';
import type { S2EdgeLabel } from './s2-edge-label';

export type S2BaseEdge = S2Edge<S2EdgeData>;

export class S2EdgeData extends S2ElementData {
    public readonly stroke: S2StrokeData;
    public readonly opacity: S2Number;
    public readonly pathFrom: S2Number;
    public readonly pathTo: S2Number;
    public readonly startDistance: S2Length;
    public readonly endDistance: S2Length;
    public readonly pathThreshold: S2Length;

    constructor(scene: S2BaseScene) {
        super();
        const viewSpace = scene.getViewSpace();
        this.stroke = new S2StrokeData(scene);
        this.opacity = new S2Number(1);
        this.pathFrom = new S2Number(0);
        this.pathTo = new S2Number(1);
        this.startDistance = new S2Length(0, viewSpace);
        this.endDistance = new S2Length(0, viewSpace);
        this.pathThreshold = new S2Length(2, viewSpace);

        this.stroke.width.set(4, viewSpace);
        this.stroke.color.set(0, 0, 0, 1);
        this.opacity.set(1);
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        this.stroke.setOwner(owner);
        this.opacity.setOwner(owner);
        this.pathFrom.setOwner(owner);
        this.pathTo.setOwner(owner);
        this.startDistance.setOwner(owner);
        this.endDistance.setOwner(owner);
        this.pathThreshold.setOwner(owner);
    }

    clearDirty(): void {
        super.clearDirty();
        this.stroke.clearDirty();
        this.opacity.clearDirty();
        this.pathFrom.clearDirty();
        this.pathTo.clearDirty();
        this.startDistance.clearDirty();
        this.endDistance.clearDirty();
        this.pathThreshold.clearDirty();
    }
}

export abstract class S2Edge<Data extends S2EdgeData> extends S2Element<Data> implements S2Tipable {
    protected readonly element: SVGGElement;
    protected readonly start: S2BaseNode;
    protected readonly end: S2BaseNode;
    protected arrowTips: S2ArrowTip[] = [];
    protected labels: S2EdgeLabel[] = [];

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

    attachLabel(label: S2EdgeLabel): this {
        label.setParent(this);
        label.setEdgeReference(this);
        label.markDirty();
        this.labels.push(label);
        this.markDirty();
        return this;
    }

    detachLabel(label: S2EdgeLabel): this {
        label.setParent(null);
        const index = this.labels.indexOf(label);
        if (index === -1) return this;
        this.labels.splice(index, 1);
        label.markDirty();
        this.markDirty();
        return this;
    }

    getStart(): S2BaseNode {
        return this.start;
    }

    getEnd(): S2BaseNode {
        return this.end;
    }

    getTip(index: number): S2ArrowTip {
        return this.arrowTips[index];
    }

    getTipCount(): number {
        return this.arrowTips.length;
    }

    detachTip(index: number): this {
        return this.detachTipElement(this.getTip(index));
    }

    detachTipElement(arrowTip: S2ArrowTip): this {
        arrowTip.setParent(null);
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

    protected updateLabels(): void {
        for (const label of this.labels) {
            label.markDirty();
            label.update();
        }
    }
}
