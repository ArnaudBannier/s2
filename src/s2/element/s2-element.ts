import { S2Camera } from '../math/s2-camera';
import { type S2BaseScene } from '../s2-interface';
import { type S2SVGAttributes } from '../s2-globals';
import { S2Animatable, S2Attributes } from '../s2-attributes';
export type S2BaseElement = S2Element<SVGElement>;

export abstract class S2Element<T extends SVGElement> {
    protected oldElement?: T;
    protected scene: S2BaseScene;
    protected parent: S2Element<SVGElement> | null = null;
    protected styleDecl: S2SVGAttributes = {};
    protected id: number;
    protected layer: number = 0;
    protected isVisible: boolean = true;

    constructor(scene: S2BaseScene, element?: T) {
        this.oldElement = element;
        this.scene = scene;
        this.id = scene.nextId++;
    }

    protected static compareLayers(a: S2BaseElement, b: S2BaseElement): number {
        if (a.layer !== b.layer) return a.layer - b.layer;
        return a.id - b.id;
    }

    protected static updateSVGChildren(parent: SVGElement, children: S2BaseElement[]): void {
        children.sort(S2Element.compareLayers);
        const elements: SVGElement[] = [];
        for (const child of children) {
            if (child.getIsVisible()) {
                elements.push(...child.getSVGElements());
            }
        }
        parent.replaceChildren(...elements);
    }

    getSVGElements(): SVGElement[] {
        return [];
    }

    setLayer(layer: number = 0): this {
        this.layer = layer;
        return this;
    }

    getLayer(): number {
        return this.layer;
    }

    setIsVisible(isVisible: boolean): this {
        this.isVisible = isVisible;
        return this;
    }

    getIsVisible(): boolean {
        return this.isVisible;
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
        this.oldElement?.setAttribute(qualifiedName, value);
        return this;
    }

    setId(id: string): this {
        if (this.oldElement) this.oldElement.id = id;
        return this;
    }

    addClass(className: string): this {
        this.oldElement?.classList.add(className);
        return this;
    }

    setSVGAttributes(style: S2SVGAttributes): this {
        this.styleDecl = { ...this.styleDecl, ...style };
        for (const [key, value] of Object.entries(style)) {
            this.oldElement?.setAttribute(key, value);
        }
        return this;
    }

    getSVGAttributes(): S2SVGAttributes {
        return { ...this.styleDecl };
    }

    setParent(parent: S2Element<SVGElement> | null): this {
        this.parent = parent;
        return this;
    }

    getParent(): S2Element<SVGElement> | null {
        return this.parent;
    }

    getElement(): T | undefined {
        return this.oldElement;
    }

    getActiveCamera(): S2Camera {
        return this.scene.activeCamera;
    }

    abstract update(): this;
}
