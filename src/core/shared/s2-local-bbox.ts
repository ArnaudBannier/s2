import type { S2Space } from '../math/s2-space';
import type { S2BaseScene } from '../scene/s2-base-scene';
import type { S2Point } from './s2-point';
import { S2BaseType } from './s2-base-type';
import { S2Vec2 } from '../math/s2-vec2';
import { S2Extents } from './s2-extents';
import { S2Offset } from './s2-offset';

export class S2LocalBBox extends S2BaseType {
    readonly kind = 'local-bbox' as const;
    protected readonly center: S2Offset;
    protected readonly extents: S2Extents;

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
        const center = _vec0.set(bbox.x + bbox.width / 2, bbox.y + bbox.height / 2);
        if (parentPosition) {
            parentPosition.getInto(_vec1, viewSpace);
            center.subV(_vec1);
        }

        this.center.setV(center, viewSpace);
        this.extents.set(bbox.width / 2, bbox.height / 2, viewSpace);
        this.markDirty();
    }

    getCenterOffsetInto(dst: S2Vec2, space: S2Space): this {
        this.center.getInto(dst, space);
        return this;
    }

    getExtentsInto(dst: S2Vec2, space: S2Space): this {
        this.extents.getInto(dst, space);
        return this;
    }

    getBBoxOffsetsInto(dstLower: S2Vec2, dstUpper: S2Vec2, space: S2Space): this {
        const center = _vec0;
        const extents = _vec1;
        this.getCenterOffsetInto(center, space);
        this.getExtentsInto(extents, space);
        dstLower.copy(center).subV(extents);
        dstUpper.copy(center).addV(extents);
        return this;
    }
}

const _vec0 = new S2Vec2();
const _vec1 = new S2Vec2();
