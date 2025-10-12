import type { S2BaseScene } from '../scene/s2-base-scene';
import type { S2BaseAnimation } from './s2-base-animation';
import type { S2TimelineTrigger } from './s2-timeline-trigger';
import type { S2BaseElement } from '../element/base/s2-element';
import { S2MathUtils } from '../math/s2-math-utils';
import { S2Timeline } from './s2-timeline';
import { S2Playable } from './s2-playable';

export class S2StepAnimator {
    protected scene: S2BaseScene;
    protected timeline: S2Timeline;
    protected playable: S2Playable;
    protected stepTimes: number[];

    private labelId: number;

    constructor(scene: S2BaseScene) {
        this.scene = scene;
        this.timeline = new S2Timeline(this.scene);
        this.playable = new S2Playable(this.timeline);
        this.stepTimes = [0];
        this.labelId = 0;
    }

    finalize(): this {
        this.makeStep();
        return this;
    }

    getStepIndexFromElapsed(elapsed: number): number {
        for (let i = 0; i < this.stepTimes.length - 1; i++) {
            if (elapsed >= this.stepTimes[i] && elapsed < this.stepTimes[i + 1]) {
                return i;
            }
        }
        return this.stepTimes.length - 1;
    }

    getStepStartTime(index: number): number {
        index = S2MathUtils.clamp(index, 0, this.stepTimes.length - 2);
        return this.stepTimes[index];
    }

    playStep(index: number): this {
        index = S2MathUtils.clamp(index, 0, this.stepTimes.length - 2);
        this.stop();
        this.timeline.setElapsed(this.stepTimes[index]);
        this.playable.setRange(this.stepTimes[index], this.stepTimes[index + 1]);
        this.playable.play();
        return this;
    }

    playMaster(): this {
        this.stop();
        this.playable.setRange(0, this.timeline.getDuration());
        this.playable.play();
        return this;
    }

    isPlaying(): boolean {
        return this.playable.isPlaying();
    }

    isPaused(): boolean {
        return this.playable.isPaused();
    }

    pause(): this {
        this.playable.pause();
        return this;
    }

    resume(): this {
        this.playable.resume();
        return this;
    }

    resetStep(index: number): this {
        index = S2MathUtils.clamp(index, 0, this.stepTimes.length - 1);
        this.timeline.setElapsed(this.stepTimes[index]);
        return this;
    }

    reset(): this {
        this.timeline.setElapsed(0);
        this.scene.getSVG().update();
        return this;
    }

    stop(): this {
        this.playable.stop();
        return this;
    }

    setMasterElapsed(elapsed: number): this {
        this.timeline.setElapsed(elapsed);
        return this;
    }

    getMasterDuration(): number {
        return this.timeline.getDuration();
    }

    getStepDuration(index: number): number {
        index = S2MathUtils.clamp(index, 0, this.stepTimes.length - 2);
        return this.stepTimes[index + 1] - this.stepTimes[index];
    }

    getStepCount(): number {
        return this.stepTimes.length - 1;
    }

    makeStep(): this {
        if (this.timeline.getDuration() > this.stepTimes[this.stepTimes.length - 1]) {
            this.stepTimes.push(this.timeline.getDuration());
        }
        return this;
    }

    addAnimation(animation: S2BaseAnimation, label?: string, offset: number = 0): this {
        this.timeline.addAnimation(animation, label, offset);
        return this;
    }

    addTrigger(trigger: S2TimelineTrigger, label?: string, offset: number = 0): this {
        this.timeline.addTrigger(trigger, label, offset);
        return this;
    }

    addLabel(name: string, time: number): this {
        this.timeline.addLabel(name, time);
        return this;
    }

    addLabelAtCurrentTime(name: string): this {
        this.timeline.addLabelAtCurrentTime(name);
        return this;
    }

    createLabelAtCurrentTime(): string {
        const label = `step-${this.stepTimes.length - 1}-id-${this.labelId++}`;
        this.timeline.addLabelAtCurrentTime(label);
        return label;
    }

    ensureLabel(label?: string): string {
        if (label) {
            if (this.timeline.hasLabel(label)) return label;
            this.timeline.addLabelAtCurrentTime(label);
            return label;
        } else {
            return this.createLabelAtCurrentTime();
        }
    }

    enableElement(element: S2BaseElement, isEnabled: boolean, label?: string, offset: number = 0): this {
        this.timeline.enableElement(element, isEnabled, label, offset);
        return this;
    }

    getCurrentStepDuration(): number {
        return this.timeline.getCycleDuration();
    }

    getMasterTimeline(): S2Timeline {
        return this.timeline;
    }

    getStepTimeline(index: number): S2Timeline {
        void index;
        return this.timeline;
    }

    getStepPlayable(index: number): S2Playable {
        this.playable.setRange(this.stepTimes[index], this.stepTimes[index + 1]);
        return this.playable;
    }

    getMasterPlayable(): S2Playable {
        return this.playable;
    }
}
