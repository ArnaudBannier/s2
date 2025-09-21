import type { S2Dirtyable, S2FontStyle, S2LineCap, S2LineJoin } from '../../s2-globals';
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

    setOwner(owner: S2Dirtyable | null = null): void {
        void owner;
    }

    resetDirtyFlags(): void {
        this.layer.resetDirtyFlags();
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

    copy(other: S2StrokeData): void {
        this.color.copy(other.color);
        this.width.copy(other.width);
        this.opacity.copy(other.opacity);
        this.lineCap.copy(other.lineCap);
        this.lineJoin.copy(other.lineJoin);
    }

    resetDirtyFlags(): void {
        this.color.dirty = false;
        this.width.dirty = false;
        this.opacity.dirty = false;
        this.lineCap.dirty = false;
        this.lineJoin.dirty = false;
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        this.color.setOwner(owner);
        this.width.setOwner(owner);
        this.opacity.setOwner(owner);
        this.lineCap.setOwner(owner);
        this.lineJoin.setOwner(owner);
    }
}

export class S2FillData {
    public readonly color: S2Color;
    public readonly opacity: S2Number;

    constructor() {
        this.color = new S2Color(255, 255, 255, S2TypeState.Inactive);
        this.opacity = new S2Number(1, S2TypeState.Inactive);
    }

    copy(other: S2FillData): void {
        this.color.copy(other.color);
        this.opacity.copy(other.opacity);
    }

    resetDirtyFlags(): void {
        this.color.dirty = false;
        this.opacity.dirty = false;
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        this.color.setOwner(owner);
        this.opacity.setOwner(owner);
    }
}

export class S2FontData {
    public readonly size: S2Length;
    public readonly weight: S2Number;
    public readonly relativeLineHeight: S2Number;
    public readonly relativeAscenderHeight: S2Number;
    public readonly family: S2String;
    public readonly style: S2Enum<S2FontStyle>;
    public dirty: boolean;

    constructor() {
        this.family = new S2String('system-ui');
        this.size = new S2Length(16, 'view');
        this.weight = new S2Number(400);
        this.style = new S2Enum<S2FontStyle>('normal');
        this.relativeLineHeight = new S2Number(21 / 16);
        this.relativeAscenderHeight = new S2Number(16 / 16);
        this.dirty = true;
    }

    copy(other: S2FontData): void {
        this.size.copy(other.size);
        this.weight.copy(other.weight);
        this.relativeLineHeight.copy(other.relativeLineHeight);
        this.relativeAscenderHeight.copy(other.relativeAscenderHeight);
        this.family.copy(other.family);
        this.style.copy(other.style);
    }

    resetDirtyFlags(): void {
        this.size.dirty = false;
        this.weight.dirty = false;
        this.relativeLineHeight.dirty = false;
        this.relativeAscenderHeight.dirty = false;
        this.family.dirty = false;
        this.style.dirty = false;
        this.dirty = false;
    }
}
