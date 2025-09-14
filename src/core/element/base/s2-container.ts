import { type S2BaseScene } from '../../s2-base-scene';
import type { S2LayerData } from './s2-base-data';
import { S2Element, S2ElementUtils } from './s2-element';

export type S2BaseContainer = S2Container<SVGElement, S2LayerData, S2Element<S2LayerData>>;

export class S2Container<
    SVGType extends SVGElement,
    Data extends S2LayerData,
    ChildType extends S2Element<Data>,
> extends S2Element<Data> {
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
        if (prevParent && prevParent instanceof S2Container) {
            prevParent.removeChild(child);
        }
        this.children.push(child);
        child.setParent(this);
        child.data.setParent(this.data);
        S2ElementUtils.updateSVGChildren(this.element, this.children);
        return this;
    }

    removeChildren(): this {
        for (const child of this.children) {
            child.setParent(null);
            child.data.setParent(null);
        }
        this.children.length = 0;
        S2ElementUtils.updateSVGChildren(this.element, this.children);
        return this;
    }

    removeChild(child: ChildType): this {
        const index = this.children.indexOf(child);
        if (index !== -1) {
            this.children.splice(index, 1);
            child.setParent(null);
            child.data.setParent(null);
        }
        S2ElementUtils.updateSVGChildren(this.element, this.children);
        return this;
    }

    removeLastChild(): this {
        const last = this.children.pop();
        if (last) {
            last.setParent(null);
            last.data.setParent(null);
        }
        S2ElementUtils.updateSVGChildren(this.element, this.children);
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

    updateSVGChildren(): this {
        S2ElementUtils.updateSVGChildren(this.element, this.children);
        return this;
    }

    protected updateImpl(updateId?: number): void {
        void updateId;
        S2ElementUtils.updateSVGChildren(this.element, this.children);
        //this.data.applyToElement(this.element, this.scene);
    }
}
