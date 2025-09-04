import type { S2BaseScene } from '../core/s2-interface';
import { S2Animation } from './s2-animation';

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
    public animation: S2Animation;
    public start: number;
    public end: number;

    constructor(animation: S2Animation, start: number = 0) {
        this.animation = animation;
        this.start = start;
        this.end = start + animation.getDuration();
    }
}

type S2TimelinePositionTypes = 'absolute' | 'previous-start' | 'previous-end';
export class S2Timeline extends S2Animation {
    protected parts: S2TimelinePart[] = [];
    protected sortedStart: S2TimelinePart[] = [];
    protected sortedEnd: S2TimelinePart[] = [];

    constructor(scene: S2BaseScene) {
        super(scene);
    }

    addAnimation(animation: S2Animation, position: S2TimelinePositionTypes = 'previous-end', offset: number = 0): this {
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
                    start += previousPart.start + previousPart.animation.getDuration();
                }
                break;
        }
        start = Math.max(0, start);
        const end = start + animation.getDuration();
        const part = new S2TimelinePart(animation, start);
        this.cycleDuration = Math.max(this.cycleDuration, end);
        this.parts.push(part);
        this.sortedStart.push(part);
        this.sortedEnd.push(part);
        this.sortedStart.sort((a, b) => a.start - b.start);
        this.sortedEnd.sort((a, b) => a.end - b.end);
        return this;
    }

    setElapsed(elapsed: number, updateId?: number): this {
        super.setElapsed(elapsed, updateId);
        for (let i = this.sortedStart.length - 1; i >= 0; i--) {
            const part = this.sortedStart[i];
            if (part.start < this.wrapedCycleElapsed) break;
            part.animation.applyInitialState();
        }
        for (let i = 0; i < this.sortedEnd.length; i++) {
            const part = this.sortedEnd[i];
            if (part.end > this.wrapedCycleElapsed) break;
            part.animation.applyFinalState();
        }

        for (const part of this.parts) {
            const localElapsed = this.wrapedCycleElapsed - part.start;
            if (localElapsed >= 0 && localElapsed <= part.animation.getDuration()) {
                part.animation.setElapsed(localElapsed, updateId);
            } else {
                part.animation.updateTargets(updateId);
            }
        }

        return this;
    }

    // Penser à setCycleDuration !
}
