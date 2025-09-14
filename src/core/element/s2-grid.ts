import { type S2BaseScene } from '../s2-base-scene';
import { S2TransformableElementData } from './base/s2-transformable-element';
import { S2Extents, S2Position, S2TypeState, type S2Space } from '../s2-types';
import { svgNS } from '../s2-globals';
import { S2Element } from './base/s2-element';

export class S2GridGeometryData {
    public readonly boundA: S2Position;
    public readonly boundB: S2Position;
    public readonly steps: S2Extents;
    public readonly referencePoint: S2Position;

    constructor() {
        this.boundA = new S2Position(-8, -4.5, 'world');
        this.boundB = new S2Position(+8, +4.5, 'world');
        this.steps = new S2Extents(1, 1, 'world');
        this.referencePoint = new S2Position(0, 0, 'world');
    }

    applyToElement(element: SVGElement, scene: S2BaseScene): void {
        const epsilon = 1e-5;
        const camera = scene.getActiveCamera();
        const boundA = this.boundA.toSpace('view', camera);
        const boundB = this.boundB.toSpace('view', camera);
        const steps = this.steps.toSpace('view', camera);
        const anchor = this.referencePoint.toSpace('view', camera);
        const lowerX = Math.min(boundA.x, boundB.x);
        const upperX = Math.max(boundA.x, boundB.x);
        const lowerY = Math.min(boundA.y, boundB.y);
        const upperY = Math.max(boundA.y, boundB.y);
        const startX = anchor.x - Math.floor((anchor.x - lowerX) / steps.x) * steps.x;
        const startY = anchor.y - Math.floor((anchor.y - lowerY) / steps.y) * steps.y;
        let d = '';
        for (let x = startX; x < upperX + epsilon; x += steps.x) {
            d += `M${x},${lowerY} V ${upperY} `;
        }
        for (let y = startY; y < upperY + epsilon; y += steps.y) {
            d += `M${lowerX},${y} H ${upperX} `;
        }
        element.setAttribute('d', d.trimEnd());
    }
}

export class S2GridData extends S2TransformableElementData {
    public readonly geometry: S2GridGeometryData;

    constructor() {
        super();
        this.geometry = new S2GridGeometryData();
    }

    applyToElement(element: SVGElement, scene: S2BaseScene): void {
        super.applyToElement(element, scene);
        this.geometry.applyToElement(element, scene);
    }

    setBoundA(x: number, y: number, space?: S2Space, state: S2TypeState = S2TypeState.Active): this {
        this.geometry.boundA.set(x, y, space, state);
        return this;
    }

    setBoundB(x: number, y: number, space?: S2Space, state: S2TypeState = S2TypeState.Active): this {
        this.geometry.boundB.set(x, y, space, state);
        return this;
    }

    setSteps(x: number, y: number, space?: S2Space, state: S2TypeState = S2TypeState.Active): this {
        this.geometry.steps.set(x, y, space, state);
        return this;
    }

    setReferencePoint(x: number, y: number, space?: S2Space, state: S2TypeState = S2TypeState.Active): this {
        this.geometry.referencePoint.set(x, y, space, state);
        return this;
    }
}

export class S2Grid extends S2Element<S2GridData> {
    protected element: SVGPathElement;

    constructor(scene: S2BaseScene) {
        super(scene, new S2GridData());
        this.element = document.createElementNS(svgNS, 'path');
        this.data.stroke.width.set(1, 'view', S2TypeState.Active);
        this.data.stroke.lineCap.set('butt', S2TypeState.Active);
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    protected updateImpl(updateId?: number): void {
        void updateId;
        this.data.applyToElement(this.element, this.scene);
    }
}
