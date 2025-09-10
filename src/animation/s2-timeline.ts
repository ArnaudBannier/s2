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

export type S2TimelinePosition = 'absolute' | 'previous-start' | 'previous-end';
class S2TimelinePart {
    public animation: S2Animation;
    public position: S2TimelinePosition;
    public offset: number;
    public start: number;
    public end: number;

    constructor(animation: S2Animation, position: S2TimelinePosition, offset: number) {
        this.animation = animation;
        this.start = 0;
        this.end = 0 + animation.getDuration();
        this.position = position;
        this.offset = offset;
    }

    update(prevPart: S2TimelinePart | null): void {
        this.start = this.offset;
        if (prevPart !== null) {
            switch (this.position) {
                case 'absolute':
                    break;
                case 'previous-start':
                    if (prevPart) {
                        this.start += prevPart.start;
                    }
                    break;
                case 'previous-end':
                    if (prevPart) {
                        this.start += prevPart.start + prevPart.animation.getDuration();
                    }
                    break;
            }
        }
        this.start = Math.max(this.start, 0);
        this.end = this.start + this.animation.getDuration();
    }
}

// TODO :
// - S2AnimationGroup ?
// - update pour chaque animation ?
// - setCycleDuration qui n'est pas valide sur une timeline pour l'instant

export class S2Timeline extends S2Animation {
    protected parts: S2TimelinePart[] = [];
    protected sortedStart: S2TimelinePart[] = [];
    protected sortedEnd: S2TimelinePart[] = [];

    constructor(scene: S2BaseScene) {
        super(scene);
        this.cycleDuration = 0;
    }

    update(): this {
        let prevPart: S2TimelinePart | null = null;
        for (let i = 0; i < this.parts.length; i++) {
            const part = this.parts[i];
            part.update(prevPart);
            prevPart = part;
        }
        this.sortedStart.sort((a, b) => a.start - b.start);
        this.sortedEnd.sort((a, b) => a.end - b.end);
        this.cycleDuration = this.sortedEnd[this.sortedEnd.length - 1].end;
        this.updateRawDuration();
        return this;
    }

    updateTargets(updateId?: number): this {
        super.updateTargets(updateId);
        for (const part of this.parts) {
            part.animation.updateTargets(updateId);
        }
        return this;
    }

    addAnimation(animation: S2Animation, position: S2TimelinePosition = 'previous-end', offset: number = 0): this {
        const part = new S2TimelinePart(animation, position, offset);
        this.parts.push(part);
        this.sortedStart.push(part);
        this.sortedEnd.push(part);
        this.update();
        return this;
    }

    protected applyInitialStateImpl(): void {
        for (let i = this.sortedStart.length - 1; i >= 0; i--) {
            this.sortedStart[i].animation.applyInitialState();
        }
    }

    protected applyFinalStateImpl(): void {
        for (let i = 0; i < this.sortedEnd.length; i++) {
            this.sortedEnd[i].animation.applyFinalState();
        }
    }

    protected setElapsedImpl(updateId?: number): void {
        for (let i = this.sortedStart.length - 1; i >= 0; i--) {
            const part = this.sortedStart[i];
            if (part.start >= this.wrapedCycleElapsed) {
                part.animation.applyInitialState();
            } else break;
        }
        for (let i = 0; i < this.sortedEnd.length; i++) {
            const part = this.sortedEnd[i];
            if (part.end <= this.wrapedCycleElapsed) {
                part.animation.applyFinalState();
            } else break;
        }

        for (const part of this.parts) {
            const localElapsed = this.wrapedCycleElapsed - part.start;
            if (localElapsed >= 0 && localElapsed <= part.animation.getDuration()) {
                part.animation.setElapsed(localElapsed, updateId);
            } else {
                part.animation.updateTargets(updateId);
            }
        }
    }

    // Penser à setCycleDuration !
}
