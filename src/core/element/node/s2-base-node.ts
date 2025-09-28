import { S2Vec2 } from '../../math/s2-vec2';
import { S2BaseScene } from '../../s2-base-scene';
import { S2AnchorUtils, svgNS } from '../../s2-globals';
import { S2Rect } from '../s2-rect';
import { S2Circle } from '../s2-circle';
import { S2Extents, S2Length, type S2Space } from '../../s2-types';
import { S2Element } from '../base/s2-element';
import { S2NodeData } from './s2-node-data';
import type { S2EdgeEndpoint } from './s2-edge';

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
}
