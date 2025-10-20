import type {
    S2Anchor,
    S2FontStyle,
    S2HorizontalAlign,
    S2LineCap,
    S2LineJoin,
    S2VerticalAlign,
} from '../../shared/s2-globals.ts';
import type { S2Space } from '../../math/s2-camera.ts';
import { S2FillData, S2BaseData, S2StrokeData, S2FontData } from './s2-base-data.ts';
import { S2Vec2 } from '../../math/s2-vec2';
import { S2Enum } from '../../shared/s2-enum.ts';
import { S2Color } from '../../shared/s2-color.ts';
import { S2LengthOld } from '../../shared/s2-length.ts';
import { S2Number } from '../../shared/s2-number.ts';
import { S2OldPoint } from '../../shared/s2-point.ts';
import { S2Extents } from '../../shared/s2-extents.ts';

export class S2DataSetterUtils {
    static setAnchor(data: S2BaseData, anchor: S2Anchor): void {
        if ('anchor' in data && data.anchor instanceof S2Enum) {
            data.anchor.set(anchor);
        }
    }

    static setBackgroundFillColor(data: S2BaseData, color: S2Color): void {
        if (
            'background' in data &&
            data.background instanceof S2BaseData &&
            'fill' in data.background &&
            data.background.fill instanceof S2FillData
        ) {
            data.background.fill.color.copyIfUnlocked(color);
        }
    }

    static setColor(data: S2BaseData, color: S2Color): void {
        if ('color' in data && data.color instanceof S2Color) {
            data.color.copyIfUnlocked(color);
        }
        if ('fill' in data && data.fill instanceof S2FillData) {
            data.fill.color.copyIfUnlocked(color);
        }
        if ('stroke' in data && data.stroke instanceof S2StrokeData) {
            data.stroke.color.copyIfUnlocked(color);
        }
    }

    static setColorRGB(data: S2BaseData, r: number, g: number, b: number): void {
        if ('color' in data && data.color instanceof S2Color) {
            data.color.set(r, g, b);
        }
        if ('fill' in data && data.fill instanceof S2FillData) {
            data.fill.color.set(r, g, b);
        }
        if ('stroke' in data && data.stroke instanceof S2StrokeData) {
            data.stroke.color.set(r, g, b);
        }
    }

    static setColorHex(data: S2BaseData, hex: string): void {
        if ('color' in data && data.color instanceof S2Color) {
            data.color.setFromHex(hex);
        }
        if ('fill' in data && data.fill instanceof S2FillData) {
            data.fill.color.setFromHex(hex);
        }
        if ('stroke' in data && data.stroke instanceof S2StrokeData) {
            data.stroke.color.setFromHex(hex);
        }
    }

    static setCornerRadius(data: S2BaseData, radius: number, space?: S2Space): void {
        if ('cornerRadius' in data && data.cornerRadius instanceof S2LengthOld) {
            data.cornerRadius.set(radius, space);
        }
    }

    static setEdgeStartDistance(data: S2BaseData, distance: number, space: S2Space = 'view'): void {
        if ('startDistance' in data && data.startDistance instanceof S2LengthOld) {
            data.startDistance.set(distance, space);
        }
    }

    static setEdgeEndDistance(data: S2BaseData, distance: number, space: S2Space = 'view'): void {
        if ('endDistance' in data && data.endDistance instanceof S2LengthOld) {
            data.endDistance.set(distance, space);
        }
    }

    static setEdgeStartAngle(data: S2BaseData, angle: number): void {
        if ('startAngle' in data && data.startAngle instanceof S2Number) {
            data.startAngle.set(angle);
        }
    }

    static setEdgeEndAngle(data: S2BaseData, angle: number): void {
        if ('endAngle' in data && data.endAngle instanceof S2Number) {
            data.endAngle.set(angle);
        }
    }

    static setEdgeBendAngle(data: S2BaseData, angle: number): void {
        if ('curveBendAngle' in data && data.curveBendAngle instanceof S2Number) {
            data.curveBendAngle.set(angle);
        }
    }

    static setEdgeTension(data: S2BaseData, tension: number): void {
        if ('curveStartTension' in data && data.curveStartTension instanceof S2Number) {
            data.curveStartTension.set(tension);
        }
        if ('curveEndTension' in data && data.curveEndTension instanceof S2Number) {
            data.curveEndTension.set(tension);
        }
    }

    static setEdgeStartTension(data: S2BaseData, tension: number): void {
        if ('curveStartTension' in data && data.curveStartTension instanceof S2Number) {
            data.curveStartTension.set(tension);
        }
    }

