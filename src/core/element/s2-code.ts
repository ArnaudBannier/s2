import { S2BaseScene } from '../s2-base-scene';
import { S2AnchorUtils, svgNS, type S2Anchor, type S2VerticalAlign } from '../s2-globals';
import { S2Enum, S2Extents, S2Length, S2Number, S2Position, S2TypeState, type S2Space } from '../s2-types';
import { S2FillData, S2BaseData, S2StrokeData, S2FontData } from './base/s2-base-data';
import { S2Element, type S2BaseElement } from './base/s2-element';
import { S2TextGroup } from './s2-text-group';
import { S2Rect } from './s2-rect';
import { S2TSpan } from './s2-text';
import { MTL } from '../../utils/mtl-colors';

export type S2CodeToken = {
    type: string;
    value: string;
};

export function tokenizeAlgorithm(input: string): S2CodeToken[] {
    const tokens: S2CodeToken[] = [];
    // Regex qui capture :
    // 1. Balises **tag:texte**
    // 2. Espaces
    // 3. Ponctuation ((),=,; etc.)
    // 4. Tout le reste (mots)
    const regex = /\*\*(\w+):(.*?)\*\*|(\s+)|([()=;,.])|([^\s()=;,.]+)/g;

    for (const line of input.split('\n')) {
        let match;
        while ((match = regex.exec(line)) !== null) {
            if (match[1]) {
                tokens.push({ type: match[1], value: match[2] });
            } else if (match[3]) {
                tokens.push({ type: 'space', value: match[3] });
            } else if (match[4]) {
                tokens.push({ type: 'punct', value: match[4] });
            } else if (match[5]) {
                tokens.push({ type: 'plain', value: match[5] });
            }
        }
        tokens.push({ type: 'newline', value: '\n' });
    }
    return tokens;
}

export class S2CodeData extends S2BaseData {
    public readonly position: S2Position;
    public readonly anchor: S2Enum<S2Anchor>;
    public readonly padding: S2Extents;
    public readonly text: S2CodeTextData;
    public readonly background: S2CodeBackgroundData;
    public readonly currentLine: S2CodeCurrentLineData;

    constructor() {
        super();
        this.position = new S2Position(0, 0, 'world');
        this.anchor = new S2Enum<S2Anchor>('center');
        this.padding = new S2Extents(10, 5, 'view');
        this.text = new S2CodeTextData();
        this.background = new S2CodeBackgroundData();
        this.currentLine = new S2CodeCurrentLineData();
    }
}

export class S2CodeTextData extends S2BaseData {
    public readonly fill: S2FillData;
    public readonly stroke: S2StrokeData;
    public readonly opacity: S2Number;

    public readonly font: S2FontData;
    public readonly verticalAlign: S2Enum<S2VerticalAlign>;

    constructor() {
        super();
        this.fill = new S2FillData();
        this.stroke = new S2StrokeData();
        this.opacity = new S2Number(1, S2TypeState.Inactive);
        this.font = new S2FontData();
        this.verticalAlign = new S2Enum<S2VerticalAlign>('middle');

        this.stroke.width.set(0, 'view', S2TypeState.Inactive);
        this.fill.opacity.set(1, S2TypeState.Inactive);
    }
}

export class S2CodeBackgroundData extends S2BaseData {
    public readonly fill: S2FillData;
    public readonly stroke: S2StrokeData;
    public readonly opacity: S2Number;
    public readonly cornerRadius: S2Length;

    constructor() {
        super();
        this.fill = new S2FillData();
        this.stroke = new S2StrokeData();
        this.opacity = new S2Number(1, S2TypeState.Inactive);
        this.cornerRadius = new S2Length(5, 'view');

        this.stroke.opacity.set(1, S2TypeState.Inactive);
        this.fill.opacity.set(1, S2TypeState.Inactive);
    }
}

export class S2CodeCurrentLineData extends S2BaseData {
    public readonly fill: S2FillData;
    public readonly stroke: S2StrokeData;
    public readonly opacity: S2Number;
    public readonly index: S2Number;

