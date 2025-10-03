import { S2BaseData, S2FontData } from './s2-base-data.ts';
import { S2Color, type S2Space } from '../../shared/s2-types.ts';
import { S2Vec2 } from '../../math/s2-vec2';
import type {
    S2Anchor,
    S2FontStyle,
    S2HorizontalAlign,
    S2LineCap,
    S2LineJoin,
    S2VerticalAlign,
} from '../../shared/s2-globals.ts';
import { S2DataSetterUtils } from './s2-data-setter-utils.ts';

export class S2DataSetter {
    public readonly targets: S2BaseData[] = [];

    static setTargets(...targets: S2BaseData[]): S2DataSetter {
        const setter = new S2DataSetter();
        setter.targets.length = 0;
        setter.targets.push(...targets);
        return setter;
    }

    setTargets(...targets: S2BaseData[]): this {
        this.targets.length = 0;
        this.targets.push(...targets);
        return this;
    }

    setAnchor(anchor: S2Anchor): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setAnchor(target, anchor);
        }
        return this;
    }

    setColor(color: S2Color): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setColor(target, color);
        }
        return this;
    }

    setColorRGB(r: number, g: number, b: number): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setColorRGB(target, r, g, b);
        }
        return this;
    }

    setColorHex(hex: string): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setColorHex(target, hex);
        }
        return this;
    }

    setCornerRadius(radius: number, space?: S2Space): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setCornerRadius(target, radius, space);
        }
        return this;
    }

    setEdgeStartDistance(distance: number, space: S2Space = 'view'): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setEdgeStartDistance(target, distance, space);
        }
        return this;
    }

    setEdgeEndDistance(distance: number, space: S2Space = 'view'): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setEdgeEndDistance(target, distance, space);
        }
        return this;
    }

    setEdgeStartAngle(angle: number): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setEdgeStartAngle(target, angle);
        }
        return this;
    }

    setEdgeEndAngle(angle: number): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setEdgeEndAngle(target, angle);
        }
        return this;
    }

    setEdgeBendAngle(angle: number): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setEdgeBendAngle(target, angle);
        }
        return this;
    }

    setEdgeTension(tension: number): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setEdgeTension(target, tension);
        }
        return this;
    }

    setEdgeStartTension(tension: number): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setEdgeStartTension(target, tension);
        }
        return this;
    }

    setEdgeEndTension(tension: number): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setEdgeEndTension(target, tension);
        }
        return this;
    }

    setExtents(x: number, y: number, space?: S2Space): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setExtents(target, x, y, space);
        }
        return this;
    }

    setExtentsV(v: S2Vec2, space?: S2Space): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setExtentsV(target, v, space);
        }
        return this;
    }

    setFont(font: S2FontData): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setFont(target, font);
        }
        return this;
    }

    setFontSize(size: number, space?: S2Space): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setFontSize(target, size, space);
        }
        return this;
    }

    setFontWeight(weight: number): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setFontWeight(target, weight);
        }
        return this;
    }

    setFontStyle(style: S2FontStyle): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setFontStyle(target, style);
        }
        return this;
    }
    setFontFamily(family: string): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setFontFamily(target, family);
        }
        return this;
    }

    setFontRelativeLineHeight(lineHeight: number): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setFontRelativeLineHeight(target, lineHeight);
        }
        return this;
    }

    setFontRelativeAscenderHeight(ascenderHeight: number): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setFontRelativeAscenderHeight(target, ascenderHeight);
        }
        return this;
    }

    setFillColor(color: S2Color): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setFillColor(target, color);
        }
        return this;
    }

    setFillColorRGB(r: number, g: number, b: number): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setFillColorRGB(target, r, g, b);
        }
        return this;
    }

    setFillColorHex(hex: string): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setFillColorHex(target, hex);
        }
        return this;
    }

    setFillOpacity(opacity: number): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setFillOpacity(target, opacity);
        }
        return this;
    }

    setHorizontalAlign(align: S2HorizontalAlign): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setHorizontalAlign(target, align);
        }
        return this;
    }

    setVerticalAlign(align: S2VerticalAlign): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setVerticalAlign(target, align);
        }
        return this;
    }

    setLayer(layer: number): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setLayer(target, layer);
        }
        return this;
    }

    setMinExtents(x: number, y: number, space?: S2Space): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setMinExtents(target, x, y, space);
        }
        return this;
    }

    setMinExtentsV(v: S2Vec2, space?: S2Space): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setMinExtentsV(target, v, space);
        }
        return this;
    }

    setOpacity(opacity: number): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setOpacity(target, opacity);
        }
        return this;
    }

    setPadding(x: number, y: number, space?: S2Space): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setPadding(target, x, y, space);
        }
        return this;
    }

    setPaddingV(v: S2Vec2, space?: S2Space): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setPaddingV(target, v, space);
        }
        return this;
    }

    setPathFrom(pathFrom: number): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setPathFrom(target, pathFrom);
        }
        return this;
    }

    setPathTo(pathTo: number): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setPathTo(target, pathTo);
        }
        return this;
    }

    setPosition(x: number, y: number, space?: S2Space): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setPosition(target, x, y, space);
        }
        return this;
    }

    setPositionV(v: S2Vec2, space?: S2Space): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setPositionV(target, v, space);
        }
        return this;
    }

    setStartPosition(x: number, y: number, space?: S2Space): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setStartPosition(target, x, y, space);
        }
        return this;
    }

    setStartPositionV(v: S2Vec2, space?: S2Space): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setStartPositionV(target, v, space);
        }
        return this;
    }

    setEndPosition(x: number, y: number, space?: S2Space): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setEndPosition(target, x, y, space);
        }
        return this;
    }

    setEndPositionV(v: S2Vec2, space?: S2Space): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setEndPositionV(target, v, space);
        }
        return this;
    }

    setRadius(radius: number, space?: S2Space): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setRadius(target, radius, space);
        }
        return this;
    }

    setStrokeColor(color: S2Color): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setStrokeColor(target, color);
        }
        return this;
    }

    setSpace(space: S2Space): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setSpace(target, space);
        }
        return this;
    }

    setStrokeColorRGB(r: number, g: number, b: number): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setStrokeColorRGB(target, r, g, b);
        }
        return this;
    }

    setStrokeColorHex(hex: string): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setStrokeColorHex(target, hex);
        }
        return this;
    }

    setStrokeLineCap(lineCap: S2LineCap): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setStrokeLineCap(target, lineCap);
        }
        return this;
    }

    setStrokeLineJoin(lineJoin: S2LineJoin): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setStrokeLineJoin(target, lineJoin);
        }
        return this;
    }

    setStrokeOpacity(opacity: number): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setStrokeOpacity(target, opacity);
        }
        return this;
    }

    setStrokeWidth(width: number, space?: S2Space): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setStrokeWidth(target, width, space);
        }
        return this;
    }

    setGridBoundA(x: number, y: number, space?: S2Space): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setGridBoundA(target, x, y, space);
        }
        return this;
    }

    setGridBoundB(x: number, y: number, space?: S2Space): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setGridBoundB(target, x, y, space);
        }
        return this;
    }

    setGridReferencePoint(x: number, y: number, space?: S2Space): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setGridReferencePoint(target, x, y, space);
        }
        return this;
    }

    setGridSteps(x: number, y: number, space?: S2Space): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setGridSteps(target, x, y, space);
        }
        return this;
    }
}

