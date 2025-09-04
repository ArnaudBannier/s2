import type { S2BaseScene } from '../core/s2-interface';
import { S2AnimationNEW } from './s2-animation';

//             |     |
// A - < # > . . < > . < # > . .
// B - . . < # # > . . < > . . .
// C - . < > . . . < # # > . . .
// D - . . . . . < # # # # # # >
// Commencer par tous les starts des animation suivantes dans l'ordre de beginTime décroissant
// Continuer par tous les complete des animation précédentes dans l'ordre de endTime croissant
// Finir par les animations en cours

// Faut-il sauvegarder les cibles des animations ?

class S2TimelinePart {
    public animation: S2AnimationNEW;
    public start: number;
    public end: number;

    constructor(animation: S2AnimationNEW, start: number = 0) {
        this.animation = animation;
        this.start = start;
        this.end = start + animation.getTotalDuration();
    }
}

type S2TimelinePositionTypes = 'absolute' | 'previous-start' | 'previous-end';
export class S2Timeline extends S2AnimationNEW {
    protected parts: S2TimelinePart[] = [];
    protected sortedStart: S2TimelinePart[] = [];
    protected sortedEnd: S2TimelinePart[] = [];

    constructor(scene: S2BaseScene) {
        super(scene);
    }

    addAnimation(
        animation: S2AnimationNEW,
        position: S2TimelinePositionTypes = 'previous-end',
        offset: number = 0,
    ): this {
        const previousPart = this.parts.length > 0 ? this.parts[this.parts.length - 1] : null;
        let start = offset;
        switch (position) {
            case 'absolute':
                break;
            case 'previous-start':
                if (previousPart) {
                    start += previousPart.start;
                }
                break;
            case 'previous-end':
                if (previousPart) {
                    start += previousPart.start + previousPart.animation.getTotalDuration();
                }
                break;
        }
        start = Math.max(0, start);
        const end = start + animation.getTotalDuration();
        const part = new S2TimelinePart(animation, start);
        this.loopDuration = Math.max(this.loopDuration, end);
        this.parts.push(part);
        this.sortedStart.push(part);
        this.sortedEnd.push(part);
        this.sortedStart.sort((a, b) => a.start - b.start);
        this.sortedEnd.sort((a, b) => a.end - b.end);
        return this;
    }

    // protected onBegin(): void {
    //     for (let i = this.sortedEnd.length - 1; i >= 0; i--) {
    //         this.sortedEnd[i].animation.begin();
    //     }
    // }

    // protected onLoop(): void {
    //     for (let i = this.sortedEnd.length - 1; i >= 0; i--) {
    //         this.sortedEnd[i].animation.begin();
    //     }
    //     for (const part of this.parts) {
    //         part.animation.play();
    //     }
    // }

    play(): void {
        // super.play();
        // for (const part of this.parts) {
        //     part.animation.play();
        // }
    }
    setRawElapsed(elapsed: number, updateId?: number): this {
        super.setRawElapsed(elapsed, updateId);
        //const isLoopReversed = this.alternate && this.loopIndex % 2 === 1;
        for (let i = this.sortedStart.length - 1; i >= 0; i--) {
            const part = this.sortedStart[i];
            if (part.start < this.currWrapedLoopElapsed) break;
            part.animation.applyInitialState();
        }
        for (let i = 0; i < this.sortedEnd.length; i++) {
            const part = this.sortedEnd[i];
            if (part.end > this.currWrapedLoopElapsed) break;
            part.animation.applyFinalState();
        }

        for (const part of this.parts) {
            console.log('New part =========================================');
            const localElapsed = this.currWrapedLoopElapsed - part.start;
            console.log('Local in timeline:', localElapsed);
            if (localElapsed >= 0 && localElapsed <= part.animation.getTotalDuration()) {
                console.log('Calling setRawElapsed on part: ----------------------------------');
                part.animation.setRawElapsed(localElapsed, updateId);
            } else {
                part.animation.updateTargets(updateId);
            }
        }

        return this;
    }

    // Penser à setLoopDuration !

    update(dt: number): void {
        // super.update(dt);
        // for (let i = 0; i < this.sortedStart.length; i++) {
        //     const part = this.sortedStart[i];
        //     const localElapsed = this.currWrapedLoopElapsed - part.start;
        //     if (this.currWrapedLoopElapsed > 0 && localElapsed < part.animation.getTotalDuration()) {
        //         part.animation.setRawElapsed(localElapsed);
        //     }
        // }
    }
}
