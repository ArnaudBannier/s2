import { S2BaseScene } from '../scene/s2-base-scene';
import { S2Extents, S2Number, S2Position, S2Transform } from '../shared/s2-types';
import { svgNS, type S2Dirtyable } from '../shared/s2-globals';
import { S2Element } from './base/s2-element';
import { S2BaseData, S2ElementData, S2StrokeData } from './base/s2-base-data';
import { S2DataUtils } from './base/s2-data-utils';

export class S2GridData extends S2ElementData {
    public readonly stroke: S2StrokeData;
    public readonly opacity: S2Number;
    public readonly transform: S2Transform;
    public readonly geometry: S2GridGeometryData;

    constructor() {
        super();
        this.stroke = new S2StrokeData();
        this.opacity = new S2Number(1);
        this.transform = new S2Transform();
        this.geometry = new S2GridGeometryData();

        this.stroke.opacity.set(1);
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        this.stroke.setOwner(owner);
        this.opacity.setOwner(owner);
        this.transform.setOwner(owner);
        this.geometry.setOwner(owner);
    }

    clearDirty(): void {
        super.clearDirty();
        this.stroke.clearDirty();
        this.opacity.clearDirty();
        this.transform.clearDirty();
        this.geometry.clearDirty();
    }
}

export class S2GridGeometryData extends S2BaseData {
    public readonly boundA: S2Position;
    public readonly boundB: S2Position;
    public readonly steps: S2Extents;
    public readonly referencePoint: S2Position;

    constructor() {
        super();
        this.boundA = new S2Position(-8, -4.5, 'world');
        this.boundB = new S2Position(+8, +4.5, 'world');
        this.steps = new S2Extents(1, 1, 'world');
        this.referencePoint = new S2Position(0, 0, 'world');
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        this.boundA.setOwner(owner);
        this.boundB.setOwner(owner);
        this.steps.setOwner(owner);
        this.referencePoint.setOwner(owner);
    }

    clearDirty(): void {
        this.boundA.clearDirty();
        this.boundB.clearDirty();
        this.steps.clearDirty();
        this.referencePoint.clearDirty();
    }
}

export class S2Grid extends S2Element<S2GridData> {
    protected element: SVGPathElement;

    constructor(scene: S2BaseScene) {
        super(scene, new S2GridData());
        this.element = document.createElementNS(svgNS, 'path');
        this.data.stroke.width.set(1, 'view');
        this.data.stroke.lineCap.set('butt');
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    protected applyGeometry(): void {
        const scene = this.scene;
        const element = this.element;
        const data = this.data.geometry;
        const epsilon = 1e-5;
        const camera = scene.getActiveCamera();

        const boundA = data.boundA.toSpace('view', camera);
        const boundB = data.boundB.toSpace('view', camera);
        const steps = data.steps.toSpace('view', camera);
        const anchor = data.referencePoint.toSpace('view', camera);
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

    update(): void {
        if (this.skipUpdate()) return;

        S2DataUtils.applyStroke(this.data.stroke, this.element, this.scene);
        S2DataUtils.applyOpacity(this.data.opacity, this.element, this.scene);
        S2DataUtils.applyTransform(this.data.transform, this.element, this.scene);
        this.applyGeometry();

        this.clearDirty();
    }
}
