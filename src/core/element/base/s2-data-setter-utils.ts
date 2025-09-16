import { S2FillData, S2BaseData, S2StrokeData } from './s2-base-data.ts';
import { S2Color, S2Enum, S2Extents, S2Length, S2Number, S2Position, S2TypeState, type S2Space } from '../../s2-types';
import { S2Vec2 } from '../../math/s2-vec2';
import { type S2Anchor, type S2LineCap, type S2LineJoin } from '../../s2-globals.ts';

export class S2DataSetterUtils {
    static setAnchor(data: S2BaseData, anchor: S2Anchor): void {
        if ('anchor' in data && data.anchor instanceof S2Enum) {
            data.anchor.set(anchor);
        }
    }

    static setColor(data: S2BaseData, color: S2Color): void {
        if ('color' in data && data.color instanceof S2Color) {
            data.color.copy(color);
        }
        if ('fill' in data && data.fill instanceof S2FillData) {
            data.fill.color.copy(color);
        }
        if ('stroke' in data && data.stroke instanceof S2StrokeData) {
            data.stroke.color.copy(color);
        }
    }

    static setColorRGB(
        data: S2BaseData,
        r: number,
        g: number,
        b: number,
        state: S2TypeState = S2TypeState.Active,
    ): void {
        if ('color' in data && data.color instanceof S2Color) {
            data.color.set(r, g, b, state);
        }
        if ('fill' in data && data.fill instanceof S2FillData) {
            data.fill.color.set(r, g, b, state);
        }
        if ('stroke' in data && data.stroke instanceof S2StrokeData) {
            data.stroke.color.set(r, g, b, state);
        }
    }

    static setColorHex(data: S2BaseData, hex: string, state: S2TypeState = S2TypeState.Active): void {
        if ('color' in data && data.color instanceof S2Color) {
            data.color.setFromHex(hex, state);
        }
        if ('fill' in data && data.fill instanceof S2FillData) {
            data.fill.color.setFromHex(hex, state);
        }
        if ('stroke' in data && data.stroke instanceof S2StrokeData) {
            data.stroke.color.setFromHex(hex, state);
        }
    }

    static setCornerRadius(
        data: S2BaseData,
        radius: number,
        space?: S2Space,
        state: S2TypeState = S2TypeState.Active,
    ): void {
        if ('cornerRadius' in data && data.cornerRadius instanceof S2Length) {
            data.cornerRadius.set(radius, space, state);
        }
    }

    static setExtents(
        data: S2BaseData,
        x: number,
        y: number,
        space?: S2Space,
        state: S2TypeState = S2TypeState.Active,
    ): void {
        if ('extents' in data && data.extents instanceof S2Extents) {
            data.extents.set(x, y, space, state);
        }
    }

    static setExtentsV(data: S2BaseData, v: S2Vec2, space?: S2Space, state: S2TypeState = S2TypeState.Active): void {
        if ('extents' in data && data.extents instanceof S2Extents) {
            data.extents.setV(v, space, state);
        }
    }

    static setFillColor(data: S2BaseData, color: S2Color): void {
        if ('fill' in data && data.fill instanceof S2FillData) {
            data.fill.color.copy(color);
        }
    }

    static setFillColorRGB(
        data: S2BaseData,
        r: number,
        g: number,
        b: number,
        state: S2TypeState = S2TypeState.Active,
    ): void {
        if ('fill' in data && data.fill instanceof S2FillData) {
            data.fill.color.set(r, g, b, state);
        }
    }

    static setFillColorHex(data: S2BaseData, hex: string, state: S2TypeState = S2TypeState.Active): void {
        if ('fill' in data && data.fill instanceof S2FillData) {
            data.fill.color.setFromHex(hex, state);
        }
    }

    static setFillOpacity(data: S2BaseData, opacity: number, state: S2TypeState = S2TypeState.Active): void {
        if ('fill' in data && data.fill instanceof S2FillData) {
            data.fill.opacity.set(opacity, state);
        }
    }

    static setOpacity(data: S2BaseData, opacity: number, state: S2TypeState = S2TypeState.Active): void {
        if ('opacity' in data && data.opacity instanceof S2Number) {
            data.opacity.set(opacity, state);
        }
    }

