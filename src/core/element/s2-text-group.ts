import { S2Vec2 } from '../math/s2-vec2';
import { S2BaseScene } from '../s2-base-scene';
import { type S2Anchor, type S2HorizontalAlign, type S2VerticalAlign, S2AnchorUtils, svgNS } from '../s2-globals';
import { S2BaseText, S2TextData } from './s2-text';
import { S2Enum, S2Extents, S2Length, S2TypeState, type S2Space } from '../s2-types';
import { S2Element, S2ElementUtils } from './base/s2-element';
import { S2ShapeElementData } from './base/s2-shape-element';
import { S2FontData } from './base/s2-base-data';

export class S2TextLineData extends S2TextData {
    public readonly skip: S2Length;
    public readonly horizontalAlign: S2Enum<S2HorizontalAlign>;

    constructor() {
        super();
        this.skip = new S2Length(0, 'view');
        this.horizontalAlign = new S2Enum<S2HorizontalAlign>('left', S2TypeState.Inactive);
    }

    setParent(parent: S2TextLineData | null = null): void {
        super.setParent(parent);
        this.skip.setParent(parent ? parent.skip : null);
        this.horizontalAlign.setParent(parent ? parent.horizontalAlign : null);
    }
}

export class S2TextLine extends S2BaseText<S2TextLineData> {
    constructor(scene: S2BaseScene) {
        super(scene, new S2TextLineData());
    }
}

export class S2TextGroupData extends S2ShapeElementData {
    public readonly font: S2FontData;
    public readonly skip: S2Length;
    public readonly horizontalAlign: S2Enum<S2HorizontalAlign>;
    public readonly verticalAlign: S2Enum<S2VerticalAlign>;
    public readonly minExtents: S2Extents;
    public readonly anchor: S2Enum<S2Anchor>;

    constructor() {
        super();
        this.font = new S2FontData();
        this.skip = new S2Length(0, 'view');
        this.horizontalAlign = new S2Enum<S2HorizontalAlign>('left', S2TypeState.Inactive);
        this.verticalAlign = new S2Enum<S2VerticalAlign>('middle');
        this.minExtents = new S2Extents(0, 0, 'view');
        this.anchor = new S2Enum<S2Anchor>('center');
    }

    setParent(parent: S2TextGroupData | null = null): void {
        super.setParent(parent);
        this.font.setParent(parent ? parent.font : null);
        this.skip.setParent(parent ? parent.skip : null);
        this.horizontalAlign.setParent(parent ? parent.horizontalAlign : null);
        this.verticalAlign.setParent(parent ? parent.verticalAlign : null);
        this.minExtents.setParent(parent ? parent.minExtents : null);
        this.anchor.setParent(parent ? parent.anchor : null);
    }

    applyToElement(element: SVGElement, scene: S2BaseScene): void {
        super.applyToElement(element, scene);
        this.font.applyToElement(element, scene);
    }
}

export class S2TextGroup extends S2Element<S2TextGroupData> {
    protected element: SVGGElement;
    protected children: Array<S2TextLine>;
    protected textExtents: S2Extents;
    protected extents: S2Extents;

    constructor(scene: S2BaseScene) {
        super(scene, new S2TextGroupData());
        this.children = [];
        this.element = document.createElementNS(svgNS, 'g');
        this.textExtents = new S2Extents(0, 0, 'view');
        this.extents = new S2Extents(0, 0, 'view');
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    addLine(options?: { align?: S2HorizontalAlign; skip?: number }): S2TextLine {
        const textLine = new S2TextLine(this.scene);
        textLine.data.font.setParent(this.data.font);
        textLine.data.fill.setParent(this.data.fill);
        textLine.data.stroke.setParent(this.data.stroke);
        textLine.data.opacity.setParent(this.data.opacity);
        textLine.data.horizontalAlign.setParent(this.data.horizontalAlign);
        textLine.data.skip.setParent(this.data.skip);

        if (options?.align) {
            textLine.data.horizontalAlign.set(options.align);
        }
        if (options?.skip !== undefined) {
            textLine.data.skip.set(options.skip);
        }
        S2ElementUtils.appendChild(this, this.children, textLine);
        S2ElementUtils.updateSVGChildren(this.element, this.children);
        return textLine;
    }

    getTextExtents(space: S2Space): S2Vec2 {
        return this.textExtents.toSpace(space, this.scene.getActiveCamera());
    }

    getExtents(space: S2Space): S2Vec2 {
        return this.extents.toSpace(space, this.scene.getActiveCamera());
    }

    getCenter(space: S2Space): S2Vec2 {
        return S2AnchorUtils.getCenter(
            this.data.anchor.getInherited(),
            space,
            this.scene.getActiveCamera(),
            this.data.position,
            this.data.minExtents,
        );
    }

    updateExtents(): void {
        const camera = this.scene.getActiveCamera();
        const space = 'view';

        // Apply font to group element to ensure correct measurement of bounding boxes
        this.data.font.applyToElement(this.element, this.scene);

        let maxWidth = 0;
        let totalHeight = 0;
        for (let i = 0; i < this.children.length; i++) {
            const line = this.children[i];
            const bbox = line.getBBox();
            const font = line.data.font;
            const relativeHeight = font.relativeLineHeight.getInherited();
            const size = font.size.getInherited(space, camera);
            maxWidth = Math.max(bbox.width, maxWidth);
            totalHeight += line.data.skip.value + relativeHeight * size;
        }
        const textExtents = new S2Vec2(maxWidth, totalHeight).scale(0.5);
        const minExtents = this.data.minExtents.toSpace(space, camera);
        const extents = minExtents.maxV(textExtents);

        this.textExtents.setValueFromSpace(space, camera, textExtents.x, textExtents.y);
        this.extents.setValueFromSpace(space, camera, extents.x, extents.y);
    }

    protected updateImpl(updateId?: number): void {
        void updateId;
        if (this.children.length === 0) return;
        const camera = this.scene.getActiveCamera();
        this.data.applyToElement(this.element, this.scene);
        this.updateExtents();

        const textExtents = this.textExtents.toSpace('view', camera);
        const groupExtents = this.extents.toSpace('view', camera);
        const groupNW = this.getCenter('view').subV(groupExtents); // TODO
        const firstLineFont = this.children[0].data.font;
        const ascenderHeight =
            firstLineFont.relativeAscenderHeight.getInherited() * firstLineFont.size.getInherited('view', camera);

        let lineX = 0;
        let lineY = groupNW.y + ascenderHeight;
        switch (this.data.verticalAlign.getInherited()) {
            case 'top':
                break;
            case 'middle':
                lineY += groupExtents.y - textExtents.y;
                break;
            case 'bottom':
                lineY += 2 * (groupExtents.y - textExtents.y);
                break;
        }

        for (let i = 0; i < this.children.length; i++) {
            const line = this.children[i];
            const font = line.data.font;
            const lineHeight = font.relativeLineHeight.getInherited() * font.size.getInherited('view', camera);
            switch (line.data.horizontalAlign.getInherited()) {
                case 'left':
                    lineX = groupNW.x;
                    line.data.textAnchor.set('start');
                    break;
                case 'center':
                    lineX = groupNW.x + groupExtents.x;
                    line.data.textAnchor.set('middle');
                    break;
                case 'right':
                    lineX = groupNW.x + 2 * groupExtents.x;
                    line.data.textAnchor.set('end');
                    break;
            }
            line.data.position.set(lineX, lineY, 'view');
            lineY += line.data.skip.value + lineHeight;
        }
    }
}
