import type { S2BaseScene } from '../../scene/s2-base-scene';
import type { S2Point } from '../../shared/s2-point';
import type { S2BaseDraggable } from './s2-draggable';
import type { S2DragSnapMode } from '../../shared/s2-globals';
import { S2AnimatablePoint } from '../../animation/s2-animatable';
import { S2Enum } from '../../shared/s2-enum';

export class S2DraggableTarget {
    public readonly animatable: S2AnimatablePoint;
    public readonly snapMode: S2Enum<S2DragSnapMode>;

    protected readonly scene: S2BaseScene;
    protected snapOnDrag: boolean = false;
    protected snapOnRelease: boolean = false;

    constructor(scene: S2BaseScene, point: S2Point) {
        this.scene = scene;
        this.animatable = new S2AnimatablePoint(scene, point);
        this.snapMode = new S2Enum('none');
    }

    getPoint(): S2Point {
        return this.animatable.point;
    }

    updateSnapMode(): void {
        if (!this.snapMode.isDirty()) return;
        const mode = this.snapMode.get();
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
        this.snapMode.clearDirty();
    }

    onDrag(draggable: S2BaseDraggable, event: PointerEvent): void {
        void event;
        const point = this.scene.acquireVec2();
        const space = draggable.data.position.space;
        draggable.data.position.getInto(point, space);

        if (this.snapOnDrag) {
            const snapSteps = this.scene.acquireVec2();
            draggable.data.snapSteps.getInto(snapSteps, space);
            point.snapV(snapSteps);
            this.scene.releaseVec2(snapSteps);
        }

        this.animatable.setV(point, space);
        this.scene.releaseVec2(point);
    }

    onRelease(draggable: S2BaseDraggable, event: PointerEvent): void {
        void event;
        const point = this.scene.acquireVec2();
        const space = draggable.data.position.space;
        draggable.data.position.getInto(point, space);

        if (this.snapOnRelease) {
            const snapSteps = this.scene.acquireVec2();
            draggable.data.snapSteps.getInto(snapSteps, space);
            point.snapV(snapSteps);
            this.scene.releaseVec2(snapSteps);
        }

        this.animatable.setV(point, space);
        this.scene.releaseVec2(point);
    }
}
