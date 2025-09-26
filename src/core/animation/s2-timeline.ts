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
    public property: S2AnimProperty;
    public sortedParts: S2TimelinePart[] = [];

    constructor(property: S2AnimProperty) {
        this.property = property;
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
                    this.property,
                    this.sortedParts[i],
                    this.sortedParts[i + 1],
                );
            }
        }
    }

    private getActivePart(elapsed: number): S2TimelinePart {
        if (this.sortedParts.length === 0) {
            throw new Error('S2TimelineTargetParts: No parts available.');
        }
        if (elapsed <= this.sortedParts[0].start) {
            return this.sortedParts[0];
        }
        for (let i = 0; i < this.sortedParts.length - 1; i++) {
            if (elapsed <= this.sortedParts[i].end || elapsed < this.sortedParts[i + 1].start) {
                return this.sortedParts[i];
            }
        }
        return this.sortedParts[this.sortedParts.length - 1];
    }

    setElapsed(elapsed: number): void {
        const part = this.getActivePart(elapsed);
        const animation = part.animation;
        if (elapsed <= part.start) {
            animation.setElapsedProperty(this.property, 0);
        } else if (elapsed >= part.end) {
            animation.setElapsedProperty(this.property, animation.getDuration());
        } else {
            const localElapsed = elapsed - part.start;
            animation.setElapsedProperty(this.property, localElapsed);
        }
    }
}

export class S2Timeline extends S2BaseAnimation {
    protected parts: S2TimelinePart[];
    protected propertyTrackMap: Map<S2AnimProperty, S2TimelinePropertyTrack>;

    constructor(scene: S2BaseScene) {
        super(scene);
        this.cycleDuration = 0;
        this.parts = [];
        this.propertyTrackMap = new Map();
    }

    addAnimation(animation: S2BaseAnimation, position: S2TimelinePosition = 'previous-end', offset: number = 0): this {
        const prevPart = this.parts.length > 0 ? this.parts[this.parts.length - 1] : null;
        const currPart = new S2TimelinePart(animation, position, offset);
        currPart.updateRange(prevPart);
        this.cycleDuration = Math.max(this.cycleDuration, currPart.end);
        this.updateRawDuration();

        const properties = animation.getProperties();
        for (const property of properties) {
            this.properties.add(property);
            let track = this.propertyTrackMap.get(property);
            if (track === undefined) {
                track = new S2TimelinePropertyTrack(property);
                this.propertyTrackMap.set(property, track);
            }
            track.addPart(currPart);
        }

        this.parts.push(currPart);
        return this;
    }

    protected setElapsedPropertyImpl(target: S2AnimProperty): void {
        const propertyTrack = this.propertyTrackMap.get(target);
        if (propertyTrack === undefined) {
            return;
        }
        propertyTrack.setElapsed(this.wrapedCycleElapsed);
    }
}
