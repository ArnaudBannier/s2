import { S2Camera } from '../math/s2-camera';
import { type S2BaseScene } from '../s2-interface';
import { type S2SVGAttributes } from '../s2-globals';
import { S2OldAttributes } from '../s2-interface';
import { S2Attributes } from '../s2-attributes';
export type S2BaseElement = S2Element<SVGElement>;

export abstract class S2Element<T extends SVGElement> {
    protected element: T;
    protected scene: S2BaseScene;
    protected parent: S2Element<SVGElement> | null = null;
    protected styleDecl: S2SVGAttributes = {};
    protected id: number;
    protected layer: number = 0;
    protected isVisible: boolean = true;

    constructor(element: T, scene: S2BaseScene) {
        this.element = element;
        this.scene = scene;
        this.id = scene.nextId++;
    }

    setAttributes(attributes: S2Attributes): this {
        void attributes;
        return this;
    }

    getAttributes(): S2Attributes {
        return new S2Attributes();
    }

    setParameters(params: S2OldAttributes): this {
        void params;
        return this;
    }

    getParameters(): S2OldAttributes {
        return new S2OldAttributes();
    }

    setSVGAttribute(qualifiedName: string, value: string): this {
        this.element.setAttribute(qualifiedName, value);
        return this;
    }

    setId(id: string): this {
        this.element.id = id;
        return this;
    }

    addClass(className: string): this {
        this.element.classList.add(className);
        return this;
    }

    setSVGAttributes(style: S2SVGAttributes): this {
        this.styleDecl = { ...this.styleDecl, ...style };
        for (const [key, value] of Object.entries(style)) {
            this.element.setAttribute(key, value);
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

    getElement(): T {
        return this.element;
    }

    getActiveCamera(): S2Camera {
        return this.scene.activeCamera;
    }

    update(): this {
        return this;
    }
}
