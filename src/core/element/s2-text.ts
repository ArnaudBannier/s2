import { S2Vec2 } from '../math/s2-vec2';
import { type S2BaseScene } from '../s2-interface';
import { svgNS } from '../s2-globals';
import { NewS2SimpleShape, S2SMonoGraphicData } from './s2-shape';
import { S2Position } from '../s2-types';

// "text-anchor": "start | middle | end"
// "dominant-baseline": "auto | middle | hanging" + autres
// "font-family"
// "font-size"
// "font-stretch"
// "font-style"
// "font-variant"
// "font-weight"

export type S2TextAnchor = 'start' | 'middle' | 'end';

export class S2TextData extends S2SMonoGraphicData {
    public position: S2Position;
    public anchor: S2TextAnchor;

    constructor() {
        super();
        this.position = new S2Position(0, 0, 'world');
        this.anchor = 'start';
    }

    copy(other: S2TextData): void {
        super.copy(other);
        this.position.copy(other.position);
        this.anchor = other.anchor;
    }

    applyToElement(element: SVGElement, scene: S2BaseScene): void {
        super.applyToElement(element, scene);
        const position = this.position.toSpace('view', scene.activeCamera);
        element.setAttribute('x', position.x.toString());
        element.setAttribute('y', position.y.toString());
        element.setAttribute('text-anchor', this.anchor);
    }
}

export class NewS2BaseText<Data extends S2TextData> extends NewS2SimpleShape<Data> {
    protected element: SVGTextElement;
    protected tspans: Array<NewS2TSpan>;

    constructor(scene: S2BaseScene, data: Data) {
        super(scene, data);
        this.element = document.createElementNS(svgNS, 'text');
        this.tspans = [];
    }

    get position(): S2Position {
        return this.data.position;
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    addContent(content: string): this {
        this.element.appendChild(document.createTextNode(content));
        return this;
    }

    addSpan(content: string): NewS2TSpan {
        const tspan = new NewS2TSpan(this.scene);
        this.tspans.push(tspan);
        this.element.appendChild(tspan.getSVGElement());
        tspan.setContent(content);
        return tspan;
    }

    clearText(): this {
        this.tspans.length = 0;
        this.element.replaceChildren();
        return this;
    }

    getBBox(): DOMRect {
        return this.element.getBBox();
    }

    getDimensions(): S2Vec2 {
        const bbox = this.element.getBBox();
        return new S2Vec2(bbox.width, bbox.height);
    }

    update(updateId?: number): this {
        if (this.shouldSkipUpdate(updateId)) return this;
        this.data.applyToElement(this.element, this.scene);
        return this;
    }
}

export class NewS2Text extends NewS2BaseText<S2TextData> {
    constructor(scene: S2BaseScene) {
        super(scene, new S2TextData());
    }
}

export class S2TSpanData extends S2SMonoGraphicData {
    constructor() {
        super();
    }

    copy(other: S2TSpanData): void {
        super.copy(other);
    }

    applyToElement(element: SVGElement, scene: S2BaseScene): void {
        super.applyToElement(element, scene);
    }
}

export class NewS2TSpan extends NewS2SimpleShape<S2TSpanData> {
    protected element: SVGTSpanElement;

    constructor(scene: S2BaseScene) {
        super(scene, new S2TSpanData());
        this.element = document.createElementNS(svgNS, 'tspan');
    }

    getSVGElement(): SVGTextElement {
        return this.element;
    }

    setContent(content: string): this {
        this.element.textContent = content;
        return this;
    }

    update(updateId?: number): this {
        if (this.shouldSkipUpdate(updateId)) return this;
        this.data.applyToElement(this.element, this.scene);
        return this;
    }
}
