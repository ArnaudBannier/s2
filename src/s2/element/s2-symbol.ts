import { type S2BaseScene } from '../s2-interface';
import { svgNS } from '../s2-globals';
import { S2Element } from './s2-element';

export class S2Symbol extends S2Element<SVGSymbolElement> {
    constructor(scene: S2BaseScene) {
        const element = document.createElementNS(svgNS, 'symbol');
        super(scene, element);
    }

    update(): this {
        super.update();
        return this;
    }
}
