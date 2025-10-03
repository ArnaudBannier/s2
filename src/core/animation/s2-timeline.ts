import { S2BaseScene } from '../scene/s2-base-scene';
import { S2BaseAnimation, type S2AnimProperty } from './s2-base-animation';

export type S2TimelinePosition = 'absolute' | 'previous-start' | 'previous-end';
class S2TimelinePart {
    protected animation: S2BaseAnimation | null;
    protected position: S2TimelinePosition;
    protected offset: number;
    protected start: number;
    protected end: number;

    constructor(position: S2TimelinePosition, offset: number) {
        this.position = position;
        this.offset = offset;
        this.animation = null;
        this.start = 0;
        this.end = 0;
    }

    getStart(): number {
        return this.start;
    }

    getEnd(): number {
        return this.end;
    }

    setAnimation(animation: S2BaseAnimation | null): void {
        this.animation = animation;
    }

    updateRange(prevPart: S2TimelinePart | null): void {
        const duration = this.animation ? this.animation.getDuration() : 0;
        if (prevPart !== null) {
            switch (this.position) {
                default:
                case 'absolute':
                    this.start = this.offset;
                    break;
                case 'previous-start':
                    this.start = prevPart.start + this.offset;
                    break;
                case 'previous-end':
                    this.start = prevPart.end + this.offset;
                    break;
            }
        }
        this.start = Math.max(this.start, 0);
        this.end = this.start + duration;
    }

    setElapsedProperty(property: S2AnimProperty, elapsed: number): void {
        if (this.animation) {
            if (elapsed <= this.start) {
                this.animation.setElapsedProperty(property, 0);
            } else if (elapsed >= this.end) {
                this.animation.setElapsedProperty(property, this.animation.getDuration());
            } else {
                const localElapsed = elapsed - this.start;
                this.animation.setElapsedProperty(property, localElapsed);
            }
        } else {
            console.warn('S2TimelinePart: No animation assigned.');
        }
    }
}

class S2TimelinePropertyTrack {
    public property: S2AnimProperty;
    public sortedParts: S2TimelinePart[] = [];

    constructor(property: S2AnimProperty) {
        this.property = property;
    }

    addPart(part: S2TimelinePart): void {
        this.sortedParts.push(part);
        this.sortedParts.sort((a, b) => a.getStart() - b.getStart());
        for (let i = 0; i < this.sortedParts.length - 1; i++) {
            if (this.sortedParts[i].getEnd() > this.sortedParts[i + 1].getStart()) {
                console.warn(
                    'S2Timeline: Overlapping animations on the same target are not supported.',
                    this.property,
                    this.sortedParts[i],
                    this.sortedParts[i + 1],
                );
            }
        }
    }

    private getActivePart(elapsed: number): S2TimelinePart | null {
        if (this.sortedParts.length === 0) {
            console.warn('S2TimelineTargetParts: No parts available.');
            return null;
        }
        if (elapsed <= this.sortedParts[0].getStart()) {
            return this.sortedParts[0];
        }
        for (let i = 0; i < this.sortedParts.length - 1; i++) {
            if (elapsed < this.sortedParts[i + 1].getStart()) {
                return this.sortedParts[i];
            }
        }
        return this.sortedParts[this.sortedParts.length - 1];
    }

    setElapsed(elapsed: number): void {
        const part = this.getActivePart(elapsed);
        part?.setElapsedProperty(this.property, elapsed);
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
        const currPart = new S2TimelinePart(position, offset);
        currPart.setAnimation(animation);
        currPart.updateRange(prevPart);
        this.cycleDuration = Math.max(this.cycleDuration, currPart.getEnd());
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
