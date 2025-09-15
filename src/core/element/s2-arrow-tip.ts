import type { S2BaseScene } from '../s2-base-scene';
import { svgNS } from '../s2-globals';
import { S2Extents, S2Number, S2Position, S2Transform, S2TypeState } from '../s2-types';
import { S2BaseData, S2FillData, S2StrokeData } from './base/s2-base-data';
import { S2DataUtils } from './base/s2-data-utils';
import { S2Element } from './base/s2-element';

export class S2ArrowTipData extends S2BaseData {
    public readonly fill: S2FillData;
    public readonly stroke: S2StrokeData;
    public readonly opacity: S2Number;
    public readonly transform: S2Transform;
    // public readonly extents: S2Extents;
    // public readonly anchorPosition: S2Position;
    // public readonly ratio: S2Number;
    // public readonly polyCurve: S2PolyCurve;

    constructor() {
        super();
        this.fill = new S2FillData();
        this.stroke = new S2StrokeData();
        this.opacity = new S2Number(1, S2TypeState.Inactive);
        this.transform = new S2Transform();

        this.stroke.opacity.set(1, S2TypeState.Inactive);
        this.transform.state = S2TypeState.Inactive;
        this.fill.opacity.set(1, S2TypeState.Inactive);
    }
}

export class S2ArrowTip extends S2Element<S2ArrowTipData> {
    protected element: SVGPathElement;

    constructor(scene: S2BaseScene) {
        super(scene, new S2ArrowTipData());
        this.element = document.createElementNS(svgNS, 'path');
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    protected updateImpl(updateId?: number): void {
        void updateId;
        S2DataUtils.applyFill(this.data.fill, this.element, this.scene);
        S2DataUtils.applyStroke(this.data.stroke, this.element, this.scene);
        S2DataUtils.applyOpacity(this.data.opacity, this.element, this.scene);
        S2DataUtils.applyTransform(this.data.transform, this.element, this.scene);
    }
}
