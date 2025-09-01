import { S2ShapeUtils } from '../math/s2-shape-utils';
import { type S2BaseScene, type S2HasExtents, type S2HasRadius } from '../s2-interface';
import { S2Vec2 } from '../math/s2-vec2';
import { svgNS, type S2Anchor, S2AnchorUtils } from '../s2-globals';
import { NewS2SimpleShape, S2Shape, S2SMonoGraphicData } from './s2-shape';
import { type S2Space, S2Length, S2Extents, S2Position } from '../s2-types';
import type { S2Animatable, S2Attributes } from '../s2-attributes';

export class S2RectData extends S2SMonoGraphicData {
    public position: S2Position;
    public radius: S2Length;
    public extents: S2Extents;
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
        }
    }
}

export class NewS2Rect extends NewS2SimpleShape<S2RectData> {
    protected element: SVGRectElement;

    constructor(scene: S2BaseScene) {
        const data = new S2RectData();
        super(scene, data);
        this.element = document.createElementNS(svgNS, 'rect');
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    getPointInDirection(direction: S2Vec2, space: S2Space, distance: S2Length): S2Vec2 {
        const camera = this.scene.activeCamera;
        const d = distance.toSpace(space, camera);
        const extents = this.data.extents.toSpace(space, camera).add(d, d).max(0, 0);
        const radius = Math.min(Math.max(this.data.radius.toSpace(space, camera) + d, 0), extents.x, extents.y);

        const center = S2AnchorUtils.getNorthWest(
            this.data.anchor,
            'view',
            camera,
            this.data.position,
            this.data.extents,
        );

        return S2ShapeUtils.intersectDirectionRoundedRectangle(direction, extents, radius).addV(center);
    }

    update(): this {
        this.data.applyToElement(this.element, this.scene);
        return this;
    }
}

export class S2Rect extends S2Shape implements S2HasRadius, S2HasExtents {
    protected element: SVGRectElement;
    public radius: S2Length;
    public extents: S2Extents;
    protected anchor: S2Anchor = 'north';

    constructor(scene: S2BaseScene) {
        super(scene);
        this.element = document.createElementNS(svgNS, 'rect');
        this.extents = new S2Extents(1, 1, 'world');
        this.radius = new S2Length(0, 'view');
    }

    setAnimatableAttributes(attributes: S2Animatable): this {
        super.setAnimatableAttributes(attributes);
        if (attributes.extents) this.extents.copy(attributes.extents);
        if (attributes.radius) this.radius.copy(attributes.radius);
        return this;
    }

    getAnimatableAttributes(): S2Animatable {
        const attributes = super.getAnimatableAttributes();
        attributes.extents = this.extents.clone();
        attributes.radius = this.radius.clone();
        return attributes;
    }

    setAttributes(attributes: S2Attributes): this {
        super.setAttributes(attributes);
        if (attributes.extents) this.extents.copy(attributes.extents);
        if (attributes.radius) this.radius.copy(attributes.radius);
        return this;
    }

    getAttributes(): S2Attributes {
        const attributes = super.getAttributes();
        attributes.extents = this.extents.clone();
        attributes.radius = this.radius.clone();
        return attributes;
    }

    getSVGElement(): SVGRectElement {
        return this.element;
    }

    setAnchor(anchor: S2Anchor): this {
        this.anchor = anchor;
        return this;
    }

    setExtents(x: number, y: number, space?: S2Space): this {
        if (space) this.extents.space = space;
        this.extents.value.set(x, y);
        return this;
    }

    setExtentsV(extents: S2Vec2, space?: S2Space): this {
        if (space) this.extents.space = space;
        this.extents.value.copy(extents);
        return this;
    }

    setRadius(radius?: number, space?: S2Space): this {
        if (space) this.radius.space = space;
        this.radius.value = radius ?? 0;
        return this;
    }

    setRadiusL(radius?: S2Length): this {
        this.radius.copy(radius);
        return this;
    }

    getExtents(space: S2Space = this.extents.space): S2Vec2 {
        return this.extents.toSpace(space, this.getActiveCamera());
    }

    getRadius(space: S2Space = this.radius.space): number {
        return this.radius.toSpace(space, this.getActiveCamera());
    }

    getCenter(space: S2Space = this.position.space): S2Vec2 {
        return S2AnchorUtils.getCenter(this.anchor, space, this.getActiveCamera(), this.position, this.extents);
    }

    getPointInDirection(direction: S2Vec2, space: S2Space = this.position.space, distance: S2Length): S2Vec2 {
        const d = distance.toSpace(space, this.getActiveCamera());
        const extents = this.getExtents(space).add(d, d).max(0, 0);
        const radius = Math.min(Math.max(this.getRadius(space) + d, 0), extents.x, extents.y);

        return S2ShapeUtils.intersectDirectionRoundedRectangle(direction, extents, radius).addV(this.getCenter(space));
    }

    changeExtentsSpace(space: S2Space): this {
        this.extents.changeSpace(space, this.getActiveCamera());
        return this;
    }

    changeRadiusSpace(space: S2Space): this {
        this.radius.changeSpace(space, this.getActiveCamera());
        return this;
    }

    update(): this {
        this.updateSVGTransform(this.element);
        this.updateSVGStyle(this.element);
        const extents = this.getExtents('view');
        const northWest = this.getCenter('view').subV(extents);
        this.element.setAttribute('x', northWest.x.toString());
        this.element.setAttribute('y', northWest.y.toString());
        this.element.setAttribute('width', (2 * extents.x).toString());
        this.element.setAttribute('height', (2 * extents.y).toString());
        if (this.radius.value > 0) {
            const radius = Math.min(this.getRadius('view'), extents.x, extents.y);
            this.element.setAttribute('rx', radius.toString());
            this.element.setAttribute('ry', radius.toString());
        }
        return this;
    }
}
