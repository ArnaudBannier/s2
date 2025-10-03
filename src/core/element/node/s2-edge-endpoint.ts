import { S2Vec2 } from '../../math/s2-vec2';
import { type S2Space, S2Length, S2Position } from '../../shared/s2-types';
import { S2Camera } from '../../math/s2-camera';
import { type S2Dirtyable } from '../../shared/s2-globals';
import { S2BaseNode } from './s2-base-node';
import type { S2BaseEdge } from './s2-base-edge';

export class S2EdgeEndpoint implements S2Dirtyable {
    protected mode: 'node' | 'position';
    public node: S2BaseNode | null;
    public position: S2Position;
    private owner: S2Dirtyable | null;
    public dirty: boolean = true;
    public edge: S2BaseEdge | null;

    constructor() {
        this.mode = 'position';
        this.node = null;
        this.owner = null;
        this.position = new S2Position(0, 0, 'world');
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

    set(endpoint: S2BaseNode | S2Position): this {
        if (endpoint instanceof S2BaseNode) {
            this.mode = 'node';
            this.node = endpoint;
            this.position.copy(this.node.data.position);
            this.node.attachEndPoint(this);
        } else {
            this.mode = 'position';
            this.node = null;
            this.position.copy(endpoint);
        }
        return this;
    }

    copy(other: S2EdgeEndpoint): void {
        this.mode = other.mode;
        this.node = other.node;
        this.position.copy(other.position);
    }

    getCenter(space: S2Space, camera: S2Camera): S2Vec2 {
        if (this.mode === 'node' && this.node) {
            return this.node.getCenter(space);
        } else {
            return this.position.toSpace(space, camera);
        }
    }

    getPointInDirection(direction: S2Vec2, space: S2Space, camera: S2Camera, distance: S2Length): S2Vec2 {
        if (this.mode === 'node' && this.node) {
            if (distance.value !== -Infinity) {
                return this.node.getPointInDirection(direction, space, distance);
            } else {
                return this.node.getCenter(space);
            }
        } else {
            const point = this.position.toSpace(space, camera);
            const d = distance.toSpace(space, camera);
            return point.addV(direction.clone().normalize().scale(d));
        }
    }
}
