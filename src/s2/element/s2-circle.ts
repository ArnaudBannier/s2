import { type S2HasRadius, type S2BaseScene } from '../s2-interface';
import { Vector2 } from '../../math/vector2';
import { svgNS } from '../s2-globals';
import { S2Shape } from './s2-shape';
import { type S2Space, S2Length } from '../math/s2-space';
//import type { S2Animatable } from '../s2-attributes';

export class S2Circle extends S2Shape<SVGCircleElement> implements S2HasRadius {
    protected element: SVGCircleElement;
    public radius: S2Length;

    constructor(scene: S2BaseScene) {
        const element = document.createElementNS(svgNS, 'circle');
        super(scene, element);
        this.element = element;
        this.radius = new S2Length(1, 'world');
    }

    // setAnimatableAttributes(attributes: S2Animatable): this {
    //     super.setAnimatableAttributes(attributes);
    //     return this;
    // }

    // getAnimatableAttributes(): S2Animatable {
    //     const attributes = super.getAnimatableAttributes();
    //     return attributes;
    // }

    getSVGElement(): SVGCircleElement {
        return this.element;
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

    getRadius(space: S2Space = this.radius.space): number {
        return this.radius.toSpace(space, this.getActiveCamera());
    }

    getPointInDirection(direction: Vector2, space: S2Space = this.position.space, distance: S2Length): Vector2 {
        const d = distance.toSpace(space, this.getActiveCamera());
        const radius = Math.max(this.getRadius(space) + d, 0);
        const point = direction.clone().normalize().scale(radius);
        return point.addV(this.getPosition(space));
    }

    changeRadiusSpace(space: S2Space): this {
        this.radius.changeSpace(space, this.getActiveCamera());
        return this;
    }

    update(): this {
        this.updateSVGTransform(this.element);
        this.updateSVGStyle(this.element);
        const position = this.getPosition('view');
        const radius = this.getRadius('view');
        this.element.setAttribute('cx', position.x.toString());
        this.element.setAttribute('cy', position.y.toString());
        this.element.setAttribute('r', radius.toString());
        return this;
    }
}
