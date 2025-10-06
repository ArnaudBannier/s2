import type { S2Anchor } from '../shared/s2-globals';
import type { S2Boolean, S2Enum, S2Number, S2Space, S2String } from '../shared/s2-types';
import type { S2AnimProperty } from './s2-base-animation';

export abstract class S2TimelineTrigger<T extends S2AnimProperty = S2AnimProperty> {
    public property: T;

    constructor(property: T) {
        this.property = property;
    }

    abstract onTrigger(): void;
}

export class S2TriggerBoolean extends S2TimelineTrigger<S2Boolean> {
    public value: boolean;

    constructor(property: S2Boolean, value: boolean) {
        super(property);
        this.value = value;
    }

    onTrigger(): void {
        this.property.set(this.value);
    }
}

export class S2TriggerString extends S2TimelineTrigger<S2String> {
    public value: string;

    constructor(property: S2String, value: string) {
        super(property);
        this.value = value;
    }

    onTrigger(): void {
        this.property.set(this.value);
    }
}

export class S2TriggerSpace extends S2TimelineTrigger<S2Enum<S2Space>> {
    public value: S2Space;

    constructor(property: S2Enum<S2Space>, value: S2Space) {
        super(property);
        this.value = value;
    }

    onTrigger(): void {
        this.property.set(this.value);
    }
}

export class S2TriggerAnchor extends S2TimelineTrigger<S2Enum<S2Anchor>> {
    public value: S2Anchor;

    constructor(property: S2Enum<S2Anchor>, value: S2Anchor) {
        super(property);
        this.value = value;
    }

    onTrigger(): void {
        this.property.set(this.value);
    }
}

export class S2TriggerNumber extends S2TimelineTrigger<S2Number> {
    public value: number;

    constructor(property: S2Number, value: number) {
        super(property);
        this.value = value;
    }

    onTrigger(): void {
        this.property.set(this.value);
    }
}
