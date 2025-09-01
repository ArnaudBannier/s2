import { S2Camera } from './math/s2-camera';
import { S2SVG } from './element/s2-svg';
import { type S2Space, S2Position } from './s2-types';
import { S2Vec2 } from './math/s2-vec2';

export interface S2BaseScene {
    readonly svg: S2SVG;
    activeCamera: S2Camera;
    nextId: number;
}

export interface S2HasExtents {
    setExtents(x: number, y: number, space?: S2Space): this;
    setExtentsV(extents: S2Vec2, space?: S2Space): this;
    getExtents(space?: S2Space): S2Vec2;
    changeExtentsSpace(space: S2Space): this;
}

export interface S2HasRadius {
    setRadius(radius: number, space?: S2Space): this;
    getRadius(space?: S2Space): number;
    changeRadiusSpace(space: S2Space): this;
}

export interface S2HasPosition {
    setPosition(x: number, y: number, space?: S2Space): this;
    setPositionV(position: S2Vec2, space?: S2Space): this;
    getPosition(space?: S2Space): S2Vec2;
    getS2Position(): S2Position;
    changePositionSpace(space: S2Space): this;
}

export interface S2HasStrokeWidth {
    setStrokeWidth(strokeWidth: number, space?: S2Space): this;
    getStrokeWidth(space?: S2Space): number;
    changeStrokeWidthSpace(space: S2Space): this;
}

export interface S2HasPartialRendering {
    setPathTo(t: number): this;
    setPathFrom(t: number): this;
    setPathRange(from: number, to: number): this;
    getPathFrom(): number;
    getPathTo(): number;
    getPathRange(): [number, number];
}
