import { S2BaseScene } from '../s2-base-scene';
import { S2Container } from './base/s2-container';
import { S2Element } from './base/s2-element';
import { svgNS } from '../s2-globals';
import { S2BaseData } from './base/s2-base-data';

export class S2Group<DataType extends S2BaseData, ChildType extends S2Element<DataType>> extends S2Container<
    SVGGElement,
    DataType,
    ChildType
> {
    constructor(scene: S2BaseScene, data: DataType) {
        const element = document.createElementNS(svgNS, 'g');
        super(scene, data, element);
    }
}
