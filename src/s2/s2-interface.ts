import { S2Camera } from './math/s2-camera';
import { S2SVG } from './element/s2-svg';
import { type S2Space, S2Length, S2Position } from './s2-space';
import { Vector2 } from '../math/vector2';
import { type S2StyleDecl } from './s2-globals';

export interface S2BaseScene {
    readonly svg: S2SVG;
    activeCamera: S2Camera;
}

export interface S2Parameters {
    position?: S2Position;
    pathFrom?: number;
    pathTo?: number;
    style?: S2StyleDecl;
    fill?: string;
    opacity?: number;
    strokeColor?: string;
    strokeWidth?: S2Length;
}

export interface S2HasExtents {
    setExtents(x: number, y: number, space?: S2Space): this;
    setExtentsV(extents: Vector2, space?: S2Space): this;
    getExtents(space?: S2Space): Vector2;
    changeExtentsSpace(space: S2Space): this;
}

export interface S2HasRadius {
    setRadius(radius: number, space?: S2Space): this;
    getRadius(space?: S2Space): number;
    changeRadiusSpace(space: S2Space): this;
}

export interface S2HasPosition {
    setPosition(x: number, y: number, space?: S2Space): this;
    setPositionV(position: Vector2, space?: S2Space): this;
    getPosition(space?: S2Space): Vector2;
    getS2Position(): S2Position;
    changePositionSpace(space: S2Space): this;
}

export interface S2HasStrokeWidth {
    setStrokeWidth(strokeWidth: number, space?: S2Space): this;
    getStrokeWidth(space?: S2Space): number;
    changeStrokeWidthSpace(space: S2Space): this;
}

export interface S2HasPartialRendering {
    reduceTo(t: number): this;
    reduceFrom(t: number): this;
    makePartial(from: number, to: number): this;
    getPartialFrom(): number;
    getPartialTo(): number;
    getPartialRange(): [number, number];
}
