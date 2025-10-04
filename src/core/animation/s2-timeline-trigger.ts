import type { S2Boolean, S2Number } from '../shared/s2-types';
import type { S2AnimProperty } from './s2-base-animation';

export class S2TimelineTrigger {
    protected property: S2AnimProperty;

    constructor(property: S2AnimProperty) {
        this.property = property;
    }

    getProperty(): S2AnimProperty {
        return this.property;
    }

    onTrigger(): void {}
}

export class S2TimelineSetterBoolean extends S2TimelineTrigger {
    protected value: boolean;
    protected property: S2Boolean;

    constructor(property: S2Boolean, value: boolean) {
        super(property);
        this.property = property;
        this.value = value;
    }

    onTrigger(): void {
        this.property.set(this.value);
    }
}

export class S2TimelineSetter {
    static boolean(property: S2Boolean, value: boolean): S2TimelineTrigger {
        const trigger = new S2TimelineTrigger(property);
        trigger.onTrigger = () => {
            property.set(value);
        };
        return trigger;
    }

    static number(property: S2Number, value: number): S2TimelineTrigger {
        const trigger = new S2TimelineTrigger(property);
        trigger.onTrigger = () => {
            property.set(value);
        };
        return trigger;
    }
}
