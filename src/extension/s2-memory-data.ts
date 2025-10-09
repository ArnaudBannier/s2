import { S2BaseData, S2ElementData, S2FillData, S2FontData, S2StrokeData } from '../core/element/base/s2-base-data';
import { S2Enum } from '../core/shared/s2-enum';
import { S2Extents } from '../core/shared/s2-extents';
import { type S2Anchor, type S2Dirtyable } from '../core/shared/s2-globals';
import { S2Length } from '../core/shared/s2-length';
import { S2Number } from '../core/shared/s2-number';
import { S2Position } from '../core/shared/s2-position';

export class S2MemoryData extends S2ElementData {
    public readonly position: S2Position;
    public readonly anchor: S2Enum<S2Anchor>;
    public readonly extents: S2Extents;
    public readonly valueWidth: S2Length;
    public readonly background: S2MemoryBackgroundData;
    public readonly highlight: S2MemoryHighlightData;
    public readonly text: S2MemoryTextData;
    public readonly padding: S2Extents;

    constructor() {
        super();
        this.position = new S2Position(0, 0, 'world');
        this.anchor = new S2Enum<S2Anchor>('center');
        this.extents = new S2Extents(0, 0, 'view');
        this.valueWidth = new S2Length(2, 'world');
        this.background = new S2MemoryBackgroundData();
        this.highlight = new S2MemoryHighlightData();
        this.text = new S2MemoryTextData();
        this.padding = new S2Extents(15, 5, 'view');
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        super.setOwner(owner);
        this.position.setOwner(owner);
        this.anchor.setOwner(owner);
        this.extents.setOwner(owner);
        this.valueWidth.setOwner(owner);
        this.background.setOwner(owner);
        this.highlight.setOwner(owner);
        this.text.setOwner(owner);
        this.padding.setOwner(owner);
    }

    clearDirty(): void {
        super.clearDirty();
        this.position.clearDirty();
        this.anchor.clearDirty();
        this.extents.clearDirty();
        this.valueWidth.clearDirty();
        this.background.clearDirty();
        this.highlight.clearDirty();
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

export class S2MemoryHighlightData extends S2BaseData {
    public readonly cornerRadius: S2Length;
    public readonly padding: S2Extents;

    constructor() {
        super();
        this.cornerRadius = new S2Length(7, 'view');
        this.padding = new S2Extents(2, 2, 'view');
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        this.cornerRadius.setOwner(owner);
        this.padding.setOwner(owner);
    }

    clearDirty(): void {
        this.cornerRadius.clearDirty();
        this.padding.clearDirty();
    }
}

export class S2MemoryTextData extends S2BaseData {
    public readonly fill: S2FillData;
    public readonly addressFill: S2FillData;
    public readonly stroke: S2StrokeData;
    public readonly opacity: S2Number;
    public readonly font: S2FontData;

    constructor() {
        super();
        this.fill = new S2FillData();
        this.addressFill = new S2FillData();
        this.stroke = new S2StrokeData();
        this.opacity = new S2Number(1);
        this.font = new S2FontData();

        this.stroke.width.set(0, 'view');
        this.fill.opacity.set(1);
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        this.fill.setOwner(owner);
        this.addressFill.setOwner(owner);
        this.stroke.setOwner(owner);
        this.opacity.setOwner(owner);
        this.font.setOwner(owner);
    }

    clearDirty(): void {
        this.fill.clearDirty();
        this.addressFill.clearDirty();
        this.stroke.clearDirty();
        this.opacity.clearDirty();
        this.font.clearDirty();
    }
}