    static setPathFrom(data: S2BaseData, pathFrom: number, state: S2TypeState = S2TypeState.Active): void {
        if ('pathFrom' in data && data.pathFrom instanceof S2Number) {
            data.pathFrom.set(pathFrom, state);
        }
    }

    static setPathTo(data: S2BaseData, pathTo: number, state: S2TypeState = S2TypeState.Active): void {
        if ('pathTo' in data && data.pathTo instanceof S2Number) {
            data.pathTo.set(pathTo, state);
        }
    }

    static setPosition(
        data: S2BaseData,
        x: number,
        y: number,
        space?: S2Space,
        state: S2TypeState = S2TypeState.Active,
    ): void {
        if ('position' in data && data.position instanceof S2Position) {
            data.position.set(x, y, space, state);
        }
    }

    static setPositionV(data: S2BaseData, v: S2Vec2, space?: S2Space, state: S2TypeState = S2TypeState.Active): void {
        if ('position' in data && data.position instanceof S2Position) {
            data.position.setV(v, space, state);
        }
    }

    static setStartPosition(
        data: S2BaseData,
        x: number,
        y: number,
        space?: S2Space,
        state: S2TypeState = S2TypeState.Active,
    ): void {
        if ('startPosition' in data && data.startPosition instanceof S2Position) {
            data.startPosition.set(x, y, space, state);
        }
    }

    static setStartPositionV(
        data: S2BaseData,
        v: S2Vec2,
        space?: S2Space,
        state: S2TypeState = S2TypeState.Active,
    ): void {
        if ('startPosition' in data && data.startPosition instanceof S2Position) {
            data.startPosition.setV(v, space, state);
        }
    }

    static setEndPosition(
        data: S2BaseData,
        x: number,
        y: number,
        space?: S2Space,
        state: S2TypeState = S2TypeState.Active,
    ): void {
        if ('endPosition' in data && data.endPosition instanceof S2Position) {
            data.endPosition.set(x, y, space, state);
        }
    }

    static setEndPositionV(
        data: S2BaseData,
        v: S2Vec2,
        space?: S2Space,
        state: S2TypeState = S2TypeState.Active,
    ): void {
        if ('endPosition' in data && data.endPosition instanceof S2Position) {
            data.endPosition.setV(v, space, state);
        }
    }

    static setRadius(data: S2BaseData, radius: number, space?: S2Space, state: S2TypeState = S2TypeState.Active): void {
        if ('radius' in data && data.radius instanceof S2Length) {
            data.radius.set(radius, space, state);
        }
    }

    static setStrokeColor(data: S2BaseData, color: S2Color): void {
        if ('stroke' in data && data.stroke instanceof S2StrokeData) {
            data.stroke.color.copy(color);
        }
    }

    static setSpace(data: S2BaseData, space: S2Space, state: S2TypeState = S2TypeState.Active): void {
        if ('space' in data && data.space instanceof S2Enum) {
            data.space.set(space, state);
        }
    }

    static setStrokeColorRGB(
        data: S2BaseData,
        r: number,
        g: number,
        b: number,
        state: S2TypeState = S2TypeState.Active,
    ): void {
        if ('stroke' in data && data.stroke instanceof S2StrokeData) {
            data.stroke.color.set(r, g, b, state);
        }
    }

    static setStrokeColorHex(data: S2BaseData, hex: string, state: S2TypeState = S2TypeState.Active): void {
        if ('stroke' in data && data.stroke instanceof S2StrokeData) {
            data.stroke.color.setFromHex(hex, state);
        }
    }

    static setStrokeLineCap(data: S2BaseData, lineCap: S2LineCap, state: S2TypeState = S2TypeState.Active): void {
        if ('stroke' in data && data.stroke instanceof S2StrokeData) {
            data.stroke.lineCap.set(lineCap, state);
        }
    }

    static setStrokeLineJoin(data: S2BaseData, lineJoin: S2LineJoin, state: S2TypeState = S2TypeState.Active): void {
        if ('stroke' in data && data.stroke instanceof S2StrokeData) {
            data.stroke.lineJoin.set(lineJoin, state);
        }
    }

