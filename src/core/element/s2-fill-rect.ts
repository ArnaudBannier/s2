import { S2BaseScene } from '../s2-base-scene';
import { svgNS } from '../s2-globals';
import { S2Element } from './base/s2-element';
import { S2Color, S2Number, S2TypeState } from '../s2-types';
import { S2LayerData } from './base/s2-base-data';

export class S2FillRectData extends S2LayerData {
    public readonly color: S2Color;
    public readonly opacity: S2Number;

    constructor() {
        super();
        this.color = new S2Color();
        this.opacity = new S2Number(1);
    }

    applyToElement(element: SVGElement, scene: S2BaseScene): void {
        void scene;
        if (this.color.state === S2TypeState.Active) {
            element.setAttribute('fill', this.color.toRgb());
        } else {
            element.removeAttribute('fill');
        }

        if (this.opacity.state === S2TypeState.Active && this.opacity.value <= 1) {
            element.setAttribute('fill-opacity', this.opacity.toFixed());
        } else {
            element.removeAttribute('fill-opacity');
        }
    }

    setColor(color: S2Color): this {
        this.color.copy(color);
        return this;
    }

    setColorHex(color: string, state: S2TypeState = S2TypeState.Active): this {
        this.color.setFromHex(color, state);
        return this;
    }

    setColorRGB(r: number, g: number, b: number, state: S2TypeState = S2TypeState.Active): this {
        this.color.set(r, g, b, state);
        return this;
    }

    setOpacity(opacity: number, state: S2TypeState = S2TypeState.Active): this {
        this.opacity.set(opacity, state);
        return this;
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

    protected updateImpl(updateId?: number): void {
        void updateId;
        const camera = this.scene.getActiveCamera();
        this.element.setAttribute('x', '0');
        this.element.setAttribute('y', '0');
        this.element.setAttribute('width', camera.viewport.x.toString());
        this.element.setAttribute('height', camera.viewport.y.toString());
        this.data.applyToElement(this.element, this.scene);
    }
}
