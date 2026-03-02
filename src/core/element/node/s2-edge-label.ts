import type { S2BaseScene } from '../../scene/s2-base-scene';
import type { S2BaseNode } from './s2-base-node';
import type { S2Dirtyable } from '../../shared/s2-globals';
import { S2TipTransform } from '../../shared/s2-globals';
import { S2Element } from '../base/s2-element';
import { S2ElementData } from '../base/s2-base-data';
import { S2Number } from '../../shared/s2-number';
import { S2Length } from '../../shared/s2-length';
import { S2Boolean } from '../../shared/s2-boolean';
import type { S2BaseEdge } from './s2-base-edge';

export class S2EdgeLabelData extends S2ElementData {
    public readonly pathPosition: S2Number;
    public readonly distance: S2Length;
    public readonly isFlipped: S2Boolean;

    constructor(scene: S2BaseScene) {
        super();
        const viewSpace = scene.getViewSpace();
        this.pathPosition = new S2Number(0.5);
        this.distance = new S2Length(10, viewSpace);
        this.isFlipped = new S2Boolean(false);
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        this.pathPosition.setOwner(owner);
        this.distance.setOwner(owner);
        this.isFlipped.setOwner(owner);
    }

    clearDirty(): void {
        super.clearDirty();
        this.pathPosition.clearDirty();
        this.distance.clearDirty();
        this.isFlipped.clearDirty();
    }
}

export class S2EdgeLabel extends S2Element<S2EdgeLabelData> {
    protected readonly node: S2BaseNode;
    protected readonly transform: S2TipTransform;

    protected edgeReference: S2BaseEdge | null = null;

    constructor(scene: S2BaseScene, node: S2BaseNode) {
        super(scene, new S2EdgeLabelData(scene));
        this.node = node;
        this.transform = new S2TipTransform(scene);

        this.node.setParent(this);
    }

    setEdgeReference(edge: S2BaseEdge | null): this {
        this.edgeReference = edge;
        this.markDirty();
        return this;
    }

    getSVGElement(): SVGElement {
        return this.node.getSVGElement();
    }

    update(): void {
        if (this.skipUpdate()) return;

        if (!this.edgeReference) return;

        const worldSpace = this.scene.getWorldSpace();

        this.edgeReference.getTipTransformAtInto(this.transform, this.data.pathPosition.get());

        const position = this.scene.acquireVec2();
        this.transform.position.getInto(position, worldSpace);
        //position.copy(this.transform.position);

        this.node.data.position.setV(position, worldSpace);

        this.scene.releaseVec2(position);
        this.node.update();
        this.clearDirty();
    }
}
