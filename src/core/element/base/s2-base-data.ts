import { type S2LineCap, type S2LineJoin } from '../../s2-globals';
import { S2BaseScene } from '../../s2-base-scene';
import { S2Color, S2TypeState, S2Length, S2Number, S2Enum, S2String } from '../../s2-types';

export class S2LayerData {
    public readonly layer: S2Number;
    public isActive: boolean;

    constructor() {
        this.layer = new S2Number(0);
        this.isActive = true;
    }

    setParent(parent: S2LayerData | null = null): void {
        void parent;
    }

    applyToElement(element: SVGElement, scene: S2BaseScene): void {
        void element;
        void scene;
    }

    setLayer(layer: number, state: S2TypeState = S2TypeState.Active): this {
        this.layer.set(layer, state);
        return this;
    }
}

export class S2StrokeData {
    public readonly color: S2Color;
    public readonly width: S2Length;
    public readonly opacity: S2Number;
    public readonly lineCap: S2Enum<S2LineCap>;
    public readonly lineJoin: S2Enum<S2LineJoin>;

    constructor() {
        this.color = new S2Color(0, 0, 0, S2TypeState.Inactive);
        this.width = new S2Length(0, 'view');
        this.opacity = new S2Number(1, S2TypeState.Inactive);
        this.lineCap = new S2Enum<S2LineCap>('round', S2TypeState.Inactive);
        this.lineJoin = new S2Enum<S2LineJoin>('miter', S2TypeState.Inactive);
    }

    setParent(parent: S2StrokeData | null = null): void {
        this.color.setParent(parent ? parent.color : null);
        this.width.setParent(parent ? parent.width : null);
        this.opacity.setParent(parent ? parent.opacity : null);
        this.lineCap.setParent(parent ? parent.lineCap : null);
        this.lineJoin.setParent(parent ? parent.lineJoin : null);
    }

    copy(other: S2StrokeData): void {
        this.color.copy(other.color);
        this.width.copy(other.width);
        this.opacity.copy(other.opacity);
        this.lineCap.copy(other.lineCap);
        this.lineJoin.copy(other.lineJoin);
    }

    applyToElement(element: SVGElement, scene: S2BaseScene): void {
        if (this.opacity.state === S2TypeState.Inactive && this.color.state === S2TypeState.Inactive) return;

        if (this.width.state === S2TypeState.Active) {
            const width = this.width.toSpace('view', scene.getActiveCamera());
            element.setAttribute('stroke-width', width.toString());
        } else {
            element.removeAttribute('stroke-width');
        }

        if (this.color.state === S2TypeState.Active) {
            element.setAttribute('stroke', this.color.toRgb());
        } else {
            element.removeAttribute('stroke');
        }

        if (this.opacity.state === S2TypeState.Active && this.opacity.value <= 1) {
            element.setAttribute('stroke-opacity', this.opacity.toFixed());
        } else {
            element.removeAttribute('stroke-opacity');
        }

        if (this.lineCap.state === S2TypeState.Active) {
            element.setAttribute('stroke-linecap', this.lineCap.value);
        } else {
            element.removeAttribute('stroke-linecap');
        }

        if (this.lineJoin.state === S2TypeState.Active) {
            element.setAttribute('stroke-linejoin', this.lineJoin.value);
        } else {
            element.removeAttribute('stroke-linejoin');
        }
    }
}

export class S2FillData {
    public readonly color: S2Color;
    public readonly opacity: S2Number;

    constructor() {
        this.color = new S2Color(255, 255, 255, S2TypeState.Inactive);
        this.opacity = new S2Number(1, S2TypeState.Inactive);
    }

    setParent(parent: S2FillData | null = null): void {
        this.color.setParent(parent ? parent.color : null);
        this.opacity.setParent(parent ? parent.opacity : null);
    }

    copy(other: S2FillData): void {
        this.color.copy(other.color);
        this.opacity.copy(other.opacity);
    }

    applyToElement(element: SVGElement, scene: S2BaseScene): void {
        void scene;
        if (this.opacity.state === S2TypeState.Inactive && this.color.state === S2TypeState.Inactive) return;

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
}

export type S2FontStyle = 'normal' | 'italic' | 'oblique';

export class S2FontData {
    public readonly size: S2Length;
    public readonly weight: S2Number;
    public readonly relativeLineHeight: S2Number;
    public readonly relativeAscenderHeight: S2Number;
    public readonly family: S2String;
    public readonly style: S2Enum<S2FontStyle>;

    constructor() {
        this.family = new S2String('system-ui');
        this.size = new S2Length(16, 'view');
        this.weight = new S2Number(400);
        this.style = new S2Enum<S2FontStyle>('normal');
        this.relativeLineHeight = new S2Number(21 / 16);
        this.relativeAscenderHeight = new S2Number(16 / 16);
    }

    setParent(parent: S2FontData | null = null): void {
        this.size.setParent(parent ? parent.size : null);
        this.weight.setParent(parent ? parent.weight : null);
        this.relativeLineHeight.setParent(parent ? parent.relativeLineHeight : null);
        this.relativeAscenderHeight.setParent(parent ? parent.relativeAscenderHeight : null);
        this.family.setParent(parent ? parent.family : null);
        this.style.setParent(parent ? parent.style : null);
    }

    copy(other: S2FontData): void {
        this.size.copy(other.size);
        this.weight.copy(other.weight);
        this.relativeLineHeight.copy(other.relativeLineHeight);
        this.relativeAscenderHeight.copy(other.relativeAscenderHeight);
        this.family.copy(other.family);
        this.style.copy(other.style);
    }

    applyToElement(element: SVGElement, scene: S2BaseScene): void {
        if (this.size.state === S2TypeState.Active) {
            const size = this.size.toSpace('view', scene.getActiveCamera());
            element.setAttribute('font-size', size.toString());
        } else {
            element.removeAttribute('font-size');
        }

        if (this.weight.state === S2TypeState.Active) {
            element.setAttribute('font-weight', this.weight.toFixed(0));
        } else {
            element.removeAttribute('font-weight');
        }

        if (this.family.state === S2TypeState.Active) {
            element.setAttribute('font-family', this.family.toString());
        } else {
            element.removeAttribute('font-family');
        }

        if (this.style.state === S2TypeState.Active) {
            element.setAttribute('font-style', this.style.value);
        } else {
            element.removeAttribute('font-style');
        }
    }
}
