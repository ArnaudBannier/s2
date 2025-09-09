import { S2BaseScene } from '../core/s2-interface';
import { S2Animation } from './s2-animation';
import { S2PlayableAnimation } from './s2-animation-manager';
import { S2Timeline, type S2TimelinePositionTypes } from './s2-timeline';

export class S2Animator {
    protected scene: S2BaseScene;
    protected currStepIndex: number = 0;
    protected timeline: S2Timeline;
    protected stepTimelines: S2Timeline[];
    protected stepCount: number = 0;
    protected playables: S2PlayableAnimation[];

    constructor(scene: S2BaseScene) {
        this.scene = scene;
        this.timeline = new S2Timeline(this.scene);
        this.stepTimelines = [new S2Timeline(this.scene)];
        this.playables = [new S2PlayableAnimation(this.stepTimelines[0])];
    }

    getStepCount(): number {
        return this.stepCount;
    }

    finalize(): void {
        this.stepCount = this.currStepIndex + 1;
    }

    makeStep(): void {
        this.playables.push(new S2PlayableAnimation(this.stepTimelines[this.currStepIndex]));
        this.currStepIndex++;
        this.stepCount = this.currStepIndex;
        this.stepTimelines.push(new S2Timeline(this.scene));
    }

    getTimeline(): S2Timeline {
        return this.timeline;
    }

    getStepTimeline(index: number): S2Timeline {
        return this.stepTimelines[index];
    }

    getPlayableStep(index: number): S2PlayableAnimation {
        return this.playables[index];
    }

    addAnimation(animation: S2Animation, position: S2TimelinePositionTypes = 'previous-end', offset: number = 0): this {
        this.stepTimelines[this.currStepIndex].addAnimation(animation, position, offset);
        return this;
    }
}
