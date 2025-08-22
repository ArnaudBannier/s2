import { S2Camera } from '../math/s2-camera';
import { type S2BaseScene } from '../s2-interface';
import { type S2StyleDecl } from '../s2-globals';
import { type S2Parameters } from '../s2-interface';
export type S2BaseElement = S2Element<SVGElement>;

export abstract class S2Element<T extends SVGElement> {
    protected element: T;
    protected scene: S2BaseScene;
    protected parent: S2Element<SVGElement> | null = null;
    protected styleDecl: S2StyleDecl = {};

    constructor(element: T, scene: S2BaseScene) {
        this.element = element;
        this.scene = scene;
    }

    setParameters(params: S2Parameters): this {
        void params;
        return this;
    }

    getAnimationState(): S2Parameters {
        return { style: this.getStyle() };
    }

    setAttribute(qualifiedName: string, value: string): this {
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

    setStyleDecl(style: S2StyleDecl): this {
        this.styleDecl = { ...this.styleDecl, ...style };
        for (const [key, value] of Object.entries(style)) {
            this.element.setAttribute(key, value);
        }
        return this;
    }

    getStyle(): S2StyleDecl {
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
