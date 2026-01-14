import type { S2BaseScene } from '../../scene/s2-base-scene';
import type { S2Dirtyable } from '../../shared/s2-globals';
import type { S2Space } from '../../math/s2-space';
import { S2Vec2 } from '../../math/s2-vec2';
import { svgNS } from '../../shared/s2-globals';
import { S2DataUtils } from '../base/s2-data-utils';
import { S2Number } from '../../shared/s2-number';
import { S2Length } from '../../shared/s2-length';
import { S2Draggable, S2DraggableData } from './s2-draggable';
import { S2Extents } from '../../shared/s2-extents';
import { S2Anchor } from '../../shared/s2-anchor';
import { S2Point } from '../../shared/s2-point';

//export type S2HandleEventListener = (handle: S2DraggableCircle, event: PointerEvent) => void;

export class S2DraggableRectData extends S2DraggableData {
    public readonly extents: S2Extents;
    public readonly anchor: S2Anchor;
    public readonly cornerRadius: S2Length;

    constructor(scene: S2BaseScene) {
        super(scene);
        this.extents = new S2Extents(1, 1, scene.getWorldSpace());
        this.anchor = new S2Anchor(0, 0);
        this.cornerRadius = new S2Length(0, scene.getWorldSpace());
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        super.setOwner(owner);
        this.extents.setOwner(owner);
        this.anchor.setOwner(owner);
        this.cornerRadius.setOwner(owner);
    }

    clearDirty(): void {
        super.clearDirty();
        this.extents.clearDirty();
        this.anchor.clearDirty();
        this.cornerRadius.clearDirty();
    }
}

export class S2DraggableRect extends S2Draggable<S2DraggableRectData> {
    protected element: SVGRectElement;
    protected opacity: S2Number;
    protected readonly svgPosition: S2Point;

    constructor(scene: S2BaseScene) {
        super(scene, new S2DraggableRectData(scene));
        this.element = document.createElementNS(svgNS, 'rect');
        this.opacity = new S2Number(0.5);
        this.svgPosition = new S2Point(0, 0, scene.getViewSpace());

        this.initSVGElement(this.element);
    }

    // getRadius(space: S2Space): number {
    //     return this.data.radius.get(space);
    // }

    getCenter(space: S2Space): S2Vec2 {
        return this.data.position.get(space);
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    update(): void {
        if (this.skipUpdate()) return;

        this.updateSnapMode();
        this.updateTargets();
        S2DataUtils.applyPointerEvents(this.data.pointerEvents, this.element, this.scene);
        S2DataUtils.applyOpacity(this.opacity, this.element, this.scene);
        S2DataUtils.applyExtents(this.data.extents, this.element, this.scene);
        S2DataUtils.applyCornerRadius(this.data.cornerRadius, this.element, this.scene);

        const viewSpace = this.scene.getViewSpace();
        const position = this.scene.acquireVec2();
        this.data.anchor.getRectPointInto(position, viewSpace, this.data.position, this.data.extents, -1, -1);
        this.svgPosition.setV(position, viewSpace);
        S2DataUtils.applyPosition(this.svgPosition, this.element, this.scene);
        this.svgPosition.clearDirty();
        this.scene.releaseVec2(position);

        this.clearDirty();
    }

    protected onGrabImpl(event: PointerEvent): void {
        void event;
    }

    protected onDragImpl(event: PointerEvent): void {
        void event;
    }

    protected onReleaseImpl(event: PointerEvent): void {
        void event;
    }
}
