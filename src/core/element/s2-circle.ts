import { type S2BaseScene } from '../s2-base-scene';
import { S2Vec2 } from '../math/s2-vec2';
import { svgNS } from '../s2-globals';
import { type S2Space, S2Length } from '../s2-types';
import { S2ShapeElement, S2ShapeElementData } from './base/s2-shape-element';
import { S2DataUtils } from './base/s2-data-setter';

export class S2CircleData extends S2ShapeElementData {
    public readonly radius: S2Length;

    constructor() {
        super();
        this.radius = new S2Length(1, 'world');
    }
}

export class S2Circle extends S2ShapeElement<S2CircleData> {
    protected element: SVGCircleElement;

    constructor(scene: S2BaseScene) {
        super(scene, new S2CircleData());
        this.element = document.createElementNS(svgNS, 'circle');
    }

    getRadius(space: S2Space): number {
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
        S2DataUtils.applyFill(this.data.fill, this.element, this.scene);
        S2DataUtils.applyStroke(this.data.stroke, this.element, this.scene);
        S2DataUtils.applyOpacity(this.data.opacity, this.element, this.scene);
        S2DataUtils.applyTransform(this.data.transform, this.element, this.scene);
        S2DataUtils.applyPosition(this.data.position, this.element, this.scene, 'cx', 'cy');
        S2DataUtils.applyRadius(this.data.radius, this.element, this.scene);
    }
}
