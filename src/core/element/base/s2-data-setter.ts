import { S2BaseData } from './s2-base-data.ts';
import { S2Color, S2TypePriority, type S2Space } from '../../s2-types';
import { S2Vec2 } from '../../math/s2-vec2';
import type { S2Anchor, S2LineCap, S2LineJoin } from '../../s2-globals.ts';
import { S2DataSetterUtils } from './s2-data-setter-utils.ts';

export class S2DataSetter {
    public readonly targets: S2BaseData[] = [];

    static addTarget(target: S2BaseData): S2DataSetter {
        const setter = new S2DataSetter();
        setter.targets.push(target);
        return setter;
    }

    static addTargets(targets: S2BaseData[]): S2DataSetter {
        const setter = new S2DataSetter();
        setter.targets.push(...targets);
        return setter;
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

    setColorRGB(r: number, g: number, b: number, state: S2TypePriority = S2TypePriority.Important): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setColorRGB(target, r, g, b, state);
        }
        return this;
    }

    setColorHex(hex: string, state: S2TypePriority = S2TypePriority.Important): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setColorHex(target, hex, state);
        }
        return this;
    }

    setCornerRadius(radius: number, space?: S2Space, state: S2TypePriority = S2TypePriority.Important): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setCornerRadius(target, radius, space, state);
        }
        return this;
    }

    setExtents(x: number, y: number, space?: S2Space, state: S2TypePriority = S2TypePriority.Important): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setExtents(target, x, y, space, state);
        }
        return this;
    }

    setExtentsV(v: S2Vec2, space?: S2Space, state: S2TypePriority = S2TypePriority.Important): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setExtentsV(target, v, space, state);
        }
        return this;
    }

    setFillColor(color: S2Color): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setFillColor(target, color);
        }
        return this;
    }

    setFillColorRGB(r: number, g: number, b: number, state: S2TypePriority = S2TypePriority.Important): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setFillColorRGB(target, r, g, b, state);
        }
        return this;
    }

    setFillColorHex(hex: string, state: S2TypePriority = S2TypePriority.Important): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setFillColorHex(target, hex, state);
        }
        return this;
    }

    setFillOpacity(opacity: number, state: S2TypePriority = S2TypePriority.Important): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setFillOpacity(target, opacity, state);
        }
        return this;
    }

    setLayer(layer: number, state: S2TypePriority = S2TypePriority.Important): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setLayer(target, layer, state);
        }
        return this;
    }

    setOpacity(opacity: number, state: S2TypePriority = S2TypePriority.Important): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setOpacity(target, opacity, state);
        }
        return this;
    }

    setPathFrom(pathFrom: number, state: S2TypePriority = S2TypePriority.Important): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setPathFrom(target, pathFrom, state);
        }
        return this;
    }

    setPathTo(pathTo: number, state: S2TypePriority = S2TypePriority.Important): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setPathTo(target, pathTo, state);
        }
        return this;
    }

    setPosition(x: number, y: number, space?: S2Space, state: S2TypePriority = S2TypePriority.Important): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setPosition(target, x, y, space, state);
        }
        return this;
    }

    setPositionV(v: S2Vec2, space?: S2Space, state: S2TypePriority = S2TypePriority.Important): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setPositionV(target, v, space, state);
        }
        return this;
    }

    setStartPosition(x: number, y: number, space?: S2Space, state: S2TypePriority = S2TypePriority.Important): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setStartPosition(target, x, y, space, state);
        }
        return this;
    }

    setStartPositionV(v: S2Vec2, space?: S2Space, state: S2TypePriority = S2TypePriority.Important): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setStartPositionV(target, v, space, state);
        }
        return this;
    }

    setEndPosition(x: number, y: number, space?: S2Space, state: S2TypePriority = S2TypePriority.Important): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setEndPosition(target, x, y, space, state);
        }
        return this;
    }

    setEndPositionV(v: S2Vec2, space?: S2Space, state: S2TypePriority = S2TypePriority.Important): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setEndPositionV(target, v, space, state);
        }
        return this;
    }

    setRadius(radius: number, space?: S2Space, state: S2TypePriority = S2TypePriority.Important): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setRadius(target, radius, space, state);
        }
        return this;
    }

    setStrokeColor(color: S2Color): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setStrokeColor(target, color);
        }
        return this;
    }

    setSpace(space: S2Space, state: S2TypePriority = S2TypePriority.Important): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setSpace(target, space, state);
        }
        return this;
    }

    setStrokeColorRGB(r: number, g: number, b: number, state: S2TypePriority = S2TypePriority.Important): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setStrokeColorRGB(target, r, g, b, state);
        }
        return this;
    }

    setStrokeColorHex(hex: string, state: S2TypePriority = S2TypePriority.Important): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setStrokeColorHex(target, hex, state);
        }
        return this;
    }

    setStrokeLineCap(lineCap: S2LineCap, state: S2TypePriority = S2TypePriority.Important): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setStrokeLineCap(target, lineCap, state);
        }
        return this;
    }

    setStrokeLineJoin(lineJoin: S2LineJoin, state: S2TypePriority = S2TypePriority.Important): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setStrokeLineJoin(target, lineJoin, state);
        }
        return this;
    }

    setStrokeOpacity(opacity: number, state: S2TypePriority = S2TypePriority.Important): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setStrokeOpacity(target, opacity, state);
        }
        return this;
    }

    setStrokeWidth(width: number, space?: S2Space, state: S2TypePriority = S2TypePriority.Important): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setStrokeWidth(target, width, space, state);
        }
        return this;
    }

    setEdgeStartDistance(
        distance: number,
        space: S2Space = 'view',
        state: S2TypePriority = S2TypePriority.Important,
    ): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setEdgeStartDistance(target, distance, space, state);
        }
        return this;
    }

    setEdgeEndDistance(
        distance: number,
        space: S2Space = 'view',
        state: S2TypePriority = S2TypePriority.Important,
    ): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setEdgeEndDistance(target, distance, space, state);
        }
        return this;
    }

    setEdgeStartAngle(angle: number, state: S2TypePriority = S2TypePriority.Important): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setEdgeStartAngle(target, angle, state);
        }
        return this;
    }

    setEdgeEndAngle(angle: number, state: S2TypePriority = S2TypePriority.Important): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setEdgeEndAngle(target, angle, state);
        }
        return this;
    }

    setEdgeBendAngle(angle: number, state: S2TypePriority = S2TypePriority.Important): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setEdgeBendAngle(target, angle, state);
        }
        return this;
    }

    setEdgeTension(tension: number, state: S2TypePriority = S2TypePriority.Important): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setEdgeTension(target, tension, state);
        }
        return this;
    }

    setEdgeStartTension(tension: number, state: S2TypePriority = S2TypePriority.Important): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setEdgeStartTension(target, tension, state);
        }
        return this;
    }

    setEdgeEndTension(tension: number, state: S2TypePriority = S2TypePriority.Important): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setEdgeEndTension(target, tension, state);
        }
        return this;
    }

    setGridBoundA(x: number, y: number, space?: S2Space, state: S2TypePriority = S2TypePriority.Important): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setGridBoundA(target, x, y, space, state);
        }
        return this;
    }

    setGridBoundB(x: number, y: number, space?: S2Space, state: S2TypePriority = S2TypePriority.Important): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setGridBoundB(target, x, y, space, state);
        }
        return this;
    }

    setGridReferencePoint(
        x: number,
        y: number,
        space?: S2Space,
        state: S2TypePriority = S2TypePriority.Important,
    ): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setGridReferencePoint(target, x, y, space, state);
        }
        return this;
    }

    setGridSteps(x: number, y: number, space?: S2Space, state: S2TypePriority = S2TypePriority.Important): this {
        for (const target of this.targets) {
            S2DataSetterUtils.setGridSteps(target, x, y, space, state);
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
//         this.position.set(x, y, space, state);
//         return this;
//     }

//     setPositionV(v: S2Vec2, space?: S2Space, state: S2TypeState = S2TypeState.Active): this {
//         this.position.setV(v, space, state);
//         return this;
//     }

//     setMinExtents(x: number, y: number, space?: S2Space, state: S2TypeState = S2TypeState.Active): this {
//         this.minExtents.set(x, y, space, state);
//         return this;
//     }

//     setMinExtentsV(v: S2Vec2, space?: S2Space, state: S2TypeState = S2TypeState.Active): this {
//         this.minExtents.setV(v, space, state);
//         return this;
//     }

//     setPadding(x: number, y: number, space?: S2Space, state: S2TypeState = S2TypeState.Active): this {
//         this.padding.set(x, y, space, state);
//         return this;
//     }

//     setPaddingV(v: S2Vec2, space?: S2Space, state: S2TypeState = S2TypeState.Active): this {
//         this.padding.setV(v, space, state);
//         return this;
//     }

//     setPartSep(sep: number, space?: S2Space, state: S2TypeState = S2TypeState.Active): this {
//         this.partSep.set(sep, space, state);
//         return this;
//     }

//     setAnchor(anchor: S2Anchor, state: S2TypeState = S2TypeState.Active): this {
//         this.anchor.set(anchor, state);
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
