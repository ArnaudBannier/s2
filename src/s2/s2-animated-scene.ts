import { S2Camera } from './math/s2-camera';
import { S2Scene } from './s2-scene';
import { clamp } from '../math/utils';
import { S2Animator } from '../../s2-animator';

export abstract class S2AnimatedScene extends S2Scene {
    protected animator: S2Animator;

    constructor(element: SVGSVGElement, camera: S2Camera) {
        super(element, camera);
        this.animator = new S2Animator(this);
    }

    createFullAnimation(): void {
        this.animator.setTargetStepIndex(-1);
        this.createAnimation();
        this.animator.getTimeline().play();
    }

    createPrevStep(): void {
        let index = this.animator.getTargetStepIndex();
        index = clamp(index - 1, 0, this.animator.getStepCount());
        this.animator.setTargetStepIndex(index);
        this.createAnimation();
    }

    createNextStep(): void {
        let index = this.animator.getTargetStepIndex();
        if (index >= this.animator.getStepCount()) return;
        index = clamp(index + 1, 0, this.animator.getStepCount());
        this.animator.setTargetStepIndex(index);
        this.createAnimation();
        this.animator.getTimeline().play();
    }

    reset(): void {
        this.animator.setTargetStepIndex(0);
        this.createAnimation();
        this.animator.getTimeline().restart();
    }

    play(): void {
        this.createAnimation();
        this.animator.getTimeline().play();
    }

    abstract createAnimation(): void;
}
