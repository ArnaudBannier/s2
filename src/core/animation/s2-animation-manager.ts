import { S2Timer } from './s2-timer';
import { S2BaseAnimation } from './s2-base-animation';

export class S2PlayableAnimation {
    protected manager: S2AnimationManager;
    protected animation: S2BaseAnimation;
    protected state: 'playing' | 'paused' | 'stopped';
    protected repeat: boolean = false;
    protected speed: number = 1;
    protected playFrom: number;
    protected playTo: number;

    constructor(animation: S2BaseAnimation) {
        this.animation = animation;
        this.manager = S2AnimationManager.getInstance();
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
        this.manager.addAnimation(this);
        this.repeat = repeat;
        return this;
    }

    pause(): this {
        this.state = 'paused';
        this.manager.removeAnimation(this);
        return this;
    }

    stop(): this {
        this.state = 'stopped';
        this.manager.removeAnimation(this);
        return this;
    }

    resume(): this {
        if (this.state === 'paused') {
            this.state = 'playing';
            this.manager.addAnimation(this);
        } else if (this.state === 'stopped') {
            this.play();
        }
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
        this.animation.getScene().update();
        return this;
    }
}

export class S2AnimationManager {
    protected static _instance: S2AnimationManager | null = null;
    protected timer: S2Timer;
    protected activeAnimations: Set<S2PlayableAnimation> = new Set();

    private constructor() {
        this.timer = new S2Timer();
        this.update = this.update.bind(this);
    }

    private firstFrame(timestamp: number): void {
        this.timer.start(timestamp);
    }

    static getInstance(): S2AnimationManager {
        if (!S2AnimationManager._instance) {
            const animManager = new S2AnimationManager();
            requestAnimationFrame(animManager.firstFrame.bind(animManager));
            requestAnimationFrame(animManager.update.bind(animManager));
            S2AnimationManager._instance = animManager;
        }

        return S2AnimationManager._instance;
    }

    protected update(timestamp: number): void {
        this.timer.update(timestamp);
        const delta = this.timer.getDelta();

        for (const anim of this.activeAnimations) {
            anim.update(delta);
        }
        requestAnimationFrame(this.update);
    }

    addAnimation(animation: S2PlayableAnimation): this {
        this.activeAnimations.add(animation);
        return this;
    }

    removeAnimation(animation: S2PlayableAnimation): this {
        this.activeAnimations.delete(animation);
        return this;
    }
}
