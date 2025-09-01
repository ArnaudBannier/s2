// export class S2EdgeData extends S2SimpleShapeData {
//     start: S2Node | S2Position;
//     end: S2Node | S2Position;

//     startDistance?: S2Length;
//     endDistance?: S2Length;
//     startAngle?: number;
//     endAngle?: number;

//     constructor() {
//         super();
//         this.start = new S2Position();
//         this.end = new S2Position();
//     }
// }

// export class S2CubicEgdeData extends S2EdgeData {
//     curveAngle?: number;
//     curveStartAngle?: number;
//     curveEndAngle?: number;
//     curveTension?: number;
//     curveStartTension?: number;
//     curveEndTension?: number;
// }

// export class S2LineData extends S2SimpleShapeData {
//     public startPosition: S2Position;
//     public endPosition: S2Position;

//     constructor() {
//         super();
//         this.startPosition = new S2Position();
//         this.endPosition = new S2Position();
//     }
// }

// export class S2RectData extends S2SimpleShapeData {
//     public position: S2Position;
//     public radius: S2Length;

//     public extents: S2Extents;
//     public anchor: S2Anchor = 'north';

//     constructor() {
//         super();
//         this.position = new S2Position(0, 0, 'world');
//         this.radius = new S2Length(0, 'view');
//         this.extents = new S2Extents(1, 1, 'world');
//     }
// }

// export class S2FillRectData extends S2LayerData {
//     public fill: S2FillData;
//     constructor() {
//         super();
//         this.fill = new S2FillData();
//     }
// }

// export class S2TextGroupData extends S2SimpleShapeData {
//     public anchor: S2Anchor = 'center';
//     public minExtents: S2Extents;
//     public textAlign: S2TextAlign = 'center';
//     public verticalAlign: S2VerticalAlign = 'middle';

//     constructor() {
//         super();
//         this.minExtents = new S2Extents(0, 0, 'view');
//     }
// }

// export class S2GridData extends S2SimpleShapeData {
//     public position: S2Position;
//     public extents: S2Extents;
//     public steps: S2Extents;

//     constructor() {
//         super();
//         this.position = new S2Position(0, 0, 'world');
//         this.extents = new S2Extents(5, 5, 'world');
//         this.steps = new S2Extents(1, 1, 'world');
//     }
// }
