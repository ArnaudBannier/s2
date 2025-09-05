import { type S2BaseScene } from '../s2-interface';
import { NewS2SimpleShape, S2SMonoGraphicData } from './s2-shape';
import { S2Extents, S2Position } from '../s2-types';
import { svgNS } from '../s2-globals';

export class S2GridGeometryData {
    public lowerBound: S2Position;
    public upperBound: S2Position;
    public steps: S2Extents;
    public anchor: S2Position;

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
        const lowerBound = this.lowerBound.toSpace('view', scene.activeCamera);
        const upperBound = this.upperBound.toSpace('view', scene.activeCamera);
        const steps = this.steps.toSpace('view', scene.activeCamera);
        const anchor = this.anchor.toSpace('view', scene.activeCamera);
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

export class S2GridData extends S2SMonoGraphicData {
    public geometry: S2GridGeometryData;

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

export class NewS2Grid extends NewS2SimpleShape<S2GridData> {
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
