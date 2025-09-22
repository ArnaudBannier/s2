import type { S2Dirtyable, S2FontStyle, S2LineCap, S2LineJoin } from '../../s2-globals';
import { S2Color, S2TypePriority, S2Length, S2Number, S2Enum, S2String } from '../../s2-types';

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

    setLayer(layer: number): this {
        this.layer.set(layer);
        return this;
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        this.layer.setOwner(owner);
    }

    clearDirty(): void {
        this.layer.clearDirty();
    }
}

export class S2StrokeData implements S2Dirtyable {
    public readonly color: S2Color;
    public readonly width: S2Length;
    public readonly opacity: S2Number;
    public readonly lineCap: S2Enum<S2LineCap>;
    public readonly lineJoin: S2Enum<S2LineJoin>;
    private dirty: boolean;
    private owner: S2Dirtyable | null;

    constructor() {
        this.color = new S2Color(0, 0, 0, S2TypePriority.Normal);
        this.width = new S2Length(0, 'view');
        this.opacity = new S2Number(1, S2TypePriority.Normal);
        this.lineCap = new S2Enum<S2LineCap>('round', S2TypePriority.Normal);
        this.lineJoin = new S2Enum<S2LineJoin>('miter', S2TypePriority.Normal);

        this.dirty = true;
        this.owner = null;

        this.color.setOwner(this);
        this.width.setOwner(this);
        this.opacity.setOwner(this);
        this.lineCap.setOwner(this);
        this.lineJoin.setOwner(this);
    }

    isDirty(): boolean {
        return this.dirty;
    }

    markDirty(): void {
        if (this.isDirty()) return;
        this.dirty = true;
        this.owner?.markDirty();
    }

    copy(other: S2StrokeData): void {
        this.color.copy(other.color);
        this.width.copy(other.width);
        this.opacity.copy(other.opacity);
        this.lineCap.copy(other.lineCap);
        this.lineJoin.copy(other.lineJoin);
        this.dirty = other.dirty;
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        this.owner = owner;
    }

    clearDirty(): void {
        this.dirty = false;
        this.color.clearDirty();
        this.width.clearDirty();
        this.opacity.clearDirty();
        this.lineCap.clearDirty();
        this.lineJoin.clearDirty();
    }
}

export class S2FillData implements S2Dirtyable {
    public readonly color: S2Color;
    public readonly opacity: S2Number;
    private dirty: boolean;
    private owner: S2Dirtyable | null;

    constructor() {
        this.color = new S2Color(255, 255, 255, S2TypePriority.Normal);
        this.opacity = new S2Number(1, S2TypePriority.Normal);
        this.dirty = true;
        this.owner = null;

        this.color.setOwner(this);
        this.opacity.setOwner(this);
    }

    isDirty(): boolean {
        return this.dirty;
    }

    markDirty(): void {
        if (this.isDirty()) return;
        this.dirty = true;
        this.owner?.markDirty();
    }

    copy(other: S2FillData): void {
        this.color.copy(other.color);
        this.opacity.copy(other.opacity);
        this.dirty = other.dirty;
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        this.owner = owner;
    }

    clearDirty(): void {
        this.dirty = false;
        this.color.clearDirty();
        this.opacity.clearDirty();
    }
}

export class S2FontData implements S2Dirtyable {
    public readonly size: S2Length;
    public readonly weight: S2Number;
    public readonly relativeLineHeight: S2Number;
    public readonly relativeAscenderHeight: S2Number;
    public readonly family: S2String;
    public readonly style: S2Enum<S2FontStyle>;
    private dirty: boolean;
    private owner: S2Dirtyable | null;

    constructor() {
        this.family = new S2String('system-ui');
        this.size = new S2Length(16, 'view');
        this.weight = new S2Number(400);
        this.style = new S2Enum<S2FontStyle>('normal');
        this.relativeLineHeight = new S2Number(21 / 16);
        this.relativeAscenderHeight = new S2Number(16 / 16);
        this.dirty = true;
        this.owner = null;

        this.size.setOwner(this);
        this.weight.setOwner(this);
        this.relativeLineHeight.setOwner(this);
        this.relativeAscenderHeight.setOwner(this);
        this.family.setOwner(this);
        this.style.setOwner(this);
    }

    isDirty(): boolean {
        return this.dirty;
    }

    markDirty(): void {
        if (this.isDirty()) return;
        this.dirty = true;
        this.owner?.markDirty();
    }

    copy(other: S2FontData): void {
        this.size.copy(other.size);
        this.weight.copy(other.weight);
        this.relativeLineHeight.copy(other.relativeLineHeight);
        this.relativeAscenderHeight.copy(other.relativeAscenderHeight);
        this.family.copy(other.family);
        this.style.copy(other.style);
        this.dirty = other.dirty;
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        this.owner = owner;
    }

    clearDirty(): void {
        this.dirty = false;
        this.size.clearDirty();
        this.weight.clearDirty();
        this.relativeLineHeight.clearDirty();
        this.relativeAscenderHeight.clearDirty();
        this.family.clearDirty();
        this.style.clearDirty();
    }
}