    constructor() {
        super();
        this.fill = new S2FillData();
        this.stroke = new S2StrokeData();
        this.opacity = new S2Number(1, S2TypeState.Inactive);
        this.index = new S2Number(0);

        this.stroke.opacity.set(1, S2TypeState.Inactive);
        this.fill.opacity.set(1, S2TypeState.Inactive);
    }
}

type S2TokenStyleSetter = (tspan: S2TSpan, type: string) => void;

export class S2Code extends S2Element<S2CodeData> {
    protected element: SVGGElement;
    protected children: Array<S2BaseElement>;
    protected textGroup: S2TextGroup;
    protected codeBackground: S2Rect;
    protected lineBackground: S2Rect;
    protected extents: S2Extents;
    protected tokenStyleSetter: S2TokenStyleSetter = S2Code.defaultTokenStyleSetter;

    constructor(scene: S2BaseScene) {
        super(scene, new S2CodeData());
        this.element = document.createElementNS(svgNS, 'g');
        this.textGroup = new S2TextGroup(scene);
        this.codeBackground = new S2Rect(scene);
        this.lineBackground = new S2Rect(scene);
        this.children = [];
        this.extents = new S2Extents(0, 0, 'view');

        this.textGroup.data.layer.set(2);
        this.codeBackground.data.layer.set(0);
        this.lineBackground.data.layer.set(0);

        this.textGroup.setParent(this);
        this.codeBackground.setParent(this);
        this.lineBackground.setParent(this);
        this.element.dataset.role = 'code';

        this.updateSVGChildren();
    }

    setTokenStyleSetter(setter: S2TokenStyleSetter): this {
        this.tokenStyleSetter = setter;
        return this;
    }

    static defaultTokenStyleSetter(tspan: S2TSpan, type: string): void {
        switch (type) {
            case 'fn':
                tspan.data.fill.color.copy(MTL.ORANGE_2);
                break;
            case 'type':
                tspan.data.fill.color.copy(MTL.CYAN_3);
                break;
            case 'kw':
                tspan.data.fill.color.copy(MTL.PURPLE_3);
                tspan.data.font.weight.set(700);
                break;
            case 'var':
                tspan.data.fill.color.copy(MTL.LIGHT_BLUE_1);
                //tspan.data.font.style.set('italic');
                break;
            case 'punct':
                tspan.data.fill.color.copy(MTL.PURPLE_1);
                break;
        }
    }

    findTokenTSpan(lineIndex: number, options: { content?: string; category?: string }): S2TSpan | undefined {
        return this.textGroup.getLine(lineIndex).findTSpan(options);
    }

    setContent(tokens: S2CodeToken[]): void {
        let lineElement = this.textGroup.addLine();
        for (const token of tokens) {
            lineElement.setPreserveWhitespace(true);
            if (token.type === 'plain') {
                lineElement.addTSpan(token.value);
            } else if (token.type === 'newline') {
                lineElement = this.textGroup.addLine();
            } else {
                const span = lineElement.addTSpan(token.value, token.type);
                this.tokenStyleSetter(span, token.type);
                span.update();
            }
        }
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    update(): void {
        const camera = this.scene.getActiveCamera();
        const space: S2Space = 'view';
        this.textGroup.updateExtents();
        const textExtents = this.textGroup.getExtents(space);
        const padding = this.data.padding.toSpace(space, camera);
        const extents = textExtents.addV(padding);
        this.extents.setV(extents, space);

        const codeCenter = S2AnchorUtils.getCenter(
            this.data.anchor.getInherited(),
            space,
            camera,
            this.data.position,
            this.extents,
        );

        this.codeBackground.data.position.setV(codeCenter, 'view');
        this.codeBackground.data.extents.setV(extents, 'view');
        // S2DataUtils.applyFill(this.data.fill, this.element, this.scene);
        // S2DataUtils.applyStroke(this.data.stroke, this.element, this.scene);
        // S2DataUtils.applyOpacity(this.data.opacity, this.element, this.scene);
        // S2DataUtils.applyTransform(this.data.transform, this.element, this.scene);
        // S2DataUtils.applyPosition(this.data.position, this.element, this.scene, 'cx', 'cy');
    }
}
