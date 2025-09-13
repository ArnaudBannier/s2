import { S2BaseScene } from '../s2-interface';
import { S2Container } from './base/s2-container';
import { type S2BaseElement } from './base/s2-element';
import { svgNS } from '../s2-globals';
import { S2TransformableElementData } from './base/s2-transformable-element';

export class S2Group<ChildType extends S2BaseElement> extends S2Container<
    SVGGElement,
    ChildType,
    S2TransformableElementData
> {
    constructor(scene: S2BaseScene) {
        const element = document.createElementNS(svgNS, 'g');
        super(scene, new S2TransformableElementData(), element);
    }
}
