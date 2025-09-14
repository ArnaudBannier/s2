import { S2BaseScene } from '../../s2-base-scene';
import { S2Color, S2TypeState, S2Number } from '../../s2-types';
import { S2FillData } from './s2-base-data';
import { S2StrokeElementData } from './s2-stroke-element';

export class S2FillStrokeElementData extends S2StrokeElementData {
    public readonly fill: S2FillData;

    constructor() {
        super();
        this.fill = new S2FillData();
        this.fill.opacity.set(1, S2TypeState.Inactive);
    }

    setParent(parent: S2FillStrokeElementData | null = null): void {
        super.setParent(parent);
        this.fill.setParent(parent ? parent.fill : null);
    }

    applyToElement(element: SVGElement, scene: S2BaseScene): void {
        super.applyToElement(element, scene);
        this.fill.applyToElement(element, scene);
    }

    get fillColor(): S2Color {
        return this.fill.color;
    }

    get fillOpacity(): S2Number {
        return this.fill.opacity;
    }

    setFillColor(color: S2Color): this {
        this.fill.color.copy(color);
        return this;
    }

    setFillColorRGB(r: number, g: number, b: number, state: S2TypeState = S2TypeState.Active): this {
        this.fill.color.set(r, g, b, state);
        return this;
    }

    setFillColorHex(hex: string, state: S2TypeState = S2TypeState.Active): this {
        this.fill.color.setFromHex(hex, state);
        return this;
    }

    setFillOpacity(opacity: number, state: S2TypeState = S2TypeState.Active): this {
        this.fill.opacity.set(opacity, state);
        return this;
    }
}

// export abstract class S2FillStrokeElement<Data extends S2FillStrokeElementData> extends S2StrokeElement<Data> {
//     constructor(scene: S2BaseScene, data: Data) {
//         super(scene, data);
//     }

//     get fillColor(): S2Color {
//         return this.data.fill.color;
//     }

//     get fillOpacity(): S2Number {
//         return this.data.fill.opacity;
//     }

//     setFillColor(color: S2Color): this {
//         this.data.fill.color.copy(color);
//         return this;
//     }

//     setFillColorRGB(r: number, g: number, b: number, state: S2TypeState = S2TypeState.Active): this {
//         this.data.fill.color.set(r, g, b, state);
//         return this;
//     }

//     setFillColorHex(hex: string, state: S2TypeState = S2TypeState.Active): this {
//         this.data.fill.color.setFromHex(hex, state);
//         return this;
//     }

//     setFillOpacity(opacity: number, state: S2TypeState = S2TypeState.Active): this {
//         this.data.fill.opacity.set(opacity, state);
//         return this;
//     }
// }
