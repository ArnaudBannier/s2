import type { S2BaseScene } from '../scene/s2-base-scene';
import type { S2Dirtyable } from '../shared/s2-globals';
import type { S2Space } from '../shared/s2-base-type';
import { S2Vec2 } from '../math/s2-vec2';
import { S2ElementData } from './base/s2-base-data';
import { S2Element } from './base/s2-element';
import { S2Transform } from '../shared/s2-transform';
import { S2Position } from '../shared/s2-position';
import { S2Direction } from '../shared/s2-direction';

export type S2BaseDraggable = S2Draggable<S2DraggableData>;
export type S2HandleEventListener = (handle: S2BaseDraggable, event: PointerEvent) => void;

export class S2DraggableData extends S2ElementData {
    public readonly transform: S2Transform;
    public readonly position: S2Position;

    constructor() {
        super();
        this.transform = new S2Transform();
        this.position = new S2Position(0, 0, 'world');

        this.pointerEvents.set('auto');
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        super.setOwner(owner);
        this.transform.setOwner(owner);
        this.position.setOwner(owner);
    }

    clearDirty(): void {
        super.clearDirty();
        this.transform.clearDirty();
        this.position.clearDirty();
    }
}

export abstract class S2Draggable<Data extends S2DraggableData> extends S2Element<Data> {
    protected currPointerPosition: S2Position;
    protected prevPointerPosition: S2Position;
    protected pointerDelta: S2Direction;
    protected pointerId: number | null = null;
    protected dragging = false;
    protected userOnGrab: S2HandleEventListener | null = null;
    protected userOnDrag: S2HandleEventListener | null = null;
    protected userOnRelease: S2HandleEventListener | null = null;
    protected boundOnGrab = this.onGrab.bind(this);
    protected boundOnDrag = this.onDrag.bind(this);
    protected boundOnRelease = this.onRelease.bind(this);

    constructor(scene: S2BaseScene, data: Data) {
        super(scene, data);
        this.currPointerPosition = new S2Position(0, 0, 'world');
        this.prevPointerPosition = new S2Position(0, 0, 'world');
        this.pointerDelta = new S2Direction(0, 0, 'world');
    }

    protected initSVGElement(element: SVGElement): void {
        element.style.touchAction = 'none';
        element.addEventListener('pointerdown', this.boundOnGrab);
        element.style.cursor = 'pointer';
        element.role = 'handle';
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

    getCenter(space: S2Space): S2Vec2 {
        return this.data.position.toSpace(space, this.scene.getActiveCamera());
    }

    getPointerDelta(space: S2Space): S2Vec2 {
        return this.pointerDelta.get(space, this.scene.getActiveCamera());
    }

    getPointerPosition(space: S2Space): S2Vec2 {
        return this.currPointerPosition.get(space, this.scene.getActiveCamera());
    }

    getPosition(space: S2Space): S2Vec2 {
        return this.data.position.get(space, this.scene.getActiveCamera());
    }

    private onGrab(event: PointerEvent) {
        // check for left button only (if button is defined)
        if (event.button && event.button !== 0) return;
        event.preventDefault();

        this.scene.convertDOMPointInto(event.clientX, event.clientY, this.currPointerPosition);
        this.currPointerPosition.changeSpace('world', this.scene.getActiveCamera());
        this.prevPointerPosition.copy(this.currPointerPosition);

        // capture the pointer
        this.getSVGElement().setPointerCapture(event.pointerId);
        this.pointerId = event.pointerId;
        this.dragging = true;

        // register global move/up to ensure we get events
        window.addEventListener('pointermove', this.boundOnDrag);
        window.addEventListener('pointerup', this.boundOnRelease);

        this.userOnGrab?.(this, event);
        this.scene.update();
    }

    private onDrag(event: PointerEvent) {
        if (!this.dragging || event.pointerId !== this.pointerId) return;
        event.preventDefault();

        const space = 'world';
        const camera = this.scene.getActiveCamera();

        this.prevPointerPosition.copy(this.currPointerPosition);
        this.scene.convertDOMPointInto(event.clientX, event.clientY, this.currPointerPosition);
        this.currPointerPosition.changeSpace(space, camera);
        const delta = S2Vec2.sub(this.currPointerPosition.value, this.prevPointerPosition.value);
        this.pointerDelta.setV(delta, space);

        const position = this.data.position.get(space, camera);
        position.addV(delta);
        this.data.position.setV(position, space);

        this.userOnDrag?.(this, event);
        this.scene.update();
    }

    private onRelease(event: PointerEvent) {
        if (!this.dragging || event.pointerId !== this.pointerId) return;
        event.preventDefault();

        this.dragging = false;
        this.pointerId = null;
        window.removeEventListener('pointermove', this.boundOnDrag);
        window.removeEventListener('pointerup', this.boundOnRelease);
        if (this.pointerId !== null) {
            this.getSVGElement().releasePointerCapture(event.pointerId);
        }

        this.userOnRelease?.(this, event);
        this.scene.update();
    }
}
