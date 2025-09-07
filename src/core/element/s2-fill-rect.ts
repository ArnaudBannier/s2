import { type S2BaseScene } from '../s2-interface';
import { svgNS } from '../s2-globals';
import { S2Element } from './s2-element';
import { S2Color, S2Number } from '../s2-types';
import { S2FillData, S2LayerData } from './s2-base-data';

export class S2FillRectData extends S2LayerData {
    public readonly fill: S2FillData;

    constructor() {
        super();
        this.fill = new S2FillData();
    }

    copy(other: S2FillRectData): void {
        super.copy(other);
        this.fill.copy(other.fill);
    }

    applyToElement(element: SVGElement, scene: S2BaseScene): void {
        super.applyToElement(element, scene);
        this.fill.applyToElement(element, scene);
    }
}

export class S2FillRect extends S2Element<S2FillRectData> {
    protected element: SVGRectElement;

    constructor(scene: S2BaseScene) {
        super(scene, new S2FillRectData());
        this.element = document.createElementNS(svgNS, 'rect');
    }

    get color(): S2Color {
        return this.data.fill.color;
    }

    get opacity(): S2Number {
        return this.data.fill.opacity;
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    protected updateImpl(updateId?: number): void {
        void updateId;
        const data = this.data;
        const camera = this.scene.getActiveCamera();
        this.element.setAttribute('x', '0');
        this.element.setAttribute('y', '0');
        this.element.setAttribute('width', camera.viewport.x.toString());
        this.element.setAttribute('height', camera.viewport.y.toString());
        this.element.setAttribute('fill', data.fill.color.toRgb());
        this.element.setAttribute('fill-opacity', data.fill.opacity.toString());
    }
}
