import { S2Camera } from './math/s2-camera';
import { S2SVG } from './element/s2-svg';
import { type S2Space, S2Length, S2Position } from './s2-space';
import { Vector2 } from '../math/vector2';
import { S2Color } from './s2-globals';
import { type S2LineCap, type S2LineJoin } from './s2-globals';

export interface S2BaseScene {
    readonly svg: S2SVG;
    activeCamera: S2Camera;
}

export class S2Parameters {
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

    setPosition(x: number, y: number, space: S2Space = 'world'): this {
        if (this.position) {
            this.position.value.set(x, y);
            this.position.space = space;
        } else {
            this.position = new S2Position(x, y, space);
        }
        return this;
    }

    setPathFrom(value: number): this {
        this.pathFrom = value;
        return this;
    }

    setPathTo(value: number): this {
        this.pathTo = value;
        return this;
    }

    setFillColor(color: S2Color): this {
        if (this.fillColor) this.fillColor.copy(color);
        else this.fillColor = color.clone();
        return this;
    }

    setFillOpacity(value: number): this {
        this.fillOpacity = value;
        return this;
    }

    setOpacity(value: number): this {
        this.opacity = value;
        return this;
    }

    setStrokeColor(color: S2Color): this {
        if (this.strokeColor) this.strokeColor.copy(color);
        else this.strokeColor = color.clone();
        return this;
    }

    setStrokeWidth(value: number, space: S2Space = 'view'): this {
        if (this.strokeWidth) {
            this.strokeWidth.value = value;
            this.strokeWidth.space = space;
        } else {
            this.strokeWidth = new S2Length(value, space);
        }
        return this;
    }

    setLineCap(lineCap: S2LineCap): this {
        this.lineCap = lineCap;
        return this;
    }

    setLineJoin(lineJoin: S2LineJoin): this {
        this.lineJoin = lineJoin;
        return this;
    }

    clone(): S2Parameters {
        const params = new S2Parameters();
        if (this.position !== undefined) params.position = this.position.clone();
        if (this.fillColor !== undefined) params.fillColor = this.fillColor.clone();
        if (this.strokeColor !== undefined) params.strokeColor = this.strokeColor.clone();
        if (this.strokeWidth !== undefined) params.strokeWidth = this.strokeWidth.clone();
        params.pathFrom = this.pathFrom;
        params.pathTo = this.pathTo;
        params.fillOpacity = this.fillOpacity;
        params.opacity = this.opacity;
        params.lineCap = this.lineCap;
        params.lineJoin = this.lineJoin;
        return params;
    }

    copy(params: S2Parameters): this {
        this.position = params.position ? params.position.clone() : undefined;
        this.fillColor = params.fillColor ? params.fillColor.clone() : undefined;
        this.strokeColor = params.strokeColor ? params.strokeColor.clone() : undefined;
        this.strokeWidth = params.strokeWidth ? params.strokeWidth.clone() : undefined;
        this.pathFrom = params.pathFrom;
        this.pathTo = params.pathTo;
        this.fillOpacity = params.fillOpacity;
        this.opacity = params.opacity;
        this.lineCap = params.lineCap;
        this.lineJoin = params.lineJoin;
        return this;
    }
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
