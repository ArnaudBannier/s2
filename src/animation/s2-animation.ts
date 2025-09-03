import { type S2BaseElement } from '../core/element/s2-element';
import { S2MathUtils } from '../core/math/s2-utils';
import { type S2BaseScene } from '../core/s2-interface';
import { easeLinear, type S2Easing } from './s2-easing';

// Créer deux catégories -> timeAnim eventAnim ?
// Comment gérer les smoothDamped ?

// Créer une S2ActionAnim qui effectue des changement immédiats
// => Les callbacks onStart peuvent faire la même chose. beforeStart, afterComplete ?

export abstract class S2AnimationNEW {
    protected scene: S2BaseScene;
    protected loopAccu: number = 0;
    protected loopIndex: number = 0;
    protected loopCount: number = 1;
    protected loopDuration: number = 1000;
    protected speed: number = 1;
    protected ease: S2Easing = easeLinear;
    protected currWrapedElapsed: number = 0;
    protected prevWrapedElapsed: number = 0;
    protected currRawElapsed: number = 0;
    protected prevRawElapsed: number = 0;
    protected rawDuration: number = 1000;

    protected reversed: boolean = false;
    protected alternate: boolean = false;
    protected paused: boolean = false;
    protected delay: number = 0;

    protected updateTargets: Set<S2BaseElement>;

    addUpdateTarget(target: S2BaseElement): this {
        this.updateTargets.add(target);
        return this;
    }

    constructor(scene: S2BaseScene) {
        this.scene = scene;
        this.updateTargets = new Set();
    }

    begin(): void {
        this.loopAccu = 0;
        this.loopIndex = 0;
        this.onBegin();
    }

    complete(): void {
        this.loopAccu = this.loopDuration;
        this.loopIndex = this.loopCount;
        this.onComplete();
    }
    protected onLoopForward(cycle: number): void {}
    protected onLoopBackward(cycle: number): void {}

    setRawElapsed(elapsed: number): this {
        this.prevRawElapsed = this.currRawElapsed;
        this.prevWrapedElapsed = this.currWrapedElapsed;

        this.currRawElapsed = elapsed;
        let t = (this.currRawElapsed % this.loopDuration) / this.loopDuration;
        if (this.reversed) t = 1 - t;
        if (this.alternate && this.loopIndex % 2 === 1) t = 1 - t;
        this.currWrapedElapsed = this.ease(t) * this.loopDuration;

        let prevCycle = Math.floor(this.prevRawElapsed / this.loopDuration);
        let currCycle = Math.floor(this.currRawElapsed / this.loopDuration);
        if (currCycle > prevCycle) {
            for (let i = prevCycle + 1; i <= currCycle; i++) {
                this.onLoopForward(i);
            }
        }
        if (currCycle < prevCycle) {
            for (let i = prevCycle; i > currCycle; i--) {
                this.onLoopBackward(i);
            }
        }

        if (this.currRawElapsed > this.prevRawElapsed && this.currRawElapsed > this.rawDuration) {
            this.onComplete();
        } else if (this.currRawElapsed < this.prevRawElapsed && this.currRawElapsed < 0) {
            this.onBegin();
        }

        // A voir
        this.currWrapedElapsed = S2MathUtils.clamp(this.currWrapedElapsed, 0, this.loopDuration);

        return this;
    }

    update(dt: number): void {
        if (this.paused) return;

        const nextAccu = this.loopAccu + this.speed * dt;
        if (this.loopAccu <= 0 && nextAccu > 0) {
            this.loopAccu = 0;
            this.onBegin();
        }
        this.loopAccu = nextAccu;

        while (this.loopAccu >= this.loopDuration) {
            this.onLoop();
            this.loopAccu -= this.loopDuration;
            this.loopIndex++;
            if (this.loopCount > 0 && this.loopIndex >= this.loopCount) {
                this.paused = true;
                this.loopAccu = this.loopDuration;
                this.onComplete();
                break;
            }
        }
        this.onUpdate();
        for (const target of this.updateTargets) {
            target.update();
        }
    }

    pause(): void {
        this.paused = true;
        this.onPause();
    }

    play(): void {
        this.loopAccu = -this.delay;
        this.loopIndex = 0;
        this.paused = false;
    }

    resume(): void {
        this.paused = false;
    }

    protected onBegin(): void {}
    protected onComplete(): void {}
    protected onLoop(): void {}
    protected onUpdate(): void {}
    protected onPause(): void {}

    setLoopCount(loopCount: number): this {
        this.loopCount = loopCount;
        return this;
    }

    setLoopDuration(loopDuration: number): this {
        this.loopDuration = loopDuration;
        return this;
    }

    setLoopProgression(t: number, loopIndex?: number): this {
        this.loopAccu = t * this.loopDuration;
        if (loopIndex !== undefined) this.loopIndex = loopIndex;
        return this;
    }

    setEasing(ease: S2Easing): this {
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
        let t = this.currRawElapsed / this.rawDuration;
        if (this.reversed) t = 1 - t;
        return this.ease(t);
    }

    getLoopProgression(): number {
        let t = this.loopAccu / this.loopDuration;
        if (this.alternate) t = t < 0.5 ? 2 * t : 2 - 2 * t;
        if (this.reversed) t = 1 - t;
        return this.ease(t);
    }

    getLoopDuration(): number {
        return this.loopDuration;
    }

    getLoopIndex(): number {
        return this.loopIndex;
    }

    getLoopCount(): number {
        return this.loopCount;
    }

    getTotalDuration(): number {
        const loopCount = this.loopCount < 0 ? 1 : this.loopCount;
        return (loopCount * this.loopDuration + this.delay) / this.speed;
    }
}
