import type { S2BaseElement } from '../element/base/s2-element';
import { S2BaseScene } from '../scene/s2-base-scene';
import { S2BaseAnimation, type S2AnimProperty } from './s2-base-animation';
import { S2TriggerBoolean, type S2TimelineTrigger } from './s2-timeline-trigger';

// export type S2TimelinePosition = 'absolute' | 'previous-start' | 'previous-end';
// export type S2TimelineLabel = 'timeline-start' | 'timeline-end' | 'absolute' | 'previous-start' | 'previous-end';

class S2TimelinePart {
    protected animation: S2BaseAnimation | null;
    protected trigger: S2TimelineTrigger | null;
    protected start: number;
    protected end: number;

    constructor(start: number) {
        this.start = start;
        this.end = start;
        this.animation = null;
        this.trigger = null;
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
        this.updateEnd();
    }

    setTrigger(trigger: S2TimelineTrigger): void {
        this.trigger = trigger;
        this.updateEnd();
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

    protected updateEnd(): void {
        const duration = this.animation ? this.animation.getDuration() : 0;
        this.end = this.start + duration;
    }
}

class S2TimelinePropertyTrack {
    public property: S2AnimProperty;
    public sortedParts: S2TimelinePart[] = [];

    constructor(property: S2AnimProperty) {
        this.property = property;
    }

    getPartCount(): number {
        return this.sortedParts.length;
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
    protected labelToTime: Map<string, number>;
    protected labelId: number;

    static readonly reservedLabelNames: readonly string[] = [
        'timeline-start',
        'timeline-end',
        'absolute',
        'previous-start',
        'previous-end',
    ] as const;

    constructor(scene: S2BaseScene) {
        super(scene);
        this.cycleDuration = 0;
        this.parts = [];
        this.propertyTrackMap = new Map();
        this.labelToTime = new Map();
        this.labelId = 0;
    }

    addLabel(name: string, time: number): this {
        if (S2Timeline.reservedLabelNames.includes(name)) {
            console.warn(`Label name '${name}' is reserved and cannot be used.`);
            return this;
        }
        if (this.labelToTime.has(name)) {
            console.warn(`Label '${name}' already exists. Overwriting.`);
        }
        this.labelToTime.set(name, time);
        return this;
    }

    addLabelAtCurrentTime(name: string): this {
        this.addLabel(name, this.cycleDuration);
        return this;
    }

    createLabelAtCurrentTime(): string {
        const label = `@-auto-label-${this.labelId++}`;
        this.addLabelAtCurrentTime(label);
        return label;
    }

    getLabelTime(label: string, offset: number = 0): number {
        switch (label) {
            case 'timeline-end':
                return this.cycleDuration + offset;
            case 'absolute':
            case 'timeline-start':
                return offset;
            case 'previous-end':
                if (this.parts.length > 0) {
                    return this.parts[this.parts.length - 1].getEnd() + offset;
                } else {
                    return offset;
                }
            case 'previous-start':
                if (this.parts.length > 0) {
                    return this.parts[this.parts.length - 1].getStart() + offset;
                } else {
                    return offset;
                }
        }
        const labelTime = this.labelToTime.get(label);
        if (labelTime !== undefined) return labelTime + offset;
        console.warn(`Label '${label}' not found. Using offset as absolute time.`);
        return offset;
    }

    addAnimation(animation: S2BaseAnimation, label: string = 'timeline-end', offset: number = 0): this {
        const start = this.getLabelTime(label, offset);
        const part = new S2TimelinePart(start);
        part.setAnimation(animation);
        this.addPart(part);
        return this;
    }

    addTrigger(trigger: S2TimelineTrigger, label: string = 'timeline-end', offset: number = 0): this {
        const start = this.getLabelTime(label, offset);
        const part = new S2TimelinePart(start);
        part.setTrigger(trigger);
        this.addPart(part);
        return this;
    }

    enableElement(
        element: S2BaseElement,
        isEnabled: boolean,
        label: string = 'timeline-end',
        offset: number = 0,
    ): this {
        const time = this.getLabelTime(label, offset);
        const property = element.data.isEnabled;
        if (this.propertyTrackMap.has(property)) {
            this.addTrigger(new S2TriggerBoolean(property, isEnabled), 'absolute', time);
        } else {
            if (time <= 0) {
                this.addTrigger(new S2TriggerBoolean(property, isEnabled), 'timeline-start');
            } else {
                this.addTrigger(new S2TriggerBoolean(property, !isEnabled), 'timeline-start');
                this.addTrigger(new S2TriggerBoolean(property, isEnabled), 'absolute', time);
            }
        }
        return this;
    }

    protected addPart(part: S2TimelinePart): void {
        this.cycleDuration = Math.max(this.cycleDuration, part.getEnd());
        this.updateRawDuration();

        let properties: Set<S2AnimProperty> | null = null;
        const animation = part.getAnimation();
        const trigger = part.getTrigger();
        if (animation) {
            properties = animation.getProperties();
        } else if (trigger) {
            properties = new Set([trigger.property]);
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
        if (track) return track;
        track = new S2TimelinePropertyTrack(property);
        this.propertyTrackMap.set(property, track);
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
