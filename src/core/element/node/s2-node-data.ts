import type { S2Anchor, S2Dirtyable, S2HorizontalAlign, S2VerticalAlign } from '../../s2-globals';
import { S2Enum, S2Extents, S2Length, S2Number, S2Position, S2Transform } from '../../s2-types';
import { S2FontData, S2ElementData, S2FillData, S2StrokeData } from '../base/s2-base-data';

export class S2NodeData extends S2ElementData {
    public readonly position: S2Position;
    public readonly anchor: S2Enum<S2Anchor>;
    public readonly background: S2NodeBackgroundData;
    public readonly text: S2NodeTextData;
    public readonly padding: S2Extents;
    public readonly minExtents: S2Extents;

    constructor() {
        super();
        this.position = new S2Position(0, 0, 'world');
        this.anchor = new S2Enum<S2Anchor>('center');
        this.minExtents = new S2Extents(0, 0, 'view');
        this.background = new S2NodeBackgroundData();
        this.text = new S2NodeTextData();
        this.padding = new S2Extents(10, 5, 'view');
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        this.position.setOwner(owner);
        this.anchor.setOwner(owner);
        this.minExtents.setOwner(owner);
        this.background.setOwner(owner);
        this.text.setOwner(owner);
        this.padding.setOwner(owner);
    }

    clearDirty(): void {
        super.clearDirty();
        this.position.clearDirty();
        this.anchor.clearDirty();
        this.minExtents.clearDirty();
        this.background.clearDirty();
        this.text.clearDirty();
        this.padding.clearDirty();
    }
}

export class S2NodeBackgroundData extends S2ElementData {
    public readonly fill: S2FillData;
    public readonly stroke: S2StrokeData;
    public readonly opacity: S2Number;
    public readonly transform: S2Transform;
    public readonly cornerRadius: S2Length;

    constructor() {
        super();
        this.fill = new S2FillData();
        this.stroke = new S2StrokeData();
        this.opacity = new S2Number(1);
        this.transform = new S2Transform();
        this.cornerRadius = new S2Length(5, 'view');

        this.stroke.opacity.set(1);
        this.fill.opacity.set(1);
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        this.fill.setOwner(owner);
        this.stroke.setOwner(owner);
        this.opacity.setOwner(owner);
        this.transform.setOwner(owner);
        this.cornerRadius.setOwner(owner);
    }

    clearDirty(): void {
        super.clearDirty();
        this.fill.clearDirty();
        this.stroke.clearDirty();
        this.opacity.clearDirty();
        this.transform.clearDirty();
        this.cornerRadius.clearDirty();
    }
}

export class S2NodeTextData extends S2ElementData {
    public readonly fill: S2FillData;
    public readonly stroke: S2StrokeData;
    public readonly opacity: S2Number;
    public readonly transform: S2Transform;

    public readonly font: S2FontData;
    public readonly horizontalAlign: S2Enum<S2HorizontalAlign>;
    public readonly verticalAlign: S2Enum<S2VerticalAlign>;

    constructor() {
        super();
        this.fill = new S2FillData();
        this.stroke = new S2StrokeData();
        this.opacity = new S2Number(1);
        this.transform = new S2Transform();
        this.font = new S2FontData();
        this.horizontalAlign = new S2Enum<S2HorizontalAlign>('center');
        this.verticalAlign = new S2Enum<S2VerticalAlign>('middle');

        this.stroke.width.set(0, 'view');
        this.fill.opacity.set(1);
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        this.fill.setOwner(owner);
        this.stroke.setOwner(owner);
        this.opacity.setOwner(owner);
        this.transform.setOwner(owner);
        this.font.setOwner(owner);
        this.horizontalAlign.setOwner(owner);
        this.verticalAlign.setOwner(owner);
    }

    clearDirty(): void {
        super.clearDirty();
        this.fill.clearDirty();
        this.stroke.clearDirty();
        this.opacity.clearDirty();
        this.transform.clearDirty();
        this.font.clearDirty();
        this.horizontalAlign.clearDirty();
        this.verticalAlign.clearDirty();
    }
}
