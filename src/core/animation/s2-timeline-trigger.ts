import type { S2Anchor } from '../shared/s2-globals';
import type {
    S2Boolean,
    S2Color,
    S2Enum,
    S2Extents,
    S2Length,
    S2Number,
    S2Position,
    S2Space,
    S2String,
} from '../shared/s2-types';

export type S2TriggerProperty =
    | S2Number
    | S2Color
    | S2Position
    | S2Length
    | S2Extents
    | S2Boolean
    | S2String
    | S2Enum<S2Space>
    | S2Enum<S2Anchor>;

export class S2TimelineTrigger {
    protected property: S2TriggerProperty;

    constructor(property: S2TriggerProperty) {
        this.property = property;
    }

    getProperty(): S2TriggerProperty {
        return this.property;
    }

    onTrigger(): void {}
}
