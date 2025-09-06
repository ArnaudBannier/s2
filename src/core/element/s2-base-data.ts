import type { S2Camera } from '../math/s2-camera';
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

    setInherited(): void {
        this.color.setInherited();
        this.width.setInherited();
        this.opacity.setInherited();
        this.lineCap = undefined;
        this.lineJoin = undefined;
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

    setInherited(): void {
        this.color.setInherited();
        this.opacity.setInherited();
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

    setInherited(): void {
        this.matrix.identity();
    }

    copy(other: S2TransformData): void {
        this.matrix.copy(other.matrix);
    }

    applyToElement(element: SVGElement, scene: S2BaseScene): void {
        void scene;
        if (this.matrix.isIdentity()) {
            element.removeAttribute('transform');
        } else {
            const m = this.matrix.elements;
            element.setAttribute('transform', `matrix(${m[0]}, ${m[1]}, ${m[2]}, ${m[3]}, ${m[4]}, ${m[5]})`);
        }
    }
}

export class S2FontData {
    public readonly size: S2Length;
    public readonly weight: S2Number;
    public readonly relativeLineHeight: S2Number;
    public readonly relativeAscenderHeight: S2Number;
    public parent?: S2FontData;

    public family: string;
    public style: 'normal' | 'italic' | 'oblique';

    constructor() {
        this.family = 'system-ui';
        this.size = new S2Length(16, 'view');
        this.weight = new S2Number(400);
        this.style = 'normal';
        this.relativeLineHeight = new S2Number(20 / 16);
        this.relativeAscenderHeight = new S2Number(14 / 16);
    }

    getInheritedSize(camera: S2Camera): number {
        if (this.size.inheritance === S2Inheritance.Explicit) {
            return this.size.toSpace('view', camera);
        }
        return this.parent?.getInheritedSize(camera) ?? this.size.toSpace('view', camera);
    }

    getInheritedLineHeight(camera: S2Camera): number {
        const size = this.getInheritedSize(camera);
        if (this.relativeLineHeight.inheritance === S2Inheritance.Explicit) {
            return this.relativeLineHeight.value * size;
        }
        return this.parent?.getInheritedLineHeight(camera) ?? this.relativeLineHeight.value * size;
    }

    getInheritedAscenderHeight(camera: S2Camera): number {
        const size = this.getInheritedSize(camera);
        if (this.relativeAscenderHeight.inheritance === S2Inheritance.Explicit) {
            return this.relativeAscenderHeight.value * size;
        }
        return this.parent?.getInheritedAscenderHeight(camera) ?? this.relativeAscenderHeight.value * size;
    }

    setInherited(): void {
        this.size.setInherited();
        this.weight.setInherited();
        this.relativeLineHeight.setInherited();
        this.relativeAscenderHeight.setInherited();
        this.family = '';
        this.style = 'normal';
    }

    copy(other: S2FontData): void {
        this.size.copy(other.size);
        this.weight.copy(other.weight);
        this.relativeLineHeight.copy(other.relativeLineHeight);
        this.relativeAscenderHeight.copy(other.relativeAscenderHeight);
        this.family = other.family;
        this.style = other.style;
    }

    applyToElement(element: SVGElement, scene: S2BaseScene): void {
        if (this.size.inheritance === S2Inheritance.Explicit) {
            const size = this.size.toSpace('view', scene.activeCamera);
            element.setAttribute('font-size', size.toString());
        } else {
            element.removeAttribute('font-size');
        }

        if (this.weight.inheritance === S2Inheritance.Explicit) {
            element.setAttribute('font-weight', this.weight.toString(0));
        } else {
            element.removeAttribute('font-weight');
        }

        if (this.family !== '') {
            element.setAttribute('font-family', this.family);
        } else {
            element.removeAttribute('font-family');
        }

        if (this.style !== 'normal') {
            element.setAttribute('font-style', this.style);
        } else {
            element.removeAttribute('font-style');
        }
    }
}
