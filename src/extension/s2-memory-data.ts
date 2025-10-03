import { S2BaseData, S2ElementData, S2FillData, S2FontData, S2StrokeData } from '../core/element/base/s2-base-data';
import { type S2Anchor, type S2Dirtyable } from '../core/shared/s2-globals';
import { S2Enum, S2Extents, S2Length, S2Number, S2Position } from '../core/shared/s2-types';

export class S2MemoryData extends S2ElementData {
    public readonly position: S2Position;
    public readonly anchor: S2Enum<S2Anchor>;
    public readonly background: S2MemoryBackgroundData;
    public readonly text: S2MemoryTextData;
    public readonly padding: S2Extents;
    public readonly extents: S2Extents;

    constructor() {
        super();
        this.position = new S2Position(0, 0, 'world');
        this.anchor = new S2Enum<S2Anchor>('center');
        this.extents = new S2Extents(0, 0, 'view');
        this.background = new S2MemoryBackgroundData();
        this.text = new S2MemoryTextData();
        this.padding = new S2Extents(10, 5, 'view');
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        super.setOwner(owner);
        this.position.setOwner(owner);
        this.anchor.setOwner(owner);
        this.extents.setOwner(owner);
        this.background.setOwner(owner);
        this.text.setOwner(owner);
        this.padding.setOwner(owner);
    }

    clearDirty(): void {
        super.clearDirty();
        this.position.clearDirty();
        this.anchor.clearDirty();
        this.extents.clearDirty();
        this.background.clearDirty();
        this.text.clearDirty();
        this.padding.clearDirty();
    }
}

export class S2MemoryBackgroundData extends S2BaseData {
    public readonly fill: S2FillData;
    public readonly stroke: S2StrokeData;
    public readonly opacity: S2Number;
    public readonly cornerRadius: S2Length;

    constructor() {
        super();
        this.fill = new S2FillData();
        this.stroke = new S2StrokeData();
        this.opacity = new S2Number(1);
        this.cornerRadius = new S2Length(5, 'view');

        this.stroke.opacity.set(1);
        this.fill.opacity.set(1);
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        this.fill.setOwner(owner);
        this.stroke.setOwner(owner);
        this.opacity.setOwner(owner);
        this.cornerRadius.setOwner(owner);
    }

    clearDirty(): void {
        this.fill.clearDirty();
        this.stroke.clearDirty();
        this.opacity.clearDirty();
        this.cornerRadius.clearDirty();
    }
}

export class S2MemoryTextData extends S2BaseData {
    public readonly fill: S2FillData;
    public readonly stroke: S2StrokeData;
    public readonly opacity: S2Number;
    public readonly font: S2FontData;

    constructor() {
        super();
        this.fill = new S2FillData();
        this.stroke = new S2StrokeData();
        this.opacity = new S2Number(1);
        this.font = new S2FontData();

        this.stroke.width.set(0, 'view');
        this.fill.opacity.set(1);
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        this.fill.setOwner(owner);
        this.stroke.setOwner(owner);
        this.opacity.setOwner(owner);
        this.font.setOwner(owner);
    }

    clearDirty(): void {
        this.fill.clearDirty();
        this.stroke.clearDirty();
        this.opacity.clearDirty();
        this.font.clearDirty();
    }
}
