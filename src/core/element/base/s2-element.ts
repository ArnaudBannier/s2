import { type S2BaseScene } from '../../scene/s2-base-scene';
import { type S2Dirtyable, type S2Tipable } from '../../shared/s2-globals';
import { S2ElementData } from './s2-base-data';

export type S2BaseElement = S2Element<S2ElementData>;
export type S2BaseTipable = S2Element<S2ElementData> & S2Tipable;

export abstract class S2Element<Data extends S2ElementData> implements S2Dirtyable {
    public readonly data: Data;
    public readonly id: number;

    protected dirty: boolean;
    protected scene: S2BaseScene;
    protected parent: S2BaseElement | null;
    protected children: S2BaseElement[];
    protected childrenChanged: boolean;

    constructor(scene: S2BaseScene, data: Data) {
        this.data = data;
        this.scene = scene;
        this.id = scene.getNextElementId();
        this.parent = null;
        this.children = [];
        this.childrenChanged = false;
        this.dirty = true;
        this.data.setOwner(this);
    }

    protected skipUpdate(): boolean {
        if (!this.getSVGElement().isConnected) {
            console.warn('Updating element not connected to DOM', this);
        }
        if (!this.isDirty()) return true;
        return false;
    }

    isDirty(): boolean {
        return this.dirty;
    }

    markDirty(): void {
        if (this.isDirty()) return;
        this.dirty = true;
        if (this.parent) {
            this.parent.markDirty();
        }
    }

    clearDirty(): void {
        this.dirty = false;
        this.data.clearDirty();
    }

    setActive(isActive: boolean): this {
        this.data.isActive.set(isActive);
        if (this.parent) {
            this.parent.updateSVGChildren();
        }
        return this;
    }

    setParent(parent: S2BaseElement | null): this {
        if (this.parent === parent) return this;
        if (this.parent !== null) {
            const index = this.parent.children.indexOf(this);
            if (index !== -1) {
                this.parent.children.splice(index, 1);
                this.parent.childrenChanged = true;
            }
            this.parent.markDirty();
        }
        if (parent !== null) {
            parent.children.push(this);
            parent.childrenChanged = true;
            parent.markDirty();
        }
        this.parent = parent;
        return this;
    }

    getParent(): S2BaseElement | null {
        return this.parent;
    }

    getChildCount(): number {
        return this.children.length;
    }

    getChild(index: number): S2BaseElement {
        return this.children[index];
    }

    getScene(): S2BaseScene {
        return this.scene;
    }

    updateSVGChildren(): this {
        if (this.childrenChanged === false) return this;

        // Sort by layer, then by id to ensure stable order
        this.children.sort((a: S2BaseElement, b: S2BaseElement): number => {
            if (a.data.layer.value !== b.data.layer.value) return a.data.layer.value - b.data.layer.value;
            return a.id - b.id;
        });
        const elements: SVGElement[] = [];
        for (const child of this.children) {
            if (child.data.isActive.get()) {
                elements.push(child.getSVGElement());
            }
        }
        const svgElement = this.getSVGElement();
        const childrenChanged =
            svgElement.children.length !== elements.length || elements.some((el, i) => el !== svgElement.children[i]);
        if (childrenChanged) {
            svgElement.replaceChildren(...elements);
        }
        this.childrenChanged = false;
        return this;
    }

    abstract update(): void;
    abstract getSVGElement(): SVGElement;
}
