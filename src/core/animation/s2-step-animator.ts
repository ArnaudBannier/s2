import { S2MathUtils } from '../math/s2-utils';
import { S2BaseScene } from '../s2-base-scene';
import { S2Animation } from './s2-animation';
import { S2PlayableAnimation } from './s2-animation-manager';
import { S2Timeline, type S2TimelinePosition } from './s2-timeline';

export class S2StepAnimator {
    protected scene: S2BaseScene;
    protected masterTimeline: S2Timeline;
    protected masterPlayable: S2PlayableAnimation;
    protected stepTimelines: S2Timeline[];
    protected stepPlayables: S2PlayableAnimation[];
    protected shouldAddNewStep: boolean = true;
    protected stepTimes: number[];
    protected speed: number;
    protected currPlayable: S2PlayableAnimation;

    constructor(scene: S2BaseScene) {
        this.scene = scene;
        this.masterTimeline = new S2Timeline(this.scene);
        this.masterPlayable = new S2PlayableAnimation(this.masterTimeline);
        this.stepTimelines = [];
        this.stepPlayables = [];
        this.stepTimes = [0];
        this.speed = 1;
        this.currPlayable = this.masterPlayable;
    }

    setSpeed(speed: number): this {
        this.speed = speed;
        this.masterPlayable.setSpeed(speed);
        for (const playable of this.stepPlayables) {
            playable.setSpeed(speed);
        }
        return this;
    }

    getSpeed(): number {
        return this.speed;
    }

    playStep(index: number): this {
        index = S2MathUtils.clamp(index, 0, this.stepTimelines.length - 1);
        this.stop();
        this.masterTimeline.setElapsed(this.stepTimes[index]);
        this.currPlayable = this.stepPlayables[index];
        this.currPlayable.play();
        return this;
    }

    playMaster(): this {
        this.stop();
        this.currPlayable = this.masterPlayable;
        this.currPlayable.play();
        return this;
    }

    isPlaying(): boolean {
        return this.currPlayable.isPlaying();
    }

    isPaused(): boolean {
        return this.currPlayable.isPaused();
    }

    pause(): this {
        this.currPlayable.pause();
        return this;
    }

    resume(): this {
        this.currPlayable.resume();
        return this;
    }

    resetStep(index: number): this {
        index = S2MathUtils.clamp(index, 0, this.stepTimelines.length - 1);
        this.masterTimeline.setElapsed(this.stepTimes[index]);
        return this;
    }

    reset(): this {
        this.masterTimeline.setElapsed(0);
        this.currPlayable = this.masterPlayable;
        return this;
    }

    stop(): this {
        this.currPlayable.stop();
        return this;
    }

    setMasterElapsed(elapsed: number, updateId?: number): this {
        this.masterTimeline.setElapsed(elapsed, updateId);
        return this;
    }

    getMasterDuration(): number {
        return this.masterTimeline.getDuration();
    }

    getStepDuration(index: number): number {
        index = S2MathUtils.clamp(index, 0, this.stepTimelines.length - 1);
        return this.stepTimelines[index].getDuration();
    }

    getStepCount(): number {
        return this.stepTimelines.length;
    }

    makeStep(): this {
        this.shouldAddNewStep = true;
        return this;
    }

    addAnimation(animation: S2Animation, position: S2TimelinePosition = 'previous-end', offset: number = 0): this {
        if (this.shouldAddNewStep) {
            const timeline = new S2Timeline(this.scene);
            const playable = new S2PlayableAnimation(timeline);
            playable.setSpeed(this.speed);
            this.stepTimelines.push(timeline);
            this.stepPlayables.push(playable);
            this.stepTimes.push(0);
            this.masterTimeline.addAnimation(timeline, 'previous-end', 0);
            this.shouldAddNewStep = false;
        }
        const currTimeline = this.stepTimelines[this.stepTimelines.length - 1];
        currTimeline.addAnimation(animation, position, offset);
        this.update();
        return this;
    }

    update(): void {
        let stepTime = 0;
        this.stepTimes[0] = 0;
        for (let i = 0; i < this.stepTimelines.length; i++) {
            const step = this.stepTimelines[i];
            stepTime += step.refreshState().getDuration();
            this.stepTimes[i + 1] = stepTime;
        }
        this.masterTimeline.refreshState();
    }

    getMasterTimeline(): S2Timeline {
        return this.masterTimeline;
    }

    getStepTimeline(index: number): S2Timeline {
        index = S2MathUtils.clamp(index, 0, this.stepTimelines.length - 1);
        return this.stepTimelines[index];
    }

    getStepPlayable(index: number): S2PlayableAnimation {
        index = S2MathUtils.clamp(index, 0, this.stepTimelines.length - 1);
        return this.stepPlayables[index];
    }

    getMasterPlayable(): S2PlayableAnimation {
        return this.masterPlayable;
    }
}
