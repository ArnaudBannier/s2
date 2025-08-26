import { S2Camera } from '../core/math/s2-camera';
import { S2Scene } from '../core/s2-scene';
import { clamp } from '../core/math/s2-utils';
import { S2Animator } from './s2-animator';
import type { Timeline } from 'animejs';

export abstract class S2AnimatedScene extends S2Scene {
    protected animator: S2Animator;
    protected timeline?: Timeline;
    protected stepIndex: number = -1;

    constructor(element: SVGSVGElement, camera: S2Camera) {
        super(element, camera);
        this.animator = new S2Animator(this);
    }

    createFullAnimation(): void {
        if (this.timeline) {
            this.timeline.pause();
            this.timeline.reset();
        }
        this.stepIndex = 0;
        this.animator.setupStep(this.stepIndex);
        this.timeline = this.animator.getTimeline();
        this.timeline.play();
    }

    createPrevStep(): void {
        if (this.timeline) {
            this.timeline.pause();
            this.timeline.reset();
        }
        this.stepIndex = clamp(this.stepIndex - 1, 0, this.animator.getStepCount());
        this.animator.setupStep(this.stepIndex);
        this.timeline = this.animator.getStepTimeline(this.stepIndex);
    }

    createNextStep(): void {
        if (this.timeline) {
            this.timeline.pause();
            this.timeline.reset();
        }
        if (this.stepIndex >= this.animator.getStepCount()) return;
        this.stepIndex = clamp(this.stepIndex + 1, 0, this.animator.getStepCount());

        this.animator.setupStep(this.stepIndex);
        this.timeline = this.animator.getStepTimeline(this.stepIndex);
        this.timeline.restart();
        this.timeline.play();
    }

    reset(): void {
        if (this.timeline) {
            this.timeline.pause();
            this.timeline.reset();
        }
        this.stepIndex = -1;
        this.animator.setupStep(this.stepIndex);
        this.timeline = this.animator.getStepTimeline(this.stepIndex);
    }

    play(): void {
        if (this.timeline === undefined) return;
        this.animator.setupStep(this.stepIndex);
        this.timeline.restart();
        this.timeline.play();
    }
}
