import { type S2BaseScene } from '../s2-interface';
import { S2Element, type S2BaseElement } from './s2-element';
import { S2Graphics } from './s2-graphics';

export type S2BaseContainer = S2Container<SVGGraphicsElement, S2BaseElement>;

export abstract class S2Container<T extends SVGGraphicsElement, U extends S2BaseElement> extends S2Graphics<T> {
    protected element: T;
    protected children: Array<U>;

    constructor(scene: S2BaseScene, element: T) {
        super(scene, element);
        this.element = element;
        this.children = [];
    }

    appendChild(child: U): this {
        const prevParent = child.getParent();
        if (prevParent === this) return this;
        if (prevParent && prevParent instanceof S2Container) {
            prevParent.removeChild(child);
        }
        this.children.push(child);
        child.setParent(this);
        S2Element.updateSVGChildren(this.element, this.children);
        return this;
    }

    removeChildren(): this {
        for (const child of this.children) {
            child.setParent(null);
        }
        this.children.length = 0;
        S2Element.updateSVGChildren(this.element, this.children);
        return this;
    }

    removeChild(child: U): this {
        const index = this.children.indexOf(child);
        if (index !== -1) {
            this.children.splice(index, 1);
            child.setParent(null);
        }
        S2Element.updateSVGChildren(this.element, this.children);
        return this;
    }

    removeLastChild(): this {
        const last = this.children.pop();
        if (last) last.setParent(null);
        S2Element.updateSVGChildren(this.element, this.children);
        return this;
    }

    getChildCount(): number {
        return this.children.length;
    }

    getChild(index: number): U {
        return this.children[index];
    }

    getSVGElements(): SVGElement[] {
        return [this.element];
    }

    update(): this {
        this.updateSVGTransform(this.element);
        this.updateSVGStyle(this.element);
        S2Element.updateSVGChildren(this.element, this.children);
        for (const child of this.children) {
            child.update();
        }
        return this;
    }
}
