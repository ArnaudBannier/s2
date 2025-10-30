import type { S2BaseScene } from '../../scene/s2-base-scene';
import type { S2Space } from '../../math/s2-space';
import type { S2Dirtyable } from '../../shared/s2-globals';
import type { S2BaseEdgeOLD } from './s2-base-edge-old';
import type { S2Length } from '../../shared/s2-length';
import { S2Vec2 } from '../../math/s2-vec2';
import { S2Point } from '../../shared/s2-point';
import { S2BaseNodeOLD } from './s2-base-node-old';

export class S2EdgeEndpointOLD implements S2Dirtyable {
    protected mode: 'node' | 'position';
    public node: S2BaseNodeOLD | null;
    public position: S2Point;
    private owner: S2Dirtyable | null;
    public dirty: boolean = true;
    public edge: S2BaseEdgeOLD | null;

    constructor(scene: S2BaseScene) {
        this.mode = 'position';
        this.node = null;
        this.owner = null;
        this.position = new S2Point(0, 0, scene.getWorldSpace());
        this.edge = null;

        this.position.setOwner(this);
    }

    isDirty(): boolean {
        return this.dirty;
    }

    markDirty(): void {
        if (this.isDirty()) return;
        this.dirty = true;
        this.owner?.markDirty();
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        this.owner = owner;
    }

    clearDirty(): void {
        this.dirty = false;
        this.position.clearDirty();
    }

    set(endpoint: S2BaseNodeOLD | S2Point): this {
        if (endpoint instanceof S2BaseNodeOLD) {
            this.mode = 'node';
            this.node = endpoint;
            this.position.copyIfUnlocked(this.node.data.position);
            this.node.attachEndPoint(this);
        } else {
            this.mode = 'position';
            this.node = null;
            this.position.copyIfUnlocked(endpoint);
        }
        return this;
    }

    copy(other: S2EdgeEndpointOLD): void {
        this.mode = other.mode;
        this.node = other.node;
        this.position.copyIfUnlocked(other.position);
    }

    getCenter(space: S2Space): S2Vec2 {
        if (this.mode === 'node' && this.node) {
            return this.node.getCenter(space);
        } else {
            return this.position.get(space);
        }
    }

    getPointInDirection(direction: S2Vec2, space: S2Space, distance: S2Length): S2Vec2 {
        if (this.mode === 'node' && this.node) {
            if (distance.value !== -Infinity) {
                return this.node.getPointInDirection(direction, space, distance);
            } else {
                return this.node.getCenter(space);
            }
        } else {
            const point = this.position.get(space);
            const d = distance.get(space);
            return point.addV(direction.clone().normalize().scale(d));
        }
    }
}
