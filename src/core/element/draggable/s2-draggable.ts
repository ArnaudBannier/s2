import type { S2BaseScene } from '../../scene/s2-base-scene';
import type { S2Dirtyable } from '../../shared/s2-globals';
import type { S2BaseDraggableContainer } from './s2-draggable-container';
import type { S2AbstractSpace } from '../../math/s2-abstract-space';
import { S2Vec2 } from '../../math/s2-vec2';
import { S2ElementData } from '../base/s2-base-data';
import { S2Element } from '../base/s2-element';
import { S2Point } from '../../shared/s2-point';
import { S2Offset } from '../../shared/s2-offset';
import { S2AnimationManager } from '../../animation/s2-animation-manager';
import { S2Boolean } from '../../shared/s2-boolean';

export type S2BaseDraggable = S2Draggable<S2DraggableData>;
export type S2HandleEventListener = (handle: S2BaseDraggable, event: PointerEvent) => void;

export class S2DraggableData extends S2ElementData {
    public readonly position: S2Point;
    public readonly xEnabled: S2Boolean = new S2Boolean(true);
    public readonly yEnabled: S2Boolean = new S2Boolean(true);
    public readonly containerBoundA: S2Point;
    public readonly containerBoundB: S2Point;

    constructor(scene: S2BaseScene) {
        super();
        const worldSpace = scene.getWorldSpace();
        this.position = new S2Point(0, 0, worldSpace);
        this.containerBoundA = new S2Point(-Infinity, -Infinity, worldSpace);
        this.containerBoundB = new S2Point(+Infinity, +Infinity, worldSpace);
        this.pointerEvents.set('auto');
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        super.setOwner(owner);
        this.position.setOwner(owner);
        this.xEnabled.setOwner(owner);
        this.yEnabled.setOwner(owner);
        this.containerBoundA.setOwner(owner);
        this.containerBoundB.setOwner(owner);
    }

    clearDirty(): void {
        super.clearDirty();
        this.position.clearDirty();
        this.xEnabled.clearDirty();
        this.yEnabled.clearDirty();
        this.containerBoundA.clearDirty();
        this.containerBoundB.clearDirty();
    }
}

export abstract class S2Draggable<Data extends S2DraggableData> extends S2Element<Data> {
    protected readonly grabDelta: S2Offset;
    protected readonly pointerPosition: S2Point;
    protected readonly pointerDelta: S2Offset;
    protected readonly delta: S2Offset;
    protected pointerId: number | null = null;
    protected dragging = false;
    protected userOnGrab: S2HandleEventListener | null = null;
    protected userOnDrag: S2HandleEventListener | null = null;
    protected userOnRelease: S2HandleEventListener | null = null;
    protected container: S2BaseDraggableContainer | null = null;

    constructor(scene: S2BaseScene, data: Data) {
        super(scene, data);
        const viewSpace = scene.getViewSpace();
        this.grabDelta = new S2Offset(0, 0, viewSpace);
        this.pointerPosition = new S2Point(0, 0, viewSpace);
        this.pointerDelta = new S2Offset(0, 0, viewSpace);
        this.delta = new S2Offset(0, 0, viewSpace);
    }

    protected initSVGElement(element: SVGElement): void {
        element.style.touchAction = 'none';
        element.style.cursor = 'pointer';
        element.role = 'draggable';
        element.addEventListener('pointerdown', this.onGrab, { passive: false });
    }

    setContainer(container: S2BaseDraggableContainer | null): void {
        if (this.container === container) return;
        this.container = container;
        container?.setOwner(this);
        this.markDirty();
    }

    setOnGrab(listener: S2HandleEventListener | null): void {
        this.userOnGrab = listener;
    }

    setOnDrag(listener: S2HandleEventListener | null): void {
        this.userOnDrag = listener;
    }

    setOnRelease(listener: S2HandleEventListener | null): void {
        this.userOnRelease = listener;
    }

