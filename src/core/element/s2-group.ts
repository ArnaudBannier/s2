import { type S2BaseScene } from '../s2-interface';
import { NewS2Container } from './s2-container';
import { type S2BaseElement } from './s2-element';
import { svgNS } from '../s2-globals';
import { S2SMonoGraphicData } from './s2-shape';

export class NewS2Group<ChildType extends S2BaseElement> extends NewS2Container<
    SVGGElement,
    ChildType,
    S2SMonoGraphicData
> {
    constructor(scene: S2BaseScene) {
        const element = document.createElementNS(svgNS, 'g');
        super(scene, new S2SMonoGraphicData(), element);
    }
}
