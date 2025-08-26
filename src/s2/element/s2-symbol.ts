import { type S2BaseScene } from '../s2-interface';
import { svgNS } from '../s2-globals';
import { S2Element } from './s2-element';

export class S2Symbol extends S2Element<SVGSymbolElement> {
    protected element: SVGSymbolElement;
    constructor(scene: S2BaseScene) {
        super(scene);
        this.element = document.createElementNS(svgNS, 'symbol');
    }

    update(): this {
        return this;
    }
}
