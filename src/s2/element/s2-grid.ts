import { Vector2 } from '../../math/vector2';
import { type S2BaseScene } from '../s2-interface';
import { S2Shape } from './s2-shape';
import { type S2Space, S2Extents } from '../math/s2-space';
import { S2Path } from './s2-path';
import { S2Attributes } from '../s2-attributes';

export class S2Grid extends S2Shape {
    protected extents: S2Extents;
    protected steps: S2Extents;
    protected epsilon: number = 1e-5;
    protected path: S2Path;

    constructor(scene: S2BaseScene) {
        super(scene);
        this.extents = new S2Extents(0, 0, 'world');
        this.steps = new S2Extents(1, 1, 'world');
        this.path = new S2Path(scene);
    }

    getSVGElement(): SVGPathElement {
        return this.path.getSVGElement();
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

    setSteps(x: number, y: number, space?: S2Space): this {
        if (space) this.steps.space = space;
        this.steps.value.set(x, y);
        return this;
    }

    setStepsV(steps: Vector2, space?: S2Space): this {
        if (space) this.steps.space = space;
        this.steps.value.copy(steps);
        return this;
    }

    getExtents(space: S2Space = this.extents.space): Vector2 {
        return this.extents.toSpace(space, this.getActiveCamera());
    }

    getSteps(space: S2Space = this.steps.space): Vector2 {
        return this.steps.toSpace(space, this.getActiveCamera());
    }

    update(): this {
        this.path.clear();
        this.path.setSpace('world');
        this.path.setAttributes(
            new S2Attributes({
                strokeWidth: this.strokeWidth,
                strokeColor: this.strokeColor,
                fillOpacity: 0,
            }),
        );
        const position = this.getPosition('world');
        const extents = this.getExtents('world');
        const steps = this.getSteps('world');
        const lowerX = position.x - extents.x;
        const upperX = position.x + extents.x;
        const lowerY = position.y - extents.y;
        const upperY = position.y + extents.y;
        for (let x = lowerX; x < upperX + this.epsilon; x += steps.x) {
            this.path.moveTo(x, lowerY).lineTo(x, upperY);
        }
        for (let y = lowerY; y < upperY + this.epsilon; y += steps.y) {
            this.path.moveTo(lowerX, y).lineTo(upperX, y);
        }
        this.path.update();
        return this;
    }
}
