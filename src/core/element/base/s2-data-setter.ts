import { S2FillData, S2LayerData, S2StrokeData } from './s2-base-data.ts';
import { S2Color, S2Enum, S2Extents, S2Length, S2Number, S2Position, S2TypeState, type S2Space } from '../../s2-types';
import { S2Vec2 } from '../../math/s2-vec2';
import type { S2Anchor, S2LineCap, S2LineJoin } from '../../s2-globals.ts';

export class S2DataUtils {
    static setAnchor(data: S2LayerData, anchor: S2Anchor): void {
        if ('anchor' in data && data.anchor instanceof S2Enum) {
            data.anchor.set(anchor);
        }
    }

    static setColor(data: S2LayerData, color: S2Color): void {
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
        data: S2LayerData,
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

    static setColorHex(data: S2LayerData, hex: string, state: S2TypeState = S2TypeState.Active): void {
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

    static setCornerRadius(data: S2LayerData, radius: number, space: S2Space): void {
        if ('cornerRadius' in data && data.cornerRadius instanceof S2Length) {
            data.cornerRadius.set(radius, space);
        }
    }

    static setExtents(data: S2LayerData, x: number, y: number, space: S2Space): void {
        if ('extents' in data && data.extents instanceof S2Extents) {
            data.extents.set(x, y, space);
        }
    }

    static setExtentsV(data: S2LayerData, v: S2Vec2, space: S2Space): void {
        if ('extents' in data && data.extents instanceof S2Extents) {
            data.extents.setV(v, space);
        }
    }

    static setFillColor(data: S2LayerData, color: S2Color): void {
        if ('fill' in data && data.fill instanceof S2FillData) {
            data.fill.color.copy(color);
        }
    }

    static setFillColorRGB(
        data: S2LayerData,
        r: number,
        g: number,
        b: number,
        state: S2TypeState = S2TypeState.Active,
    ): void {
        if ('fill' in data && data.fill instanceof S2FillData) {
            data.fill.color.set(r, g, b, state);
        }
    }

    static setFillColorHex(data: S2LayerData, hex: string, state: S2TypeState = S2TypeState.Active): void {
        if ('fill' in data && data.fill instanceof S2FillData) {
            data.fill.color.setFromHex(hex, state);
        }
    }

    static setFillOpacity(data: S2LayerData, opacity: number, state: S2TypeState = S2TypeState.Active): void {
        if ('fill' in data && data.fill instanceof S2FillData) {
            data.fill.opacity.set(opacity, state);
        }
    }

    static setOpacity(data: S2LayerData, opacity: number, state: S2TypeState = S2TypeState.Active): void {
        if ('opacity' in data && data.opacity instanceof S2Number) {
            data.opacity.set(opacity, state);
        }
    }

    static setStrokeColor(data: S2LayerData, color: S2Color): void {
        if ('stroke' in data && data.stroke instanceof S2StrokeData) {
            data.stroke.color.copy(color);
        }
    }

    static setPathFrom(data: S2LayerData, pathFrom: number, state: S2TypeState = S2TypeState.Active): void {
        if ('pathFrom' in data && data.pathFrom instanceof S2Number) {
            data.pathFrom.set(pathFrom, state);
        }
    }

    static setPathTo(data: S2LayerData, pathTo: number, state: S2TypeState = S2TypeState.Active): void {
        if ('pathTo' in data && data.pathTo instanceof S2Number) {
            data.pathTo.set(pathTo, state);
        }
    }

    static setSpace(data: S2LayerData, space: S2Space, state: S2TypeState = S2TypeState.Active): void {
        if ('space' in data && data.space instanceof S2Enum) {
            data.space.set(space, state);
        }
    }

    static setStrokeColorRGB(
        data: S2LayerData,
        r: number,
        g: number,
        b: number,
        state: S2TypeState = S2TypeState.Active,
    ): void {
        if ('stroke' in data && data.stroke instanceof S2StrokeData) {
            data.stroke.color.set(r, g, b, state);
        }
    }

    static setStrokeColorHex(data: S2LayerData, hex: string, state: S2TypeState = S2TypeState.Active): void {
        if ('stroke' in data && data.stroke instanceof S2StrokeData) {
            data.stroke.color.setFromHex(hex, state);
        }
    }

    static setStrokeLineCap(data: S2LayerData, lineCap: S2LineCap, state: S2TypeState = S2TypeState.Active): void {
        if ('stroke' in data && data.stroke instanceof S2StrokeData) {
            data.stroke.lineCap.set(lineCap, state);
        }
    }

    static setStrokeLineJoin(data: S2LayerData, lineJoin: S2LineJoin, state: S2TypeState = S2TypeState.Active): void {
        if ('stroke' in data && data.stroke instanceof S2StrokeData) {
            data.stroke.lineJoin.set(lineJoin, state);
        }
    }

    static setStrokeOpacity(data: S2LayerData, opacity: number, state: S2TypeState = S2TypeState.Active): void {
        if ('stroke' in data && data.stroke instanceof S2StrokeData) {
            data.stroke.opacity.set(opacity, state);
        }
    }

    static setStrokeWidth(
        data: S2LayerData,
        width: number,
        space?: S2Space,
        state: S2TypeState = S2TypeState.Active,
    ): void {
        if ('stroke' in data && data.stroke instanceof S2StrokeData) {
            data.stroke.width.set(width, space, state);
        }
    }

    static setPosition(
        data: S2LayerData,
        x: number,
        y: number,
        space?: S2Space,
        state: S2TypeState = S2TypeState.Active,
    ): void {
        if ('position' in data && data.position instanceof S2Position) {
            data.position.set(x, y, space, state);
        }
    }

    static setPositionV(data: S2LayerData, v: S2Vec2, space?: S2Space, state: S2TypeState = S2TypeState.Active): void {
        if ('position' in data && data.position instanceof S2Position) {
            data.position.setV(v, space, state);
        }
    }
}

export class S2DataSetter {
    public readonly targets: S2LayerData[] = [];

    static addTarget(target: S2LayerData): S2DataSetter {
        const setter = new S2DataSetter();
        setter.targets.push(target);
        return setter;
    }

    static addTargets(targets: S2LayerData[]): S2DataSetter {
        const setter = new S2DataSetter();
        setter.targets.push(...targets);
        return setter;
    }

    setAnchor(anchor: S2Anchor): this {
        for (const target of this.targets) {
            S2DataUtils.setAnchor(target, anchor);
        }
        return this;
    }

    setColor(color: S2Color): this {
        for (const target of this.targets) {
            S2DataUtils.setColor(target, color);
        }
        return this;
    }

    setColorRGB(r: number, g: number, b: number, state: S2TypeState = S2TypeState.Active): this {
        for (const target of this.targets) {
            S2DataUtils.setColorRGB(target, r, g, b, state);
        }
        return this;
    }

    setColorHex(hex: string, state: S2TypeState = S2TypeState.Active): this {
        for (const target of this.targets) {
            S2DataUtils.setColorHex(target, hex, state);
        }
        return this;
    }

    setCornerRadius(radius: number, space: S2Space): this {
        for (const target of this.targets) {
            S2DataUtils.setCornerRadius(target, radius, space);
        }
        return this;
    }

    setExtents(x: number, y: number, space: S2Space): this {
        for (const target of this.targets) {
            S2DataUtils.setExtents(target, x, y, space);
        }
        return this;
    }

    setExtentsV(v: S2Vec2, space: S2Space): this {
        for (const target of this.targets) {
            S2DataUtils.setExtentsV(target, v, space);
        }
        return this;
    }

    setFillColor(color: S2Color): this {
        for (const target of this.targets) {
            S2DataUtils.setFillColor(target, color);
        }
        return this;
    }

    setFillColorRGB(r: number, g: number, b: number, state: S2TypeState = S2TypeState.Active): this {
        for (const target of this.targets) {
            S2DataUtils.setFillColorRGB(target, r, g, b, state);
        }
        return this;
    }

    setFillColorHex(hex: string, state: S2TypeState = S2TypeState.Active): this {
        for (const target of this.targets) {
            S2DataUtils.setFillColorHex(target, hex, state);
        }
        return this;
    }

    setFillOpacity(opacity: number, state: S2TypeState = S2TypeState.Active): this {
        for (const target of this.targets) {
            S2DataUtils.setFillOpacity(target, opacity, state);
        }
        return this;
    }

    setOpacity(opacity: number, state: S2TypeState = S2TypeState.Active): this {
        for (const target of this.targets) {
            S2DataUtils.setOpacity(target, opacity, state);
        }
        return this;
    }

    setStrokeColor(color: S2Color): this {
        for (const target of this.targets) {
            S2DataUtils.setStrokeColor(target, color);
        }
        return this;
    }

    setPathFrom(pathFrom: number, state: S2TypeState = S2TypeState.Active): this {
        for (const target of this.targets) {
            S2DataUtils.setPathFrom(target, pathFrom, state);
        }
        return this;
    }

    setPathTo(pathTo: number, state: S2TypeState = S2TypeState.Active): this {
        for (const target of this.targets) {
            S2DataUtils.setPathTo(target, pathTo, state);
        }
        return this;
    }

    setSpace(space: S2Space, state: S2TypeState = S2TypeState.Active): this {
        for (const target of this.targets) {
            S2DataUtils.setSpace(target, space, state);
        }
        return this;
    }

    setStrokeColorRGB(r: number, g: number, b: number, state: S2TypeState = S2TypeState.Active): this {
        for (const target of this.targets) {
            S2DataUtils.setStrokeColorRGB(target, r, g, b, state);
        }
        return this;
    }

    setStrokeColorHex(hex: string, state: S2TypeState = S2TypeState.Active): this {
        for (const target of this.targets) {
            S2DataUtils.setStrokeColorHex(target, hex, state);
        }
        return this;
    }

    setStrokeLineCap(lineCap: S2LineCap, state: S2TypeState = S2TypeState.Active): this {
        for (const target of this.targets) {
            S2DataUtils.setStrokeLineCap(target, lineCap, state);
        }
        return this;
    }

    setStrokeLineJoin(lineJoin: S2LineJoin, state: S2TypeState = S2TypeState.Active): this {
        for (const target of this.targets) {
            S2DataUtils.setStrokeLineJoin(target, lineJoin, state);
        }
        return this;
    }

    setStrokeOpacity(opacity: number, state: S2TypeState = S2TypeState.Active): this {
        for (const target of this.targets) {
            S2DataUtils.setStrokeOpacity(target, opacity, state);
        }
        return this;
    }

    setStrokeWidth(width: number, space?: S2Space, state: S2TypeState = S2TypeState.Active): this {
        for (const target of this.targets) {
            S2DataUtils.setStrokeWidth(target, width, space, state);
        }
        return this;
    }

    setPosition(x: number, y: number, space?: S2Space, state: S2TypeState = S2TypeState.Active): this {
        for (const target of this.targets) {
            S2DataUtils.setPosition(target, x, y, space, state);
        }
        return this;
    }

    setPositionV(v: S2Vec2, space?: S2Space, state: S2TypeState = S2TypeState.Active): this {
        for (const target of this.targets) {
            S2DataUtils.setPositionV(target, v, space, state);
        }
        return this;
    }
}
