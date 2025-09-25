import { S2BaseScene } from '../s2-base-scene';
import { S2BaseAnimation, type S2AnimProperty } from './s2-base-animation';

export type S2TimelinePosition = 'absolute' | 'previous-start' | 'previous-end';
class S2TimelinePart {
    public animation: S2BaseAnimation;
    public position: S2TimelinePosition;
    public offset: number;
    public start: number;
    public end: number;

    constructor(animation: S2BaseAnimation, position: S2TimelinePosition, offset: number) {
        this.animation = animation;
        this.start = 0;
        this.end = 0 + animation.getDuration();
        this.position = position;
        this.offset = offset;
    }

    updateRange(prevPart: S2TimelinePart | null): void {
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

class S2TimelinePropertyTrack {
    public target: S2AnimProperty;
    public sortedParts: S2TimelinePart[] = [];

    constructor(target: S2AnimProperty) {
        this.target = target;
    }

    refreshState(): void {
        this.sortedParts.sort((a, b) => a.start - b.start);
    }

    addPart(part: S2TimelinePart): void {
        this.sortedParts.push(part);
        this.sortedParts.sort((a, b) => a.start - b.start);
        for (let i = 0; i < this.sortedParts.length - 1; i++) {
            if (this.sortedParts[i].end > this.sortedParts[i + 1].start) {
                console.warn(
                    'S2Timeline: Overlapping animations on the same target are not supported.',
                    this.target,
                    this.sortedParts[i],
                    this.sortedParts[i + 1],
                );
            }
        }
    }

    getActivePart(elapsed: number): S2TimelinePart {
        if (this.sortedParts.length === 0) {
            throw new Error('S2TimelineTargetParts: No parts available.');
        }
        for (let i = 0; i < this.sortedParts.length - 1; i++) {
            if (elapsed <= this.sortedParts[i].start) {
                return this.sortedParts[i];
            }
            if (elapsed <= this.sortedParts[i].end) {
                return this.sortedParts[i];
            }
            if (elapsed < this.sortedParts[i + 1].start) {
                return this.sortedParts[i];
            }
        }
        return this.sortedParts[this.sortedParts.length - 1];
    }
}

export class S2Timeline extends S2BaseAnimation {
    protected parts: S2TimelinePart[] = [];
    protected targetPartsMap: Map<S2AnimProperty, S2TimelinePropertyTrack>;

    constructor(scene: S2BaseScene) {
        super(scene);
        this.cycleDuration = 0;
        this.targetPartsMap = new Map();
    }

    addAnimation(animation: S2BaseAnimation, position: S2TimelinePosition = 'previous-end', offset: number = 0): this {
        const part = new S2TimelinePart(animation, position, offset);
        part.updateRange(this.parts.length > 0 ? this.parts[this.parts.length - 1] : null);
        this.cycleDuration = Math.max(this.cycleDuration, part.end);
        this.updateRawDuration();

        const targets = animation.getProperties();
        for (const target of targets) {
            this.properties.add(target);
            let targetParts = this.targetPartsMap.get(target);
            if (targetParts === undefined) {
                targetParts = new S2TimelinePropertyTrack(target);
                this.targetPartsMap.set(target, targetParts);
            }
            targetParts.addPart(part);
        }

        this.parts.push(part);
        return this;
    }

    protected setElapsedPropertyImpl(target: S2AnimProperty): void {
        const targetParts = this.targetPartsMap.get(target);
        if (targetParts === undefined) {
            return;
        }

        const elapsed = this.wrapedCycleElapsed;
        const part = targetParts.getActivePart(this.wrapedCycleElapsed);
        if (elapsed <= part.start) {
            part.animation.setElapsedProperty(target, 0);
            //part.animation.applyInitialState();
        } else if (elapsed >= part.end) {
            part.animation.setElapsedProperty(target, part.animation.getDuration());
            //part.animation.applyFinalState();
        } else {
            const localElapsed = elapsed - part.start;
            part.animation.setElapsedProperty(target, localElapsed);
        }
    }
}
