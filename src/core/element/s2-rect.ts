import { S2ShapeUtils } from '../math/s2-shape-utils';
import { type S2BaseScene } from '../s2-base-scene';
import { S2Vec2 } from '../math/s2-vec2';
import { svgNS, type S2Anchor, S2AnchorUtils } from '../s2-globals';
import { type S2Space, S2Length, S2Extents, S2Enum } from '../s2-types';
import { S2ShapeElement, S2ShapeElementData } from './base/s2-shape-element';

export class S2RectData extends S2ShapeElementData {
    public readonly cornerRadius: S2Length;
    public readonly extents: S2Extents;
    public readonly anchor: S2Enum<S2Anchor>;

    constructor() {
        super();
        this.cornerRadius = new S2Length(0, 'view');
        this.extents = new S2Extents(1, 1, 'world');
        this.anchor = new S2Enum<S2Anchor>('north');
    }

    applyToElement(element: SVGElement, scene: S2BaseScene): void {
        super.applyToElement(element, scene);
        const camera = scene.getActiveCamera();
        const radius = this.cornerRadius.toSpace('view', camera);
        const extents = this.extents.toSpace('view', camera);
        const northWest = S2AnchorUtils.getNorthWest(
            this.anchor.getInherited(),
            'view',
            camera,
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

    setCornerRadius(radius: number, space: S2Space): this {
        this.cornerRadius.set(radius, space);
        return this;
    }

    setExtents(x: number, y: number, space: S2Space): this {
        this.extents.set(x, y, space);
        return this;
    }

    setExtentsV(v: S2Vec2, space: S2Space): this {
        this.extents.setV(v, space);
        return this;
    }

    setAnchor(anchor: S2Anchor): this {
        this.anchor.set(anchor);
        return this;
    }
}

export class S2Rect extends S2ShapeElement<S2RectData> {
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
        this.data.applyToElement(this.element, this.scene);
    }
}
