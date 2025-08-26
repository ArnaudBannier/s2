import { S2Camera } from '../math/s2-camera';
import { type S2BaseScene } from '../s2-interface';
import { type S2SVGAttributes } from '../s2-globals';
import { S2Animatable, S2Attributes } from '../s2-attributes';

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

    setIsActive(isVisible: boolean): this {
        this.isActive = isVisible;
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
        void attributes;
        return this;
    }

    /**
     * Attention, pas de copie profonde.
     * @returns
     */
    getAnimatableAttributes(): S2Animatable {
        return new S2Animatable();
    }

    /**
     * Ne modifie pas attributes. Copie profonde des attributs.
     * @param attributes
     * @returns
     */
    setAttributes(attributes: S2Attributes): this {
        void attributes;
        return this;
    }

    /**
     * Attention, pas de copie profonde.
     * @returns
     */
    getAttributes(): S2Attributes {
        return new S2Attributes();
    }

    setSVGAttribute(qualifiedName: string, value: string): this {
        const element = this.getSVGElement();
        element.setAttribute(qualifiedName, value);
        return this;
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
