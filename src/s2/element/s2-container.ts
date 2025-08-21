import { type S2SceneInterface } from '../s2-scene-interface';
import { type S2BaseElement } from './s2-element';
import { S2Graphics } from './s2-graphics';

export type S2BaseContainer = S2Container<SVGGraphicsElement, S2BaseElement>;

export abstract class S2Container<T extends SVGGraphicsElement, U extends S2BaseElement> extends S2Graphics<T> {
    protected children: Array<U>;

    constructor(element: T, scene: S2SceneInterface) {
        super(element, scene);
        this.children = [];
    }

    appendChild(child: U): this {
        const prevParent = child.getParent();
        if (prevParent === this) return this;
        if (prevParent && prevParent instanceof S2Container) {
            prevParent.removeChild(child);
        }
        this.children.push(child);
        this.element.appendChild(child.getElement());
        child.setParent(this);
        return this;
    }

    removeChildren(): this {
        this.children.length = 0;
        this.element.replaceChildren();
        return this;
    }

    removeChild(child: U): this {
        const index = this.children.indexOf(child);
        if (index !== -1) {
            this.children.splice(index, 1);
            this.element.removeChild(child.getElement());
            child.setParent(null);
        }
        return this;
    }

    removeLastChild(): this {
        const last = this.children.pop();
        if (last) {
            this.element.removeChild(last.getElement());
            last.setParent(null);
        }
        return this;
    }

    getChildCount(): number {
        return this.children.length;
    }

    getChild(index: number): U {
        return this.children[index];
    }

    update(): this {
        for (const child of this.children) {
            child.update();
        }
        return this;
    }
}
