import { S2Vec2 } from '../math/s2-vec2';
import { type S2BaseScene } from '../s2-interface';
import { type S2Anchor, S2AnchorUtils, FlexUtils } from '../s2-globals';
import { S2Rect } from './s2-rect';
import { S2Circle } from './s2-circle';
import { S2TransformGraphicData } from './s2-transform-graphic';
import { S2Extents, S2Length, S2Position, type S2Space } from '../s2-types';
import { S2TextGroup, S2TextLine, type S2TextAlign, type S2VerticalAlign } from './s2-text-group';
import { clamp } from '../math/s2-utils';
import { S2Line } from './s2-line';
import { S2Element, type S2BaseElement } from './s2-element';
import { S2Group } from './s2-group';
import { S2LayerData } from './s2-base-data';

export class S2NodeBackgroundData extends S2TransformGraphicData {
    public readonly cornerRadius: S2Length;

    constructor() {
        super();
        this.cornerRadius = new S2Length(0, 'view');
    }

    copy(other: S2NodeBackgroundData): void {
        super.copy(other);
        this.cornerRadius.copy(other.cornerRadius);
    }

    applyToElement(element: SVGElement, scene: S2BaseScene): void {
        super.applyToElement(element, scene);
        const camera = scene.getActiveCamera();
        const radius = this.cornerRadius.toSpace('view', camera);
        if (radius > 0) {
            element.setAttribute('rx', radius.toString());
            element.setAttribute('ry', radius.toString());
        } else {
            element.removeAttribute('rx');
            element.removeAttribute('ry');
        }
    }
}

export class S2NodeTextData extends S2TransformGraphicData {
    public textAlign: S2TextAlign;
    public verticalAlign: S2VerticalAlign;
    public lineHeight: number;
    public ascenderHeight: number;

    constructor() {
        super();
        this.textAlign = 'center';
        this.verticalAlign = 'middle';
        this.lineHeight = 24;
        this.ascenderHeight = 18;
    }

    copy(other: S2NodeTextData): void {
        super.copy(other);
        this.textAlign = other.textAlign;
        this.verticalAlign = other.verticalAlign;
        this.lineHeight = other.lineHeight;
        this.ascenderHeight = other.ascenderHeight;
    }

    applyToElement(element: SVGElement, scene: S2BaseScene): void {
        super.applyToElement(element, scene);
    }
}

export class S2NodeData extends S2LayerData {
    public position: S2Position;
    public anchor: S2Anchor;
    public background: S2NodeBackgroundData;
    public text: S2NodeTextData;
    public padding: S2Extents;
    public partSep: S2Length;
    public minExtents: S2Extents;

    constructor() {
        super();
        this.position = new S2Position(0, 0, 'world');
        this.anchor = 'center';
        this.minExtents = new S2Extents(0, 0, 'view');
        this.background = new S2NodeBackgroundData();
        this.text = new S2NodeTextData();
        this.padding = new S2Extents(10, 5, 'view');
        this.partSep = new S2Length(5, 'view');
    }

    copy(other: S2NodeData): void {
        super.copy(other);
        this.position.copy(other.position);
        this.minExtents.copy(other.minExtents);
        this.anchor = other.anchor;
        this.background.copy(other.background);
        this.text.copy(other.text);
        this.padding.copy(other.padding);
        this.partSep.copy(other.partSep);
    }

    applyToElement(element: SVGElement, scene: S2BaseScene): void {
        super.applyToElement(element, scene);
    }
}

export class S2Node extends S2Element<S2NodeData> {
    protected mainGroup: S2Group<S2BaseElement>;
    protected textGroups: S2TextGroup[];
    protected textGrows: number[];
    protected sepLines: S2Line[];
    protected background: S2Rect | S2Circle | null = null;
    protected nodeExtents: S2Extents;

    constructor(scene: S2BaseScene, partCount: number = 1) {
        super(scene, new S2NodeData());
        this.mainGroup = new S2Group<S2BaseElement>(scene);

        this.textGroups = [];
        this.textGrows = [];
        for (let i = 0; i < partCount; i++) {
            const textGroup = new S2TextGroup(this.scene);
            textGroup.setLayer(2);
            this.textGroups.push(textGroup);
            this.textGrows.push(1);
            this.mainGroup.appendChild(textGroup);
        }
        this.sepLines = [];
        for (let i = 0; i < partCount - 1; i++) {
            const line = new S2Line(this.scene).setLayer(1);
            this.sepLines.push(line);
            this.mainGroup.appendChild(line);
        }
        this.nodeExtents = new S2Extents(0, 0, 'view');
    }

    getSVGElement(): SVGElement {
        return this.mainGroup.getSVGElement();
    }

    addLine(options?: { partIndex?: number; align?: S2TextAlign; skip?: number }): S2TextLine {
        const index = clamp(options?.partIndex ?? 0, 0, this.textGroups.length - 1);
        return this.textGroups[index].addLine(options);
    }

