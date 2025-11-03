import type { S2Space } from '../../math/s2-space';
import type { S2BaseScene } from '../../scene/s2-base-scene';
import type { S2Point } from '../../shared/s2-point';
import type { S2BaseDraggable } from './s2-draggable';
import { S2Vec2 } from '../../math/s2-vec2';
import { S2AnimatablePoint } from '../../animation/s2-animatable';

export class S2DraggableTarget {
    public readonly point: S2Point;
    public readonly animatable: S2AnimatablePoint;

    protected readonly scene: S2BaseScene;
    protected readonly snapSteps: S2Vec2 = new S2Vec2(1, 1);
    protected space: S2Space;
    protected snapOnDrag: boolean = false;
    protected snapOnRelease: boolean = false;

    constructor(scene: S2BaseScene, point: S2Point) {
        this.scene = scene;
        this.point = point;
        this.animatable = new S2AnimatablePoint(scene, point);
        this.space = point.space;
    }

    setSpace(space: S2Space): void {
        this.space = space;
    }

    setSnapSteps(stepX: number, stepY: number): void {
        this.snapSteps.set(stepX, stepY);
    }

    setSnapStepsV(steps: S2Vec2): void {
        this.snapSteps.copy(steps);
    }

    setSnapMode(mode: 'always' | 'release' | 'none'): void {
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
        draggable.data.position.getInto(point, this.space);
        if (this.snapOnDrag) {
            point.snapV(this.snapSteps);
        }
        this.animatable.setV(point, this.space);
        this.scene.releaseVec2(point);
    }

    onRelease(draggable: S2BaseDraggable, event: PointerEvent): void {
        void event;
        const point = this.scene.acquireVec2();
        draggable.data.position.getInto(point, this.space);
        if (this.snapOnRelease) {
            point.snapV(this.snapSteps);
        }
        this.animatable.setV(point, this.space);
        this.scene.releaseVec2(point);
    }
}
