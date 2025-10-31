import { S2Vec2 } from '../../math/s2-vec2';
import type { S2BaseScene } from '../../scene/s2-base-scene';
import { S2PlainText } from '../text/s2-plain-text';
import { S2BaseNode } from './s2-base-node';

export class S2PlainNode extends S2BaseNode {
    protected text: S2PlainText;

    constructor(scene: S2BaseScene) {
        super(scene);
        this.text = new S2PlainText(this.scene);
        this.text.data.layer.set(2);
        this.text.setParent(this);
        this.element.dataset.role = 'plain-node';
    }

    setContent(content: string): this {
        this.text.setContent(content);
        return this;
    }

    update(): void {
        if (this.skipUpdate()) return;

        this.updateSVGChildren();
        const space = this.data.space.get();

        // Update text styles (for correct measurement)
        this.text.data.font.copyIfUnlocked(this.data.text.font);
        this.text.data.fill.copyIfUnlocked(this.data.text.fill);
        this.text.data.opacity.copyIfUnlocked(this.data.text.opacity);
        this.text.data.stroke.copyIfUnlocked(this.data.text.stroke);
        this.text.update();

        // Update extents
        const textExtents = _vec0;
        const nodePadding = _vec1;
        const nodeExtents = _vec2;
        const contentExtents = _vec3;
        this.text.getExtentsInto(textExtents, space);
        this.data.padding.getInto(nodePadding, space);
        this.data.minExtents.getInto(nodeExtents, space);
        nodeExtents.max(textExtents.x + nodePadding.x, textExtents.y + nodePadding.y);
        contentExtents.copy(nodeExtents).subV(nodePadding);
        this.extents.setV(nodeExtents, space);

        // Update center and SDF
        this.center.space = space;
        const nodeCenter = this.center.value;
        this.data.position.getInto(nodeCenter, space);
        this.data.anchor.getCenterIntoV(nodeCenter, nodeCenter, nodeExtents);
        this.baseSDF.update(nodeCenter, Math.max(nodeExtents.x, nodeExtents.y));

        // Update text position
        const sign = space.isDirectSpace() ? 1 : -1;
        const font = this.data.text.font;
        const ascenderHeight = font.relativeAscenderHeight.value * font.size.get(space);
        const vAlign = sign * this.data.text.verticalAlign.get();
        const hAlign = this.data.text.horizontalAlign.get();

        this.text.data.textAnchor.set('middle');
        this.text.data.position.set(
            nodeCenter.x + hAlign * (contentExtents.x - textExtents.x),
            nodeCenter.y + vAlign * (contentExtents.y - textExtents.y) - (sign * ascenderHeight) / 2,
            space,
        );
        this.text.update();

        this.updateBackground();
        this.updateEdges();
        this.clearDirty();
    }
}

const _vec0 = new S2Vec2();
const _vec1 = new S2Vec2();
const _vec2 = new S2Vec2();
const _vec3 = new S2Vec2();
