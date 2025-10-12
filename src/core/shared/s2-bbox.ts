import type { S2Camera } from '../math/s2-camera';
import type { S2Space } from './s2-base-type';
import { S2BaseType } from './s2-base-type';
import { S2Vec2 } from '../math/s2-vec2';
import { S2Extents } from './s2-extents';
import { S2Position } from './s2-position';

export class S2BBox extends S2BaseType {
    readonly kind = 'bbox' as const;
    protected center: S2Position;
    protected extents: S2Extents;

    constructor() {
        super();
        this.center = new S2Position(0, 0, 'view');
        this.extents = new S2Extents(0, 0, 'view');
    }

    set(graphics: SVGGraphicsElement, parentPosition: S2Position | null, camera: S2Camera): void {
        if (!graphics.isConnected) {
            console.warn('Element is not connected to DOM, cannot compute bbox', graphics.isConnected);
            return;
        }

        const bbox = graphics.getBBox();
        const parentPos = parentPosition ? parentPosition.toSpace('view', camera) : new S2Vec2(0, 0);
        const center = new S2Vec2(bbox.x + bbox.width / 2, bbox.y + bbox.height / 2).subV(parentPos);
        this.center.setV(center, 'view');
        this.extents.set(bbox.width / 2, bbox.height / 2, 'view');
        this.markDirty();
    }

    getCenter(space: S2Space, camera: S2Camera): S2Vec2 {
        return this.center.toSpace(space, camera);
    }

    getExtents(space: S2Space, camera: S2Camera): S2Vec2 {
        return this.extents.toSpace(space, camera);
    }

    getLower(space: S2Space, camera: S2Camera): S2Vec2 {
        const center = this.getCenter(space, camera);
        const extents = this.getExtents(space, camera);
        return center.subV(extents);
    }

    getUpper(space: S2Space, camera: S2Camera): S2Vec2 {
        const center = this.getCenter(space, camera);
        const extents = this.getExtents(space, camera);
        return center.addV(extents);
    }
}
