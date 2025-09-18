import { S2Vec2 } from '../math/s2-vec2';
import { S2BaseScene } from '../s2-base-scene';
import { svgNS, type S2TextAnchor } from '../s2-globals';
import { S2Enum, S2Number, S2Position, S2Transform, S2TypeState } from '../s2-types';
import { S2BaseData, S2FillData, S2FontData, S2StrokeData } from './base/s2-base-data';
import { S2Element } from './base/s2-element';
import { S2DataUtils } from './base/s2-data-utils';

export class S2TextData extends S2BaseData {
    public readonly fill: S2FillData;
    public readonly stroke: S2StrokeData;
    public readonly opacity: S2Number;
    public readonly transform: S2Transform;
    public readonly position: S2Position;
    public readonly font: S2FontData;
    public readonly textAnchor: S2Enum<S2TextAnchor>;

    constructor() {
        super();
        this.fill = new S2FillData();
        this.stroke = new S2StrokeData();
        this.opacity = new S2Number(1, S2TypeState.Inactive);
        this.transform = new S2Transform();
        this.position = new S2Position(0, 0, 'world');
        this.font = new S2FontData();
        this.textAnchor = new S2Enum<S2TextAnchor>('start');

        this.stroke.width.set(0, 'view', S2TypeState.Inactive);
        this.transform.state = S2TypeState.Inactive;
        this.fill.opacity.set(1, S2TypeState.Inactive);
    }
}

export class S2BaseText<Data extends S2TextData> extends S2Element<Data> {
    protected element: SVGTextElement;
    protected tspans: Array<S2TSpan>;
    protected preserveWhitespace: boolean;

    constructor(scene: S2BaseScene, data: Data) {
        super(scene, data);
        this.element = document.createElementNS(svgNS, 'text');
        this.tspans = [];
        this.preserveWhitespace = false;
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    setContent(content: string): this {
        this.element.textContent = content;
        return this;
    }

    addTSpan(content: string, category?: string): S2TSpan {
        const tspan = new S2TSpan(this.scene);
        tspan.setParent(this);
        tspan.setContent(content);
        tspan.data.font.setParent(this.data.font);
        tspan.category = category ?? '';
        this.tspans.push(tspan);
        // S2ElementUtils.appendChild(this, this.children, tspan);
        // S2ElementUtils.updateSVGChildren(this.element, this.children);
        this.updateSVGChildren();
        return tspan;
    }

    setPreserveWhitespace(preserve: boolean): this {
        this.preserveWhitespace = preserve;
        return this;
    }

    getTSpans(): Array<S2TSpan> {
        return this.tspans;
    }

    getTSpanCount(): number {
        return this.tspans.length;
    }

    getTSpan(index: number): S2TSpan {
        return this.tspans[index];
    }

    findTSpan(options: { content?: string; category?: string }): S2TSpan | undefined {
        return this.tspans.find((tspan) => {
            return (
                (options.content ? tspan.getContent() === options.content : true) &&
                (options.category ? tspan.category === options.category : true)
            );
        });
    }

    clearText(): this {
        this.children.length = 0;
        this.tspans.length = 0;
        this.element.replaceChildren();
        this.updateSVGChildren();
        return this;
    }

    getBBox(): DOMRect {
        return this.element.getBBox();
    }

    getDimensions(): S2Vec2 {
        const bbox = this.element.getBBox();
        return new S2Vec2(bbox.width, bbox.height);
    }

    update(): void {
        //S2ElementUtils.updateSVGChildren(this.element, this.children);
        S2DataUtils.applyFill(this.data.fill, this.element, this.scene);
        S2DataUtils.applyStroke(this.data.stroke, this.element, this.scene);
        S2DataUtils.applyOpacity(this.data.opacity, this.element, this.scene);
        S2DataUtils.applyTransform(this.data.transform, this.element, this.scene);
        S2DataUtils.applyPosition(this.data.position, this.element, this.scene, 'x', 'y');
        S2DataUtils.applyFont(this.data.font, this.element, this.scene);
        this.element.setAttribute('text-anchor', this.data.textAnchor.getInherited());
        if (this.preserveWhitespace) {
            this.element.style.whiteSpaceCollapse = 'preserve';
        } else {
            this.element.style.whiteSpace = '';
        }
        for (const tspan of this.tspans) {
            tspan.update();
        }
    }
}

export class S2Text extends S2BaseText<S2TextData> {
    constructor(scene: S2BaseScene) {
        super(scene, new S2TextData());
    }
}

export class S2TSpanData extends S2BaseData {
    public readonly fill: S2FillData;
    public readonly stroke: S2StrokeData;
    public readonly opacity: S2Number;
    public readonly transform: S2Transform;
    public readonly font: S2FontData;

    constructor() {
        super();
        this.fill = new S2FillData();
        this.stroke = new S2StrokeData();
        this.opacity = new S2Number(1, S2TypeState.Inactive);
        this.transform = new S2Transform();
        this.font = new S2FontData();

        this.stroke.width.set(0, 'view', S2TypeState.Inactive);
        this.transform.state = S2TypeState.Inactive;
        this.fill.opacity.set(1, S2TypeState.Inactive);
    }
}

export class S2TSpan extends S2Element<S2TSpanData> {
    public category: string;
    protected content: string;
    protected element: SVGTSpanElement;

    constructor(scene: S2BaseScene) {
        super(scene, new S2TSpanData());
        this.element = document.createElementNS(svgNS, 'tspan');
        this.category = '';
        this.content = '';
    }

    getSVGElement(): SVGTextElement {
        return this.element;
    }

    setContent(content: string): this {
        this.element.textContent = content;
        this.content = content;
        return this;
    }

    getContent(): string {
        return this.content;
    }

    getBBox(): DOMRect {
        return this.element.getBBox();
    }

    update(): void {
        S2DataUtils.applyFill(this.data.fill, this.element, this.scene);
        S2DataUtils.applyStroke(this.data.stroke, this.element, this.scene);
        S2DataUtils.applyOpacity(this.data.opacity, this.element, this.scene);
        S2DataUtils.applyTransform(this.data.transform, this.element, this.scene);
        S2DataUtils.applyFont(this.data.font, this.element, this.scene);
    }
}
