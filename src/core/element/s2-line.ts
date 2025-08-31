import { S2Vec2 } from '../math/s2-vec2';
import { type S2BaseScene } from '../s2-interface';
import { svgNS } from '../s2-globals';
import { NewS2SimpleShape, S2Shape, S2SMonoGraphicData } from './s2-shape';
import { type S2Space, S2Position } from '../math/s2-space';

export class S2LineData extends S2SMonoGraphicData {
    public startPosition: S2Position;
    public endPosition: S2Position;

    constructor() {
        super();
        this.startPosition = new S2Position();
        this.endPosition = new S2Position();
    }

    copy(other: S2LineData): void {
        super.copy(other);
        this.startPosition.copy(other.startPosition);
        this.endPosition.copy(other.endPosition);
    }

    applyToElement(element: SVGElement, scene: S2BaseScene): void {
        super.applyToElement(element, scene);
        const start = this.startPosition.toSpace('view', scene.activeCamera);
        const end = this.endPosition.toSpace('view', scene.activeCamera);
        element.setAttribute('x1', start.x.toString());
        element.setAttribute('y1', start.y.toString());
        element.setAttribute('x2', end.x.toString());
        element.setAttribute('y2', end.y.toString());
    }
}

export class NewS2Line extends NewS2SimpleShape<S2LineData> {
    protected element: SVGLineElement;

    constructor(scene: S2BaseScene) {
        const data = new S2LineData();
        super(scene, data);
        this.element = document.createElementNS(svgNS, 'line');
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    update(): this {
        this.data.applyToElement(this.element, this.scene);
        return this;
    }
}

export class S2Line extends S2Shape {
    protected element: SVGLineElement;
    protected endPosition: S2Position;

    constructor(scene: S2BaseScene) {
        super(scene);
        this.element = document.createElementNS(svgNS, 'line');
        this.endPosition = new S2Position(0, 0, 'world');
    }

    getSVGElement(): SVGLineElement {
        return this.element;
    }

    update(): this {
        this.updateSVGTransform(this.element);
        this.updateSVGStyle(this.element);
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

    setStartV(position: S2Vec2, space?: S2Space): this {
        return this.setPositionV(position, space);
    }

    setEnd(x: number, y: number, space?: S2Space): this {
        if (space) this.endPosition.space = space;
        this.endPosition.value.set(x, y);
        return this;
    }

    setEndV(end: S2Vec2, space?: S2Space): this {
        if (space) this.endPosition.space = space;
        this.endPosition.value.copy(end);
        return this;
    }

    getStart(space: S2Space = this.position.space): S2Vec2 {
        return this.position.toSpace(space, this.getActiveCamera());
    }

    getEnd(space: S2Space = this.position.space): S2Vec2 {
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
