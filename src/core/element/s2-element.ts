import { S2Camera } from '../math/s2-camera';
import { type S2BaseScene } from '../s2-interface';
import { type S2LineCap, type S2LineJoin, type S2SVGAttributes } from '../s2-globals';
import { S2Animatable, S2Attributes } from '../s2-attributes';
import { S2Length, S2Number } from '../s2-types';
import { S2Mat2x3 } from '../math/s2-mat2x3';
import { S2Color } from '../s2-types';

export type S2BaseElement = NewS2Element<S2LayerData>;

export class S2LayerData {
    public layer: number;
    public isActive: boolean;

    constructor() {
        this.layer = 0;
        this.isActive = true;
    }

    copy(other: S2LayerData) {
        this.layer = other.layer;
        this.isActive = other.isActive;
    }

    applyToElement(element: SVGElement, scene: S2BaseScene): void {
        void element;
        void scene;
    }
}

export class S2StrokeData {
    public color: S2Color;
    public width: S2Length;
    public opacity: S2Number;
    public lineCap?: S2LineCap;
    public lineJoin?: S2LineJoin;

    constructor() {
        this.color = new S2Color();
        this.width = new S2Length(0, 'view');
        this.opacity = new S2Number(2);
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
    public color: S2Color;
    public opacity: S2Number;

    constructor() {
        this.color = new S2Color();
        this.opacity = new S2Number(2);
    }

    copy(other: S2FillData): void {
        this.color.copy(other.color);
        this.opacity.copy(other.opacity);
    }

    applyToElement(element: SVGElement, scene: S2BaseScene): void {
        void scene;
        if (this.opacity.value <= 0) {
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
    public matrix: S2Mat2x3;

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

export abstract class NewS2Element<D extends S2LayerData> {
    protected scene: S2BaseScene;
    protected parent: S2Element | null = null;
    public readonly id: number;
    protected prevUpdateId: number = -1;

    public data: D;

    constructor(scene: S2BaseScene, data: D) {
        this.data = data;
        this.scene = scene;
        this.id = scene.nextId++;
    }

    protected static compareLayers(a: NewS2Element<S2LayerData>, b: NewS2Element<S2LayerData>): number {
        if (a.data.layer !== b.data.layer) return a.data.layer - b.data.layer;
        return a.id - b.id;
    }

    protected static updateSVGChildren(parent: SVGElement, children: NewS2Element<S2LayerData>[]): void {
        children.sort(NewS2Element.compareLayers);
        const elements: SVGElement[] = [];
        for (const child of children) {
            if (child.data.isActive) {
                elements.push(child.getSVGElement());
            }
        }
        parent.replaceChildren(...elements);
    }

    setParent(parent: S2Element | null): this {
        this.parent = parent;
        return this;
    }

    getParent(): S2Element | null {
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

export abstract class S2Element {
    protected scene: S2BaseScene;
    protected parent: S2Element | null = null;
    protected styleDecl: S2SVGAttributes = {};
    protected id: number;
    protected layer: number = 0;
    protected isActive: boolean = true;

    constructor(scene: S2BaseScene) {
        this.scene = scene;
        this.id = scene.nextId++;
    }

    protected static compareLayers(a: S2Element, b: S2Element): number {
        if (a.layer !== b.layer) return a.layer - b.layer;
        return a.id - b.id;
    }

    protected static updateSVGChildren(parent: SVGElement, children: S2Element[]): void {
        children.sort(S2Element.compareLayers);
        const elements: SVGElement[] = [];
        for (const child of children) {
            if (child.getIsActive()) {
                elements.push(child.getSVGElement());
            }
        }
        parent.replaceChildren(...elements);
    }

    setLayer(layer: number = 0): this {
        this.layer = layer;
        return this;
    }

    getLayer(): number {
        return this.layer;
    }

    setIsActive(isActive: boolean = true): this {
        this.isActive = isActive;
        return this;
    }

    getIsActive(): boolean {
        return this.isActive;
    }

    /**
     * Ne modifie pas attributes. Copie profonde des attributs.
     * @param attributes
     * @returns
     */
    setAnimatableAttributes(attributes: S2Animatable): this {
        this.setIsActive(attributes.isActive);
        return this;
    }

    /**
     * Attention, pas de copie profonde.
     * @returns
     */
    getAnimatableAttributes(): S2Animatable {
        const attributes = new S2Animatable();
        attributes.isActive = this.isActive;
        return attributes;
    }

    /**
     * Ne modifie pas attributes. Copie profonde des attributs.
     * @param attributes
     * @returns
     */
    setAttributes(attributes: S2Attributes): this {
        this.setIsActive(attributes.isActive);
        return this;
    }

    /**
     * Attention, pas de copie profonde.
     * @returns
     */
    getAttributes(): S2Attributes {
        const attributes = new S2Attributes();
        attributes.isActive = this.isActive;
        return attributes;
    }

    setId(id: string): this {
        const element = this.getSVGElement();
        element.id = id;
        return this;
    }

    addClass(className: string): this {
        const element = this.getSVGElement();
        element.classList.add(className);
        return this;
    }

    setSVGAttribute(qualifiedName: string, value: string): this {
        const element = this.getSVGElement();
        element.setAttribute(qualifiedName, value);
        return this;
    }

    setSVGAttributes(style: S2SVGAttributes): this {
        this.styleDecl = { ...this.styleDecl, ...style };
        const element = this.getSVGElement();
        for (const [key, value] of Object.entries(style)) {
            element.setAttribute(key, value);
        }
        return this;
    }

    getSVGAttributes(): S2SVGAttributes {
        return { ...this.styleDecl };
    }

    setParent(parent: S2Element | null): this {
        this.parent = parent;
        return this;
    }

    getParent(): S2Element | null {
        return this.parent;
    }

    abstract getSVGElement(): SVGElement;

    getActiveCamera(): S2Camera {
        return this.scene.activeCamera;
    }

    abstract update(): this;
}
