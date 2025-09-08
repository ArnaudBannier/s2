import { S2Mat2x3 } from '../math/s2-mat2x3';
import { type S2BaseScene } from '../s2-interface';
import { S2TransformData } from './s2-base-data';
import { S2MonoGraphic, S2MonoGraphicData } from './s2-mono-graphic';

export class S2TransformGraphicData extends S2MonoGraphicData {
    public readonly transform: S2TransformData;

    constructor() {
        super();
        this.transform = new S2TransformData();
    }

    setParent(parent: S2TransformGraphicData | null = null): void {
        super.setParent(parent);
        this.transform.matrix.makeIdentity();
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

    setTransform(matrix: S2Mat2x3): this;
    setTransform(a00: number, a01: number, a02: number, a10: number, a11: number, a12: number): this;
    setTransform(a: S2Mat2x3 | number, a01?: number, a02?: number, a10?: number, a11?: number, a12?: number): this {
        if (a instanceof S2Mat2x3) {
            this.data.transform.matrix.copy(a);
        } else {
            this.data.transform.matrix.set(a, a01!, a02!, a10!, a11!, a12!);
        }
        return this;
    }

    setTransformIdentity(): this {
        this.data.transform.matrix.makeIdentity();
        return this;
    }

    setTransformTranslation(x: number, y: number): this {
        this.data.transform.matrix.makeTranslation(x, y);
        return this;
    }

    setTransformRotationDeg(angle: number): this {
        this.data.transform.matrix.makeRotationDeg(angle);
        return this;
    }

    setTransformRotationRad(angle: number): this {
        this.data.transform.matrix.makeRotationRad(angle);
        return this;
    }

    setTransformRotationFromDeg(angle: number, centerX: number, centerY: number): this {
        this.data.transform.matrix.makeRotationFromDeg(angle, centerX, centerY);
        return this;
    }

    setTransformRotationFromRad(angle: number, centerX: number, centerY: number): this {
        this.data.transform.matrix.makeRotationFromRad(angle, centerX, centerY);
        return this;
    }

    setTransformScale(sx: number, sy: number): this {
        this.data.transform.matrix.makeScale(sx, sy);
        return this;
    }

    setTransformScaleFrom(sx: number, sy: number, centerX: number, centerY: number): this {
        this.data.transform.matrix.makeScaleFrom(sx, sy, centerX, centerY);
        return this;
    }
}
