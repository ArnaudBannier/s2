import { Vector2 } from '../../math/vector2';
import { type S2BaseScene } from '../s2-interface';
import { svgNS } from '../s2-globals';
import { S2Shape } from './s2-shape';
import type { S2Attributes } from '../s2-attributes';

// "text-anchor": "start | middle | end"
// "dominant-baseline": "auto | middle | hanging" + autres
// "font-family"
// "font-size"
// "font-stretch"
// "font-style"
// "font-variant"
// "font-weight"

export class S2Text extends S2Shape<SVGTextElement> {
    protected viewExtents: Vector2;
    protected tspans: Array<S2Tspan>;

    constructor(scene: S2BaseScene) {
        const element = document.createElementNS(svgNS, 'text');
        super(element, scene);
        this.tspans = [];
        this.viewExtents = new Vector2(0, 0);
    }

    setAttributes(attributes: S2Attributes): this {
        super.setAttributes(attributes);
        if (attributes.textFillColor) this.fillColor = attributes.textFillColor.clone();
        if (attributes.textStrokeColor) this.strokeColor = attributes.textStrokeColor.clone();
        if (attributes.textFillOpacity) this.fillOpacity = attributes.textFillOpacity;
        if (attributes.textOpacity) this.opacity = attributes.textOpacity;
        if (attributes.textStrokeWidth) this.strokeWidth = attributes.textStrokeWidth.clone();
        return this;
    }

    getAttributes(): S2Attributes {
        const attributes = super.getAttributes();
        if (this.fillColor) attributes.textFillColor = this.fillColor.clone();
        return attributes;
    }

    addContent(content: string): this {
        this.element.appendChild(document.createTextNode(content));
        return this;
    }

    addSpan(content: string): S2Tspan {
        const tspan = new S2Tspan(this.scene);
        this.tspans.push(tspan);
        this.element.appendChild(tspan.getElement());
        tspan.setContent(content);
        return tspan;
    }

    clearText(): this {
        this.element.replaceChildren();
        this.tspans.length = 0;
        return this;
    }

    getBBox(): DOMRect {
        return this.element.getBBox();
    }

    getDimensions(): Vector2 {
        const bbox = this.element.getBBox();
        return new Vector2(bbox.width, bbox.height);
    }

    updateDimensions(): this {
        const bbox = this.element.getBBox();
        this.viewExtents.x = bbox.width / 2;
        this.viewExtents.y = bbox.height / 2;
        return this;
    }

    setTextAnchor(anchor: 'start' | 'middle' | 'end'): this {
        this.element.setAttribute('text-anchor', anchor);
        return this;
    }

    update(): this {
        super.update();
        this.updateDimensions();

        const position = this.getPosition('view');
        this.element.setAttribute('x', position.x.toString());
        this.element.setAttribute('y', position.y.toString());
        return this;
    }
}

export class S2Tspan extends S2Shape<SVGTSpanElement> {
    constructor(scene: S2BaseScene) {
        const element = document.createElementNS(svgNS, 'tspan');
        super(element, scene);
    }

    setContent(content: string): this {
        this.element.textContent = content;
        return this;
    }
}