    static setStrokeOpacity(data: S2BaseData, opacity: number, state: S2TypeState = S2TypeState.Active): void {
        if ('stroke' in data && data.stroke instanceof S2StrokeData) {
            data.stroke.opacity.set(opacity, state);
        }
    }

    static setStrokeWidth(
        data: S2BaseData,
        width: number,
        space?: S2Space,
        state: S2TypeState = S2TypeState.Active,
    ): void {
        if ('stroke' in data && data.stroke instanceof S2StrokeData) {
            data.stroke.width.set(width, space, state);
        }
    }

    static setEdgeStartDistance(
        data: S2BaseData,
        distance: number,
        space: S2Space = 'view',
        state: S2TypeState = S2TypeState.Active,
    ): void {
        if ('startDistance' in data && data.startDistance instanceof S2Length) {
            data.startDistance.set(distance, space, state);
        }
    }

    static setEdgeEndDistance(
        data: S2BaseData,
        distance: number,
        space: S2Space = 'view',
        state: S2TypeState = S2TypeState.Active,
    ): void {
        if ('endDistance' in data && data.endDistance instanceof S2Length) {
            data.endDistance.set(distance, space, state);
        }
    }

    static setEdgeStartAngle(data: S2BaseData, angle: number, state: S2TypeState = S2TypeState.Active): void {
        if ('startAngle' in data && data.startAngle instanceof S2Number) {
            data.startAngle.set(angle, state);
        }
    }

    static setEdgeEndAngle(data: S2BaseData, angle: number, state: S2TypeState = S2TypeState.Active): void {
        if ('endAngle' in data && data.endAngle instanceof S2Number) {
            data.endAngle.set(angle, state);
        }
    }

    static setEdgeBendAngle(data: S2BaseData, angle: number, state: S2TypeState = S2TypeState.Active): void {
        if ('curveBendAngle' in data && data.curveBendAngle instanceof S2Number) {
            data.curveBendAngle.set(angle, state);
        }
    }

    static setEdgeTension(data: S2BaseData, tension: number, state: S2TypeState = S2TypeState.Active): void {
        if ('curveStartTension' in data && data.curveStartTension instanceof S2Number) {
            data.curveStartTension.set(tension, state);
        }
        if ('curveEndTension' in data && data.curveEndTension instanceof S2Number) {
            data.curveEndTension.set(tension, state);
        }
    }

    static setEdgeStartTension(data: S2BaseData, tension: number, state: S2TypeState = S2TypeState.Active): void {
        if ('curveStartTension' in data && data.curveStartTension instanceof S2Number) {
            data.curveStartTension.set(tension, state);
        }
    }

    static setEdgeEndTension(data: S2BaseData, tension: number, state: S2TypeState = S2TypeState.Active): void {
        if ('curveEndTension' in data && data.curveEndTension instanceof S2Number) {
            data.curveEndTension.set(tension, state);
        }
    }

    static setGridBoundA(
        data: S2BaseData,
        x: number,
        y: number,
        space?: S2Space,
        state: S2TypeState = S2TypeState.Active,
    ): void {
        if ('boundA' in data && data.boundA instanceof S2Position) {
            data.boundA.set(x, y, space, state);
        }
    }

    static setGridBoundB(
        data: S2BaseData,
        x: number,
        y: number,
        space?: S2Space,
        state: S2TypeState = S2TypeState.Active,
    ): void {
        if ('boundB' in data && data.boundB instanceof S2Position) {
            data.boundB.set(x, y, space, state);
        }
    }

    static setGridReferencePoint(
        data: S2BaseData,
        x: number,
        y: number,
        space?: S2Space,
        state: S2TypeState = S2TypeState.Active,
    ): void {
        if ('referencePoint' in data && data.referencePoint instanceof S2Position) {
            data.referencePoint.set(x, y, space, state);
        }
    }

    static setGridSteps(
        data: S2BaseData,
        x: number,
        y: number,
        space?: S2Space,
        state: S2TypeState = S2TypeState.Active,
    ): void {
        if ('steps' in data && data.steps instanceof S2Extents) {
            data.steps.set(x, y, space, state);
        }
    }
}
