import { clamp } from '../math/utils';
import { Timeline } from 'animejs';
import { type TargetsParam, type AnimationParams } from 'animejs';

export class AnimationScheduler {
    timeline: Timeline;
    steps: number[];
    stepIndex: number = 0;
    pauseTime: number = 0;

    constructor() {
        this.timeline = new Timeline({
            autoplay: false,
            onUpdate: (self) => {
                if (self.currentTime > this.pauseTime) {
                    self.pause();
                    self.seek(this.pauseTime);
                }
            },
        });
        this.steps = [0];
    }

    /* eslint-disable @typescript-eslint/no-unsafe-function-type */
    addAnimation(
        targets: TargetsParam,
        parameters: AnimationParams,
        position?: number | string | Function,
    ): AnimationScheduler {
        this.timeline.add(targets, parameters, position);
        console.log(this.timeline.duration);
        return this;
    }
    /* eslint-enable @typescript-eslint/no-unsafe-function-type */

    addStep() {
        this.steps.push(this.timeline.duration);
    }

    finalize() {
        this.steps.push(this.timeline.duration);
    }

    playForward() {
        const time = this.steps[clamp(this.stepIndex, 0, this.steps.length)];
        this.stepIndex = clamp(this.stepIndex + 1, 0, this.steps.length);
        this.pauseTime = this.steps[this.stepIndex];
        this.timeline.seek(time);
        this.timeline.resume();
        console.log(this.stepIndex);
    }

    playBackward() {
        this.stepIndex = clamp(this.stepIndex - 1, 0, this.steps.length);

        const time = this.steps[clamp(this.stepIndex, 0, this.steps.length)];
        this.pauseTime = this.steps[this.stepIndex + 1];
        this.timeline.seek(time);
        console.log(this.stepIndex);
    }

    playFullTimeline() {
        this.pauseTime = this.timeline.duration + 1000;
        this.timeline.play();
    }
    /* eslint-disable @typescript-eslint/no-explicit-any */
    getTween(currStyle: Record<string, string>, nextStyle: Record<string, string>): { [key: string]: any } {
        const res: { [key: string]: any } = {};
        for (const [key, value] of Object.entries(nextStyle)) {
            if (key in currStyle) {
                res[key] = { to: [currStyle[key], value] };
            }
        }
        return res;
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */
}