//     get textHorizontalAlign(): S2Enum<S2HorizontalAlign> {
//         return this.text.horizontalAlign;
//     }

//     get textVerticalAlign(): S2Enum<S2VerticalAlign> {
//         return this.text.verticalAlign;
//     }

//     get textFillColor(): S2Color {
//         return this.text.fill.color;
//     }

//     get textOpacity(): S2Number {
//         return this.text.opacity;
//     }

//     get textFont(): S2FontData {
//         return this.text.font;
//     }

//     get backFillColor(): S2Color {
//         return this.background.fill.color;
//     }

//     get backFillOpacity(): S2Number {
//         return this.background.fill.opacity;
//     }

//     get backStrokeColor(): S2Color {
//         return this.background.stroke.color;
//     }

//     get backStrokeOpacity(): S2Number {
//         return this.background.stroke.opacity;
//     }

//     get backStrokeWidth(): S2Length {
//         return this.background.stroke.width;
//     }

//     get backCornerRadius(): S2Length {
//         return this.background.cornerRadius;
//     }

//     get backOpacity(): S2Number {
//         return this.background.opacity;
//     }

//     setPosition(x: number, y: number, space?: S2Space, state: S2TypeState = S2TypeState.Active): this {
//         this.position.set(x, y, space);
//         return this;
//     }