    static setEdgeEndTension(data: S2BaseData, tension: number): void {
        if ('curveEndTension' in data && data.curveEndTension instanceof S2Number) {
            data.curveEndTension.set(tension);
        }
    }

    static setEndPosition(data: S2BaseData, x: number, y: number, space?: S2Space): void {
        if ('endPosition' in data && data.endPosition instanceof S2OldPoint) {
            data.endPosition.set(x, y, space);
        }
    }

    static setEndPositionV(data: S2BaseData, v: S2Vec2, space?: S2Space): void {
        if ('endPosition' in data && data.endPosition instanceof S2OldPoint) {
            data.endPosition.setV(v, space);
        }
    }

    static setExtents(data: S2BaseData, x: number, y: number, space?: S2Space): void {
        if ('extents' in data && data.extents instanceof S2Extents) {
            data.extents.set(x, y, space);
        }
    }

    static setExtentsV(data: S2BaseData, v: S2Vec2, space?: S2Space): void {
        if ('extents' in data && data.extents instanceof S2Extents) {
            data.extents.setV(v, space);
        }
    }

    static setFillColor(data: S2BaseData, color: S2Color): void {
        if ('fill' in data && data.fill instanceof S2FillData) {
            data.fill.color.copyIfUnlocked(color);
        }
    }

    static setFillColorRGB(data: S2BaseData, r: number, g: number, b: number): void {
        if ('fill' in data && data.fill instanceof S2FillData) {
            data.fill.color.set(r, g, b);
        }
    }

    static setFillColorHex(data: S2BaseData, hex: string): void {
        if ('fill' in data && data.fill instanceof S2FillData) {
            data.fill.color.setFromHex(hex);
        }
    }

    static setFillOpacity(data: S2BaseData, opacity: number): void {
        if ('fill' in data && data.fill instanceof S2FillData) {
            data.fill.opacity.set(opacity);
        }
    }

    static setFont(data: S2BaseData, font: S2FontData): void {
        if ('font' in data && data.font instanceof S2FontData) {
            data.font.copyIfUnlocked(font);
        }
    }

    static setFontSize(data: S2BaseData, size: number, space?: S2Space): void {
        if ('font' in data && data.font instanceof S2FontData) {
            data.font.size.set(size, space);
        }
    }

    static setFontWeight(data: S2BaseData, weight: number): void {
        if ('font' in data && data.font instanceof S2FontData) {
            data.font.weight.set(weight);
        }
    }

    static setFontStyle(data: S2BaseData, style: S2FontStyle): void {
        if ('font' in data && data.font instanceof S2FontData) {
            data.font.style.set(style);
        }
    }

    static setFontFamily(data: S2BaseData, family: string): void {
        if ('font' in data && data.font instanceof S2FontData) {
            data.font.family.set(family);
        }
    }

    static setFontRelativeLineHeight(data: S2BaseData, lineHeight: number): void {
        if ('font' in data && data.font instanceof S2FontData) {
            data.font.relativeLineHeight.set(lineHeight);
        }
    }

    static setFontRelativeAscenderHeight(data: S2BaseData, ascenderHeight: number): void {
        if ('font' in data && data.font instanceof S2FontData) {
            data.font.relativeAscenderHeight.set(ascenderHeight);
        }
    }

    static setHorizontalAlign(data: S2BaseData, align: S2HorizontalAlign): void {
        if ('horizontalAlign' in data && data.horizontalAlign instanceof S2Enum) {
            data.horizontalAlign.set(align);
        }
    }

    static setVerticalAlign(data: S2BaseData, align: S2VerticalAlign): void {
        if ('verticalAlign' in data && data.verticalAlign instanceof S2Enum) {
            data.verticalAlign.set(align);
        }
    }

    static setLayer(data: S2BaseData, layer: number): void {
        if ('layer' in data && data.layer instanceof S2Number) {
            data.layer.set(layer);
        }
    }

    static setMinExtents(data: S2BaseData, x: number, y: number, space?: S2Space): void {
        if ('minExtents' in data && data.minExtents instanceof S2Extents) {
            data.minExtents.set(x, y, space);
        }
    }

    static setMinExtentsV(data: S2BaseData, v: S2Vec2, space?: S2Space): void {
        if ('minExtents' in data && data.minExtents instanceof S2Extents) {
            data.minExtents.setV(v, space);
        }
    }

    static setOpacity(data: S2BaseData, opacity: number): void {
        if ('opacity' in data && data.opacity instanceof S2Number) {
            data.opacity.set(opacity);
        }
    }

