import { S2Camera } from '../math/s2-camera';
import { type S2SceneInterface } from '../s2-scene-interface';
import { type S2StyleDecl } from '../s2-globals';
export type S2BaseElement = S2Element<SVGElement>;

export abstract class S2Element<T extends SVGElement> {
    protected element: T;
    protected scene: S2SceneInterface;
    protected parent: S2Element<SVGElement> | null = null;

    constructor(element: T, scene: S2SceneInterface) {
        this.element = element;
        this.scene = scene;
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

    setStyle(style: S2StyleDecl): this {
        for (const [key, value] of Object.entries(style)) {
            this.element.setAttribute(key, value);
        }
        return this;
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
