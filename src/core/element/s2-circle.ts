import { type S2BaseScene } from '../s2-interface';
import { S2Vec2 } from '../math/s2-vec2';
import { svgNS } from '../s2-globals';
import { S2TransformGraphic, S2TransformGraphicData } from './s2-transform-graphic';
import { type S2Space, S2Length, S2Position } from '../s2-types';

export class S2CircleData extends S2TransformGraphicData {
    public readonly position: S2Position;
    public readonly radius: S2Length;

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

export class S2Circle extends S2TransformGraphic<S2CircleData> {
    protected element: SVGCircleElement;

    constructor(scene: S2BaseScene) {
        super(scene, new S2CircleData());
        this.element = document.createElementNS(svgNS, 'circle');
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
        const radius = Math.max(this.data.radius.toSpace(space, camera) + d, 0);
        const point = direction.clone().normalize().scale(radius);
        return point.addV(this.data.position.toSpace(space, camera));
    }

    update(updateId?: number): this {
        if (this.shouldSkipUpdate(updateId)) return this;
        this.data.applyToElement(this.element, this.scene);
        return this;
    }
}
