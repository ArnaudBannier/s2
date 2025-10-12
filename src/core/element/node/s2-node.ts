import type { S2BaseScene } from '../../scene/s2-base-scene';
import type { S2Anchor, S2HorizontalAlign, S2VerticalAlign } from '../../shared/s2-globals';
import type { S2Space } from '../../shared/s2-base-type';
import { S2Vec2 } from '../../math/s2-vec2';
import { S2AnchorUtils, S2FlexUtils, svgNS } from '../../shared/s2-globals';
import { S2Rect } from '../s2-rect';
import { S2Circle } from '../s2-circle';
import { S2TextGroup, S2TextLine } from '../text/s2-text-group';
import { S2Line } from '../s2-line';
import { S2Element } from '../base/s2-element';
import { S2DataUtils } from '../base/s2-data-utils';
import { S2Extents } from '../../shared/s2-extents';
import { S2Length } from '../../shared/s2-length';
import { S2ElementData, S2FillData, S2FontData, S2StrokeData } from '../base/s2-base-data';
import { S2Position } from '../../shared/s2-position';
import { S2Enum } from '../../shared/s2-enum';
import { S2Number } from '../../shared/s2-number';
import { S2Transform } from '../../shared/s2-transform';
import { S2MathUtils } from '../../math/s2-math-utils';

export class S2RichNodeData extends S2ElementData {
    public readonly position: S2Position;
    public readonly anchor: S2Enum<S2Anchor>;
    public readonly background: S2RichNodeBackgroundData;
    public readonly text: S2RichNodeTextData;
    public readonly separator: S2RichNodeSeparatorData;
    public readonly padding: S2Extents;
    public readonly partSep: S2Length;
    public readonly minExtents: S2Extents;

    constructor() {
        super();
        this.position = new S2Position(0, 0, 'world');
        this.anchor = new S2Enum<S2Anchor>('center');
        this.minExtents = new S2Extents(0, 0, 'view');
        this.background = new S2RichNodeBackgroundData();
        this.separator = new S2RichNodeSeparatorData();
        this.text = new S2RichNodeTextData();
        this.padding = new S2Extents(10, 5, 'view');
        this.partSep = new S2Length(5, 'view');
    }
}

export class S2RichNodeBackgroundData extends S2ElementData {
    public readonly fill: S2FillData;
    public readonly stroke: S2StrokeData;
    public readonly opacity: S2Number;
    public readonly transform: S2Transform;
    public readonly cornerRadius: S2Length;

    constructor() {
        super();
        this.fill = new S2FillData();
        this.stroke = new S2StrokeData();
        this.opacity = new S2Number(1);
        this.transform = new S2Transform();
        this.cornerRadius = new S2Length(5, 'view');

        this.stroke.opacity.set(1);
        this.fill.opacity.set(1);
    }
}

export class S2RichNodeTextData extends S2ElementData {
    public readonly fill: S2FillData;
    public readonly stroke: S2StrokeData;
    public readonly opacity: S2Number;
    public readonly transform: S2Transform;

    public readonly font: S2FontData;
    public readonly horizontalAlign: S2Enum<S2HorizontalAlign>;
    public readonly verticalAlign: S2Enum<S2VerticalAlign>;

    constructor() {
        super();
        this.fill = new S2FillData();
        this.stroke = new S2StrokeData();
        this.opacity = new S2Number(1);
        this.transform = new S2Transform();
        this.font = new S2FontData();
        this.horizontalAlign = new S2Enum<S2HorizontalAlign>('center');
        this.verticalAlign = new S2Enum<S2VerticalAlign>('middle');

        this.stroke.width.set(0, 'view');
        this.fill.opacity.set(1);
    }
}

export class S2RichNodeSeparatorData extends S2ElementData {
    public readonly stroke: S2StrokeData;
    public readonly opacity: S2Number;

    constructor() {
        super();
        this.stroke = new S2StrokeData();
        this.opacity = new S2Number(1);

        this.stroke.width.set(2, 'view');
        this.opacity.set(1);
    }
}

