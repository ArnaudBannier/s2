import { S2ShapeUtils } from '../math/s2-shape-utils';
import { S2BaseScene } from '../s2-base-scene';
import { S2Vec2 } from '../math/s2-vec2';
import { svgNS, type S2Anchor, S2AnchorUtils } from '../s2-globals';
import { type S2Space, S2Length, S2Extents, S2Enum, S2Number, S2Transform, S2Position, S2TypeState } from '../s2-types';
import { S2BaseData, S2FillData, S2StrokeData } from './base/s2-base-data';
import { S2Element } from './base/s2-element';
import { S2DataUtils } from './base/s2-data-utils';

export class S2RectData extends S2BaseData {
    public readonly fill: S2FillData;
    public readonly stroke: S2StrokeData;
    public readonly opacity: S2Number;
    public readonly transform: S2Transform;

    public readonly position: S2Position;
    public readonly extents: S2Extents;
    public readonly anchor: S2Enum<S2Anchor>;
    public readonly cornerRadius: S2Length;

    constructor() {
        super();
        this.fill = new S2FillData();
        this.stroke = new S2StrokeData();
        this.opacity = new S2Number(1, S2TypeState.Inactive);
        this.transform = new S2Transform();
        this.position = new S2Position(0, 0, 'world');
        this.extents = new S2Extents(1, 1, 'world');
        this.anchor = new S2Enum<S2Anchor>('center');
        this.cornerRadius = new S2Length(0, 'view');

        this.stroke.opacity.set(1, S2TypeState.Inactive);
        this.transform.state = S2TypeState.Inactive;
        this.fill.opacity.set(1, S2TypeState.Inactive);
    }
}

export class S2Rect extends S2Element<S2RectData> {
    protected element: SVGRectElement;

    constructor(scene: S2BaseScene) {
        super(scene, new S2RectData());
        this.element = document.createElementNS(svgNS, 'rect');
    }

    getExtents(space: S2Space): S2Vec2 {
        return this.data.extents.toSpace(space, this.scene.getActiveCamera());
    }

    getCornerRadius(space: S2Space): number {
        return this.data.cornerRadius.toSpace(space, this.scene.getActiveCamera());
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    getPointInDirection(direction: S2Vec2, space: S2Space, distance: S2Length): S2Vec2 {
        const camera = this.scene.getActiveCamera();
        const d = distance.toSpace(space, camera);
        const extents = this.data.extents.toSpace(space, camera).add(d, d).max(0, 0);
        const radius = Math.min(Math.max(this.data.cornerRadius.toSpace(space, camera) + d, 0), extents.x, extents.y);
        const center = S2AnchorUtils.getCenter(
            this.data.anchor.getInherited(),
            space,
            camera,
            this.data.position,
            this.data.extents,
        );
        return S2ShapeUtils.intersectDirectionRoundedRectangle(direction, extents, radius).addV(center);
    }

    protected updateImpl(updateId?: number): void {
        void updateId;
        S2DataUtils.applyFill(this.data.fill, this.element, this.scene);
        S2DataUtils.applyStroke(this.data.stroke, this.element, this.scene);
        S2DataUtils.applyOpacity(this.data.opacity, this.element, this.scene);
        S2DataUtils.applyTransform(this.data.transform, this.element, this.scene);
        S2DataUtils.applyAnchoredPosition(
            this.data.position,
            this.data.extents,
            this.data.anchor,
            this.element,
            this.scene,
        );
        S2DataUtils.applyExtents(this.data.extents, this.element, this.scene);
        S2DataUtils.applyCornerRadius(this.data.cornerRadius, this.element, this.scene);
    }
}