    createRectBackground(): S2Rect {
        if (this.background !== null) this.mainGroup.removeChild(this.background);
        this.background = new S2Rect(this.scene);
        this.background.setLayer(0);
        this.mainGroup.appendChild(this.background);
        return this.background;
    }

    createCircleBackground(): S2Circle {
        if (this.background !== null) this.mainGroup.removeChild(this.background);
        this.background = new S2Circle(this.scene);
        this.background.setLayer(0);
        this.mainGroup.appendChild(this.background);
        return this.background;
    }

    setTextGrowFactor(partIndex: number, grow: number = 1): this {
        this.textGrows[partIndex] = grow;
        return this;
    }

    getBackground(): S2Circle | S2Rect | null {
        return this.background;
    }

    getCenter(space: S2Space = this.data.position.space): S2Vec2 {
        return S2AnchorUtils.getCenter(
            this.data.anchor,
            space,
            this.scene.getActiveCamera(),
            this.data.position,
            this.nodeExtents,
        );
    }

    getTextGroup(index: number = 0): S2TextGroup {
        return this.textGroups[index];
    }

    getTextGroupCount(): number {
        return this.textGroups.length;
    }

    getPointInDirection(direction: S2Vec2, space: S2Space, distance: S2Length): S2Vec2 {
        if (this.background) {
            return this.background.getPointInDirection(direction, space, distance);
        }
        return this.data.position.toSpace('view', this.scene.getActiveCamera());
    }

    update(updateId?: number): this {
        if (this.shouldSkipUpdate(updateId)) return this;
        const camera = this.scene.getActiveCamera();

        if (this.background !== null) {
            this.background.data.stroke.copy(this.data.background.stroke);
            this.background.data.fill.copy(this.data.background.fill);
            this.background.data.opacity.copy(this.data.background.opacity);
            this.background.data.radius.copy(this.data.background.cornerRadius);
        }

        const partHeights: Array<number> = [];
        let maxPartWidth = 0;

        for (let i = 0; i < this.textGroups.length; i++) {
            const textGroup = this.textGroups[i];
            textGroup.updateExtents();
            const extents = textGroup.getTextExtents('view');
            maxPartWidth = Math.max(maxPartWidth, 2 * extents.x);
            partHeights.push(2 * extents.y);
        }

        const nodeMinExtents = this.data.minExtents.toSpace('view', camera);
        const padding = this.data.padding.toSpace('view', camera);
        const partSep = this.data.partSep.toSpace('view', camera);

        const height = FlexUtils.computeSizes(
            partHeights,
            this.textGrows,
            2 * nodeMinExtents.y,
            padding.y,
            2 * partSep,
        );

        const nodeExtents = new S2Vec2(Math.max(maxPartWidth / 2 + padding.x, nodeMinExtents.x), height / 2);
        this.nodeExtents.setValueFromSpace('view', camera, nodeExtents.x, nodeExtents.y);

        const nodeCenter = S2AnchorUtils.getCenter(
            this.data.anchor,
            'view',
            camera,
            this.data.position,
            this.nodeExtents,
        );
        const textPosition = nodeCenter.clone().subV(nodeExtents).addV(padding);
        for (let i = 0; i < this.textGroups.length; i++) {
            this.textGroups[i].data.position.setV(textPosition, 'view');
            this.textGroups[i].data.minExtents.set(nodeExtents.x - padding.x, partHeights[i] / 2, 'view');
            this.textGroups[i].data.anchor = 'north west';
            textPosition.y += partHeights[i] + 2 * partSep;
        }

        // Position background and separator lines
        if (this.background instanceof S2Rect) {
            // Background
            this.background.position.setV(nodeCenter, 'view');
            this.background.extents.setV(nodeExtents, 'view');
            this.background.data.anchor = 'center';

            // Separator lines
            let y = nodeCenter.y - nodeExtents.y + padding.y + partHeights[0] + partSep;
            for (let i = 0; i < this.textGroups.length - 1; i++) {
                this.sepLines[i].startPosition.set(nodeCenter.x - nodeExtents.x, y, 'view');
                this.sepLines[i].endPosition.set(nodeCenter.x + nodeExtents.x, y, 'view');
                y += partHeights[i + 1] + 2 * partSep;
            }
        } else if (this.background instanceof S2Circle) {
            // Background
            const radius = Math.max(nodeExtents.x, nodeExtents.y);
            this.background.position.setV(nodeCenter, 'view');
            this.background.radius.set(radius, 'view');

            // Separator lines
            let y = nodeCenter.y - nodeExtents.y + padding.y + partHeights[0] + partSep;
            for (let i = 0; i < this.textGroups.length - 1; i++) {
                const x = Math.sqrt(radius * radius - (y - nodeCenter.y) * (y - nodeCenter.y));
                this.sepLines[i].startPosition.set(nodeCenter.x - x, y, 'view');
                this.sepLines[i].endPosition.set(nodeCenter.x + x, y, 'view');
                y += partHeights[i + 1] + 2 * partSep;
            }
        }
        this.mainGroup.update();
        this.emitUpdate(updateId);
        return this;
    }
}
