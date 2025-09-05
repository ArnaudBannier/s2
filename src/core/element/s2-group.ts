import { type S2BaseScene } from '../s2-interface';
import { NewS2Container, S2Container } from './s2-container';
import { S2Element, type S2BaseElement } from './s2-element';
import { svgNS } from '../s2-globals';
import { S2SMonoGraphicData } from './s2-shape';

export class NewS2Group<ChildType extends S2BaseElement> extends NewS2Container<
    SVGGElement,
    ChildType,
    S2SMonoGraphicData
> {
    constructor(scene: S2BaseScene) {
        const data = new S2SMonoGraphicData();
        const element = document.createElementNS(svgNS, 'g');
        super(scene, data, element);
    }
}

export class S2Group<T extends S2Element> extends S2Container<SVGGElement, T> {
    constructor(scene: S2BaseScene) {
        const element = document.createElementNS(svgNS, 'g');
        super(scene, element);
    }

    getSVGElement(): SVGGElement {
        return this.element;
    }
}