export class S2Node extends S2Element<S2RichNodeData> {
    protected element: SVGGElement;
    protected textGroups: S2TextGroup[];
    protected textGrows: number[];
    protected sepLines: S2Line[];
    protected background: S2Rect | S2Circle | null = null;
    protected extents: S2Extents;

    constructor(scene: S2BaseScene, partCount: number = 1) {
        super(scene, new S2RichNodeData());
        this.element = document.createElementNS(svgNS, 'g');
        this.textGroups = [];
        this.textGrows = [];
        this.sepLines = [];

        for (let i = 0; i < partCount; i++) {
            const textGroup = new S2TextGroup(this.scene);
            textGroup.data.layer.set(2);

            textGroup.setParent(this);
            this.textGroups.push(textGroup);
            this.textGrows.push(1);
        }
        for (let i = 0; i < partCount - 1; i++) {
            const line = new S2Line(this.scene);
            line.data.layer.set(1);

            line.setParent(this);
            this.sepLines.push(line);
        }
        this.extents = new S2Extents(0, 0, 'view');
        this.element.dataset.role = 'node';
        this.updateSVGChildren();
    }

    getPosition(space: S2Space): S2Vec2 {
        return this.data.position.toSpace(space, this.scene.getActiveCamera());
    }

    getMinExtents(space: S2Space): S2Vec2 {
        return this.data.minExtents.toSpace(space, this.scene.getActiveCamera());
    }

