import { type S2BaseScene } from '../s2-interface';
import { S2Vec2 } from '../math/s2-vec2';
import { svgNS } from '../s2-globals';
import { type S2Space, S2Length } from '../s2-types';
import { S2ShapeGraphic, S2ShapeGraphicData } from './s2-shape-graphic';

export class S2CircleData extends S2ShapeGraphicData {
    public readonly radius: S2Length;

    constructor() {
        super();
        this.radius = new S2Length(1, 'view');
    }

    copy(other: S2CircleData): void {
        super.copy(other);
        this.radius.copy(other.radius);
    }

    applyToElement(element: SVGElement, scene: S2BaseScene): void {
        super.applyToElement(element, scene);
        const camera = scene.getActiveCamera();
        const position = this.position.toSpace('view', camera);
        const radius = this.radius.toSpace('view', camera);
        element.setAttribute('cx', position.x.toString());
        element.setAttribute('cy', position.y.toString());
        element.setAttribute('r', radius.toString());
    }
}

export class S2Circle extends S2ShapeGraphic<S2CircleData> {
    protected element: SVGCircleElement;

    constructor(scene: S2BaseScene) {
        super(scene, new S2CircleData());
        this.element = document.createElementNS(svgNS, 'circle');
    }

    get radius(): S2Length {
        return this.data.radius;
    }

    setRadius(radius: number, space: S2Space = this.data.radius.space): this {
        this.data.radius.set(radius, space);
        return this;
    }

    getRadius(space: S2Space = this.data.radius.space): number {
        return this.data.radius.toSpace(space, this.scene.getActiveCamera());
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    getPointInDirection(direction: S2Vec2, space: S2Space, distance: S2Length): S2Vec2 {
        const camera = this.scene.getActiveCamera();
        const d = distance.toSpace(space, camera);
        const radius = Math.max(this.data.radius.toSpace(space, camera) + d, 0);
        const point = direction.clone().normalize().scale(radius);
        return point.addV(this.data.position.toSpace(space, camera));
    }

    protected updateImpl(updateId?: number): void {
        void updateId;
        this.data.applyToElement(this.element, this.scene);
    }
}
