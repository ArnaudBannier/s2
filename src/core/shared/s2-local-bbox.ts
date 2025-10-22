import type { S2Space } from '../math/s2-space';
import type { S2BaseScene } from '../scene/s2-base-scene';
import type { S2Point } from './s2-point';
import { S2BaseType } from './s2-base-type';
import { S2Vec2 } from '../math/s2-vec2';
import { S2Extents } from './s2-extents';
import { S2Offset } from './s2-offset';

export class S2LocalBBox extends S2BaseType {
    readonly kind = 'bbox' as const;
    protected center: S2Offset;
    protected extents: S2Extents;

    constructor(space: S2Space) {
        super();
        this.center = new S2Offset(0, 0, space);
        this.extents = new S2Extents(0, 0, space);
    }

    set(graphics: SVGGraphicsElement, parentPosition: S2Point | null, scene: S2BaseScene): void {
        if (!graphics.isConnected) {
            console.warn('Element is not connected to DOM, cannot compute bbox', graphics.isConnected);
            return;
        }
        const viewSpace = scene.getViewSpace();
        const bbox = graphics.getBBox();
        const parentPos = parentPosition ? parentPosition.get(viewSpace) : new S2Vec2(0, 0);
        const center = new S2Vec2(bbox.x + bbox.width / 2, bbox.y + bbox.height / 2).subV(parentPos);
        this.center.setV(center, viewSpace);
        this.extents.set(bbox.width / 2, bbox.height / 2, viewSpace);
        this.markDirty();
    }

    getCenter(space: S2Space): S2Vec2 {
        return this.center.get(space);
    }

    getExtents(space: S2Space): S2Vec2 {
        return this.extents.get(space);
    }

    getLower(space: S2Space): S2Vec2 {
        const center = this.getCenter(space);
        const extents = this.getExtents(space);
        return center.subV(extents);
    }

    getUpper(space: S2Space): S2Vec2 {
        const center = this.getCenter(space);
        const extents = this.getExtents(space);
        return center.addV(extents);
    }
}
