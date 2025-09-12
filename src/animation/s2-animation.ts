import { type S2BaseElement } from '../core/element/s2-element';
import { S2MathUtils } from '../core/math/s2-utils';
import { type S2BaseScene } from '../core/s2-interface';
import { ease, type S2EaseType } from './s2-easing';

interface S2AnimationCallbacks {
    onSetElapsed?: (source: S2Animation, elapsed: number, updateId?: number) => void;
    onApplyInitial?: (source: S2Animation) => void;
    onApplyFinal?: (source: S2Animation) => void;
}

export abstract class S2Animation {
    protected scene: S2BaseScene;
    protected cycleIndex: number = 0;
    protected cycleCount: number = 1;
    protected cycleDuration: number = 1000;
    protected rawCycleAlpha: number = 0;
    protected rawElapsed: number = 0;
    protected rawDuration: number = 1000;
    protected wrapedCycleAlpha: number = 0;
    protected wrapedCycleElapsed: number = 0;
    protected ease: S2EaseType = ease.linear;
    protected reversed: boolean = false;
    protected alternate: boolean = false;
    protected elementsToUpdate: Set<S2BaseElement>;
    protected callbacks: S2AnimationCallbacks = {};

    constructor(scene: S2BaseScene) {
        this.scene = scene;
        this.elementsToUpdate = new Set();
    }

    onSetElapsed(cb: (source: S2Animation, updateId?: number) => void): this {
        this.callbacks.onSetElapsed = cb;
        return this;
    }

    onApplyInitial(cb: (source: S2Animation) => void): this {
        this.callbacks.onApplyInitial = cb;
        return this;
    }

    onApplyFinal(cb: (source: S2Animation) => void): this {
        this.callbacks.onApplyFinal = cb;
        return this;
    }

    addUpdateTarget(target: S2BaseElement): this {
        this.elementsToUpdate.add(target);
        return this;
    }

    updateTargets(updateId?: number): this {
        for (const target of this.elementsToUpdate) {
            target.update(updateId);
        }
        return this;
    }

    applyInitialState(): void {
        this.applyInitialStateImpl();
        if (this.callbacks.onApplyInitial) {
            this.callbacks.onApplyInitial(this);
        }
    }

    applyFinalState(): void {
        this.applyFinalStateImpl();
        if (this.callbacks.onApplyFinal) {
            this.callbacks.onApplyFinal(this);
        }
    }

    setElapsed(elapsed: number, updateId?: number): this {
        this.rawElapsed = elapsed;
        this.cycleIndex = S2MathUtils.clamp(Math.floor(this.rawElapsed / this.cycleDuration), 0, this.cycleCount - 1);

        if (elapsed >= this.cycleCount * this.cycleDuration) {
            this.rawCycleAlpha = 1;
        } else {
            this.rawCycleAlpha = (this.rawElapsed % this.cycleDuration) / this.cycleDuration;
        }
        this.wrapedCycleAlpha = this.reversed ? 1 - this.rawCycleAlpha : this.rawCycleAlpha;
        if (this.alternate && this.cycleIndex % 2 === 1) this.wrapedCycleAlpha = 1 - this.wrapedCycleAlpha;
        this.wrapedCycleAlpha = this.ease(this.wrapedCycleAlpha);
        this.wrapedCycleElapsed = S2MathUtils.clamp(this.wrapedCycleAlpha, 0, 1) * this.cycleDuration;

        this.setElapsedImpl(updateId);
        if (this.callbacks.onSetElapsed) {
            this.callbacks.onSetElapsed(this, elapsed, updateId);
        }
        this.updateTargets(updateId);

        return this;
    }

    getElapsed(): number {
        return this.rawElapsed;
    }

    getDuration(): number {
        return this.rawDuration;
    }

    setCycleCount(cycleCount: number): this {
        this.cycleCount = cycleCount;
        this.updateRawDuration();
        return this;
    }

    setCycleDuration(cycleDuration: number): this {
        this.cycleDuration = cycleDuration;
        this.updateRawDuration();
        return this;
    }

    setEasing(ease: S2EaseType): this {
        this.ease = ease;
        return this;
    }

    setReversed(reversed: boolean = true): this {
        this.reversed = reversed;
        return this;
    }

    setAlternate(alternate: boolean = true): this {
        this.alternate = alternate;
        return this;
    }

    getWrapedProgress(): number {
        let t = this.rawElapsed / this.rawDuration;
        if (this.reversed) t = 1 - t;
        return this.ease(t);
    }

    getCycleDuration(): number {
        return this.cycleDuration;
    }

    getCycleIndex(): number {
        return this.cycleIndex;
    }

    getCycleCount(): number {
        return this.cycleCount;
    }

    protected applyInitialStateImpl(): void {}
    protected applyFinalStateImpl(): void {}
    protected setElapsedImpl(updateId?: number): void {
        void updateId;
    }

    protected updateRawDuration(): void {
        this.rawDuration = this.cycleDuration * (this.cycleCount < 0 ? 1 : this.cycleCount);
    }

    abstract refreshState(): this;
}
