import type { S2BaseScene } from '../scene/s2-base-scene';
import type { S2Space } from '../shared/s2-base-type';
import type { S2TSpan } from './text/s2-tspan';
import type { S2Vec2 } from '../math/s2-vec2';
import type { S2StepAnimator } from '../animation/s2-step-animator';
import type { S2Color } from '../shared/s2-color';
import type { S2Anchor, S2Dirtyable, S2VerticalAlign } from '../shared/s2-globals';
import { S2AnchorUtils, svgNS } from '../shared/s2-globals';
import { S2FillData, S2ElementData, S2StrokeData, S2FontData, S2BaseData } from './base/s2-base-data';
import { S2Element } from './base/s2-element';
import { S2TextGroup } from './text/s2-text-group';
import { S2Rect } from './s2-rect';
import { MTL } from '../../utils/mtl-colors';
import { S2DataUtils } from './base/s2-data-utils';
import { S2MathUtils } from '../math/s2-utils';
import { S2Position } from '../shared/s2-position';
import { S2Enum } from '../shared/s2-enum';
import { S2Extents } from '../shared/s2-extents';
import { S2Number } from '../shared/s2-number';
import { S2Length } from '../shared/s2-length';
import { S2LerpAnimFactory } from '../animation/s2-lerp-anim';
import { ease } from '../animation/s2-easing';
import { S2TextHighlight } from './text/s2-text-highlight';

export type S2CodeToken = {
    type: string;
    value: string;
};

export function tokenizeAlgorithm(input: string): S2CodeToken[] {
    const tokens: S2CodeToken[] = [];
    // Regex qui capture :
    // 1. Balises **tag:texte**
    // 2. Espaces
    // 3. Ponctuation (();,.)
    // 4. Tout le reste (mots)
    const regex = /\*\*(\w+):(.*?)\*\*|(\s+)|([();,.])|([^\s();,.]+)/g;

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
    tokens.pop(); // Remove the last newline
    return tokens;
}

export class S2CodeData extends S2ElementData {
    public readonly position: S2Position;
    public readonly opacity: S2Number;
    public readonly anchor: S2Enum<S2Anchor>;
    public readonly padding: S2Extents;
    public readonly minExtents: S2Extents;
    public readonly text: S2CodeTextData;
    public readonly background: S2CodeBackgroundData;
    public readonly currentLine: S2CodeCurrentLineData;

    constructor() {
        super();
        this.position = new S2Position(0, 0, 'world');
        this.anchor = new S2Enum<S2Anchor>('center');
        this.padding = new S2Extents(10, 5, 'view');
        this.minExtents = new S2Extents(0, 0, 'view');
        this.text = new S2CodeTextData();
        this.background = new S2CodeBackgroundData();
        this.currentLine = new S2CodeCurrentLineData();
        this.opacity = new S2Number(1);
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        super.setOwner(owner);
        this.position.setOwner(owner);
        this.anchor.setOwner(owner);
        this.padding.setOwner(owner);
        this.minExtents.setOwner(owner);
        this.text.setOwner(owner);
        this.background.setOwner(owner);
        this.currentLine.setOwner(owner);
        this.opacity.setOwner(owner);
    }

    clearDirty(): void {
        super.clearDirty();
        this.position.clearDirty();
        this.anchor.clearDirty();
        this.padding.clearDirty();
        this.minExtents.clearDirty();
        this.text.clearDirty();
        this.background.clearDirty();
        this.currentLine.clearDirty();
        this.opacity.clearDirty();
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
        this.opacity = new S2Number(1);
        this.font = new S2FontData();
        this.verticalAlign = new S2Enum<S2VerticalAlign>('middle');

        this.stroke.width.set(0, 'view');
        this.fill.opacity.set(1);
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        this.fill.setOwner(owner);
        this.stroke.setOwner(owner);
        this.opacity.setOwner(owner);
        this.font.setOwner(owner);
        this.verticalAlign.setOwner(owner);
    }

    clearDirty(): void {
        this.fill.clearDirty();
        this.stroke.clearDirty();
        this.opacity.clearDirty();
        this.font.clearDirty();
        this.verticalAlign.clearDirty();
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
        this.opacity = new S2Number(1);
        this.cornerRadius = new S2Length(5, 'view');

        this.stroke.opacity.set(1);
        this.fill.opacity.set(1);
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        this.fill.setOwner(owner);
        this.stroke.setOwner(owner);
        this.opacity.setOwner(owner);
        this.cornerRadius.setOwner(owner);
    }

    clearDirty(): void {
        this.fill.clearDirty();
        this.stroke.clearDirty();
        this.opacity.clearDirty();
        this.cornerRadius.clearDirty();
    }
}

export class S2CodeCurrentLineData extends S2BaseData {
    public readonly fill: S2FillData;
    public readonly stroke: S2StrokeData;
    public readonly opacity: S2Number;
    public readonly index: S2Number;
    public readonly padding: S2Extents;

