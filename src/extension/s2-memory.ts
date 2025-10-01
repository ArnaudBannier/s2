import { S2BaseData, S2ElementData, S2FillData, S2FontData, S2StrokeData } from '../core/element/base/s2-base-data';
import { S2Element } from '../core/element/base/s2-element';
import { S2Line } from '../core/element/s2-line';
import { S2Rect } from '../core/element/s2-rect';
import type { S2Vec2 } from '../core/math/s2-vec2';
import type { S2BaseScene } from '../core/s2-base-scene';
import { S2AnchorUtils, svgNS, type S2Anchor, type S2Dirtyable } from '../core/s2-globals';
import { S2Enum, S2Extents, S2Length, S2Number, S2Position, type S2Space } from '../core/s2-types';

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

export class S2Memory extends S2Element<S2MemoryData> {
    protected element: SVGGElement;
    protected addressCount: number;
    protected background: S2Rect;
    protected vSeparator: S2Line;
    protected hSeparators: S2Line[];

    constructor(scene: S2BaseScene, addressCount: number) {
        super(scene, new S2MemoryData());
        this.element = document.createElementNS(svgNS, 'g');
        this.addressCount = addressCount;
        this.element.dataset.role = 'memory';
        this.background = new S2Rect(scene);
        this.vSeparator = new S2Line(scene);
        this.vSeparator.setParent(this);
        this.hSeparators = [];
        for (let i = 0; i < this.addressCount; i++) {
            const hLine = new S2Line(scene);
            hLine.setParent(this);
            hLine.setIsActive(false);
            this.hSeparators.push(hLine);
        }
        this.updateBackground();
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    getExtents(space: S2Space): S2Vec2 {
        return this.data.extents.toSpace(space, this.scene.getActiveCamera());
    }

    getCenter(space: S2Space): S2Vec2 {
        return S2AnchorUtils.getCenter(
            this.data.anchor.get(),
            space,
            this.scene.getActiveCamera(),
            this.data.position,
            this.data.extents,
        );
    }

    protected updateBackground(): void {
        //const camera = this.scene.getActiveCamera();
        const space: S2Space = 'view';
        const center = this.getCenter(space);
        const extents = this.getExtents(space);

        this.background.data.stroke.copy(this.data.background.stroke);
        this.background.data.fill.copy(this.data.background.fill);
        this.background.data.opacity.copy(this.data.background.opacity);
        if (this.background instanceof S2Rect) {
            this.background.data.cornerRadius.copy(this.data.background.cornerRadius);
        }

        // Position background
        this.background.data.position.setV(center, space);
        this.background.data.extents.setV(extents, space);
        this.background.data.anchor.set('center');

        this.background.update();
    }

    protected updateSeparators(): void {
        const space: S2Space = 'view';
        const center = this.getCenter(space);
        const extents = this.getExtents(space);

        this.vSeparator.data.startPosition.set(center.x, center.y + extents.y, space);
        this.vSeparator.data.endPosition.set(center.x, center.y - extents.y, space);

        this.vSeparator.update();

        // for (const hLine of this.hSeparators) {
        //     hLine.data.position.setV(center, space);
        //     hLine.data.extents.setV(extents, space);
        //     hLine.data.anchor.set('center');

        //     hLine.update();
        // }
    }

    update(): void {
        if (this.skipUpdate()) return;

        this.updateBackground();
        this.updateSeparators();

        // S2DataUtils.applyFill(this.data.fill, this.element, this.scene);
        // S2DataUtils.applyStroke(this.data.stroke, this.element, this.scene);
        // S2DataUtils.applyOpacity(this.data.opacity, this.element, this.scene);
        // S2DataUtils.applyTransform(this.data.transform, this.element, this.scene);
        // S2DataUtils.applyPosition(this.data.position, this.element, this.scene, 'cx', 'cy');
        // S2DataUtils.applyRadius(this.data.radius, this.element, this.scene);

        this.clearDirty();
    }
}
