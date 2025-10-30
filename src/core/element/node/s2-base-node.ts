import type { S2BaseScene } from '../../scene/s2-base-scene';
import { S2Vec2 } from '../../math/s2-vec2';
import { svgNS } from '../../shared/s2-globals';
import { S2Element } from '../base/s2-element';
import { S2Extents } from '../../shared/s2-extents';
import type { S2Space } from '../../math/s2-space';
import { S2NodeData } from './s2-node-data';
import { S2Point } from '../../shared/s2-point';
import type { S2SDF } from '../../math/curve/s2-sdf';
import { S2PathRect } from '../s2-path-rect';
import { S2PathCircle } from '../s2-path-circle';

class S2NodeCenterSDF implements S2SDF {
    protected readonly node: S2BaseNode;
    protected readonly center: S2Vec2 = new S2Vec2(0, 0);
    protected radius: number = 0;

    constructor(node: S2BaseNode) {
        this.node = node;
    }

    evaluateSDF(x: number, y: number): number {
        const dx = x - this.center.x;
        const dy = y - this.center.y;
        return Math.sqrt(dx * dx + dy * dy) - this.radius;
    }

    evaluateSDFV(p: S2Vec2): number {
        return this.evaluateSDF(p.x, p.y);
    }

    update(center: S2Vec2, radius: number): void {
        this.center.copy(center);
        this.radius = radius;
    }

    getCenterInto(dst: S2Vec2): void {
        dst.copy(this.center);
    }
}

export abstract class S2BaseNode extends S2Element<S2NodeData> {
    protected readonly element: SVGGElement;
    protected readonly center: S2Point;
    protected readonly extents: S2Extents;
    protected readonly baseSDF: S2NodeCenterSDF = new S2NodeCenterSDF(this);
    protected background: S2PathRect | S2PathCircle | null = null;

    //protected endPoints: S2EdgeEndpointOLD[];

    constructor(scene: S2BaseScene) {
        super(scene, new S2NodeData(scene));
        this.element = document.createElementNS(svgNS, 'g');
        this.extents = new S2Extents(0, 0, scene.getViewSpace());
        this.center = new S2Point(0, 0, scene.getWorldSpace());
        this.element.dataset.role = 'plain-node';
        //this.endPoints = [];
    }

    // attachEndPoint(endPoint: S2EdgeEndpointOLD): this {
    //     this.endPoints.push(endPoint);
    //     endPoint.markDirty();
    //     return this;
    // }

    // detachEndPoint(endPoint: S2EdgeEndpointOLD): this {
    //     const index = this.endPoints.indexOf(endPoint);
    //     if (index === -1) return this;
    //     this.endPoints.splice(index, 1);
    //     endPoint.markDirty();
    //     return this;
    // }

    getSDF(): S2SDF {
        if (this.background !== null) {
            return this.background;
        } else {
            return this.baseSDF;
        }
    }

    getPosition(space: S2Space): S2Vec2 {
        return this.data.position.get(space);
    }

    getExtents(space: S2Space): S2Vec2 {
        return this.extents.get(space);
    }

    getMinExtents(space: S2Space): S2Vec2 {
        return this.data.minExtents.get(space);
    }

    getPadding(space: S2Space): S2Vec2 {
        return this.data.padding.get(space);
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    getBackground(): S2PathCircle | S2PathRect | null {
        return this.background;
    }

    getCenterInto(dst: S2Vec2, space: S2Space): this {
        this.center.getInto(dst, space);
        return this;
    }

    getPositionInto(dst: S2Vec2, space: S2Space): this {
        this.data.position.getInto(dst, space);
        return this;
    }

    getExtentsInto(dst: S2Vec2, space: S2Space): this {
        this.extents.getInto(dst, space);
        return this;
    }

    getMinExtentsInto(dst: S2Vec2, space: S2Space): this {
        this.data.minExtents.getInto(dst, space);
        return this;
    }

    protected updateCenterAndSDF(): void {
        const space = this.data.space.get();
        const position = _vec0;
        const extents = _vec1;

        this.data.position.getInto(position, space);
        this.extents.getInto(extents, space);
        this.data.anchor.getCenterIntoV(this.center.value, position, extents);
        this.center.space = space;

        const radius = Math.max(extents.x, extents.y);
        this.baseSDF.update(this.center.value, radius);
    }

    protected updateBackground(): void {
        if (this.data.background.shape.isDirty()) {
            // Remove old background
            if (this.background !== null) this.background.setParent(null);

            // Create new background
            switch (this.data.background.shape.value) {
                case 'rectangle':
                    this.background = new S2PathRect(this.scene);
                    break;
                case 'circle':
                    this.background = new S2PathCircle(this.scene);
                    break;
                case 'none':
                    this.background = null;
                    return;
            }
            if (this.background) {
                this.background.data.layer.set(0);
                this.background.setParent(this);
            }
            this.updateSVGChildren();
        }

        if (this.background === null) return;

        const space = this.data.space.get();
        const nodeCenter = _vec0;
        const nodeExtents = _vec1;
        this.center.getInto(nodeCenter, space);
        this.extents.getInto(nodeExtents, space);

        this.background.data.space.set(this.data.space.get());
        this.background.data.stroke.copyIfUnlocked(this.data.background.stroke);
        this.background.data.fill.copyIfUnlocked(this.data.background.fill);
        this.background.data.opacity.copyIfUnlocked(this.data.background.opacity);
        this.background.data.transform.copyIfUnlocked(this.data.background.transform);
        if (this.background instanceof S2PathRect) {
            this.background.data.cornerRadius.copyIfUnlocked(this.data.background.cornerRadius);
        }

        // Position background
        if (this.background instanceof S2PathRect) {
            // Rectangle
            this.background.data.position.setV(nodeCenter, space);
            this.background.data.extents.setV(nodeExtents, space);
            this.background.data.anchor.set(0, 0);
        } else if (this.background instanceof S2PathCircle) {
            // Circle
            const radius = Math.max(nodeExtents.x, nodeExtents.y);
            this.background.data.position.setV(nodeCenter, space);
            this.background.data.radius.set(radius, space);
        }

        this.background.update();
    }

    protected updateEndPoints(): void {
        // for (const endpoint of this.endPoints) {
        //     endpoint.markDirty();
        //     endpoint.edge?.update();
        // }
    }
}

const _vec0 = new S2Vec2();
const _vec1 = new S2Vec2();
