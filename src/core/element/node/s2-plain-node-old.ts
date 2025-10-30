import type { S2BaseScene } from '../../scene/s2-base-scene';
import { S2PlainText } from '../text/s2-plain-text';
import { S2BaseNodeOLD } from './s2-base-node-old';

export class S2PlainNodeOLD extends S2BaseNodeOLD {
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

        const viewSpace = this.scene.getViewSpace();
        this.updateSVGChildren();

        this.text.data.font.copyIfUnlocked(this.data.text.font);
        this.text.data.fill.copyIfUnlocked(this.data.text.fill);
        this.text.data.opacity.copyIfUnlocked(this.data.text.opacity);
        this.text.data.stroke.copyIfUnlocked(this.data.text.stroke);
        this.text.update();

        const textExtents = this.text.getExtents(viewSpace);
        const padding = this.data.padding.get(viewSpace);
        const extents = this.data.minExtents.get(viewSpace);
        extents.max(textExtents.x + padding.x, textExtents.y + padding.y);
        const contentExtents = extents.clone().subV(padding);

        this.extents.setV(extents, viewSpace);

        const nodeCenter = this.getCenter(viewSpace);
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
        this.text.data.position.set(lineX, lineY, viewSpace);
        this.text.update();

        this.updateBackground();
        this.updateEndPoints();
        this.clearDirty();
    }
}
