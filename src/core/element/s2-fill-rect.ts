import type { S2BaseScene } from '../scene/s2-base-scene';
import type { S2Dirtyable } from '../shared/s2-globals';
import { svgNS } from '../shared/s2-globals';
import { S2Element } from './base/s2-element';
import { S2ElementData } from './base/s2-base-data';
import { S2DataUtils } from './base/s2-data-utils';
import { S2Number } from '../shared/s2-number';
import { S2Color } from '../shared/s2-color';

export class S2FillRectData extends S2ElementData {
    public readonly color: S2Color;
    public readonly opacity: S2Number;

    constructor() {
        super();
        this.color = new S2Color();
        this.opacity = new S2Number(1);
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        super.setOwner(owner);
        this.opacity.setOwner(owner);
        this.color.setOwner(owner);
    }

    clearDirty(): void {
        super.clearDirty();
        this.opacity.clearDirty();
        this.color.clearDirty();
    }
}

export class S2FillRect extends S2Element<S2FillRectData> {
    protected element: SVGRectElement;

    constructor(scene: S2BaseScene) {
        super(scene, new S2FillRectData());
        this.element = document.createElementNS(svgNS, 'rect');
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    update(): void {
        if (this.skipUpdate()) return;

        const camera = this.scene.getActiveCamera();
        this.element.setAttribute('x', '0');
        this.element.setAttribute('y', '0');
        this.element.setAttribute('width', camera.viewportSize.x.toString());
        this.element.setAttribute('height', camera.viewportSize.y.toString());
        S2DataUtils.applyPointerEvents(this.data.pointerEvents, this.element, this.scene);
        S2DataUtils.applyColor(this.data.color, this.element, this.scene);
        S2DataUtils.applyOpacity(this.data.opacity, this.element, this.scene);

        this.clearDirty();
    }
}
