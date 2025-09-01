import { S2Color, type S2Anchor, type S2LineCap, type S2LineJoin } from './core/s2-globals';
import { S2Extents, S2Length, S2Position } from './s2-types';
import { S2Mat2x3 } from './core/math/s2-mat2x3';
import type { S2Node } from './core/element/s2-node';
import type { S2TextAlign, S2VerticalAlign } from './core/element/s2-text-group';

export class S2LayerData {
    public layer: number;
    public isActive: boolean;

    constructor() {
        this.layer = 0;
        this.isActive = true;
    }
}

export class S2StrokeData {
    public color: S2Color;
    public width: S2Length;
    public opacity: number;
    public lineCap?: S2LineCap;
    public lineJoin?: S2LineJoin;

    constructor() {
        this.color = new S2Color();
        this.width = new S2Length(0, 'view');
        this.opacity = 1;
    }

    clone(): S2StrokeData {
        const attributes = new S2StrokeData();
        attributes.color = this.color.clone();
        attributes.width = this.width.clone();
        attributes.opacity = this.opacity;
        return attributes;
    }

    copy(other: S2StrokeData): void {
        this.color.copy(other.color);
        this.width.copy(other.width);
        this.opacity = other.opacity;
    }
}

export class S2FillData {
    public color: S2Color;
    public opacity: number;

    constructor() {
        this.color = new S2Color();
        this.opacity = 1;
    }

    clone(): S2StrokeData {
        const attributes = new S2StrokeData();
        attributes.color = this.color.clone();
        attributes.opacity = this.opacity;
        return attributes;
    }

    copy(other: S2StrokeData): void {
        this.color.copy(other.color);
        this.opacity = other.opacity;
    }
}

export class S2TransformData {
    public matrix: S2Mat2x3;

    constructor() {
        this.matrix = S2Mat2x3.createIdentity();
    }
}

export class S2SimpleShapeData extends S2LayerData {
    public transform: S2TransformData;
    public stroke: S2StrokeData;
    public fill: S2FillData;

    constructor() {
        super();
        this.transform = new S2TransformData();
        this.fill = new S2FillData();
        this.stroke = new S2StrokeData();
    }
}

export class S2EdgeData extends S2SimpleShapeData {
    start: S2Node | S2Position;
    end: S2Node | S2Position;

    startDistance?: S2Length;
    endDistance?: S2Length;
    startAngle?: number;
    endAngle?: number;

    constructor() {
        super();
        this.start = new S2Position();
        this.end = new S2Position();
    }
}

export class S2CubicEgdeData extends S2EdgeData {
    curveAngle?: number;
    curveStartAngle?: number;
    curveEndAngle?: number;
    curveTension?: number;
    curveStartTension?: number;
    curveEndTension?: number;
}

export class S2LineData extends S2SimpleShapeData {
    public startPosition: S2Position;
    public endPosition: S2Position;

    constructor() {
        super();
        this.startPosition = new S2Position();
        this.endPosition = new S2Position();
    }
}

export class S2RectData extends S2SimpleShapeData {
    public position: S2Position;
    public radius: S2Length;

    public extents: S2Extents;
    public anchor: S2Anchor = 'north';

    constructor() {
        super();
        this.position = new S2Position(0, 0, 'world');
        this.radius = new S2Length(0, 'view');
        this.extents = new S2Extents(1, 1, 'world');
    }
}

export class S2FillRectData extends S2LayerData {
    public fill: S2FillData;
    constructor() {
        super();
        this.fill = new S2FillData();
    }
}

export class S2TextGroupData extends S2SimpleShapeData {
    public anchor: S2Anchor = 'center';
    public minExtents: S2Extents;
    public textAlign: S2TextAlign = 'center';
    public verticalAlign: S2VerticalAlign = 'middle';

    constructor() {
        super();
        this.minExtents = new S2Extents(0, 0, 'view');
    }
}

export class S2GridData extends S2SimpleShapeData {
    public position: S2Position;
    public extents: S2Extents;
    public steps: S2Extents;

    constructor() {
        super();
        this.position = new S2Position(0, 0, 'world');
        this.extents = new S2Extents(5, 5, 'world');
        this.steps = new S2Extents(1, 1, 'world');
    }
}
