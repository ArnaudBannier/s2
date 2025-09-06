import { S2ShapeUtils } from '../math/s2-shape-utils';
import { type S2BaseScene } from '../s2-interface';
import { S2Vec2 } from '../math/s2-vec2';
import { svgNS, type S2Anchor, S2AnchorUtils } from '../s2-globals';
import { S2TransformGraphic, S2TransformGraphicData } from './s2-shape';
import { type S2Space, S2Length, S2Extents, S2Position } from '../s2-types';

export class S2RectData extends S2TransformGraphicData {
    public readonly position: S2Position;
    public readonly radius: S2Length;
    public readonly extents: S2Extents;
    public anchor: S2Anchor;

    constructor() {
        super();
        this.position = new S2Position(0, 0, 'world');
        this.radius = new S2Length(0, 'view');
        this.extents = new S2Extents(1, 1, 'world');
        this.anchor = 'north';
    }

    copy(other: S2RectData): void {
        super.copy(other);
        this.position.copy(other.position);
        this.radius.copy(other.radius);
        this.extents.copy(other.extents);
        this.anchor = other.anchor;
    }

    applyToElement(element: SVGElement, scene: S2BaseScene): void {
        super.applyToElement(element, scene);
        const radius = this.radius.toSpace('view', scene.activeCamera);
        const extents = this.extents.toSpace('view', scene.activeCamera);
        const northWest = S2AnchorUtils.getNorthWest(
            this.anchor,
            'view',
            scene.activeCamera,
            this.position,
            this.extents,
        );
        element.setAttribute('x', northWest.x.toString());
        element.setAttribute('y', northWest.y.toString());
        element.setAttribute('width', (2 * extents.x).toString());
        element.setAttribute('height', (2 * extents.y).toString());
        if (radius > 0) {
            element.setAttribute('rx', radius.toString());
            element.setAttribute('ry', radius.toString());
        } else {
            element.removeAttribute('rx');
            element.removeAttribute('ry');
        }
    }
}

export class S2Rect extends S2TransformGraphic<S2RectData> {
    protected element: SVGRectElement;

    constructor(scene: S2BaseScene) {
        super(scene, new S2RectData());
        this.element = document.createElementNS(svgNS, 'rect');
    }

    get extents(): S2Extents {
        return this.data.extents;
    }

    get position(): S2Position {
        return this.data.position;
    }

    get radius(): S2Length {
        return this.data.radius;
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    getPointInDirection(direction: S2Vec2, space: S2Space, distance: S2Length): S2Vec2 {
        const camera = this.scene.activeCamera;
        const d = distance.toSpace(space, camera);
        const extents = this.data.extents.toSpace(space, camera).add(d, d).max(0, 0);
        const radius = Math.min(Math.max(this.data.radius.toSpace(space, camera) + d, 0), extents.x, extents.y);
        const center = S2AnchorUtils.getCenter(this.data.anchor, space, camera, this.data.position, this.data.extents);
        return S2ShapeUtils.intersectDirectionRoundedRectangle(direction, extents, radius).addV(center);
    }

    update(updateId?: number): this {
        if (this.shouldSkipUpdate(updateId)) return this;
        this.data.applyToElement(this.element, this.scene);
        return this;
    }
}
