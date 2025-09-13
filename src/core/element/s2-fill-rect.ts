import { S2BaseScene } from '../s2-interface';
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
            element.setAttribute('fill-opacity', this.opacity.toString());
        } else {
            element.removeAttribute('fill-opacity');
        }
    }
}

export class S2FillRect extends S2Element<S2FillRectData> {
    protected element: SVGRectElement;

    constructor(scene: S2BaseScene) {
        super(scene, new S2FillRectData());
        this.element = document.createElementNS(svgNS, 'rect');
    }

    get color(): S2Color {
        return this.data.color;
    }

    get opacity(): S2Number {
        return this.data.opacity;
    }

    setColor(color: S2Color): this {
        this.data.color.copy(color);
        return this;
    }

    setColorHex(color: string, state: S2TypeState = S2TypeState.Active): this {
        this.data.color.setFromHex(color, state);
        return this;
    }

    setColorRGB(r: number, g: number, b: number, state: S2TypeState = S2TypeState.Active): this {
        this.data.color.set(r, g, b, state);
        return this;
    }

    setOpacity(opacity: number, state: S2TypeState = S2TypeState.Active): this {
        this.data.opacity.set(opacity, state);
        return this;
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
        this.element.setAttribute('fill', data.color.toRgb());
        this.element.setAttribute('fill-opacity', data.opacity.toString());
    }
}
