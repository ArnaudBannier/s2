import type { S2BaseScene } from '../../scene/s2-base-scene';
import type { S2Point } from '../../shared/s2-point';
import type { S2BaseDraggable } from './s2-draggable';
import type { S2DragSnapMode } from '../../shared/s2-globals';
import { S2AnimatablePoint } from '../../animation/s2-animatable';

export class S2DraggableTarget {
    public readonly point: S2Point;
    public readonly animatable: S2AnimatablePoint;

    protected readonly scene: S2BaseScene;
    protected snapOnDrag: boolean = false;
    protected snapOnRelease: boolean = false;

    constructor(scene: S2BaseScene, point: S2Point) {
        this.scene = scene;
        this.point = point;
        this.animatable = new S2AnimatablePoint(scene, point);
    }

    setSnapMode(mode: S2DragSnapMode): void {
        switch (mode) {
            case 'always':
                this.snapOnDrag = true;
                this.snapOnRelease = true;
                break;
            case 'release':
                this.snapOnDrag = false;
                this.snapOnRelease = true;
                break;
            default:
            case 'none':
                this.snapOnDrag = false;
                this.snapOnRelease = false;
                break;
        }
    }

    onDrag(draggable: S2BaseDraggable, event: PointerEvent): void {
        void event;
        const point = this.scene.acquireVec2();
        const space = draggable.data.position.space;
        draggable.data.position.getInto(point, space);
        // if (this.snapOnDrag) {
        //     point.snapV(this.snapSteps);
        // }

        // const space = this.data.position.space;
        // const currPosition = this.scene.acquireVec2();
        // this.data.position.getInto(currPosition, space);

        // const snapSteps = this.scene.acquireVec2();
        // this.data.snapSteps.getInto(snapSteps, space);
        // currPosition.snapV(snapSteps);
        // this.data.position.setV(currPosition, space);

        // this.scene.releaseVec2(snapSteps);
        // this.scene.releaseVec2(currPosition);

        this.animatable.setV(point, space);
        this.scene.releaseVec2(point);
    }

    onRelease(draggable: S2BaseDraggable, event: PointerEvent): void {
        void event;
        const point = this.scene.acquireVec2();
        const space = draggable.data.position.space;
        draggable.data.position.getInto(point, space);
        // if (this.snapOnDrag) {
        //     point.snapV(this.snapSteps);
        // }

        // const space = this.data.position.space;
        // const currPosition = this.scene.acquireVec2();
        // this.data.position.getInto(currPosition, space);

        // const snapSteps = this.scene.acquireVec2();
        // this.data.snapSteps.getInto(snapSteps, space);
        // currPosition.snapV(snapSteps);
        // this.data.position.setV(currPosition, space);

        // this.scene.releaseVec2(snapSteps);
        // this.scene.releaseVec2(currPosition);

        this.animatable.setV(point, space);
        this.scene.releaseVec2(point);
    }
}
