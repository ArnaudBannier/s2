import { S2Vec2 } from '../../math/s2-vec2';
import { type S2BaseScene } from '../../s2-interface';
import { S2Position, S2TypeState, type S2Space } from '../../s2-types';
import { S2TransformableElement, S2TransformableElementData } from './s2-transformable-element';

export class S2ShapeElementData extends S2TransformableElementData {
    public readonly position: S2Position;

    constructor() {
        super();
        this.position = new S2Position(0, 0, 'world');
    }

    setParent(): void {
        super.setParent();
        this.position.setParent();
    }

    applyToElement(element: SVGElement, scene: S2BaseScene): void {
        super.applyToElement(element, scene);
    }
}

export abstract class S2ShapeElement<Data extends S2ShapeElementData> extends S2TransformableElement<Data> {
    constructor(scene: S2BaseScene, data: Data) {
        super(scene, data);
    }

    get position(): S2Position {
        return this.data.position;
    }

    setPosition(x: number, y: number, space?: S2Space, state: S2TypeState = S2TypeState.Active): this {
        this.data.position.set(x, y, space, state);
        return this;
    }

    setPositionV(v: S2Vec2, space?: S2Space, state: S2TypeState = S2TypeState.Active): this {
        this.data.position.setV(v, space, state);
        return this;
    }

    getPosition(space: S2Space): S2Vec2 {
        return this.data.position.toSpace(space, this.scene.getActiveCamera());
    }
}
