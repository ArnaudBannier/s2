import { S2Position } from './math/s2-space';
import { S2Color, type S2Anchor, type S2LineCap, type S2LineJoin } from './s2-globals';
import { S2Length } from './math/s2-space';

export class S2Attributes {
    position?: S2Position;
    pathFrom?: number;
    pathTo?: number;
    fillColor?: S2Color;
    fillOpacity?: number;
    opacity?: number;
    strokeColor?: S2Color;
    strokeWidth?: S2Length;

    lineCap?: S2LineCap;
    lineJoin?: S2LineJoin;
    anchor?: S2Anchor;

    private static animatable = [
        'position',
        'pathFrom',
        'pathTo',
        'fillColor',
        'fillOpacity',
        'opacity',
        'strokeColor',
        'strokeWidth',
    ] as const;
    private static attrPosition = ['position'] as const;
    private static attrLength = ['strokeWidth'] as const;
    private static attrColor = ['fillColor', 'strokeColor'] as const;

    constructor(init?: Partial<S2Attributes>) {
        Object.assign(this, init);
        for (const key of S2Attributes.attrPosition) {
            const value = this[key];
            if (value !== undefined) {
                this[key] = value.clone();
            }
        }
        for (const key of S2Attributes.attrLength) {
            const value = this[key];
            if (value !== undefined) {
                this[key] = value.clone();
            }
        }
        for (const key of S2Attributes.attrColor) {
            const value = this[key];
            if (value !== undefined) {
                this[key] = value.clone();
            }
        }
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
        return new S2Attributes(this);
    }

    copy(other: S2Attributes): this {
        Object.assign(this, other);
        for (const key of S2Attributes.attrPosition) {
            const otherValue = other[key];
            if (otherValue !== undefined) {
                if (this[key] !== undefined) {
                    this[key].copy(otherValue);
                } else {
                    this[key] = otherValue.clone();
                }
            } else {
                this[key] = otherValue;
            }
        }
        for (const key of S2Attributes.attrLength) {
            const otherValue = other[key];
            if (otherValue !== undefined) {
                if (this[key] !== undefined) {
                    this[key].copy(otherValue);
                } else {
                    this[key] = otherValue.clone();
                }
            } else {
                this[key] = otherValue;
            }
        }
        for (const key of S2Attributes.attrColor) {
            const otherValue = other[key];
            if (otherValue !== undefined) {
                if (this[key] !== undefined) {
                    this[key].copy(otherValue);
                } else {
                    this[key] = otherValue.clone();
                }
            } else {
                this[key] = otherValue;
            }
        }
        return this;
    }
}
