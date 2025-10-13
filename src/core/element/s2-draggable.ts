import type { S2BaseScene } from '../scene/s2-base-scene';
import type { S2Dirtyable } from '../shared/s2-globals';
import type { S2Space } from '../math/s2-camera';
import { S2Vec2 } from '../math/s2-vec2';
import { S2ElementData } from './base/s2-base-data';
import { S2Element } from './base/s2-element';
import { S2Position } from '../shared/s2-position';
import { S2Direction } from '../shared/s2-direction';
import { S2AnimationManager } from '../animation/s2-animation-manager';
import { S2Boolean } from '../shared/s2-boolean';
import { S2MathUtils } from '../math/s2-math-utils';

export type S2BaseDraggable = S2Draggable<S2DraggableData>;
export type S2HandleEventListener = (handle: S2BaseDraggable, event: PointerEvent) => void;

export class S2DraggableData extends S2ElementData {
    public readonly position: S2Position = new S2Position(0, 0, 'world');
    public readonly xEnabled: S2Boolean = new S2Boolean(true);
    public readonly yEnabled: S2Boolean = new S2Boolean(true);
    public readonly containerBoundA: S2Position = new S2Position(-Infinity, -Infinity, 'world');
    public readonly containerBoundB: S2Position = new S2Position(+Infinity, +Infinity, 'world');

    constructor() {
        super();
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

// export class S2DragContext {
//     public readonly pointerPosition: S2Position = new S2Position(0, 0, 'world');
//     public readonly pointerDelta: S2Direction = new S2Direction(0, 0, 'world');
//     public readonly position: S2Position = new S2Position(0, 0, 'world');
//     public readonly delta: S2Direction = new S2Direction(0, 0, 'world');
//     public readonly draggable: S2BaseDraggable;

//     constructor(draggable: S2BaseDraggable) {
//         this.draggable = draggable;
//     }
// }

export abstract class S2Draggable<Data extends S2DraggableData> extends S2Element<Data> {
    protected grabDelta: S2Direction = new S2Direction(0, 0, 'view');
    protected pointerPosition: S2Position = new S2Position(0, 0, 'view');
    protected pointerDelta: S2Direction = new S2Direction(0, 0, 'view');
    protected pointerId: number | null = null;
    protected delta: S2Direction = new S2Direction(0, 0, 'view');
    protected dragging = false;
    protected userOnGrab: S2HandleEventListener | null = null;
    protected userOnDrag: S2HandleEventListener | null = null;
    protected userOnRelease: S2HandleEventListener | null = null;

    constructor(scene: S2BaseScene, data: Data) {
        super(scene, data);
    }

    protected initSVGElement(element: SVGElement): void {
        element.style.touchAction = 'none';
        element.style.cursor = 'pointer';
        element.role = 'handle';
        element.addEventListener('pointerdown', this.onGrab, { passive: false });
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

    getPosition(space: S2Space): S2Vec2 {
        return this.data.position.get(space, this.scene.getActiveCamera());
    }

    getDelta(space: S2Space): S2Vec2 {
        return this.delta.get(space, this.scene.getActiveCamera());
    }

    getCenter(space: S2Space): S2Vec2 {
        return this.data.position.toSpace(space, this.scene.getActiveCamera());
    }

    getPointerDelta(space: S2Space): S2Vec2 {
        return this.pointerDelta.get(space, this.scene.getActiveCamera());
    }

    getPointerPosition(space: S2Space): S2Vec2 {
        return this.pointerPosition.get(space, this.scene.getActiveCamera());
    }

    protected updatePointerPosition(x: number, y: number): void {
        const space = 'view';
        const camera = this.scene.getActiveCamera();

        const prevPointerPosition = this.pointerPosition.get(space, camera);
        this.scene.convertDOMPointInto(x, y, this.pointerPosition);
        const currPointerPosition = this.pointerPosition.get(space, camera);
        const pointerDelta = S2Vec2.sub(currPointerPosition, prevPointerPosition);
        this.pointerDelta.setValueFromSpaceV(pointerDelta, space, camera);
    }

    protected updatePositionFromPointer(): void {
        const space = 'view';
        const camera = this.scene.getActiveCamera();

        const pointerPosition = this.pointerPosition.get(space, camera);
        const prevPosition = this.data.position.get(space, camera);
        const currPosition = S2Vec2.add(pointerPosition, this.grabDelta.get(space, camera));
        const boundA = this.data.containerBoundA.get(space, camera);
        const boundB = this.data.containerBoundB.get(space, camera);
        const lowerX = Math.min(boundA.x, boundB.x);
        const upperX = Math.max(boundA.x, boundB.x);
        const lowerY = Math.min(boundA.y, boundB.y);
        const upperY = Math.max(boundA.y, boundB.y);
        if (this.data.xEnabled.get()) {
            this.data.position.setXFromSpace(S2MathUtils.clamp(currPosition.x, lowerX, upperX), space, camera);
        }
        if (this.data.yEnabled.get()) {
            this.data.position.setYFromSpace(S2MathUtils.clamp(currPosition.y, lowerY, upperY), space, camera);
        }

        const delta = S2Vec2.sub(this.data.position.get(space, camera), prevPosition);
        this.delta.setV(delta, space);
    }

    private onGrab = (event: PointerEvent): void => {
        // check for left button only (if button is defined)
        if (event.button !== undefined && event.button !== 0) return;
        event.preventDefault();

        const space = 'view';
        const camera = this.scene.getActiveCamera();

        this.updatePointerPosition(event.clientX, event.clientY);
        const position = this.data.position.get(space, camera);
        this.grabDelta.setV(S2Vec2.sub(position, this.pointerPosition.value), space);
        this.pointerDelta.set(0, 0, space);
        this.delta.set(0, 0, space);

        // capture the pointer
        this.getSVGElement().setPointerCapture(event.pointerId);
        this.pointerId = event.pointerId;
        this.dragging = true;

        // register global move/up to ensure we get events
        window.addEventListener('pointermove', this.onDrag, { passive: false });
        window.addEventListener('pointerup', this.onRelease, { passive: false });

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

        const space = 'view';
        this.delta.set(0, 0, space);
        this.pointerDelta.set(0, 0, space);
        this.pointerPosition.set(0, 0, space);

        this.dragging = false;
        this.pointerId = null;
        window.removeEventListener('pointermove', this.onDrag);
        window.removeEventListener('pointerup', this.onRelease);

        this.getSVGElement().releasePointerCapture(event.pointerId);

        this.onReleaseImpl(event);
        this.userOnRelease?.(this, event);
        S2AnimationManager.requestUpdate(this.scene);
    };

    protected abstract onGrabImpl(event: PointerEvent): void;
    protected abstract onDragImpl(event: PointerEvent): void;
    protected abstract onReleaseImpl(event: PointerEvent): void;
}
