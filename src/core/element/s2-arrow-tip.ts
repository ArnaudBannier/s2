import { S2Mat2x3Builder } from '../math/s2-mat2x3-builder';
import { S2BaseScene } from '../s2-base-scene';
import { S2TipTransform, svgNS } from '../s2-globals';
import { S2Number, S2Position, S2Transform, S2TypeState } from '../s2-types';
import { S2BaseData, S2FillData, S2StrokeData } from './base/s2-base-data';
import { S2DataUtils } from './base/s2-data-utils';
import { S2Element } from './base/s2-element';
import { type S2BaseTipable } from './base/s2-element';

export class S2ArrowTipData extends S2BaseData {
    public readonly fill: S2FillData;
    public readonly stroke: S2StrokeData;
    public readonly opacity: S2Number;
    public readonly ratio: S2Number;

    constructor() {
        super();
        this.fill = new S2FillData();
        this.stroke = new S2StrokeData();
        this.opacity = new S2Number(1, S2TypeState.Inactive);
        this.ratio = new S2Number(1);

        this.stroke.opacity.set(1, S2TypeState.Inactive);
        this.fill.opacity.set(1, S2TypeState.Inactive);
    }
}

export class S2ArrowTip extends S2Element<S2ArrowTipData> {
    protected element: SVGPathElement;
    protected transform: S2Transform;
    protected tipableReference: S2BaseTipable | null = null;
    protected tipTransform: S2TipTransform;

    constructor(scene: S2BaseScene) {
        super(scene, new S2ArrowTipData());
        this.element = document.createElementNS(svgNS, 'path');
        this.transform = new S2Transform();
        this.tipTransform = new S2TipTransform();
    }

    setTipableReference(tipable: S2BaseTipable | null): void {
        if (this.tipableReference === tipable) return;
        if (tipable === null) {
            if (this.tipableReference !== null) {
                this.removeDependency(this.tipableReference);
            }
            this.tipableReference = null;
            return;
        } else {
            if (this.tipableReference !== null) {
                this.removeDependency(this.tipableReference);
            }
            this.addDependency(tipable);
            this.tipableReference = tipable;
        }
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    protected updateTipTransform(): void {
        if (this.tipableReference === null) return;
        this.tipTransform = this.tipableReference.getTipTransformAt(this.data.ratio.getInherited());
        S2Mat2x3Builder.setTarget(this.transform.value)
            .rotateRad(this.tipTransform.tangent.angle())
            .translateV(
                S2Position.toSpace(
                    this.tipTransform.position,
                    this.tipTransform.space,
                    'view',
                    this.scene.getActiveCamera(),
                ),
            );
    }

    protected updateImpl(updateId?: number): void {
        void updateId;
        this.updateTipTransform();
        S2DataUtils.applyFill(this.data.fill, this.element, this.scene);
        S2DataUtils.applyStroke(this.data.stroke, this.element, this.scene);
        S2DataUtils.applyOpacity(this.data.opacity, this.element, this.scene);
        S2DataUtils.applyTransform(this.transform, this.element, this.scene);
        this.element.setAttribute('d', 'M -5,0 L -10,10 L 10,0 L -10,-10 Z');
    }
}
