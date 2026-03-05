import type { S2BaseScene } from '../../src/core/scene/s2-base-scene';
import { svgNS, type S2Dirtyable } from '../../src/core/shared/s2-globals';
import {
    S2BaseData,
    S2ElementData,
    S2FillData,
    S2FontData,
    S2StrokeData,
} from '../../src/core/element/base/s2-base-data';
import { S2Anchor } from '../../src/core/shared/s2-anchor';
import { S2Extents } from '../../src/core/shared/s2-extents';
import { S2Point } from '../../src/core/shared/s2-point';
import { S2Number } from '../../src/core/shared/s2-number';
import { S2Length } from '../../src/core/shared/s2-length';
import { S2Element } from '../../src/core/element/base/s2-element';

export class S2VarPanelData extends S2ElementData {
    public readonly position: S2Point;
    public readonly minExtents: S2Extents;
    public readonly padding: S2Extents;
    public readonly anchor: S2Anchor;
    public readonly text: S2VarPanelTextData;
    public readonly background: S2VarPanelBackgroundData;

    constructor(scene: S2BaseScene) {
        super();
        this.position = new S2Point(0, 0, scene.getWorldSpace());
        this.anchor = new S2Anchor(0, 0);
        this.minExtents = new S2Extents(0, 0, scene.getViewSpace());
        this.padding = new S2Extents(10, 5, scene.getViewSpace());
        this.background = new S2VarPanelBackgroundData(scene);
        this.text = new S2VarPanelTextData(scene);
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        super.setOwner(owner);
        this.position.setOwner(owner);
        this.minExtents.setOwner(owner);
        this.anchor.setOwner(owner);
        this.padding.setOwner(owner);
        this.background.setOwner(owner);
        this.text.setOwner(owner);
    }

    clearDirty(): void {
        super.clearDirty();
        this.position.clearDirty();
        this.minExtents.clearDirty();
        this.anchor.clearDirty();
        this.padding.clearDirty();
        this.background.clearDirty();
        this.text.clearDirty();
    }
}

export class S2VarPanelTextData extends S2BaseData {
    public readonly fill: S2FillData;
    public readonly stroke: S2StrokeData;
    public readonly opacity: S2Number;

    public readonly font: S2FontData;
    public readonly verticalAlign: S2Number;

    constructor(scene: S2BaseScene) {
        super();
        this.fill = new S2FillData();
        this.stroke = new S2StrokeData(scene);
        this.opacity = new S2Number(1);
        this.font = new S2FontData(scene);
        this.verticalAlign = new S2Number(0);

        this.stroke.width.set(0, scene.getViewSpace());
        this.fill.opacity.set(1);
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        this.fill.setOwner(owner);
        this.stroke.setOwner(owner);
        this.opacity.setOwner(owner);
        this.font.setOwner(owner);
        this.verticalAlign.setOwner(owner);
    }

    clearDirty(): void {
        this.fill.clearDirty();
        this.stroke.clearDirty();
        this.opacity.clearDirty();
        this.font.clearDirty();
        this.verticalAlign.clearDirty();
    }
}

export class S2VarPanelBackgroundData extends S2BaseData {
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

export class S2VarData extends S2ElementData {
    public readonly fill: S2FillData;

    constructor(scene: S2BaseScene) {
        void scene;
        super();
        this.fill = new S2FillData();
        this.fill.opacity.set(1);
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        this.fill.setOwner(owner);
    }

    clearDirty(): void {
        this.fill.clearDirty();
    }
}

export class S2VarElement extends S2Element<S2VarData> {
    protected readonly element: SVGGElement;

    constructor(scene: S2BaseScene) {
        super(scene, new S2VarData(scene));
        this.element = document.createElementNS(svgNS, 'g');
        this.element.dataset.role = 'varible';
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    update(): void {
        if (this.skipUpdate()) return;

        //const viewSpace = this.scene.getViewSpace();
        this.updateSVGChildren();

        this.clearDirty();
    }
}
