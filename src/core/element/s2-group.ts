import { type S2BaseScene } from '../s2-interface';
import { S2Container } from './s2-container';
import { type S2BaseElement } from './s2-element';
import { svgNS } from '../s2-globals';
import { S2TransformGraphicData } from './s2-transform-graphic';

export class S2Group<ChildType extends S2BaseElement> extends S2Container<
    SVGGElement,
    ChildType,
    S2TransformGraphicData
> {
    constructor(scene: S2BaseScene) {
        const element = document.createElementNS(svgNS, 'g');
        super(scene, new S2TransformGraphicData(), element);
    }
}
