import { S2Vec2 } from '../../math/s2-vec2';
import { S2BaseScene } from '../../s2-base-scene';
import { S2AnchorUtils, svgNS } from '../../s2-globals';
import { S2Rect } from '../s2-rect';
import { S2Circle } from '../s2-circle';
import { S2Extents, S2Length, type S2Space } from '../../s2-types';
import { S2Element } from '../base/s2-element';
import { S2NodeData } from './s2-node-data';
import type { S2EdgeEndpoint } from './s2-edge-endpoint';

export abstract class S2BaseNode extends S2Element<S2NodeData> {
    protected element: SVGGElement;
    protected background: S2Rect | S2Circle | null = null;
    protected extents: S2Extents;

    protected endPoints: S2EdgeEndpoint[];

    constructor(scene: S2BaseScene) {
        super(scene, new S2NodeData());
        this.element = document.createElementNS(svgNS, 'g');
        this.extents = new S2Extents(0, 0, 'view');
        this.element.dataset.role = 'plain-node';
        this.endPoints = [];
    }

    attachEndPoint(endPoint: S2EdgeEndpoint): this {
        this.endPoints.push(endPoint);
        endPoint.markDirty();
        return this;
    }

    detachEndPoint(endPoint: S2EdgeEndpoint): this {
        const index = this.endPoints.indexOf(endPoint);
        if (index === -1) return this;
        this.endPoints.splice(index, 1);
        endPoint.markDirty();
        return this;
    }

    getPosition(space: S2Space): S2Vec2 {
        return this.data.position.toSpace(space, this.scene.getActiveCamera());
    }

    getExtents(space: S2Space): S2Vec2 {
        return this.extents.toSpace(space, this.scene.getActiveCamera());
    }

    getMinExtents(space: S2Space): S2Vec2 {
        return this.data.minExtents.toSpace(space, this.scene.getActiveCamera());
    }

    getPadding(space: S2Space): S2Vec2 {
        return this.data.padding.toSpace(space, this.scene.getActiveCamera());
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    createRectBackground(): S2Rect {
        if (this.background !== null) this.background.setParent(null);
        this.background = new S2Rect(this.scene);
        this.background.data.layer.set(0);

        this.background.setParent(this);
        this.updateSVGChildren();
        return this.background;
    }

    createCircleBackground(): S2Circle {
        if (this.background !== null) this.background.setParent(null);
        this.background = new S2Circle(this.scene);
        this.background.data.layer.set(0);

        this.background.setParent(this);
        this.updateSVGChildren();
        return this.background;
    }

    getBackground(): S2Circle | S2Rect | null {
        return this.background;
    }

    getCenter(space: S2Space): S2Vec2 {
        return S2AnchorUtils.getCenter(
            this.data.anchor.get(),
            space,
            this.scene.getActiveCamera(),
            this.data.position,
            this.extents,
        );
    }

    getPointInDirection(direction: S2Vec2, space: S2Space, distance: S2Length): S2Vec2 {
        if (this.background) {
            return this.background.getPointInDirection(direction, space, distance);
        }
        return this.data.position.toSpace(space, this.scene.getActiveCamera());
    }

    protected updateBackground(): void {
        if (this.data.shape.isDirty()) {
            // Remove old background
            if (this.background !== null) this.background.setParent(null);

            // Create new background
            switch (this.data.shape.value) {
                case 'rectangle':
                    this.background = new S2Rect(this.scene);
                    break;
                case 'circle':
                    this.background = new S2Circle(this.scene);
                    break;
                case 'none':
                    this.background = null;
                    return;
            }
            this.background.data.layer.set(0);
            this.background.setParent(this);
            this.updateSVGChildren();
        }

        if (this.background === null) return;

        const camera = this.scene.getActiveCamera();
        const space: S2Space = 'view';
        const nodeCenter = this.getCenter(space);
        const extents = this.extents.toSpace(space, camera);

        this.background.data.stroke.copy(this.data.background.stroke);
        this.background.data.fill.copy(this.data.background.fill);
        this.background.data.opacity.copy(this.data.background.opacity);
        this.background.data.transform.copy(this.data.background.transform);
        if (this.background instanceof S2Rect) {
            this.background.data.cornerRadius.copy(this.data.background.cornerRadius);
        }

        // Position background
        if (this.background instanceof S2Rect) {
            // Rectangle
            this.background.data.position.setV(nodeCenter, space);
            this.background.data.extents.setV(extents, space);
            this.background.data.anchor.set('center');
        } else if (this.background instanceof S2Circle) {
            // Circle
            const radius = Math.max(extents.x, extents.y);
            this.background.data.position.setV(nodeCenter, space);
            this.background.data.radius.set(radius, space);
        }

        this.background.update();
    }

    protected updateEndPoints(): void {
        for (const endpoint of this.endPoints) {
            endpoint.markDirty();
            endpoint.edge?.update();
        }
    }
}
