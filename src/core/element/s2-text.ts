import { S2Vec2 } from '../math/s2-vec2';
import { S2BaseScene } from '../s2-base-scene';
import { svgNS, type S2TextAnchor } from '../s2-globals';
import { S2TransformableElementData } from './base/s2-transformable-element';
import { S2Enum } from '../s2-types';
import { S2FontData } from './base/s2-base-data';
import { S2ShapeElement, S2ShapeElementData } from './base/s2-shape-element';
import { S2Element } from './base/s2-element';

export class S2TextData extends S2ShapeElementData {
    public readonly font: S2FontData;
    public readonly textAnchor: S2Enum<S2TextAnchor>;

    constructor() {
        super();
        this.font = new S2FontData();
        this.textAnchor = new S2Enum<S2TextAnchor>('start');
    }

    setParent(parent: S2TextData | null = null): void {
        super.setParent(parent);
        this.font.setParent(parent ? parent.font : null);
        this.textAnchor.setParent(parent ? parent.textAnchor : null);
    }

    applyToElement(element: SVGElement, scene: S2BaseScene): void {
        super.applyToElement(element, scene);
        this.font.applyToElement(element, scene);
        const camera = scene.getActiveCamera();
        const position = this.position.toSpace('view', camera);
        element.setAttribute('x', position.x.toString());
        element.setAttribute('y', position.y.toString());
        element.setAttribute('text-anchor', this.textAnchor.getInherited());
    }
}

export class S2BaseText<Data extends S2TextData> extends S2ShapeElement<Data> {
    protected element: SVGTextElement;
    protected tspans: Array<S2TSpan>;

    constructor(scene: S2BaseScene, data: Data) {
        super(scene, data);
        this.element = document.createElementNS(svgNS, 'text');
        this.tspans = [];
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    addContent(content: string): this {
        this.element.appendChild(document.createTextNode(content));
        return this;
    }

    addSpan(content: string): S2TSpan {
        const tspan = new S2TSpan(this.scene);
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

    protected updateImpl(updateId?: number): void {
        void updateId;
        this.data.applyToElement(this.element, this.scene);
    }
}

export class S2Text extends S2BaseText<S2TextData> {
    constructor(scene: S2BaseScene) {
        super(scene, new S2TextData());
    }
}

export class S2TSpanData extends S2TransformableElementData {
    constructor() {
        super();
    }

    applyToElement(element: SVGElement, scene: S2BaseScene): void {
        super.applyToElement(element, scene);
    }
}

export class S2TSpan extends S2Element<S2TSpanData> {
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

    protected updateImpl(updateId?: number): void {
        void updateId;
        this.data.applyToElement(this.element, this.scene);
    }
}
