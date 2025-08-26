import { S2Extents, S2Position } from './math/s2-space';
import { S2Color, type S2Anchor, type S2LineCap, type S2LineJoin } from './s2-globals';
import { S2Length } from './math/s2-space';
import type { S2TextAlign, S2VerticalAlign } from './element/s2-text-group';

export class S2Animatable {
    position?: S2Position;
    pathFrom?: number;
    pathTo?: number;
    fillColor?: S2Color;
    fillOpacity?: number;
    opacity?: number;
    strokeColor?: S2Color;
    strokeWidth?: S2Length;

    clone(): S2Animatable {
        const obj = new S2Animatable();
        Object.assign(obj, this);
        if (this.position) obj.position = this.position.clone();
        if (this.fillColor) obj.fillColor = this.fillColor.clone();
        if (this.strokeColor) obj.strokeColor = this.strokeColor.clone();
        if (this.strokeWidth) obj.strokeWidth = this.strokeWidth.clone();
        return obj;
    }
}

export class S2Attributes {
    fillColor?: S2Color;
    fillOpacity?: number;
    opacity?: number;
    position?: S2Position;
    pathFrom?: number;
    pathTo?: number;
    strokeColor?: S2Color;
    strokeWidth?: S2Length;

    textFillColor?: S2Color;
    textFillOpacity?: number;
    textOpacity?: number;
    textStrokeColor?: S2Color;
    textStrokeWidth?: S2Length;

    minExtents?: S2Extents;
    padding?: S2Extents;
    partSep?: S2Length;

    lineCap?: S2LineCap;
    lineJoin?: S2LineJoin;
    anchor?: S2Anchor;
    textAlign?: S2TextAlign;
    verticalAlign?: S2VerticalAlign;

    constructor(init?: Partial<S2Attributes>) {
        Object.assign(this, init);
    }
}

//     private static animatable = [
//         'position',
//         'pathFrom',
//         'pathTo',
//         'fillColor',
//         'fillOpacity',
//         'opacity',
//         'strokeColor',
//         'strokeWidth',
//     ] as const;
//     private static attrPosition = ['position'] as const;
//     private static attrLength = ['strokeWidth', 'partSep'] as const;
//     private static attrColor = ['fillColor', 'strokeColor'] as const;
//     private static attrExtents = ['minExtents', 'padding'] as const;

//     constructor(init?: Partial<S2Attributes>) {
//         Object.assign(this, init);
//         for (const key of S2Attributes.attrPosition) {
//             const value = this[key];
//             if (value !== undefined) {
//                 this[key] = value.clone();
//             }
//         }
//         for (const key of S2Attributes.attrLength) {
//             const value = this[key];
//             if (value !== undefined) {
//                 this[key] = value.clone();
//             }
//         }
//         for (const key of S2Attributes.attrColor) {
//             const value = this[key];
//             if (value !== undefined) {
//                 this[key] = value.clone();
//             }
//         }
//         for (const key of S2Attributes.attrExtents) {
//             const value = this[key];
//             if (value !== undefined) {
//                 this[key] = value.clone();
//             }
//         }
//     }

//     onlyAnimatable(): S2Attributes {
//         const filtered = new S2Attributes();
//         for (const key of S2Attributes.animatable) {
//             const value = this[key];
//             if (value !== undefined) {
//                 S2Attributes.setAttr(filtered, key, value);
//             }
//         }
//         return filtered;
//     }

//     private static setAttr<K extends keyof S2Attributes>(obj: S2Attributes, key: K, value: S2Attributes[K]) {
//         obj[key] = value;
//     }

//     clone(): S2Attributes {
//         return new S2Attributes(this);
//     }

//     copy(other: S2Attributes): this {
//         Object.assign(this, other);
//         for (const key of S2Attributes.attrPosition) {
//             const otherValue = other[key];
//             if (otherValue !== undefined) {
//                 if (this[key] !== undefined) {
//                     this[key].copy(otherValue);
//                 } else {
//                     this[key] = otherValue.clone();
//                 }
//             } else {
//                 this[key] = otherValue;
//             }
//         }
//         for (const key of S2Attributes.attrLength) {
//             const otherValue = other[key];
//             if (otherValue !== undefined) {
//                 if (this[key] !== undefined) {
//                     this[key].copy(otherValue);
//                 } else {
//                     this[key] = otherValue.clone();
//                 }
//             } else {
//                 this[key] = otherValue;
//             }
//         }
//         for (const key of S2Attributes.attrColor) {
//             const otherValue = other[key];
//             if (otherValue !== undefined) {
//                 if (this[key] !== undefined) {
//                     this[key].copy(otherValue);
//                 } else {
//                     this[key] = otherValue.clone();
//                 }
//             } else {
//                 this[key] = otherValue;
//             }
//         }
//         for (const key of S2Attributes.attrExtents) {
//             const otherValue = other[key];
//             if (otherValue !== undefined) {
//                 if (this[key] !== undefined) {
//                     this[key].copy(otherValue);
//                 } else {
//                     this[key] = otherValue.clone();
//                 }
//             } else {
//                 this[key] = otherValue;
//             }
//         }
//         return this;
//     }
// }
