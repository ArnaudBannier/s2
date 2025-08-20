import { Vector2 } from '../../math/vector2';
import { type S2SceneInterface } from '../s2-scene-interface';
import { svgNS } from '../s2-globals';
import { S2Shape } from './s2-shape';
import { type S2Space, S2Position } from '../s2-space';

export class S2Line extends S2Shape<SVGLineElement> {
    protected endPosition: S2Position;

    constructor(scene: S2SceneInterface) {
        const element = document.createElementNS(svgNS, 'line');
        super(element, scene);
        this.endPosition = new S2Position(0, 0, 'world');
    }

    update(): this {
        super.update();
        const start = this.getStart('view');
        const end = this.getEnd('view');
        this.element.setAttribute('x1', start.x.toString());
        this.element.setAttribute('y1', start.y.toString());
        this.element.setAttribute('x2', end.x.toString());
        this.element.setAttribute('y2', end.y.toString());
        return this;
    }

    setStart(x: number, y: number, space?: S2Space): this {
        return this.setPosition(x, y, space);
    }

    setStartV(position: Vector2, space?: S2Space): this {
        return this.setPositionV(position, space);
    }

    setEnd(x: number, y: number, space?: S2Space): this {
        if (space) this.endPosition.space = space;
        this.endPosition.value.set(x, y);
        return this;
    }

    setEndV(end: Vector2, space?: S2Space): this {
        if (space) this.endPosition.space = space;
        this.endPosition.value.copy(end);
        return this;
    }

    getStart(space: S2Space = this.position.space): Vector2 {
        return this.position.toSpace(space, this.getActiveCamera());
    }

    getEnd(space: S2Space = this.position.space): Vector2 {
        return this.endPosition.toSpace(space, this.getActiveCamera());
    }

    changeStartSpace(space: S2Space): this {
        return this.changePositionSpace(space);
    }

    changeEndSpace(space: S2Space): this {
        this.endPosition.changeSpace(space, this.getActiveCamera());
        return this;
    }
}
