import { S2BaseScene } from '../s2-base-scene';
import { S2Element } from './base/s2-element';
import { svgNS } from '../s2-globals';
import { S2ElementData } from './base/s2-base-data';

export class S2Group<DataType extends S2ElementData> extends S2Element<DataType> {
    protected element: SVGGElement;

    constructor(scene: S2BaseScene, data: DataType) {
        super(scene, data);
        this.element = document.createElementNS(svgNS, 'g');
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    update(): void {
        if (this.skipUpdate()) return;

        this.updateSVGChildren();
        for (const child of this.children) {
            child.update();
        }

        this.clearDirty();
    }
}