//     setPositionV(v: S2Vec2, space?: S2Space, state: S2TypeState = S2TypeState.Active): this {
//         this.position.setV(v, space);
//         return this;
//     }

//     setMinExtents(x: number, y: number, space?: S2Space, state: S2TypeState = S2TypeState.Active): this {
//         this.minExtents.set(x, y, space);
//         return this;
//     }

//     setMinExtentsV(v: S2Vec2, space?: S2Space, state: S2TypeState = S2TypeState.Active): this {
//         this.minExtents.setV(v, space);
//         return this;
//     }

//     setPadding(x: number, y: number, space?: S2Space, state: S2TypeState = S2TypeState.Active): this {
//         this.padding.set(x, y, space);
//         return this;
//     }

//     setPaddingV(v: S2Vec2, space?: S2Space, state: S2TypeState = S2TypeState.Active): this {
//         this.padding.setV(v, space);
//         return this;
//     }

//     setPartSep(sep: number, space?: S2Space, state: S2TypeState = S2TypeState.Active): this {
//         this.partSep.set(sep, space);
//         return this;
//     }

//     setAnchor(anchor: S2Anchor, state: S2TypeState = S2TypeState.Active): this {
//         this.anchor.set(anchor);
//         return this;
//     }

//     setTransform(matrix: S2Mat2x3): this;
//     setTransform(a00: number, a01: number, a02: number, a10: number, a11: number, a12: number): this;
//     setTransform(a: S2Mat2x3 | number, a01?: number, a02?: number, a10?: number, a11?: number, a12?: number): this {
//         if (a instanceof S2Mat2x3) {
//             this.transform.value.copy(a);
//         } else {
//             this.transform.value.set(a, a01!, a02!, a10!, a11!, a12!);
//         }
//         return this;
//     }

//     setTransformIdentity(): this {
//         this.transform.value.makeIdentity();
//         return this;
//     }

//     setTransformTranslation(x: number, y: number): this {
//         this.transform.value.makeTranslation(x, y);
//         return this;
//     }

//     setTransformRotationDeg(angle: number): this {
//         this.transform.value.makeRotationDeg(angle);
//         return this;
//     }

//     setTransformRotationRad(angle: number): this {
//         this.transform.value.makeRotationRad(angle);
//         return this;
//     }

//     setTransformRotationFromDeg(angle: number, centerX: number, centerY: number): this {
//         this.transform.value.makeRotationFromDeg(angle, centerX, centerY);
//         return this;
//     }

//     setTransformRotationFromRad(angle: number, centerX: number, centerY: number): this {
//         this.transform.value.makeRotationFromRad(angle, centerX, centerY);
//         return this;
//     }

//     setTransformScale(sx: number, sy: number): this {
//         this.transform.value.makeScale(sx, sy);
//         return this;
//     }

//     setTransformScaleFrom(sx: number, sy: number, centerX: number, centerY: number): this {
//         this.transform.value.makeScaleFrom(sx, sy, centerX, centerY);
//         return this;
//     }
