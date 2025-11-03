import type { S2Dirtyable } from '../core/shared/s2-globals';
import type { S2BaseScene } from '../core/scene/s2-base-scene';
import { S2BaseData, S2ElementData, S2FillData, S2FontData, S2StrokeData } from '../core/element/base/s2-base-data';
import { S2Extents } from '../core/shared/s2-extents';
import { S2Length } from '../core/shared/s2-length';
import { S2Number } from '../core/shared/s2-number';
import { S2Point } from '../core/shared/s2-point';
import { S2Anchor } from '../core/shared/s2-anchor';

export class S2MemoryData extends S2ElementData {
    public readonly position: S2Point;
    public readonly anchor: S2Anchor;
    public readonly extents: S2Extents;
    public readonly valueWidth: S2Length;
    public readonly background: S2MemoryBackgroundData;
    public readonly highlight: S2MemoryHighlightData;
    public readonly text: S2MemoryTextData;
    public readonly padding: S2Extents;

    constructor(scene: S2BaseScene) {
        super();
        this.position = new S2Point(0, 0, scene.getWorldSpace());
        this.anchor = new S2Anchor(0, 0);
        this.extents = new S2Extents(0, 0, scene.getViewSpace());
        this.valueWidth = new S2Length(2, scene.getWorldSpace());
        this.background = new S2MemoryBackgroundData(scene);
        this.highlight = new S2MemoryHighlightData(scene);
        this.text = new S2MemoryTextData(scene);
        this.padding = new S2Extents(15, 5, scene.getViewSpace());
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

    constructor(scene: S2BaseScene) {
        super();
        this.fill = new S2FillData();
        this.stroke = new S2StrokeData(scene);
        this.opacity = new S2Number(1);
        this.cornerRadius = new S2Length(5, scene.getViewSpace());

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

    constructor(scene: S2BaseScene) {
        super();
        this.cornerRadius = new S2Length(7, scene.getViewSpace());
        this.padding = new S2Extents(2, 2, scene.getViewSpace());
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

    constructor(scene: S2BaseScene) {
        super();
        this.fill = new S2FillData();
        this.addressFill = new S2FillData();
        this.stroke = new S2StrokeData(scene);
        this.opacity = new S2Number(1);
        this.font = new S2FontData(scene);

        this.stroke.width.set(0, scene.getViewSpace());
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
