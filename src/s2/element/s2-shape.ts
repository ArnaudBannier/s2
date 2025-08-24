import { Vector2 } from '../../math/vector2';
import { type S2Attributes, type S2BaseScene } from '../s2-interface';
import { S2Graphics } from './s2-graphics';
import { type S2Space, S2Position } from '../s2-space';
import { type S2HasPosition } from '../s2-interface';

export abstract class S2Shape<T extends SVGGraphicsElement> extends S2Graphics<T> implements S2HasPosition {
    protected position: S2Position;

    constructor(element: T, scene: S2BaseScene) {
        super(element, scene);
        this.position = new S2Position(0, 0, 'world');
    }

    setParameters(params: S2Attributes): this {
        super.setParameters(params);
        if (params.position) this.setPositionV(params.position.value, params.position.space);
        return this;
    }

    getParameters(): S2Attributes {
        const parameters = super.getParameters();
        parameters.position = this.position.clone();
        return parameters;
    }

    setPosition(x: number, y: number, space?: S2Space): this {
        if (space) this.position.space = space;
        this.position.value.set(x, y);
        return this;
    }

    setPositionV(position: Vector2, space?: S2Space): this {
        if (space) this.position.space = space;
        this.position.value.copy(position);
        return this;
    }

    getPosition(space: S2Space = this.position.space): Vector2 {
        return this.position.toSpace(space, this.getActiveCamera());
    }

    getS2Position(): S2Position {
        return this.position.clone();
    }

    changePositionSpace(space: S2Space): this {
        this.position.changeSpace(space, this.getActiveCamera());
        return this;
    }
}
