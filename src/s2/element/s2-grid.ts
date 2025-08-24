import { Vector2 } from '../../math/vector2';
import { type S2BaseScene } from '../s2-interface';
import { S2Line } from './s2-line';
import { S2Shape } from './s2-shape';
import { S2Group } from './s2-group';
import { type S2Space, S2Extents } from '../math/s2-space';

export class S2Grid extends S2Shape<SVGGElement> {
    protected extents: S2Extents;
    protected steps: S2Extents;
    protected epsilon: number = 1e-5;
    protected lineGroup: S2Group<S2Line>;

    constructor(scene: S2BaseScene) {
        const lineGroup = new S2Group<S2Line>(scene);
        super(lineGroup.getElement(), scene);

        this.lineGroup = lineGroup;
        this.lineGroup.addClass('s2-grid');
        this.extents = new S2Extents(0, 0, 'world');
        this.steps = new S2Extents(1, 1, 'world');
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

    private getLine(index: number): S2Line {
        if (index < this.lineGroup.getChildCount()) {
            return this.lineGroup.getChild(index);
        }
        const line = new S2Line(this.scene);
        this.lineGroup.appendChild(line);
        return line;
    }

    update(): this {
        super.update();
        const position = this.getPosition('world');
        const extents = this.getExtents('world');
        const steps = this.getSteps('world');
        let index = 0;
        const lowerX = position.x - extents.x;
        const upperX = position.x + extents.x;
        const lowerY = position.y - extents.y;
        const upperY = position.y + extents.y;
        for (let x = lowerX; x < upperX + this.epsilon; x += steps.x) {
            const line = this.getLine(index);
            line.setStart(x, lowerY, 'world').setEnd(x, upperY, 'world').update();
            index++;
        }
        for (let y = lowerY; y < upperY + this.epsilon; y += steps.y) {
            const line = this.getLine(index);
            line.setStart(lowerX, y, 'world').setEnd(upperX, y, 'world').update();
            index++;
        }
        while (this.lineGroup.getChildCount() > index) {
            this.lineGroup.removeLastChild();
        }
        return this;
    }
}
