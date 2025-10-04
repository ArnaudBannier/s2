import { S2BaseScene } from '../scene/s2-base-scene';
import { S2BaseAnimation, type S2AnimProperty } from './s2-base-animation';
import type { S2TimelineTrigger } from './s2-timeline-trigger';

export type S2TimelinePosition = 'absolute' | 'previous-start' | 'previous-end';

class S2TimelinePart {
    protected animation: S2BaseAnimation | null;
    protected trigger: S2TimelineTrigger | null;
    protected position: S2TimelinePosition;
    protected offset: number;
    protected start: number;
    protected end: number;

    constructor(position: S2TimelinePosition, offset: number) {
        this.position = position;
        this.offset = offset;
        this.animation = null;
        this.trigger = null;
        this.start = 0;
        this.end = 0;
    }

    getStart(): number {
        return this.start;
    }

    getEnd(): number {
        return this.end;
    }

    getAnimation(): S2BaseAnimation | null {
        return this.animation;
    }

    getTrigger(): S2TimelineTrigger | null {
        return this.trigger;
    }

    setAnimation(animation: S2BaseAnimation | null): void {
        this.animation = animation;
    }

    setTrigger(trigger: S2TimelineTrigger): void {
        this.trigger = trigger;
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
        }
        if (this.trigger && elapsed >= this.start) this.trigger.onTrigger();
        if (!this.animation && !this.trigger) {
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
        this.validateParts();
    }

    protected validateParts(): void {
        const epsilon = 1e-6;
        for (let i = 0; i < this.sortedParts.length - 1; i++) {
            if (this.sortedParts[i].getEnd() > this.sortedParts[i + 1].getStart() + epsilon) {
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
    protected labelTimeMap: Map<string, number>;

    constructor(scene: S2BaseScene) {
        super(scene);
        this.cycleDuration = 0;
        this.parts = [];
        this.propertyTrackMap = new Map();
        this.labelTimeMap = new Map();
    }

    addLabel(name: string, time: number): this {
        this.labelTimeMap.set(name, time);
        return this;
    }

    addLabelAtCurrentTime(name: string): this {
        this.labelTimeMap.set(name, this.cycleDuration);
        return this;
    }

    addAnimationAtLabel(animation: S2BaseAnimation, label: string, offset: number = 0): this {
        let time = 0;
        const labelTime = this.labelTimeMap.get(label);
        if (labelTime !== undefined) {
            time = labelTime;
        } else if (this.parts.length > 0) {
            const prevPart = this.parts[this.parts.length - 1];
            if (label === 'previous-end') {
                time = prevPart.getEnd();
            } else if (label === 'previous-start') {
                time = prevPart.getStart();
            }
        }
        time = Math.max(0, time + offset);
        void animation; // to avoid unused variable warning

        // TODO

        return this;
    }

    addAnimation(animation: S2BaseAnimation, position: S2TimelinePosition = 'previous-end', offset: number = 0): this {
        const part = new S2TimelinePart(position, offset);
        part.setAnimation(animation);
        this.addPart(part);
        return this;
    }

    addTrigger(trigger: S2TimelineTrigger, position: S2TimelinePosition = 'previous-end', offset: number = 0): this {
        const part = new S2TimelinePart(position, offset);
        part.setTrigger(trigger);
        this.addPart(part);
        return this;
    }

    protected addPart(part: S2TimelinePart): void {
        const prevPart = this.parts.length > 0 ? this.parts[this.parts.length - 1] : null;
        part.updateRange(prevPart);
        this.cycleDuration = Math.max(this.cycleDuration, part.getEnd());
        this.updateRawDuration();

        let properties: Set<S2AnimProperty> | null = null;
        const animation = part.getAnimation();
        const trigger = part.getTrigger();
        if (animation) {
            properties = animation.getProperties();
        } else if (trigger) {
            properties = new Set([trigger.getProperty()]);
        } else {
            console.warn('S2Timeline: No animation or trigger assigned.');
            properties = new Set();
        }

        for (const property of properties) {
            this.properties.add(property);
            const track = this.createOrGetPropertyTrack(property);
            track.addPart(part);
        }
        this.parts.push(part);
    }

    protected createOrGetPropertyTrack(property: S2AnimProperty): S2TimelinePropertyTrack {
        let track = this.propertyTrackMap.get(property);
        if (track === undefined) {
            track = new S2TimelinePropertyTrack(property);
            this.propertyTrackMap.set(property, track);
        }
        return track;
    }

    protected setElapsedPropertyImpl(target: S2AnimProperty): void {
        const propertyTrack = this.propertyTrackMap.get(target);
        if (propertyTrack === undefined) {
            return;
        }
        propertyTrack.setElapsed(this.wrapedCycleElapsed);
    }
}
