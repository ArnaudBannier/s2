import { type S2BaseScene } from '../s2-interface';
import { S2Container } from './s2-container';
import { type S2BaseElement } from './s2-element';
import { svgNS } from '../s2-globals';

export class S2Group<T extends S2BaseElement> extends S2Container<SVGGElement, T> {
    constructor(scene: S2BaseScene) {
        const element = document.createElementNS(svgNS, 'g');
        super(scene, element);
    }
}
