import { S2Camera } from '../math/s2-camera';
import { type S2BaseScene } from '../s2-interface';
import { type S2LineCap, type S2LineJoin } from '../s2-globals';
import { S2Inheritance, S2Length, S2Number } from '../s2-types';
import { S2Mat2x3 } from '../math/s2-mat2x3';
import { S2Color } from '../s2-types';

export type S2BaseElement = S2Element<S2LayerData>;

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
    }

    applyToElement(element: SVGElement, scene: S2BaseScene): void {
        if (this.opacity.value <= 0 || this.width.value <= 0) return;
        const width = this.width.toSpace('view', scene.activeCamera);
        element.setAttribute('stroke', this.color.toRgb());
        element.setAttribute('stroke-width', width.toString());
        if (this.lineCap !== undefined) element.setAttribute('stroke-linecap', this.lineCap);
        else element.removeAttribute('stroke-linecap');
        if (this.lineJoin !== undefined) element.setAttribute('stroke-linejoin', this.lineJoin);
        else element.removeAttribute('stroke-linejoin');
        if (this.opacity.value <= 1) element.setAttribute('stroke-opacity', this.opacity.toString());
        else element.removeAttribute('stroke-opacity');
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
        if (this.opacity.value === 0) {
            element.removeAttribute('fill');
            element.setAttribute('fill-opacity', this.opacity.toString());
            return;
        } else if (this.opacity.value < 0) {
            element.removeAttribute('fill');
            element.removeAttribute('fill-opacity');
            return;
        }
        element.setAttribute('fill', this.color.toRgb());
        if (this.opacity.value <= 1) element.setAttribute('fill-opacity', this.opacity.toString());
        else element.removeAttribute('fill-opacity');
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

type S2ElementListener = (source: S2BaseElement, updateId?: number) => void;

export abstract class S2Element<Data extends S2LayerData> {
    public data: Data;
    public readonly id: number;

    protected scene: S2BaseScene;
    protected parent: S2BaseElement | null = null;
    protected prevUpdateId: number = -1;

    private listeners: Set<S2ElementListener> = new Set();
    private dependencies: Set<S2BaseElement> = new Set();

    get layer(): number {
        return this.data.layer.value;
    }

    set layer(layer: number) {
        this.data.layer.value = layer;
    }

    setLayer(layer: number = 0): this {
        this.data.layer.value = layer;
        return this;
    }

    addListener(listener: S2ElementListener): void {
        this.listeners.add(listener);
    }

    removeListener(listener: S2ElementListener): void {
        this.listeners.delete(listener);
    }

    addDependency(dep: S2BaseElement): void {
        this.dependencies.add(dep);
        dep.addListener(this.onDependencyUpdate.bind(this));
    }

    protected onDependencyUpdate(dep: S2BaseElement, updateId?: number): void {
        if (this.shouldSkipUpdate(updateId)) return;
        this.updateFromDependency(dep, updateId);
        this.emitUpdate(updateId);
    }

    protected updateFromDependency(dep: S2BaseElement, updateId?: number): void {
        void dep;
        void updateId;
    }

    protected emitUpdate(updateId?: number): void {
        for (const listener of this.listeners) {
            listener(this, updateId);
        }
    }

    constructor(scene: S2BaseScene, data: Data) {
        this.data = data;
        this.scene = scene;
        this.id = scene.nextId++;
    }

    protected static updateSVGChildren(parent: SVGElement, children: S2BaseElement[]): void {
        children.sort((a: S2BaseElement, b: S2BaseElement): number => {
            if (a.data.layer.value !== b.data.layer.value) return a.data.layer.value - b.data.layer.value;
            return a.id - b.id;
        });
        const elements: SVGElement[] = [];
        for (const child of children) {
            if (child.data.isActive) {
                elements.push(child.getSVGElement());
            }
        }
        parent.replaceChildren(...elements);
    }

    setParent(parent: S2BaseElement | null): this {
        this.parent = parent;
        return this;
    }

    getParent(): S2BaseElement | null {
        return this.parent;
    }

    abstract getSVGElement(): SVGElement;

    getActiveCamera(): S2Camera {
        return this.scene.activeCamera;
    }

    // TODO : Ajouter un updateID pour ne pas faire plusieurs fois le même update dans une frame
    abstract update(updateId?: number): this;

    protected shouldSkipUpdate(updateId?: number): boolean {
        if (updateId === undefined) {
            this.prevUpdateId = this.scene.getNextUpdateId();
            return false;
        } else if (this.prevUpdateId !== updateId) {
            this.prevUpdateId = updateId;
            return false;
        }
        return true;
    }
}
