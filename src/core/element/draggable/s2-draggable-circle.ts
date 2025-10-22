import type { S2BaseScene } from '../../scene/s2-base-scene';
import type { S2Dirtyable } from '../../shared/s2-globals';
import type { S2Space } from '../../math/s2-space';
import { S2Vec2 } from '../../math/s2-vec2';
import { svgNS } from '../../shared/s2-globals';
import { S2DataUtils } from '../base/s2-data-utils';
import { S2Number } from '../../shared/s2-number';
import { S2Length } from '../../shared/s2-length';
import { S2Draggable, S2DraggableData } from './s2-draggable';

export type S2HandleEventListener = (handle: S2DraggableCircle, event: PointerEvent) => void;

export class S2DraggableCircleData extends S2DraggableData {
    public readonly radius: S2Length;

    constructor(scene: S2BaseScene) {
        super(scene);
        this.radius = new S2Length(1, scene.getWorldSpace());
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        super.setOwner(owner);
        this.radius.setOwner(owner);
    }

    clearDirty(): void {
        super.clearDirty();
        this.radius.clearDirty();
    }
}

export class S2DraggableCircle extends S2Draggable<S2DraggableCircleData> {
    protected element: SVGCircleElement;
    protected opacity: S2Number;

    constructor(scene: S2BaseScene) {
        super(scene, new S2DraggableCircleData(scene));
        this.element = document.createElementNS(svgNS, 'circle');
        this.opacity = new S2Number(0.0);

        this.initSVGElement(this.element);
    }

    getRadius(space: S2Space): number {
        return this.data.radius.get(space);
    }

    getCenter(space: S2Space): S2Vec2 {
        return this.data.position.get(space);
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    update(): void {
        if (this.skipUpdate()) return;

        S2DataUtils.applyPointerEvents(this.data.pointerEvents, this.element, this.scene);
        S2DataUtils.applyOpacity(this.opacity, this.element, this.scene);
        S2DataUtils.applyPosition(this.data.position, this.element, this.scene, 'cx', 'cy');
        S2DataUtils.applyRadius(this.data.radius, this.element, this.scene);

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
