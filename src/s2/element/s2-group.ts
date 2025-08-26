import { type S2BaseScene } from '../s2-interface';
import { S2Container } from './s2-container';
import { S2Element } from './s2-element';
import { svgNS } from '../s2-globals';

export class S2Group<T extends S2Element> extends S2Container<SVGGElement, T> {
    constructor(scene: S2BaseScene) {
        const element = document.createElementNS(svgNS, 'g');
        super(scene, element);
    }

    getSVGElement(): SVGGElement {
        return this.element;
    }
}
