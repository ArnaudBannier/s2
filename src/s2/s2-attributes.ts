import { S2Position } from './s2-space';
import { S2Color, type S2Anchor } from './s2-globals';

export class S2Attributes {
    position?: S2Position;
    fillColor?: S2Color;
    fillOpacity?: number;
    anchor?: S2Anchor;
    strokeColor?: S2Color;

    static animatable = ['position', 'fillColor', 'fillOpacity'] as const;

    constructor(init?: Partial<S2Attributes>) {
        Object.assign(this, init);
    }

    onlyAnimatable(): S2Attributes {
        const filtered = new S2Attributes();
        for (const key of S2Attributes.animatable) {
            const value = this[key];
            if (value !== undefined) {
                S2Attributes.setAttr(filtered, key, value);
            }
        }
        return filtered;
    }

    private static setAttr<K extends keyof S2Attributes>(obj: S2Attributes, key: K, value: S2Attributes[K]) {
        obj[key] = value;
    }

    clone(): S2Attributes {
        const obj = new S2Attributes();
        for (const key of Object.keys(S2Attributes) as (keyof S2Attributes)[]) {
            const value = this[key];
            if (value === undefined) continue;
            if (typeof value === 'number' || typeof value === 'string') {
                S2Attributes.setAttr(obj, key, value);
            } else if (value !== undefined && 'clone' in value) {
                S2Attributes.setAttr(obj, key, value.clone());
            }
        }
        return obj;
    }

    copy(other: S2Attributes): this {
        for (const key of Object.keys(S2Attributes) as (keyof S2Attributes)[]) {
            const value = other[key];
            if (value === undefined) continue;
            if (typeof value === 'number' || typeof value === 'string') {
                S2Attributes.setAttr(this, key, value);
            } else if (value !== undefined && 'clone' in value) {
                S2Attributes.setAttr(this, key, value.clone());
            }
        }
        return this;
    }
}
