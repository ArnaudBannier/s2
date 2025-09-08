import { type S2BaseScene } from '../s2-interface';
import { S2Element, type S2BaseElement } from './s2-element';
import { S2TransformGraphic, type S2TransformGraphicData } from './s2-transform-graphic';

export type S2BaseContainer = S2Container<SVGElement, S2BaseElement, S2TransformGraphicData>;

export class S2Container<
    SVGType extends SVGElement,
    ChildType extends S2BaseElement,
    Data extends S2TransformGraphicData,
> extends S2TransformGraphic<Data> {
    protected element: SVGType;
    protected children: Array<ChildType>;

    constructor(scene: S2BaseScene, data: Data, element: SVGType) {
        super(scene, data);
        this.data.fill.opacity.setParent();
        this.data.stroke.opacity.setParent();
        this.data.opacity.setParent();
        this.element = element;
        this.children = [];
    }

    appendChild(child: ChildType): this {
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

    removeChild(child: ChildType): this {
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

    getChild(index: number): ChildType {
        return this.children[index];
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    protected updateImpl(updateId?: number): void {
        void updateId;
        this.data.applyToElement(this.element, this.scene);
    }
}