    getPosition(space: S2AbstractSpace): S2Vec2 {
        return this.data.position.get(space);
    }

    getDelta(space: S2AbstractSpace): S2Vec2 {
        return this.delta.get(space);
    }

    getCenter(space: S2AbstractSpace): S2Vec2 {
        return this.data.position.get(space);
    }

    getPointerDelta(space: S2AbstractSpace): S2Vec2 {
        return this.pointerDelta.get(space);
    }

    getPointerPosition(space: S2AbstractSpace): S2Vec2 {
        return this.pointerPosition.get(space);
    }

    protected updatePointerPosition(x: number, y: number): void {
        const viewSpace = this.scene.getViewSpace();

        const prevPointerPosition = this.pointerPosition.get(viewSpace);
        this.scene.convertDOMPointInto(this.pointerPosition, x, y);
        const currPointerPosition = this.pointerPosition.get(viewSpace);
        const pointerDelta = S2Vec2.subV(currPointerPosition, prevPointerPosition);
        this.pointerDelta.setValueFromSpaceV(pointerDelta, viewSpace);
    }

    protected updatePositionFromPointer(): void {
        const space = this.data.position.space;
        const prevPosition = this.data.position.get(space);
        let currPosition = this.pointerPosition.get(space);
        currPosition.addV(this.grabDelta.get(space));
        this.data.position.setValueFromSpaceV(currPosition, space);
        if (this.container) {
            this.container.updatePosition(this.data.position);
            currPosition = this.data.position.get(space);
        }
        this.delta.setV(currPosition.subV(prevPosition), space);
    }

    private onGrab = (event: PointerEvent): void => {
        // check for left button only (if button is defined)
        if (event.button !== undefined && event.button !== 0) return;
        event.preventDefault();

        const viewSpace = this.scene.getViewSpace();

        this.updatePointerPosition(event.clientX, event.clientY);
        const position = this.data.position.get(viewSpace);
        this.grabDelta.setV(S2Vec2.subV(position, this.pointerPosition.value), viewSpace);
        this.pointerDelta.set(0, 0, viewSpace);
        this.delta.set(0, 0, viewSpace);

        // capture the pointer
        const element = this.getSVGElement();
        element.setPointerCapture(event.pointerId);
        element.addEventListener('pointermove', this.onDrag);
        element.addEventListener('pointerup', this.onRelease);

        this.pointerId = event.pointerId;
        this.dragging = true;

        this.scene.getSVG().getSVGElement().style.touchAction = 'none';

        this.onGrabImpl(event);
        this.userOnGrab?.(this, event);
        S2AnimationManager.requestUpdate(this.scene);
    };

    private onDrag = (event: PointerEvent): void => {
        if (!this.dragging || event.pointerId !== this.pointerId) return;
        event.preventDefault();

        this.updatePointerPosition(event.clientX, event.clientY);
        this.updatePositionFromPointer();

        this.onDragImpl(event);
        this.userOnDrag?.(this, event);
        S2AnimationManager.requestUpdate(this.scene);
    };

    private onRelease = (event: PointerEvent): void => {
        if (!this.dragging || event.pointerId !== this.pointerId) return;
        event.preventDefault();

        const viewSpace = this.scene.getViewSpace();
        this.delta.set(0, 0, viewSpace);
        this.pointerDelta.set(0, 0, viewSpace);
        this.pointerPosition.set(0, 0, viewSpace);

        this.dragging = false;
        this.pointerId = null;

        const element = this.getSVGElement();
        element.releasePointerCapture(event.pointerId);
        element.removeEventListener('pointermove', this.onDrag);
        element.removeEventListener('pointerup', this.onRelease);

        this.onReleaseImpl(event);
        this.userOnRelease?.(this, event);
        S2AnimationManager.requestUpdate(this.scene);
    };

    protected abstract onGrabImpl(event: PointerEvent): void;
    protected abstract onDragImpl(event: PointerEvent): void;
    protected abstract onReleaseImpl(event: PointerEvent): void;
}
