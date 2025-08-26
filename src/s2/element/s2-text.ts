import { Vector2 } from '../../math/vector2';
import { type S2BaseScene } from '../s2-interface';
import { svgNS } from '../s2-globals';
import { S2Shape } from './s2-shape';

// "text-anchor": "start | middle | end"
// "dominant-baseline": "auto | middle | hanging" + autres
// "font-family"
// "font-size"
// "font-stretch"
// "font-style"
// "font-variant"
// "font-weight"

export class S2Text extends S2Shape<SVGTextElement> {
    protected element: SVGTextElement;
    protected viewExtents: Vector2;
    protected tspans: Array<S2Tspan>;

    constructor(scene: S2BaseScene) {
        const element = document.createElementNS(svgNS, 'text');
        super(scene);
        this.element = element;
        this.tspans = [];
        this.viewExtents = new Vector2(0, 0);
    }

    getSVGElement(): SVGTextElement {
        return this.element;
    }

    addContent(content: string): this {
        this.element.appendChild(document.createTextNode(content));
        return this;
    }

    addSpan(content: string): S2Tspan {
        const tspan = new S2Tspan(this.scene);
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
        return this.element.getBBox() ?? new DOMRect();
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
        this.updateSVGTransform(this.element);
        this.updateSVGStyle(this.element);
        this.updateDimensions();

        const position = this.getPosition('view');
        this.element.setAttribute('x', position.x.toString());
        this.element.setAttribute('y', position.y.toString());
        return this;
    }
}

export class S2Tspan extends S2Shape<SVGTSpanElement> {
    protected element: SVGTSpanElement;
    constructor(scene: S2BaseScene) {
        const element = document.createElementNS(svgNS, 'tspan');
        super(scene);
        this.element = element;
    }

    getSVGElement(): SVGTSpanElement {
        return this.element;
    }

    setContent(content: string): this {
        this.element.textContent = content;
        return this;
    }

    update(): this {
        this.updateSVGTransform(this.element);
        this.updateSVGStyle(this.element);
        return this;
    }
}
