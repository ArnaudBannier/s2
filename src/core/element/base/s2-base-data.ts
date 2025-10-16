import type { S2Dirtyable, S2FontStyle, S2LineCap, S2LineJoin, S2PointerEvents } from '../../shared/s2-globals';
import { S2Boolean } from '../../shared/s2-boolean';
import { S2Color } from '../../shared/s2-color';
import { S2Enum } from '../../shared/s2-enum';
import { S2Length } from '../../shared/s2-length';
import { S2Number } from '../../shared/s2-number';
import { S2String } from '../../shared/s2-string';

export abstract class S2BaseData {
    abstract setOwner(owner: S2Dirtyable | null): void;
    abstract clearDirty(): void;
}

export class S2ElementData extends S2BaseData {
    public readonly layer: S2Number = new S2Number(0);
    public readonly isEnabled: S2Boolean = new S2Boolean(true);
    public readonly pointerEvents: S2Enum<S2PointerEvents> = new S2Enum<S2PointerEvents>('none');

    setOwner(owner: S2Dirtyable | null = null): void {
        this.layer.setOwner(owner);
        this.isEnabled.setOwner(owner);
        this.pointerEvents.setOwner(owner);
    }

    clearDirty(): void {
        this.layer.clearDirty();
        this.isEnabled.clearDirty();
        this.pointerEvents.clearDirty();
    }
}

export class S2StrokeData extends S2BaseData implements S2Dirtyable {
    public readonly color: S2Color;
    public readonly width: S2Length;
    public readonly opacity: S2Number;
    public readonly lineCap: S2Enum<S2LineCap>;
    public readonly lineJoin: S2Enum<S2LineJoin>;

    private dirty: boolean;
    private owner: S2Dirtyable | null;

    constructor() {
        super();
        this.color = new S2Color(0, 0, 0);
        this.width = new S2Length(0, 'view');
        this.opacity = new S2Number(1);
        this.lineCap = new S2Enum<S2LineCap>('round');
        this.lineJoin = new S2Enum<S2LineJoin>('miter');

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
    }

    copyIfUnlocked(other: S2StrokeData): void {
        this.color.copyIfUnlocked(other.color);
        this.width.copyIfUnlocked(other.width);
        this.opacity.copyIfUnlocked(other.opacity);
        this.lineCap.copyIfUnlocked(other.lineCap);
        this.lineJoin.copyIfUnlocked(other.lineJoin);
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

export class S2FillData extends S2BaseData implements S2Dirtyable {
    public readonly color: S2Color;
    public readonly opacity: S2Number;

    private dirty: boolean;
    private owner: S2Dirtyable | null;

    constructor() {
        super();
        this.color = new S2Color(255, 255, 255);
        this.opacity = new S2Number(1);
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
    }

    copyIfUnlocked(other: S2FillData): void {
        this.color.copyIfUnlocked(other.color);
        this.opacity.copyIfUnlocked(other.opacity);
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

export class S2FontData extends S2BaseData implements S2Dirtyable {
    public readonly size: S2Length;
    public readonly weight: S2Number;
    public readonly relativeLineHeight: S2Number;
    public readonly relativeAscenderHeight: S2Number;
    public readonly family: S2String;
    public readonly style: S2Enum<S2FontStyle>;

    private dirty: boolean;
    private owner: S2Dirtyable | null;

    constructor() {
        super();
        this.size = new S2Length(16, 'view');
        this.weight = new S2Number(400);
        this.relativeLineHeight = new S2Number(21 / 16);
        this.relativeAscenderHeight = new S2Number(16 / 16);
        this.family = new S2String('system-ui');
        this.style = new S2Enum<S2FontStyle>('normal');
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
    }

    copyIfUnlocked(other: S2FontData): void {
        this.size.copyIfUnlocked(other.size);
        this.weight.copyIfUnlocked(other.weight);
        this.relativeLineHeight.copyIfUnlocked(other.relativeLineHeight);
        this.relativeAscenderHeight.copyIfUnlocked(other.relativeAscenderHeight);
        this.family.copyIfUnlocked(other.family);
        this.style.copyIfUnlocked(other.style);
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
