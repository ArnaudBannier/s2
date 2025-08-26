import { ShapeUtils } from '../../math/shape-utils';
import { type S2BaseScene, type S2HasExtents, type S2HasRadius } from '../s2-interface';
import { Vector2 } from '../../math/vector2';
import { svgNS, type S2Anchor, S2AnchorUtils } from '../s2-globals';
import { S2Shape } from './s2-shape';
import { type S2Space, S2Length, S2Extents } from '../math/s2-space';

export class S2Rect extends S2Shape<SVGRectElement> implements S2HasRadius, S2HasExtents {
    protected element: SVGRectElement;
    public radius: S2Length;
    public extents: S2Extents;
    protected anchor: S2Anchor = 'north';

    constructor(scene: S2BaseScene) {
        const element = document.createElementNS(svgNS, 'rect');
        super(scene, element);
        this.element = element;
        this.extents = new S2Extents(1, 1, 'world');
        this.radius = new S2Length(0, 'view');
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

    setExtentsV(extents: Vector2, space?: S2Space): this {
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

    getExtents(space: S2Space = this.extents.space): Vector2 {
        return this.extents.toSpace(space, this.getActiveCamera());
    }

    getRadius(space: S2Space = this.radius.space): number {
        return this.radius.toSpace(space, this.getActiveCamera());
    }

    getCenter(space: S2Space = this.position.space): Vector2 {
        return S2AnchorUtils.getCenter(this.anchor, space, this.getActiveCamera(), this.position, this.extents);
    }

    getPointInDirection(direction: Vector2, space: S2Space = this.position.space, distance: S2Length): Vector2 {
        const d = distance.toSpace(space, this.getActiveCamera());
        const extents = this.getExtents(space).add(d, d).max(0, 0);
        const radius = Math.min(Math.max(this.getRadius(space) + d, 0), extents.x, extents.y);

        return ShapeUtils.intersectDirectionRoundedRectangle(direction, extents, radius).addV(this.getCenter(space));
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
