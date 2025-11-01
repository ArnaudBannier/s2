import type { S2BaseScene } from '../../scene/s2-base-scene';
import type { S2Space } from '../../math/s2-space';
import type { S2SDF } from '../../math/curve/s2-sdf';
import type { S2BaseEdge } from './s2-base-edge';
import { S2Vec2 } from '../../math/s2-vec2';
import { svgNS } from '../../shared/s2-globals';
import { S2Element } from '../base/s2-element';
import { S2Extents } from '../../shared/s2-extents';
import { S2NodeData } from './s2-node-data';
import { S2Point } from '../../shared/s2-point';
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
    protected readonly defaultSDF: S2NodeCenterSDF = new S2NodeCenterSDF(this);
    protected background: S2PathRect | S2PathCircle | null = null;
    protected edges: S2BaseEdge[] = [];

    constructor(scene: S2BaseScene) {
        super(scene, new S2NodeData(scene));
        this.element = document.createElementNS(svgNS, 'g');
        this.extents = new S2Extents(0, 0, scene.getViewSpace());
        this.center = new S2Point(0, 0, scene.getWorldSpace());
        this.element.dataset.role = 'plain-node';
    }

    attachEdge(edge: S2BaseEdge): this {
        this.edges.push(edge);
        edge.markDirty();
        return this;
    }

    detachEdge(edge: S2BaseEdge): this {
        const index = this.edges.indexOf(edge);
        if (index === -1) return this;
        this.edges.splice(index, 1);
        edge.markDirty();
        return this;
    }

    getSDF(): S2SDF {
        if (this.background !== null) {
            return this.background;
        } else {
            return this.defaultSDF;
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

        this.background.data.space.set(this.data.space.get());
        this.background.data.stroke.copyIfUnlocked(this.data.background.stroke);
        this.background.data.fill.copyIfUnlocked(this.data.background.fill);
        this.background.data.opacity.copyIfUnlocked(this.data.background.opacity);
        this.background.data.transform.copyIfUnlocked(this.data.background.transform);

        if (this.background instanceof S2PathRect) {
            // Rectangle
            this.background.data.position.copy(this.center);
            this.background.data.extents.copy(this.extents);
            this.background.data.anchor.set(0, 0);
            this.background.data.cornerRadius.copyIfUnlocked(this.data.background.cornerRadius);
        } else if (this.background instanceof S2PathCircle) {
            // Circle
            this.background.data.position.copy(this.center);
            this.extents.getMaxLengthInto(this.background.data.radius);
        }

        this.background.update();
    }

    protected updateEdges(): void {
        for (const edge of this.edges) {
            edge.markDirty();
            edge.update();
        }
    }
}
