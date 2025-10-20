import type { S2BaseScene } from '../scene/s2-base-scene';
import type { S2Dirtyable } from '../shared/s2-globals';
import type { S2BaseTipable } from './base/s2-element';
import { ease } from '../animation/s2-easing';
import { S2Mat2x3Builder } from '../math/s2-mat2x3-builder';
import { S2Extents } from '../shared/s2-extents';
import { S2TipTransform, svgNS } from '../shared/s2-globals';
import { S2LengthOld } from '../shared/s2-length';
import { S2Number } from '../shared/s2-number';
import { S2Transform } from '../shared/s2-transform';
import { S2ElementData, S2FillData, S2StrokeData } from './base/s2-base-data';
import { S2DataUtils } from './base/s2-data-utils';
import { S2Element } from './base/s2-element';

export class S2ArrowTipData extends S2ElementData {
    public readonly fill: S2FillData;
    public readonly stroke: S2StrokeData;
    public readonly opacity: S2Number;
    public readonly extents: S2Extents;
    public readonly pathPosition: S2Number;
    public readonly pathThreshold: S2LengthOld;
    public readonly pathStrokeFactor: S2Number;

    constructor() {
        super();
        this.fill = new S2FillData();
        this.stroke = new S2StrokeData();
        this.opacity = new S2Number(1);
        this.pathPosition = new S2Number(1);
        this.pathThreshold = new S2LengthOld(30, 'view');
        this.extents = new S2Extents(5, 5, 'view');
        this.pathStrokeFactor = new S2Number(1);

        this.stroke.width.set(0, 'view');
        this.stroke.opacity.set(1);
        this.fill.opacity.set(1);
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        super.setOwner(owner);
        this.fill.setOwner(owner);
        this.stroke.setOwner(owner);
        this.opacity.setOwner(owner);
        this.extents.setOwner(owner);
        this.pathPosition.setOwner(owner);
        this.pathThreshold.setOwner(owner);
        this.pathStrokeFactor.setOwner(owner);
    }

    clearDirty(): void {
        super.clearDirty();
        this.fill.clearDirty();
        this.stroke.clearDirty();
        this.opacity.clearDirty();
        this.extents.clearDirty();
        this.pathPosition.clearDirty();
        this.pathThreshold.clearDirty();
        this.pathStrokeFactor.clearDirty();
    }
}

export class S2ArrowTip extends S2Element<S2ArrowTipData> {
    protected element: SVGPathElement;
    protected transform: S2Transform;
    protected anchorAlignment: number;
    protected tipableReference: S2BaseTipable | null = null;
    protected tipTransform: S2TipTransform;
    protected tipShape: string;
    protected tipInset: number;
    protected isReversed: boolean;

    constructor(scene: S2BaseScene) {
        super(scene, new S2ArrowTipData());
        this.element = document.createElementNS(svgNS, 'path');
        this.transform = new S2Transform();
        this.tipTransform = new S2TipTransform();
        this.isReversed = false;
        this.tipInset = 0.25;
        this.tipShape = '';
        this.anchorAlignment = 0;
        this.updateTipShape();
    }

    markDirty(): void {
        if (this.isDirty()) return;
        this.dirty = true;
        if (this.tipableReference) {
            this.tipableReference.markDirty();
        }
    }

    setReversed(reversed: boolean = false): this {
        this.isReversed = reversed;
        return this;
    }

    setTipInset(inset: number = 0.25): this {
        this.tipInset = inset;
        this.updateTipShape();
        return this;
    }

    /**
     * Set the anchor alignment for the arrow tip.
     * @param alignment The anchor alignment value. This value is typically between -1 and +1.
     * +1 means the anchor is at the start of the tip shape,
     * 0 means the anchor is at the center of the tip shape,
     * -1 means the anchor is at the end of the tip shape.
     * @returns The current instance for chaining.
     */
    setAnchorAlignment(alignment: number = 0): this {
        this.anchorAlignment = alignment;
        return this;
    }

    setTipableReference(tipable: S2BaseTipable | null): this {
        this.tipableReference = tipable;
        return this;
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    protected updateTipShape(): void {
        const x = -10 + this.tipInset * 20;
        this.tipShape = `M ${x},0 L -10,10 L 10,0 L -10,-10 Z`;
    }

    protected updateTipTransform(): void {
        if (this.tipableReference === null) return;
        const camera = this.scene.getActiveCamera();
        this.tipTransform = this.tipableReference.getTipTransformAt(this.data.pathPosition.get());
        const extents = this.data.extents.get('view', camera);
        const strokeWidth = camera.convertLength(this.tipTransform.strokeWidth, this.tipTransform.space, 'view');
        extents.x += strokeWidth * this.data.pathStrokeFactor.get();
        extents.y += strokeWidth * this.data.pathStrokeFactor.get();
        const pathLength = camera.convertLength(this.tipTransform.pathLength, this.tipTransform.space, 'view');
        const pathThreshold = this.data.pathThreshold.get('view', camera);
        if (pathThreshold > 0 && pathLength < pathThreshold) {
            extents.scale(ease.out(pathLength / pathThreshold));
        }
        const viewPosition = camera.convertPointV(this.tipTransform.position, this.tipTransform.space, 'view');

        const xScaleSign = this.isReversed ? -1 : +1;
        const angle = this.tipTransform.tangent.angle() + camera.getRotationRad();
        S2Mat2x3Builder.setTarget(this.transform.value)
            .translate(this.anchorAlignment * 10, 0)
            .scale((xScaleSign * extents.x) / 10, extents.y / 10)
            .rotateRad(angle)
            .translateV(viewPosition);
    }

    update(): void {
        if (this.skipUpdate()) return;

        this.updateTipTransform();
        S2DataUtils.applyPointerEvents(this.data.pointerEvents, this.element, this.scene);
        S2DataUtils.applyFill(this.data.fill, this.element, this.scene);
        S2DataUtils.applyStroke(this.data.stroke, this.element, this.scene);
        S2DataUtils.applyOpacity(this.data.opacity, this.element, this.scene);
        S2DataUtils.applyTransform(this.transform, this.element, this.scene);
        this.element.setAttribute('d', this.tipShape);

        this.clearDirty();
    }
}
