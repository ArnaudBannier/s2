import type { S2BaseScene } from '../../scene/s2-base-scene';
import type { S2Dirtyable } from '../../shared/s2-globals';
import { S2Enum } from '../../shared/s2-enum';
import { S2Extents } from '../../shared/s2-extents';
import { S2Length } from '../../shared/s2-length';
import { S2Number } from '../../shared/s2-number';
import { S2Point } from '../../shared/s2-point';
import { S2Transform } from '../../shared/s2-transform';
import { S2FontData, S2ElementData, S2FillData, S2StrokeData, S2BaseData } from '../base/s2-base-data';
import { S2Anchor } from '../../shared/s2-anchor';
import { S2SpaceRef } from '../../shared/s2-space-ref';

export type S2NodeShape = 'none' | 'rectangle' | 'circle';

export class S2NodeData extends S2ElementData {
    public readonly space: S2SpaceRef;
    public readonly position: S2Point;
    public readonly minExtents: S2Extents;
    public readonly anchor: S2Anchor;
    public readonly background: S2NodeBackgroundData;
    public readonly text: S2NodeTextData;
    public readonly padding: S2Extents;

    constructor(scene: S2BaseScene) {
        super();
        this.space = new S2SpaceRef(scene.getWorldSpace());
        this.position = new S2Point(0, 0, scene.getWorldSpace());
        this.anchor = new S2Anchor(0, 0);
        this.minExtents = new S2Extents(0, 0, scene.getViewSpace());
        this.background = new S2NodeBackgroundData(scene);
        this.text = new S2NodeTextData(scene);
        this.padding = new S2Extents(10, 5, scene.getViewSpace());
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        super.setOwner(owner);
        this.space.setOwner(owner);
        this.position.setOwner(owner);
        this.minExtents.setOwner(owner);
        this.anchor.setOwner(owner);
        this.background.setOwner(owner);
        this.text.setOwner(owner);
        this.padding.setOwner(owner);
    }

    clearDirty(): void {
        super.clearDirty();
        this.space.clearDirty();
        this.position.clearDirty();
        this.minExtents.clearDirty();
        this.anchor.clearDirty();
        this.background.clearDirty();
        this.text.clearDirty();
        this.padding.clearDirty();
    }
}

export class S2NodeBackgroundData extends S2BaseData {
    public readonly fill: S2FillData;
    public readonly stroke: S2StrokeData;
    public readonly opacity: S2Number;
    public readonly transform: S2Transform;
    public readonly cornerRadius: S2Length;
    public readonly shape: S2Enum<S2NodeShape>;

    constructor(scene: S2BaseScene) {
        super();
        this.fill = new S2FillData();
        this.stroke = new S2StrokeData(scene);
        this.opacity = new S2Number(1);
        this.transform = new S2Transform();
        this.cornerRadius = new S2Length(5, scene.getViewSpace());
        this.shape = new S2Enum<S2NodeShape>('rectangle');

        this.stroke.opacity.set(1);
        this.fill.opacity.set(1);
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        this.fill.setOwner(owner);
        this.stroke.setOwner(owner);
        this.opacity.setOwner(owner);
        this.transform.setOwner(owner);
        this.cornerRadius.setOwner(owner);
        this.shape.setOwner(owner);
    }

    clearDirty(): void {
        this.fill.clearDirty();
        this.stroke.clearDirty();
        this.opacity.clearDirty();
        this.transform.clearDirty();
        this.cornerRadius.clearDirty();
        this.shape.clearDirty();
    }
}

export class S2NodeTextData extends S2BaseData {
    public readonly fill: S2FillData;
    public readonly stroke: S2StrokeData;
    public readonly opacity: S2Number;
    public readonly transform: S2Transform;

    public readonly font: S2FontData;
    public readonly horizontalAlign: S2Number;
    public readonly verticalAlign: S2Number;

    constructor(scene: S2BaseScene) {
        super();
        this.fill = new S2FillData();
        this.stroke = new S2StrokeData(scene);
        this.opacity = new S2Number(1);
        this.transform = new S2Transform();
        this.font = new S2FontData(scene);
        this.horizontalAlign = new S2Number(0);
        this.verticalAlign = new S2Number(0);

        this.stroke.width.set(0, scene.getViewSpace());
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
        this.fill.clearDirty();
        this.stroke.clearDirty();
        this.opacity.clearDirty();
        this.transform.clearDirty();
        this.font.clearDirty();
        this.horizontalAlign.clearDirty();
        this.verticalAlign.clearDirty();
    }
}
