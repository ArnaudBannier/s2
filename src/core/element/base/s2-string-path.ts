import type { S2BaseScene } from '../../scene/s2-base-scene';
import { svgNS, type S2Dirtyable } from '../../shared/s2-globals';
import { S2Number } from '../../shared/s2-number';
import { S2String } from '../../shared/s2-string';
import { S2Transform } from '../../shared/s2-transform';
import { S2ElementData, S2FillData, S2StrokeData } from './s2-base-data';
import { S2DataUtils } from './s2-data-utils';
import { S2Element } from './s2-element';

export class S2StringPathData extends S2ElementData {
    public readonly fill: S2FillData;
    public readonly stroke: S2StrokeData;
    public readonly opacity: S2Number;
    public readonly transform: S2Transform;
    public readonly path: S2String;

    constructor(scene: S2BaseScene) {
        super();
        this.stroke = new S2StrokeData(scene);
        this.opacity = new S2Number(1);
        this.fill = new S2FillData();
        this.transform = new S2Transform();
        this.path = new S2String();
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        super.setOwner(owner);
        this.fill.setOwner(owner);
        this.stroke.setOwner(owner);
        this.opacity.setOwner(owner);
        this.transform.setOwner(owner);
        this.path.setOwner(owner);
    }

    clearDirty(): void {
        super.clearDirty();
        this.fill.clearDirty();
        this.stroke.clearDirty();
        this.opacity.clearDirty();
        this.transform.clearDirty();
        this.path.clearDirty();
    }
}

export class S2StringPath extends S2Element<S2StringPathData> {
    protected element: SVGPathElement;

    constructor(scene: S2BaseScene) {
        super(scene, new S2StringPathData(scene));
        this.element = document.createElementNS(svgNS, 'path');
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    update(): void {
        if (this.skipUpdate()) return;

        S2DataUtils.applyPointerEvents(this.data.pointerEvents, this.element, this.scene);
        S2DataUtils.applyFill(this.data.fill, this.element, this.scene);
        S2DataUtils.applyStroke(this.data.stroke, this.element, this.scene);
        S2DataUtils.applyOpacity(this.data.opacity, this.element, this.scene);
        S2DataUtils.applyTransform(this.data.transform, this.element, this.scene);

        const svgPath = this.data.path.get();
        this.element.setAttribute('d', svgPath.trim());

        this.clearDirty();
    }
}
