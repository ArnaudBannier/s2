import { S2Vec2 } from '../math/s2-vec2';
import { type S2BaseScene } from '../s2-interface';
import { S2Position, S2TypeState, type S2Space } from '../s2-types';
import { S2TransformGraphic, S2TransformGraphicData } from './s2-transform-graphic';

export class S2ShapeGraphicData extends S2TransformGraphicData {
    public readonly position: S2Position;

    constructor() {
        super();
        this.position = new S2Position(0, 0, 'world');
    }

    setParent(): void {
        super.setParent();
        this.position.setParent();
    }

    copy(other: S2ShapeGraphicData): void {
        super.copy(other);
        this.position.copy(other.position);
    }

    applyToElement(element: SVGElement, scene: S2BaseScene): void {
        super.applyToElement(element, scene);
    }
}

export abstract class S2ShapeGraphic<Data extends S2ShapeGraphicData> extends S2TransformGraphic<Data> {
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
