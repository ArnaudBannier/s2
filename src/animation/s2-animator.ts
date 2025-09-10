import { S2MathUtils } from '../core/math/s2-utils';
import { S2BaseScene } from '../core/s2-interface';
import { S2Animation } from './s2-animation';
import { S2PlayableAnimation } from './s2-animation-manager';
import { S2Timeline, type S2TimelinePosition } from './s2-timeline';

export class S2Animator {
    protected scene: S2BaseScene;
    protected mainTimeline: S2Timeline;
    protected mainPlayable: S2PlayableAnimation;
    protected timelines: S2Timeline[];
    protected playables: S2PlayableAnimation[];
    protected newStepOnNextAdd: boolean = true;
    protected stepTimes: number[];

    constructor(scene: S2BaseScene) {
        this.scene = scene;
        this.mainTimeline = new S2Timeline(this.scene);
        this.mainPlayable = new S2PlayableAnimation(this.mainTimeline);
        this.timelines = [];
        this.playables = [];
        this.stepTimes = [0];
    }

    getStepCount(): number {
        return this.timelines.length;
    }

    makeStep(): void {
        this.newStepOnNextAdd = true;
    }

    getTimeline(): S2Timeline {
        return this.mainTimeline;
    }

    getStepTimeline(index: number): S2Timeline {
        index = S2MathUtils.clamp(index, 0, this.timelines.length - 1);
        return this.timelines[index];
    }

    getPlayableStep(index: number): S2PlayableAnimation {
        index = S2MathUtils.clamp(index, 0, this.timelines.length - 1);
        return this.playables[index];
    }

    getMainPlayable(): S2PlayableAnimation {
        return this.mainPlayable;
    }

    addAnimation(animation: S2Animation, position: S2TimelinePosition = 'previous-end', offset: number = 0): this {
        if (this.newStepOnNextAdd) {
            const timeline = new S2Timeline(this.scene);
            this.timelines.push(timeline);
            this.playables.push(new S2PlayableAnimation(timeline));
            this.stepTimes.push(0);
            this.mainTimeline.addAnimation(timeline, 'previous-end', 0);
            this.newStepOnNextAdd = false;
        }
        const currTimeline = this.timelines[this.timelines.length - 1];
        currTimeline.addAnimation(animation, position, offset);
        this.update();
        return this;
    }

    update(): void {
        let stepTime = 0;
        this.stepTimes[0] = 0;
        for (let i = 0; i < this.timelines.length; i++) {
            const step = this.timelines[i];
            stepTime += step.update().getDuration();
            this.stepTimes[i + 1] = stepTime;
            console.log('step time', stepTime);
        }
        this.mainTimeline.update();
        console.log('duration', this.mainTimeline.getDuration());
        console.log('main timeline', this.mainTimeline);
    }

    resetStep(index: number): this {
        this.mainTimeline.setElapsed(this.stepTimes[index]);
        return this;
    }
}