    constructor() {
        super();
        this.fill = new S2FillData();
        this.stroke = new S2StrokeData();
        this.opacity = new S2Number(0);
        this.index = new S2Number(0);
        this.padding = new S2Extents(0, 1, 'view');

        this.stroke.opacity.set(1);
        this.fill.opacity.set(1);
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        this.fill.setOwner(owner);
        this.stroke.setOwner(owner);
        this.opacity.setOwner(owner);
        this.index.setOwner(owner);
        this.padding.setOwner(owner);
    }

    clearDirty(): void {
        this.fill.clearDirty();
        this.stroke.clearDirty();
        this.opacity.clearDirty();
        this.index.clearDirty();
        this.padding.clearDirty();
    }
}

export type S2TokenStyleSetter = (tspan: S2TSpan, type: string) => void;

export class S2Code extends S2Element<S2CodeData> {
    protected element: SVGGElement;
    protected textGroup: S2TextGroup;
    protected codeBackground: S2Rect;
    protected lineBackground: S2Rect;
    protected extents: S2Extents;
    protected tokenStyleSetter: S2TokenStyleSetter = S2Code.defaultTokenStyleSetter;
    protected highlights: S2TextHighlight[];

    constructor(scene: S2BaseScene) {
        super(scene, new S2CodeData());
        this.element = document.createElementNS(svgNS, 'g');
        this.textGroup = new S2TextGroup(scene);
        this.codeBackground = new S2Rect(scene);
        this.lineBackground = new S2Rect(scene);
        this.extents = new S2Extents(0, 0, 'view');
        this.highlights = [];

        this.textGroup.setParent(this);
        this.codeBackground.setParent(this);
        this.lineBackground.setParent(this);

        this.textGroup.data.layer.set(2);
        this.codeBackground.data.layer.set(0);
        this.lineBackground.data.layer.set(0);

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
                tspan.data.fill.color.copyIfUnlocked(MTL.ORANGE_2).lock();
                break;
            case 'type':
                tspan.data.fill.color.copyIfUnlocked(MTL.BLUE_3).lock();
                break;
            case 'kw':
                tspan.data.fill.color.copyIfUnlocked(MTL.PURPLE_3).lock();
                //tspan.data.font.weight.set(700).lock();
                break;
            case 'var':
                tspan.data.fill.color.copyIfUnlocked(MTL.LIGHT_BLUE_1).lock();
                break;
            case 'num':
                tspan.data.fill.color.copyIfUnlocked(MTL.LIME_2).lock();
                break;
            case 'str':
                tspan.data.fill.color.copyIfUnlocked(MTL.DEEP_ORANGE_2).lock();
                break;
            case 'punct':
                tspan.data.fill.color.copyIfUnlocked(MTL.PURPLE_1).lock();
                break;
        }
    }

    animateSetCurrentLine(
        index: number,
        animator: S2StepAnimator,
        options: { label?: string; offset?: number; duration?: number; prevIndex?: number } = {},
    ): this {
        const label = animator.ensureLabel(options.label);
        const offset = options.offset ?? 0;
        const duration = options.duration ?? 500;
        if (options.prevIndex !== undefined) {
            this.data.currentLine.index.set(options.prevIndex);
        }
        const lerpAnim = S2LerpAnimFactory.create(this.scene, this.data.currentLine.index)
            .setCycleDuration(duration)
            .setEasing(ease.inOut);
        this.data.currentLine.index.set(index);
        animator.addAnimation(lerpAnim.commitFinalState(), label, offset);
        return this;
    }

    findTokenTSpan(lineIndex: number, options: { content?: string; category?: string }): S2TSpan | undefined {
        return this.textGroup.getLine(lineIndex).findTSpan(options);
    }

    createTokenHighlight(
        tokens: { lineIndex: number; content?: string; category?: string }[],
        color?: S2Color,
    ): S2TextHighlight {
        const highlightColor = color ?? MTL.BLUE_5;
        const highlight = new S2TextHighlight(this.scene);
        highlight.data.fill.opacity.set(0.15);
        highlight.data.fill.color.copyIfUnlocked(highlightColor);
        highlight.data.stroke.color.copyIfUnlocked(highlightColor);
        highlight.data.stroke.width.set(1, 'view');
        highlight.data.layer.set(1);
        highlight.setParent(this);

        for (const token of tokens) {
            const span = this.findTokenTSpan(token.lineIndex, {
                content: token.content,
                category: token.category,
            });
            if (span) {
                highlight.addReference(span);
            } else {
                console.warn('Token not found for highlight:', token);
            }
        }
        this.highlights.push(highlight);
        return highlight;
    }

    createEmphasisForToken(
        lineIndex: number,
        options: { content?: string; category?: string },
    ): S2TextHighlight | null {
        const span = this.findTokenTSpan(lineIndex, options);
        if (!span) return null;

        const emph = new S2TextHighlight(this.scene);
        emph.data.fill.opacity.set(0.2);
        emph.data.fill.color.copyIfUnlocked(MTL.BLUE_9);
        emph.data.stroke.color.copyIfUnlocked(MTL.BLUE_5);
        emph.data.stroke.width.set(1, 'view');
        emph.data.layer.set(1);
        emph.setParent(this);
        emph.addReference(span);
        emph.update();
        this.highlights.push(emph);
        return emph;
    }

    detachEmphasisRect(highlight: S2TextHighlight): this {
        const index = this.highlights.indexOf(highlight);
        if (index !== -1) {
            this.highlights.splice(index, 1);
        }
        highlight.setParent(null);
        return this;
    }

    setContent(tokens: S2CodeToken[]): void {
        let lineElement = this.textGroup.addLine();
        for (const token of tokens) {
            lineElement.data.preserveWhitespace.set(true);
            if (token.type === 'plain') {
                lineElement.addTSpan(token.value);
            } else if (token.type === 'newline') {
                lineElement = this.textGroup.addLine();
            } else {
                const span = lineElement.addTSpan(token.value, token.type);
                this.tokenStyleSetter(span, token.type);
                //span.update();
            }
        }
    }

    getExtents(space: S2Space): S2Vec2 {
        return this.extents.toSpace(space, this.scene.getActiveCamera());
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    update(): void {
        if (this.skipUpdate()) return;

        const camera = this.scene.getActiveCamera();
        const space: S2Space = 'view';
        this.updateSVGChildren();

        S2DataUtils.applyOpacity(this.data.opacity, this.element, this.scene);

        this.textGroup.data.font.copyIfUnlocked(this.data.text.font);
        this.textGroup.data.horizontalAlign.set('left');
        this.textGroup.data.verticalAlign.copyIfUnlocked(this.data.text.verticalAlign);
        this.textGroup.data.fill.copyIfUnlocked(this.data.text.fill);
        this.textGroup.data.opacity.copyIfUnlocked(this.data.text.opacity);
        this.textGroup.data.stroke.copyIfUnlocked(this.data.text.stroke);
        this.textGroup.update();

        const textExtents = this.textGroup.getExtents(space);
        const padding = this.data.padding.toSpace(space, camera);

        const minExtents = this.data.minExtents.toSpace(space, camera);
        const extents = textExtents.addV(padding);
        extents.maxV(minExtents);
        this.extents.setV(extents, space);
        const textMinExtents = extents.clone().subV(padding);

        const codeCenter = S2AnchorUtils.getCenter(
            this.data.anchor.get(),
            space,
            camera,
            this.data.position,
            this.extents,
        );

        this.textGroup.data.minExtents.setV(textMinExtents, space);
        this.textGroup.data.position.setV(codeCenter, space);
        this.textGroup.update();

        this.codeBackground.data.position.setV(codeCenter, 'view');
        this.codeBackground.data.extents.setV(extents, 'view');
        this.codeBackground.data.cornerRadius.copyIfUnlocked(this.data.background.cornerRadius);
        this.codeBackground.data.fill.copyIfUnlocked(this.data.background.fill);
        this.codeBackground.data.stroke.copyIfUnlocked(this.data.background.stroke);
        this.codeBackground.data.opacity.copyIfUnlocked(this.data.background.opacity);
        this.codeBackground.update();

        this.lineBackground.data.fill.copyIfUnlocked(this.data.currentLine.fill);
        this.lineBackground.data.stroke.copyIfUnlocked(this.data.currentLine.stroke);
        this.lineBackground.data.opacity.copyIfUnlocked(this.data.currentLine.opacity);

        const lineCount = this.textGroup.getLineCount();
        if (lineCount > 0) {
            const linePadding = this.data.currentLine.padding.toSpace(space, camera);
            const currIndex = S2MathUtils.clamp(this.data.currentLine.index.get(), 0, lineCount - 1);
            const index0 = S2MathUtils.clamp(Math.floor(currIndex), 0, lineCount - 1);
            const index1 = S2MathUtils.clamp(Math.ceil(currIndex), 0, lineCount - 1);

            const t = currIndex - index0;
            const extents0 = this.textGroup.getLine(index0).getExtents(space);
            const extents1 = this.textGroup.getLine(index1).getExtents(space);
            const position0 = this.textGroup.getLine(index0).getCenter(space);
            const position1 = this.textGroup.getLine(index1).getCenter(space);
            const extentsY = extents0.y * (1 - t) + extents1.y * t;
            const y = position0.y * (1 - t) + position1.y * t;
            this.lineBackground.data.position.set(codeCenter.x, y, 'view');
            this.lineBackground.data.extents.set(extents.x + linePadding.x, extentsY + linePadding.y, 'view');
            this.lineBackground.data.anchor.set('center');
            this.lineBackground.update();
        }

        for (const highlight of this.highlights) {
            highlight.update();
        }

        this.clearDirty();
    }
}
