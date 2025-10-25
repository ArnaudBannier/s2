import type { S2AnchorOld } from '../shared/s2-globals';
import type { S2AnimProperty } from './s2-base-animation';
import type { S2Boolean } from '../shared/s2-boolean';
import type { S2String } from '../shared/s2-string';
import type { S2Enum } from '../shared/s2-enum';
import type { S2Number } from '../shared/s2-number';
import type { S2Color } from '../shared/s2-color';
import type { S2SpaceRef } from '../shared/s2-space-ref';
import type { S2Space } from '../math/s2-space';

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

export class S2TriggerSpace extends S2TimelineTrigger<S2SpaceRef> {
    public value: S2Space;

    constructor(property: S2SpaceRef, value: S2Space) {
        super(property);
        this.value = value;
    }

    onTrigger(): void {
        this.property.set(this.value);
    }
}

export class S2TriggerAnchor extends S2TimelineTrigger<S2Enum<S2AnchorOld>> {
    public value: S2AnchorOld;

    constructor(property: S2Enum<S2AnchorOld>, value: S2AnchorOld) {
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

export class S2TriggerColor extends S2TimelineTrigger<S2Color> {
    public value: S2Color;

    constructor(property: S2Color, value: S2Color) {
        super(property);
        this.value = value;
    }

    onTrigger(): void {
        this.property.copy(this.value);
    }
}
