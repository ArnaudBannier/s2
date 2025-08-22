import { Vector2 } from '../../math/vector2';
import { type S2BaseScene } from '../s2-interface';
import { S2Graphics } from './s2-graphics';
import { type S2Space, S2Position, S2Length } from '../s2-space';
import { type S2HasPosition, type S2HasStrokeWidth } from '../s2-interface';

export abstract class S2Shape<T extends SVGGraphicsElement>
    extends S2Graphics<T>
    implements S2HasPosition, S2HasStrokeWidth
{
    protected position: S2Position;
    protected strokeWidth: S2Length;

    constructor(element: T, scene: S2BaseScene) {
        super(element, scene);
        this.position = new S2Position(0, 0, 'world');
        this.strokeWidth = new S2Length(0, 'view');
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

    setStrokeWidth(strokeWidth: number, space?: S2Space): this {
        if (space) this.strokeWidth.space = space;
        this.strokeWidth.value = strokeWidth;
        return this;
    }

    getPosition(space: S2Space = this.position.space): Vector2 {
        return this.position.toSpace(space, this.getActiveCamera());
    }

    getStrokeWidth(space: S2Space = this.strokeWidth.space): number {
        return this.strokeWidth.toSpace(space, this.getActiveCamera());
    }

    changePositionSpace(space: S2Space): this {
        this.position.changeSpace(space, this.getActiveCamera());
        return this;
    }

    changeStrokeWidthSpace(space: S2Space): this {
        this.strokeWidth.changeSpace(space, this.getActiveCamera());
        return this;
    }

    update(): this {
        super.update();
        if (this.strokeWidth.value > 0) {
            const strokeWidth = this.getStrokeWidth('view');
            this.element.setAttribute('stroke-width', strokeWidth.toString());
        }
        return this;
    }
}
