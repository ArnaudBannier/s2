import type { S2BaseScene } from '../../scene/s2-base-scene';
import type { S2Space } from '../../shared/s2-base-type';
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

        const camera = this.scene.getActiveCamera();
        const space: S2Space = 'view';
        this.updateSVGChildren();

        this.text.data.font.copyIfUnlocked(this.data.text.font);
        this.text.data.fill.copyIfUnlocked(this.data.text.fill);
        this.text.data.opacity.copyIfUnlocked(this.data.text.opacity);
        this.text.data.stroke.copyIfUnlocked(this.data.text.stroke);
        this.text.update();

        const textExtents = this.text.getExtents(space);
        const padding = this.data.padding.toSpace(space, camera);
        const extents = this.data.minExtents.toSpace(space, camera);
        extents.max(textExtents.x + padding.x, textExtents.y + padding.y);
        const contentExtents = extents.clone().subV(padding);

        this.extents.setV(extents, space);

        const nodeCenter = this.getCenter(space);
        const contentNW = nodeCenter.clone().subV(contentExtents);

        const font = this.data.text.font;
        const ascenderHeight = font.relativeAscenderHeight.value * font.size.value;

        let lineX = 0;
        let lineY = contentNW.y + ascenderHeight;
        switch (this.data.text.verticalAlign.value) {
            case 'top':
                break;
            case 'middle':
                lineY += contentExtents.y - textExtents.y;
                break;
            case 'bottom':
                lineY += 2 * (contentExtents.y - textExtents.y);
                break;
        }
        switch (this.data.text.horizontalAlign.value) {
            case 'left':
                lineX = contentNW.x;
                this.text.data.textAnchor.set('start');
                break;
            case 'center':
                lineX = contentNW.x + contentExtents.x;
                this.text.data.textAnchor.set('middle');
                break;
            case 'right':
                lineX = contentNW.x + 2 * contentExtents.x;
                this.text.data.textAnchor.set('end');
                break;
        }
        this.text.data.position.set(lineX, lineY, 'view');
        this.text.update();

        this.updateBackground();
        this.updateEndPoints();
        this.clearDirty();
    }
}
