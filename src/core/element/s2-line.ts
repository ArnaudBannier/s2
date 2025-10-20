import type { S2BaseScene } from '../scene/s2-base-scene';
import type { S2Dirtyable, S2Tipable } from '../shared/s2-globals';
import { S2TipTransform, svgNS } from '../shared/s2-globals';
import { S2Element } from './base/s2-element';
import { S2ElementData, S2StrokeData } from './base/s2-base-data';
import { S2DataUtils } from './base/s2-data-utils';
import { S2Number } from '../shared/s2-number';
import { S2Transform } from '../shared/s2-transform';
import { S2OldPoint } from '../shared/s2-point';
import { S2ArrowTip } from './s2-arrow-tip';
import { S2Vec2 } from '../math/s2-vec2';
import { S2LengthOld } from '../shared/s2-length';

export class S2LineData extends S2ElementData {
    public readonly stroke: S2StrokeData = new S2StrokeData();
    public readonly opacity: S2Number = new S2Number(1);
    public readonly transform: S2Transform = new S2Transform();
    public readonly startPosition: S2OldPoint = new S2OldPoint();
    public readonly endPosition: S2OldPoint = new S2OldPoint();
    public readonly startPadding: S2LengthOld = new S2LengthOld(0);
    public readonly endPadding: S2LengthOld = new S2LengthOld(0);

    setOwner(owner: S2Dirtyable | null = null): void {
        super.setOwner(owner);
        this.stroke.setOwner(owner);
        this.opacity.setOwner(owner);
        this.transform.setOwner(owner);
        this.startPosition.setOwner(owner);
        this.endPosition.setOwner(owner);
        this.startPadding.setOwner(owner);
        this.endPadding.setOwner(owner);
    }

    clearDirty(): void {
        super.clearDirty();
        this.stroke.clearDirty();
        this.opacity.clearDirty();
        this.transform.clearDirty();
        this.startPosition.clearDirty();
        this.endPosition.clearDirty();
        this.startPadding.clearDirty();
        this.endPadding.clearDirty();
    }
}

export class S2Line extends S2Element<S2LineData> implements S2Tipable {
    protected element: SVGLineElement;
    protected arrowTips: S2ArrowTip[] = [];
    protected position0: S2OldPoint = new S2OldPoint();
    protected position1: S2OldPoint = new S2OldPoint();

    constructor(scene: S2BaseScene) {
        super(scene, new S2LineData());
        this.element = document.createElementNS(svgNS, 'line');
    }

    createArrowTip(): S2ArrowTip {
        const arrowTip = new S2ArrowTip(this.scene);
        arrowTip.setParent(this.scene.getSVG());
        this.arrowTips.push(arrowTip);
        arrowTip.data.pathPosition.set(1);
        arrowTip.setTipableReference(this);
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

    getTipTransformAt(t: number): S2TipTransform {
        const space = 'world';
        const camera = this.scene.getActiveCamera();
        const p0 = this.data.startPosition.get(space, camera);
        const p1 = this.data.endPosition.get(space, camera);
        const transform = new S2TipTransform();
        transform.space = space;
        transform.position = S2Vec2.lerpV(p0, p1, t);
        transform.tangent = S2Vec2.subV(p1, p0);
        transform.pathLength = p0.distance(p1);
        transform.strokeWidth = this.data.stroke.width.get(transform.space, camera);
        return transform;
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    update(): void {
        if (this.skipUpdate()) return;

        const space = 'view';
        const camera = this.scene.getActiveCamera();

        S2DataUtils.applyPointerEvents(this.data.pointerEvents, this.element, this.scene);
        S2DataUtils.applyStroke(this.data.stroke, this.element, this.scene);
        S2DataUtils.applyOpacity(this.data.opacity, this.element, this.scene);
        S2DataUtils.applyTransform(this.data.transform, this.element, this.scene);

        const isPosDirty =
            this.data.startPosition.isDirty() ||
            this.data.endPosition.isDirty() ||
            this.data.startPadding.isDirty() ||
            this.data.endPadding.isDirty();
        if (isPosDirty) {
            const pos0 = this.data.startPosition.get(space, camera);
            const pos1 = this.data.endPosition.get(space, camera);
            const length = pos0.distance(pos1);
            const padding0 = this.data.startPadding.get(space, camera);
            const padding1 = this.data.endPadding.get(space, camera);

            if (length < 1e-6 || length < padding0 + padding1) {
                // Too close, hide the line
                this.position0.setV(pos0, space);
                this.position1.setV(pos0, space);
            } else {
                const dir = S2Vec2.subV(pos1, pos0).normalize();
                pos0.addV(dir.clone().scale(padding0));
                pos1.subV(dir.clone().scale(padding1));
                this.position0.setV(pos0, space);
                this.position1.setV(pos1, space);
            }

            S2DataUtils.applyPositionOld(this.position0, this.element, this.scene, 'x1', 'y1');
            S2DataUtils.applyPositionOld(this.position1, this.element, this.scene, 'x2', 'y2');
            this.position0.clearDirty();
            this.position1.clearDirty();
        }

        for (const arrowTip of this.arrowTips) {
            arrowTip.data.fill.color.copyIfUnlocked(this.data.stroke.color);
            arrowTip.data.fill.opacity.copyIfUnlocked(this.data.stroke.opacity);
            arrowTip.markDirty();
            arrowTip.update();
        }

        this.clearDirty();
    }
}
