import { type S2HasRadius, type S2BaseScene } from '../s2-interface';
import { S2Vec2 } from '../math/s2-vec2';
import { svgNS } from '../s2-globals';
import { NewS2SimpleShape, S2Shape, S2SimpleShapeData } from './s2-shape';
import { type S2Space, S2Length, S2Position } from '../math/s2-space';

export class S2CircleData extends S2SimpleShapeData {
    public position: S2Position;
    public radius: S2Length;

    constructor() {
        super();
        this.position = new S2Position(0, 0, 'world');
        this.radius = new S2Length(1, 'view');
    }

    copy(other: S2CircleData): void {
        super.copy(other);
        this.position.copy(other.position);
        this.radius.copy(other.radius);
    }

    applyToElement(element: SVGElement, scene: S2BaseScene): void {
        super.applyToElement(element, scene);
        const position = this.position.toSpace('view', scene.activeCamera);
        const radius = this.radius.toSpace('view', scene.activeCamera);
        element.setAttribute('cx', position.x.toString());
        element.setAttribute('cy', position.y.toString());
        element.setAttribute('r', radius.toString());
    }
}

export class NewS2Circle extends NewS2SimpleShape<S2CircleData> {
    protected element: SVGCircleElement;

    constructor(scene: S2BaseScene) {
        const data = new S2CircleData();
        super(scene, data);
        this.element = document.createElementNS(svgNS, 'circle');
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    getPointInDirection(direction: S2Vec2, space: S2Space, distance: S2Length): S2Vec2 {
        const camera = this.scene.activeCamera;
        const d = distance.toSpace(space, camera);
        const radius = Math.max(this.data.radius.toSpace(space, camera) + d, 0);
        const point = direction.clone().normalize().scale(radius);
        return point.addV(this.data.position.toSpace(space, camera));
    }

    update(): this {
        this.data.applyToElement(this.element, this.scene);
        return this;
    }
}

export class S2Circle extends S2Shape implements S2HasRadius {
    protected element: SVGCircleElement;
    public radius: S2Length;

    constructor(scene: S2BaseScene) {
        super(scene);
        this.element = document.createElementNS(svgNS, 'circle');
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

    getPointInDirection(direction: S2Vec2, space: S2Space = this.position.space, distance: S2Length): S2Vec2 {
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
