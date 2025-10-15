import type { S2BaseScene } from '../scene/s2-base-scene';
import type { S2Dirtyable } from '../shared/s2-globals';
import { svgNS } from '../shared/s2-globals';
import { S2Element } from './base/s2-element';
import { S2BaseData, S2ElementData, S2StrokeData } from './base/s2-base-data';
import { S2DataUtils } from './base/s2-data-utils';
import { S2Number } from '../shared/s2-number';
import { S2Transform } from '../shared/s2-transform';
import { S2Point } from '../shared/s2-point';
import { S2Extents } from '../shared/s2-extents';
import { S2Enum } from '../shared/s2-enum';
import type { S2Space } from '../math/s2-camera';

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
        super.setOwner(owner);
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
    public readonly boundA: S2Point;
    public readonly boundB: S2Point;
    public readonly steps: S2Extents;
    public readonly referencePoint: S2Point;
    public readonly space: S2Enum<S2Space> = new S2Enum<S2Space>('world');

    constructor() {
        super();
        this.boundA = new S2Point(-8, -4.5, 'world');
        this.boundB = new S2Point(+8, +4.5, 'world');
        this.steps = new S2Extents(1, 1, 'world');
        this.referencePoint = new S2Point(0, 0, 'world');
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        this.boundA.setOwner(owner);
        this.boundB.setOwner(owner);
        this.steps.setOwner(owner);
        this.referencePoint.setOwner(owner);
        this.space.setOwner(owner);
    }

    clearDirty(): void {
        this.boundA.clearDirty();
        this.boundB.clearDirty();
        this.steps.clearDirty();
        this.referencePoint.clearDirty();
        this.space.clearDirty();
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
        const space = data.space.get();

        const boundA = data.boundA.get(space, camera);
        const boundB = data.boundB.get(space, camera);
        const steps = data.steps.get(space, camera);
        const anchor = data.referencePoint.get(space, camera);
        const lowerX = Math.min(boundA.x, boundB.x);
        const upperX = Math.max(boundA.x, boundB.x);
        const lowerY = Math.min(boundA.y, boundB.y);
        const upperY = Math.max(boundA.y, boundB.y);
        const startX = anchor.x - Math.floor((anchor.x - lowerX) / steps.x) * steps.x;
        const startY = anchor.y - Math.floor((anchor.y - lowerY) / steps.y) * steps.y;
        let d = '';
        for (let x = startX; x < upperX + epsilon; x += steps.x) {
            const pointA = scene.getActiveCamera().convertPoint(x, lowerY, space, 'view');
            const pointB = scene.getActiveCamera().convertPoint(x, upperY, space, 'view');
            d += `M${pointA.x},${pointA.y} L ${pointB.x},${pointB.y} `;
        }
        for (let y = startY; y < upperY + epsilon; y += steps.y) {
            const pointA = scene.getActiveCamera().convertPoint(lowerX, y, space, 'view');
            const pointB = scene.getActiveCamera().convertPoint(upperX, y, space, 'view');
            d += `M${pointA.x},${pointA.y} L ${pointB.x},${pointB.y} `;
        }
        element.setAttribute('d', d.trimEnd());
    }

    update(): void {
        if (this.skipUpdate()) return;

        S2DataUtils.applyPointerEvents(this.data.pointerEvents, this.element, this.scene);
        S2DataUtils.applyStroke(this.data.stroke, this.element, this.scene);
        S2DataUtils.applyOpacity(this.data.opacity, this.element, this.scene);
        S2DataUtils.applyTransform(this.data.transform, this.element, this.scene);
        this.applyGeometry();

        this.clearDirty();
    }
}
