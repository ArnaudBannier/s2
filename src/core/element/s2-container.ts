import { type S2BaseScene } from '../s2-interface';
import { NewS2Element, type S2BaseElement } from './s2-element';
import { NewS2SimpleShape, type S2SMonoGraphicData } from './s2-shape';

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
        this.data.fill.opacity.set(-1);
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