    static setPadding(data: S2BaseData, x: number, y: number, space?: S2Space): void {
        if ('padding' in data && data.padding instanceof S2Extents) {
            data.padding.set(x, y, space);
        }
    }

    static setPaddingV(data: S2BaseData, v: S2Vec2, space?: S2Space): void {
        if ('padding' in data && data.padding instanceof S2Extents) {
            data.padding.setV(v, space);
        }
    }

    static setPathFrom(data: S2BaseData, pathFrom: number): void {
        if ('pathFrom' in data && data.pathFrom instanceof S2Number) {
            data.pathFrom.set(pathFrom);
        }
    }

    static setPathTo(data: S2BaseData, pathTo: number): void {
        if ('pathTo' in data && data.pathTo instanceof S2Number) {
            data.pathTo.set(pathTo);
        }
    }

    static setPosition(data: S2BaseData, x: number, y: number, space?: S2Space): void {
        if ('position' in data && data.position instanceof S2OldPoint) {
            data.position.set(x, y, space);
        }
    }

    static setPositionV(data: S2BaseData, v: S2Vec2, space?: S2Space): void {
        if ('position' in data && data.position instanceof S2OldPoint) {
            data.position.setV(v, space);
        }
    }

    static setStartPosition(data: S2BaseData, x: number, y: number, space?: S2Space): void {
        if ('startPosition' in data && data.startPosition instanceof S2OldPoint) {
            data.startPosition.set(x, y, space);
        }
    }

    static setStartPositionV(data: S2BaseData, v: S2Vec2, space?: S2Space): void {
        if ('startPosition' in data && data.startPosition instanceof S2OldPoint) {
            data.startPosition.setV(v, space);
        }
    }

    static setRadius(data: S2BaseData, radius: number, space?: S2Space): void {
        if ('radius' in data && data.radius instanceof S2LengthOld) {
            data.radius.set(radius, space);
        }
    }

    static setStrokeColor(data: S2BaseData, color: S2Color): void {
        if ('stroke' in data && data.stroke instanceof S2StrokeData) {
            data.stroke.color.copyIfUnlocked(color);
        }
    }

    static setSpace(data: S2BaseData, space: S2Space): void {
        if ('space' in data && data.space instanceof S2Enum) {
            data.space.set(space);
        }
    }

    static setStrokeColorRGB(data: S2BaseData, r: number, g: number, b: number): void {
        if ('stroke' in data && data.stroke instanceof S2StrokeData) {
            data.stroke.color.set(r, g, b);
        }
    }

    static setStrokeColorHex(data: S2BaseData, hex: string): void {
        if ('stroke' in data && data.stroke instanceof S2StrokeData) {
            data.stroke.color.setFromHex(hex);
        }
    }

    static setStrokeLineCap(data: S2BaseData, lineCap: S2LineCap): void {
        if ('stroke' in data && data.stroke instanceof S2StrokeData) {
            data.stroke.lineCap.set(lineCap);
        }
    }

    static setStrokeLineJoin(data: S2BaseData, lineJoin: S2LineJoin): void {
        if ('stroke' in data && data.stroke instanceof S2StrokeData) {
            data.stroke.lineJoin.set(lineJoin);
        }
    }

    static setStrokeOpacity(data: S2BaseData, opacity: number): void {
        if ('stroke' in data && data.stroke instanceof S2StrokeData) {
            data.stroke.opacity.set(opacity);
        }
    }

    static setStrokeWidth(data: S2BaseData, width: number, space?: S2Space): void {
        if ('stroke' in data && data.stroke instanceof S2StrokeData) {
            data.stroke.width.set(width, space);
        }
    }

    static setGridBoundA(data: S2BaseData, x: number, y: number, space?: S2Space): void {
        if ('boundA' in data && data.boundA instanceof S2OldPoint) {
            data.boundA.set(x, y, space);
        }
    }

    static setGridBoundB(data: S2BaseData, x: number, y: number, space?: S2Space): void {
        if ('boundB' in data && data.boundB instanceof S2OldPoint) {
            data.boundB.set(x, y, space);
        }
    }

    static setGridReferencePoint(data: S2BaseData, x: number, y: number, space?: S2Space): void {
        if ('referencePoint' in data && data.referencePoint instanceof S2OldPoint) {
            data.referencePoint.set(x, y, space);
        }
    }

    static setGridSteps(data: S2BaseData, x: number, y: number, space?: S2Space): void {
        if ('steps' in data && data.steps instanceof S2Extents) {
            data.steps.set(x, y, space);
        }
    }
}
