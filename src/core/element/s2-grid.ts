import { type S2BaseScene } from '../s2-interface';
import { S2TransformGraphic, S2TransformGraphicData } from './s2-transform-graphic';
import { S2Extents, S2Position } from '../s2-types';
import { svgNS } from '../s2-globals';

export class S2GridGeometryData {
    public readonly lowerBound: S2Position;
    public readonly upperBound: S2Position;
    public readonly steps: S2Extents;
    public readonly anchor: S2Position;

    constructor() {
        this.lowerBound = new S2Position(-8, -4.5, 'world');
        this.upperBound = new S2Position(+8, +4.5, 'world');
        this.steps = new S2Extents(1, 1, 'world');
        this.anchor = new S2Position(0, 0, 'world');
    }

    copy(other: S2GridGeometryData): void {
        this.lowerBound.copy(other.lowerBound);
        this.upperBound.copy(other.upperBound);
        this.steps.copy(other.steps);
        this.anchor.copy(other.anchor);
    }

    applyToElement(element: SVGElement, scene: S2BaseScene): void {
        const epsilon = 1e-5;
        const camera = scene.getActiveCamera();
        const lowerBound = this.lowerBound.toSpace('view', camera);
        const upperBound = this.upperBound.toSpace('view', camera);
        const steps = this.steps.toSpace('view', camera);
        const anchor = this.anchor.toSpace('view', camera);
        const lowerX = Math.min(lowerBound.x, upperBound.x);
        const upperX = Math.max(lowerBound.x, upperBound.x);
        const lowerY = Math.min(lowerBound.y, upperBound.y);
        const upperY = Math.max(lowerBound.y, upperBound.y);
        const startX = anchor.x - Math.floor((anchor.x - lowerX) / steps.x) * steps.x;
        const startY = anchor.y - Math.floor((anchor.y - lowerY) / steps.y) * steps.y;
        let d = '';
        for (let x = startX; x < upperX + epsilon; x += steps.x) {
            d += `M${x},${lowerY} L${x},${upperY} `;
        }
        for (let y = startY; y < upperY + epsilon; y += steps.y) {
            d += `M${lowerX},${y} L${upperX},${y} `;
        }
        element.setAttribute('d', d);
    }
}

export class S2GridData extends S2TransformGraphicData {
    public readonly geometry: S2GridGeometryData;

    constructor() {
        super();
        this.geometry = new S2GridGeometryData();
    }

    copy(other: S2GridData): void {
        super.copy(other);
        this.geometry.copy(other.geometry);
    }

    applyToElement(element: SVGElement, scene: S2BaseScene): void {
        super.applyToElement(element, scene);
        this.geometry.applyToElement(element, scene);
    }
}

export class S2Grid extends S2TransformGraphic<S2GridData> {
    protected element: SVGPathElement;

    constructor(scene: S2BaseScene) {
        super(scene, new S2GridData());
        this.element = document.createElementNS(svgNS, 'path');
    }

    get lowerBound(): S2Position {
        return this.data.geometry.lowerBound;
    }

    get upperBound(): S2Position {
        return this.data.geometry.upperBound;
    }

    get steps(): S2Extents {
        return this.data.geometry.steps;
    }

    get anchor(): S2Position {
        return this.data.geometry.anchor;
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    update(updateId?: number): this {
        if (this.shouldSkipUpdate(updateId)) return this;
        this.data.applyToElement(this.element, this.scene);
        return this;
    }
}
