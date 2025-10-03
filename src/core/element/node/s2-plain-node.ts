import { S2BaseScene } from '../../scene/s2-base-scene';
import { type S2Space } from '../../s2-types';
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

        this.text.data.font.copy(this.data.text.font);
        this.text.data.fill.copy(this.data.text.fill);
        this.text.data.opacity.copy(this.data.text.opacity);
        this.text.data.stroke.copy(this.data.text.stroke);
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

        // // Style background
        // if (this.background !== null) {
        //     this.background.data.stroke.copy(this.data.background.stroke);
        //     this.background.data.fill.copy(this.data.background.fill);
        //     this.background.data.opacity.copy(this.data.background.opacity);
        //     this.background.data.transform.copy(this.data.background.transform);
        //     if (this.background instanceof S2Rect) {
        //         this.background.data.cornerRadius.copy(this.data.background.cornerRadius);
        //     }

        //     // Position background
        //     if (this.background instanceof S2Rect) {
        //         // Rectangle
        //         this.background.data.position.setV(nodeCenter, 'view');
        //         this.background.data.extents.setV(extents, 'view');
        //         this.background.data.anchor.set('center');
        //     } else if (this.background instanceof S2Circle) {
        //         // Circle
        //         const radius = Math.max(extents.x, extents.y);
        //         this.background.data.position.setV(nodeCenter, 'view');
        //         this.background.data.radius.set(radius, 'view');
        //     }

        //     this.background.update();
        // }
        this.updateBackground();

        this.updateEndPoints();
        this.clearDirty();
    }
}
