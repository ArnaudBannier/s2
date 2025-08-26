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
        super(scene, element);
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
        this.oldElement?.appendChild(document.createTextNode(content));
        return this;
    }

    addSpan(content: string): S2Tspan {
        const tspan = new S2Tspan(this.scene);
        this.tspans.push(tspan);
        const tspanElement = tspan.getElement();
        if (tspanElement) this.oldElement?.appendChild(tspanElement);
        tspan.setContent(content);
        return tspan;
    }

    clearText(): this {
        this.tspans.length = 0;
        this.oldElement?.replaceChildren();
        return this;
    }

    getBBox(): DOMRect {
        return this.oldElement?.getBBox() ?? new DOMRect();
    }

    getDimensions(): Vector2 {
        if (this.oldElement === undefined) return new Vector2(0, 0);
        const bbox = this.oldElement.getBBox();
        return new Vector2(bbox.width, bbox.height);
    }

    updateDimensions(): this {
        if (this.oldElement === undefined) return this;
        const bbox = this.oldElement.getBBox();
        this.viewExtents.x = bbox.width / 2;
        this.viewExtents.y = bbox.height / 2;
        return this;
    }

    setTextAnchor(anchor: 'start' | 'middle' | 'end'): this {
        this.oldElement?.setAttribute('text-anchor', anchor);
        return this;
    }

    update(): this {
        super.update();
        this.updateDimensions();
        if (this.oldElement === undefined) return this;

        const position = this.getPosition('view');
        this.oldElement.setAttribute('x', position.x.toString());
        this.oldElement.setAttribute('y', position.y.toString());
        return this;
    }
}

export class S2Tspan extends S2Shape<SVGTSpanElement> {
    constructor(scene: S2BaseScene) {
        const element = document.createElementNS(svgNS, 'tspan');
        super(scene, element);
    }

    setContent(content: string): this {
        if (this.oldElement) this.oldElement.textContent = content;
        return this;
    }
}
