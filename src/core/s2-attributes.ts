import { S2Extents, S2Position } from './math/s2-space';
import { S2Color, type S2Anchor, type S2LineCap, type S2LineJoin } from './s2-globals';
import { S2Length } from './math/s2-space';
import type { S2TextAlign, S2VerticalAlign } from './element/s2-text-group';

export class S2Animatable {
    // Basic animatable
    extents?: S2Extents; // todo
    isActive?: boolean;
    fillColor?: S2Color;
    fillOpacity?: number;
    opacity?: number;
    pathFrom?: number;
    pathTo?: number;
    position?: S2Position;
    radius?: S2Length; // todo
    strokeColor?: S2Color;
    strokeWidth?: S2Length;

    // S2Nodes
    minExtents?: S2Extents; // todo
    textFillColor?: S2Color; // todo
    textFillOpacity?: number; // todo
    textOpacity?: number; // todo
    textStrokeColor?: S2Color; // todo
    textStrokeWidth?: S2Length; // todo

    constructor(init?: Partial<S2Animatable>) {
        Object.assign(this, init);
    }

    clone(): S2Animatable {
        const obj = new S2Animatable();
        Object.assign(obj, this);
        if (this.extents) obj.extents = this.extents.clone();
        if (this.fillColor) obj.fillColor = this.fillColor.clone();
        if (this.minExtents) obj.minExtents = this.minExtents.clone();
        if (this.position) obj.position = this.position.clone();
        if (this.radius) obj.radius = this.radius.clone();
        if (this.strokeColor) obj.strokeColor = this.strokeColor.clone();
        if (this.strokeWidth) obj.strokeWidth = this.strokeWidth.clone();
        if (this.textFillColor) obj.textFillColor = this.textFillColor.clone();
        if (this.textStrokeColor) obj.textStrokeColor = this.textStrokeColor.clone();
        if (this.textStrokeWidth) obj.textStrokeWidth = this.textStrokeWidth.clone();
        return obj;
    }
}

export class S2Attributes {
    // Basic animatable
    extents?: S2Extents; // todo
    isActive?: boolean;
    fillColor?: S2Color;
    fillOpacity?: number;
    opacity?: number;
    position?: S2Position;
    pathFrom?: number;
    pathTo?: number;
    radius?: S2Length; // todo
    strokeColor?: S2Color;
    strokeWidth?: S2Length;

    // Basic non animatable
    lineCap?: S2LineCap;
    lineJoin?: S2LineJoin;
    anchor?: S2Anchor;
    textAlign?: S2TextAlign;
    verticalAlign?: S2VerticalAlign;

    // S2Nodes
    minExtents?: S2Extents; // todo
    padding?: S2Extents;
    partSep?: S2Length;
    textFillColor?: S2Color;
    textFillOpacity?: number;
    textOpacity?: number;
    textStrokeColor?: S2Color;
    textStrokeWidth?: S2Length;

    constructor(init?: Partial<S2Attributes>) {
        Object.assign(this, init);
    }
}
