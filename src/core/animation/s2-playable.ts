import type { S2BaseAnimation } from './s2-base-animation';
import { S2AnimationManager } from './s2-animation-manager';

export class S2Playable {
    protected animation: S2BaseAnimation;
    protected state: 'playing' | 'paused' | 'stopped';
    protected repeat: boolean = false;
    protected speed: number = 1;
    protected playFrom: number;
    protected playTo: number;

    constructor(animation: S2BaseAnimation) {
        this.animation = animation;
        this.playFrom = 0;
        this.playTo = this.animation.getDuration();
        this.state = 'stopped';
    }

    setRange(from: number, to: number): this {
        this.playFrom = Math.max(0, from);
        this.playTo = Math.min(to, this.animation.getDuration());
        return this;
    }

    getAnimation(): S2BaseAnimation {
        return this.animation;
    }

    setSpeed(speed: number): this {
        this.speed = speed;
        return this;
    }

    getSpeed(): number {
        return this.speed;
    }

    setElapsed(elapsed: number): this {
        this.animation.setElapsed(elapsed);
        return this;
    }

    getElapsed(): number {
        return this.animation.getElapsed();
    }

    isPlaying(): boolean {
        return this.state === 'playing';
    }

    isPaused(): boolean {
        return this.state === 'paused';
    }

    isStopped(): boolean {
        return this.state === 'stopped';
    }

    play(repeat: boolean = false): this {
        this.state = 'playing';
        this.animation.setElapsed(this.playFrom);
        S2AnimationManager.addAnimation(this);
        this.repeat = repeat;
        return this;
    }

    pause(): this {
        this.state = 'paused';
        S2AnimationManager.removeAnimation(this);
        return this;
    }

    stop(): this {
        this.state = 'stopped';
        S2AnimationManager.removeAnimation(this);
        return this;
    }

    resume(): this {
        this.state = 'playing';
        S2AnimationManager.addAnimation(this);
        return this;
    }

    update(delta: number): this {
        if (this.state !== 'playing') return this;
        const rawElapsed = this.animation.getElapsed() + delta * this.speed;
        const rawDuration = this.playTo - this.playFrom;
        if (rawElapsed >= this.playTo) {
            if (this.repeat) {
                const localElapsed = (rawElapsed - this.playFrom) % rawDuration;
                this.animation.setElapsed(localElapsed + this.playFrom);
            } else {
                this.animation.setElapsed(this.playTo);
                this.stop();
            }
        } else if (rawElapsed < this.playFrom) {
            this.animation.setElapsed(this.playFrom);
            this.stop();
        } else {
            this.animation.setElapsed(rawElapsed);
        }
        S2AnimationManager.requestUpdate(this.animation.getScene());
        return this;
    }
}
