import { S2BaseScene } from '../s2-base-scene';
import { svgNS, type S2Dirtyable } from '../s2-globals';
import { S2Number, S2Position, S2Transform, S2TypePriority } from '../s2-types';
import { S2Element } from './base/s2-element';
import { S2ElementData, S2StrokeData } from './base/s2-base-data';
import { S2DataUtils } from './base/s2-data-utils';

export class S2LineData extends S2ElementData {
    public readonly stroke: S2StrokeData;
    public readonly opacity: S2Number;
    public readonly transform: S2Transform;
    public readonly startPosition: S2Position;
    public readonly endPosition: S2Position;

    constructor() {
        super();
        this.stroke = new S2StrokeData();
        this.opacity = new S2Number(1, S2TypePriority.Normal);
        this.transform = new S2Transform();
        this.startPosition = new S2Position();
        this.endPosition = new S2Position();
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        this.stroke.setOwner(owner);
        this.opacity.setOwner(owner);
        this.transform.setOwner(owner);
        this.startPosition.setOwner(owner);
        this.endPosition.setOwner(owner);
    }

    clearDirty(): void {
        super.clearDirty();
        this.stroke.clearDirty();
        this.opacity.clearDirty();
        this.transform.clearDirty();
        this.startPosition.clearDirty();
        this.endPosition.clearDirty();
    }
}

export class S2Line extends S2Element<S2LineData> {
    protected element: SVGLineElement;

    constructor(scene: S2BaseScene) {
        super(scene, new S2LineData());
        this.element = document.createElementNS(svgNS, 'line');
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    update(): void {
        if (this.skipUpdate()) return;

        S2DataUtils.applyStroke(this.data.stroke, this.element, this.scene);
        S2DataUtils.applyOpacity(this.data.opacity, this.element, this.scene);
        S2DataUtils.applyTransform(this.data.transform, this.element, this.scene);
        S2DataUtils.applyPosition(this.data.startPosition, this.element, this.scene, 'x1', 'y1');
        S2DataUtils.applyPosition(this.data.endPosition, this.element, this.scene, 'x2', 'y2');

        this.clearDirty();
    }
}
