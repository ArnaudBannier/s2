import type { S2FontStyle, S2LineCap, S2LineJoin } from '../../s2-globals';
import { S2BaseScene } from '../../s2-base-scene';
import { S2Color, S2TypeState, S2Length, S2Number, S2Enum, S2String } from '../../s2-types';

export class S2BaseData {
    public readonly layer: S2Number;
    public isActive: boolean;

    constructor() {
        this.layer = new S2Number(0);
        this.isActive = true;
    }

    setParent(parent: S2BaseData | null = null): void {
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
}

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
}