    getPadding(space: S2Space): S2Vec2 {
        return this.data.padding.toSpace(space, this.scene.getActiveCamera());
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    addLine(options?: { partIndex?: number; align?: S2HorizontalAlign; skip?: number }): S2TextLine {
        const index = S2MathUtils.clamp(options?.partIndex ?? 0, 0, this.textGroups.length - 1);
        const textLine = this.textGroups[index].addLine(options);
        return textLine;
    }

    createRectBackground(): S2Rect {
        if (this.background !== null) this.background.setParent(null);
        this.background = new S2Rect(this.scene);
        this.background.data.layer.set(0);

        this.background.setParent(this);
        this.updateSVGChildren();
        return this.background;
    }

    createCircleBackground(): S2Circle {
        if (this.background !== null) this.background.setParent(null);
        this.background = new S2Circle(this.scene);
        this.background.data.layer.set(0);

        this.background.setParent(this);
        this.updateSVGChildren();
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
            this.data.anchor.get(),
            space,
            this.scene.getActiveCamera(),
            this.data.position,
            this.extents,
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
        return this.data.position.toSpace(space, this.scene.getActiveCamera());
    }

    // refreshExtents(): void {
    //     for (let i = 0; i < this.textGroups.length; i++) {
    //         const textGroup = this.textGroups[i];
    //         textGroup.updateExtents();
    //     }
    // }

    update(): void {
        if (this.skipUpdate()) return;
        const camera = this.scene.getActiveCamera();

        if (this.background !== null) {
            this.background.data.stroke.copyIfUnlocked(this.data.background.stroke);
            this.background.data.fill.copyIfUnlocked(this.data.background.fill);
            this.background.data.opacity.copyIfUnlocked(this.data.background.opacity);
            this.background.data.transform.copyIfUnlocked(this.data.background.transform);
            if (this.background instanceof S2Rect) {
                this.background.data.cornerRadius.copyIfUnlocked(this.data.background.cornerRadius);
            }
        }

        for (const textGroup of this.textGroups) {
            textGroup.data.font.copyIfUnlocked(this.data.text.font);
            textGroup.data.horizontalAlign.copyIfUnlocked(this.data.text.horizontalAlign);
            textGroup.data.verticalAlign.copyIfUnlocked(this.data.text.verticalAlign);
            textGroup.data.fill.copyIfUnlocked(this.data.text.fill);
            textGroup.data.opacity.copyIfUnlocked(this.data.text.opacity);
            textGroup.data.stroke.copyIfUnlocked(this.data.text.stroke);
        }

        for (const line of this.sepLines) {
            line.data.opacity.copyIfUnlocked(this.data.separator.opacity);
            line.data.stroke.copyIfUnlocked(this.data.separator.stroke);
        }

        const partHeights: Array<number> = [];
        let maxPartWidth = 0;

        for (let i = 0; i < this.textGroups.length; i++) {
            const textGroup = this.textGroups[i];
            //textGroup.updateExtents();
            const extents = textGroup.getTextExtents('view');
            maxPartWidth = Math.max(maxPartWidth, 2 * extents.x);
            partHeights.push(2 * extents.y);
        }

        const nodeMinExtents = this.data.minExtents.toSpace('view', camera);
        const padding = this.data.padding.toSpace('view', camera);
        const partSep = this.data.partSep.toSpace('view', camera);

        const height = S2FlexUtils.computeSizes(
            partHeights,
            this.textGrows,
            2 * nodeMinExtents.y,
            padding.y,
            2 * partSep,
        );

        const nodeExtents = new S2Vec2(Math.max(maxPartWidth / 2 + padding.x, nodeMinExtents.x), height / 2);
        this.extents.setValueFromSpace(nodeExtents.x, nodeExtents.y, 'view', camera);

        const nodeCenter = S2AnchorUtils.getCenter(
            this.data.anchor.get(),
            'view',
            camera,
            this.data.position,
            this.extents,
        );
        const textPosition = nodeCenter.clone().subV(nodeExtents).addV(padding);
        for (let i = 0; i < this.textGroups.length; i++) {
            this.textGroups[i].data.position.setV(textPosition, 'view');
            this.textGroups[i].data.minExtents.set(nodeExtents.x - padding.x, partHeights[i] / 2, 'view');
            this.textGroups[i].data.anchor.set('north-west');
            textPosition.y += partHeights[i] + 2 * partSep;
        }

        // Position background and separator lines
        if (this.background instanceof S2Rect) {
            // Background
            this.background.data.position.setV(nodeCenter, 'view');
            this.background.data.extents.setV(nodeExtents, 'view');
            this.background.data.anchor.set('center');

            // Separator lines
            let y = nodeCenter.y - nodeExtents.y + padding.y + partHeights[0] + partSep;
            for (let i = 0; i < this.textGroups.length - 1; i++) {
                this.sepLines[i].data.startPosition.set(nodeCenter.x - nodeExtents.x, y, 'view');
                this.sepLines[i].data.endPosition.set(nodeCenter.x + nodeExtents.x, y, 'view');
                y += partHeights[i + 1] + 2 * partSep;
            }
        } else if (this.background instanceof S2Circle) {
            // Background
            const radius = Math.max(nodeExtents.x, nodeExtents.y);
            this.background.data.position.setV(nodeCenter, 'view');
            this.background.data.radius.set(radius, 'view');

            // Separator lines
            let y = nodeCenter.y - nodeExtents.y + padding.y + partHeights[0] + partSep;
            for (let i = 0; i < this.textGroups.length - 1; i++) {
                const x = Math.sqrt(radius * radius - (y - nodeCenter.y) * (y - nodeCenter.y));
                this.sepLines[i].data.startPosition.set(nodeCenter.x - x, y, 'view');
                this.sepLines[i].data.endPosition.set(nodeCenter.x + x, y, 'view');
                y += partHeights[i + 1] + 2 * partSep;
            }
        }

        S2DataUtils.applyFont(this.data.text.font, this.element, this.scene);
        S2DataUtils.applyFill(this.data.text.fill, this.element, this.scene);
        S2DataUtils.applyStroke(this.data.text.stroke, this.element, this.scene);
        S2DataUtils.applyOpacity(this.data.text.opacity, this.element, this.scene);
        S2DataUtils.applyTransform(this.data.text.transform, this.element, this.scene);

        for (const child of this.children) {
            child.update();
        }

        this.clearDirty();
    }
}
