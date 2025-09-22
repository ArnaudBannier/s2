import { S2BaseScene } from '../s2-base-scene';
import { svgNS, type S2Dirtyable } from '../s2-globals';
import { S2Element } from './base/s2-element';
import { S2Color, S2Number } from '../s2-types';
import { S2BaseData } from './base/s2-base-data';
import { S2DataUtils } from './base/s2-data-utils';

export class S2FillRectData extends S2BaseData {
    public readonly color: S2Color;
    public readonly opacity: S2Number;

    constructor() {
        super();
        this.color = new S2Color();
        this.opacity = new S2Number(1);
    }

    setOwner(owner: S2Dirtyable | null = null): void {
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
        if (!this.isDirty()) return;
        if (!this.element.isConnected) return;

        const camera = this.scene.getActiveCamera();
        this.element.setAttribute('x', '0');
        this.element.setAttribute('y', '0');
        this.element.setAttribute('width', camera.viewport.x.toString());
        this.element.setAttribute('height', camera.viewport.y.toString());
        S2DataUtils.applyColor(this.data.color, this.element, this.scene);
        S2DataUtils.applyOpacity(this.data.opacity, this.element, this.scene);

        this.clearDirty();
    }
}
