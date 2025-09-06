import { type S2BaseScene } from '../s2-interface';
import { S2TransformData } from './s2-base-data';
import { S2MonoGraphic, S2MonoGraphicData } from './s2-mono-graphic';

export class S2TransformGraphicData extends S2MonoGraphicData {
    public readonly transform: S2TransformData;

    constructor() {
        super();
        this.transform = new S2TransformData();
    }

    copy(other: S2TransformGraphicData): void {
        super.copy(other);
        this.transform.copy(other.transform);
    }

    applyToElement(element: SVGElement, scene: S2BaseScene): void {
        super.applyToElement(element, scene);
        this.transform.applyToElement(element, scene);
    }
}

export abstract class S2TransformGraphic<Data extends S2TransformGraphicData> extends S2MonoGraphic<Data> {
    constructor(scene: S2BaseScene, data: Data) {
        super(scene, data);
    }

    get transform(): S2TransformData {
        return this.data.transform;
    }
}
