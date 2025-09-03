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
    protected animations: S2AnimationNEW[] = [];
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

    protected onBegin(): void {
        for (let i = this.sortedEnd.length - 1; i >= 0; i--) {
            this.sortedEnd[i].animation.begin();
        }
    }

    protected onLoop(): void {
        for (let i = this.sortedEnd.length - 1; i >= 0; i--) {
            this.sortedEnd[i].animation.begin();
        }
        for (const part of this.parts) {
            part.animation.play();
        }
    }

    play(): void {
        super.play();
        for (const part of this.parts) {
            part.animation.play();
        }
    }

    // Penser à setLoopDuration !

    update(dt: number): void {
        super.update(dt);
        for (let i = 0; i < this.sortedStart.length; i++) {
            const part = this.sortedStart[i];
            if (this.loopAccu >= part.start) {
                part.animation.update(dt);
            }
        }
    }
}
