import { type S2BaseScene } from '../s2-interface';
import { NewS2Element, S2Element, type S2BaseElement } from './s2-element';
import { S2Graphics } from './s2-graphics';
import { NewS2SimpleShape, type S2SMonoGraphicData } from './s2-shape';

export type S2BaseContainer = S2Container<SVGElement, S2Element>;
export type NewS2BaseContainer = NewS2Container<SVGElement, S2BaseElement, S2SMonoGraphicData>;

export class NewS2Container<
    SVGType extends SVGElement,
    ChildType extends S2BaseElement,
    Data extends S2SMonoGraphicData,
> extends NewS2SimpleShape<Data> {
    protected element: SVGType;
    protected children: Array<ChildType>;

    constructor(scene: S2BaseScene, data: Data, element: SVGType) {
        super(scene, data);
        this.element = element;
        this.children = [];
    }

    appendChild(child: ChildType): this {
        const prevParent = child.getParent();
        if (prevParent === this) return this;
        if (prevParent && prevParent instanceof NewS2Container) {
            prevParent.removeChild(child);
        }
        this.children.push(child);
        child.setParent(this);
        NewS2Element.updateSVGChildren(this.element, this.children);
        return this;
    }

    removeChildren(): this {
        for (const child of this.children) {
            child.setParent(null);
        }
        this.children.length = 0;
        NewS2Element.updateSVGChildren(this.element, this.children);
        return this;
    }

    removeChild(child: ChildType): this {
        const index = this.children.indexOf(child);
        if (index !== -1) {
            this.children.splice(index, 1);
            child.setParent(null);
        }
        NewS2Element.updateSVGChildren(this.element, this.children);
        return this;
    }

    removeLastChild(): this {
        const last = this.children.pop();
        if (last) last.setParent(null);
        NewS2Element.updateSVGChildren(this.element, this.children);
        return this;
    }

    getChildCount(): number {
        return this.children.length;
    }

    getChild(index: number): ChildType {
        return this.children[index];
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    update(updateId?: number): this {
        if (this.shouldSkipUpdate(updateId)) return this;
        this.data.applyToElement(this.element, this.scene);
        for (const child of this.children) {
            child.update(updateId);
        }
        return this;
    }
}

export abstract class S2Container<T extends SVGElement, U extends S2Element> extends S2Graphics {
    protected element: T;
    protected children: Array<U>;

    constructor(scene: S2BaseScene, element: T) {
        super(scene);
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
