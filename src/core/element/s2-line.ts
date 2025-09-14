import { S2BaseScene } from '../s2-base-scene';
import { svgNS } from '../s2-globals';
import { S2TransformableElementData } from './base/s2-transformable-element';
import { S2Position, S2TypeState, type S2Space } from '../s2-types';
import { S2Element } from './base/s2-element';

export class S2LineData extends S2TransformableElementData {
    public readonly startPosition: S2Position;
    public readonly endPosition: S2Position;

    constructor() {
        super();
        this.startPosition = new S2Position();
        this.endPosition = new S2Position();
    }

    applyToElement(element: SVGElement, scene: S2BaseScene): void {
        super.applyToElement(element, scene);
        const camera = scene.getActiveCamera();
        const start = this.startPosition.toSpace('view', camera);
        const end = this.endPosition.toSpace('view', camera);
        element.setAttribute('x1', start.x.toString());
        element.setAttribute('y1', start.y.toString());
        element.setAttribute('x2', end.x.toString());
        element.setAttribute('y2', end.y.toString());
    }

    setStartPosition(x: number, y: number, space?: S2Space, state: S2TypeState = S2TypeState.Active): this {
        this.startPosition.set(x, y, space, state);
        return this;
    }

    setEndPosition(x: number, y: number, space?: S2Space, state: S2TypeState = S2TypeState.Active): this {
        this.endPosition.set(x, y, space, state);
        return this;
    }
}

export class S2Line extends S2Element<S2LineData> {
    protected element: SVGLineElement;

    constructor(scene: S2BaseScene) {
        super(scene, new S2LineData());
        this.element = document.createElementNS(svgNS, 'line');
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    protected updateImpl(updateId?: number): void {
        void updateId;
        this.data.applyToElement(this.element, this.scene);
    }
}
