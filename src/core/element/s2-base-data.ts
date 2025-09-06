import { S2Mat2x3 } from '../math/s2-mat2x3';
import type { S2LineCap, S2LineJoin } from '../s2-globals';
import { type S2BaseScene } from '../s2-interface';
import { S2Color, S2Inheritance, S2Length, S2Number } from '../s2-types';

export class S2LayerData {
    public readonly layer: S2Number;
    public isActive: boolean;

    constructor() {
        this.layer = new S2Number(0);
        this.isActive = true;
    }

    copy(other: S2LayerData): void {
        this.layer.copy(other.layer);
        this.isActive = other.isActive;
    }

    applyToElement(element: SVGElement, scene: S2BaseScene): void {
        void element;
        void scene;
    }
}

export class S2StrokeData {
    public readonly color: S2Color;
    public readonly width: S2Length;
    public readonly opacity: S2Number;
    public lineCap?: S2LineCap;
    public lineJoin?: S2LineJoin;

    constructor() {
        this.color = new S2Color(0, 0, 0, S2Inheritance.Inherited);
        this.width = new S2Length(0, 'view');
        this.opacity = new S2Number(1, S2Inheritance.Inherited);
    }

    copy(other: S2StrokeData): void {
        this.color.copy(other.color);
        this.width.copy(other.width);
        this.opacity.copy(other.opacity);
        this.lineCap = other.lineCap;
        this.lineJoin = other.lineJoin;
    }

    applyToElement(element: SVGElement, scene: S2BaseScene): void {
        if (this.opacity.inheritance === S2Inheritance.Inherited && this.color.inheritance === S2Inheritance.Inherited)
            return;

        if (this.width.inheritance === S2Inheritance.Explicit) {
            const width = this.width.toSpace('view', scene.activeCamera);
            element.setAttribute('stroke-width', width.toString());
        } else {
            element.removeAttribute('stroke-width');
        }

        if (this.color.inheritance === S2Inheritance.Explicit) {
            element.setAttribute('stroke', this.color.toRgb());
            console.log('apply stroke');
        } else {
            element.removeAttribute('stroke');
        }

        if (this.opacity.inheritance === S2Inheritance.Explicit && this.opacity.value <= 1) {
            element.setAttribute('stroke-opacity', this.opacity.toString());
        } else {
            element.removeAttribute('stroke-opacity');
        }

        if (this.lineCap) {
            element.setAttribute('stroke-linecap', this.lineCap);
        } else {
            element.removeAttribute('stroke-linecap');
        }

        if (this.lineJoin) {
            element.setAttribute('stroke-linejoin', this.lineJoin);
        } else {
            element.removeAttribute('stroke-linejoin');
        }
    }
}

export class S2FillData {
    public readonly color: S2Color;
    public readonly opacity: S2Number;

    constructor() {
        this.color = new S2Color(255, 255, 255, S2Inheritance.Inherited);
        this.opacity = new S2Number(1, S2Inheritance.Inherited);
    }

    copy(other: S2FillData): void {
        this.color.copy(other.color);
        this.opacity.copy(other.opacity);
    }

    applyToElement(element: SVGElement, scene: S2BaseScene): void {
        void scene;
        if (this.opacity.inheritance === S2Inheritance.Inherited && this.color.inheritance === S2Inheritance.Inherited)
            return;

        if (this.color.inheritance === S2Inheritance.Explicit) {
            element.setAttribute('fill', this.color.toRgb());
        } else {
            element.removeAttribute('fill');
        }

        if (this.opacity.inheritance === S2Inheritance.Explicit && this.opacity.value <= 1) {
            element.setAttribute('fill-opacity', this.opacity.toString());
        } else {
            element.removeAttribute('fill-opacity');
        }
    }
}

export class S2TransformData {
    public readonly matrix: S2Mat2x3;

    constructor() {
        this.matrix = S2Mat2x3.createIdentity();
    }

    copy(other: S2TransformData): void {
        this.matrix.copy(other.matrix);
    }

    applyToElement(element: SVGElement, scene: S2BaseScene): void {
        void scene;
        if (this.matrix.isIdentity()) {
            element.removeAttribute('transform');
            return;
        }
        const m = this.matrix.elements;
        element.setAttribute('transform', `matrix(${m[0]}, ${m[1]}, ${m[2]}, ${m[3]}, ${m[4]}, ${m[5]})`);
    }
}
