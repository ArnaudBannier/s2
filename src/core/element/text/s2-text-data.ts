import { type S2Dirtyable, type S2TextAnchor } from '../../shared/s2-globals';
import { S2Boolean, S2Enum, S2Extents, S2Number, S2Position, S2Transform } from '../../shared/s2-types';
import { S2ElementData, S2FillData, S2FontData, S2StrokeData } from '../base/s2-base-data';

export class S2TextData extends S2ElementData {
    public readonly fill: S2FillData;
    public readonly stroke: S2StrokeData;
    public readonly opacity: S2Number;
    public readonly transform: S2Transform;
    public readonly position: S2Position;
    public readonly localShift: S2Extents;
    public readonly font: S2FontData;
    public readonly textAnchor: S2Enum<S2TextAnchor>;
    public readonly preserveWhitespace: S2Boolean;

    constructor() {
        super();
        this.fill = new S2FillData();
        this.stroke = new S2StrokeData();
        this.opacity = new S2Number(1);
        this.transform = new S2Transform();
        this.position = new S2Position(0, 0, 'world');
        this.localShift = new S2Extents(0, 0, 'view');
        this.font = new S2FontData();
        this.textAnchor = new S2Enum<S2TextAnchor>('start');
        this.preserveWhitespace = new S2Boolean(false);

        this.stroke.width.set(0, 'view');
        this.fill.opacity.set(1);
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        this.fill.setOwner(owner);
        this.stroke.setOwner(owner);
        this.opacity.setOwner(owner);
        this.transform.setOwner(owner);
        this.position.setOwner(owner);
        this.localShift.setOwner(owner);
        this.font.setOwner(owner);
        this.textAnchor.setOwner(owner);
        this.preserveWhitespace.setOwner(owner);
    }

    clearDirty(): void {
        super.clearDirty();
        this.fill.clearDirty();
        this.stroke.clearDirty();
        this.opacity.clearDirty();
        this.transform.clearDirty();
        this.position.clearDirty();
        this.localShift.clearDirty();
        this.font.clearDirty();
        this.textAnchor.clearDirty();
        this.preserveWhitespace.clearDirty();
    }
}
