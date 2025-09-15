import { type S2BaseScene } from '../../s2-base-scene';
import { S2BaseData } from './s2-base-data';

export type S2BaseElement = S2Element<S2BaseData>;

type S2ElementListener = (source: S2BaseElement, updateId?: number) => void;

export abstract class S2Element<Data extends S2BaseData> {
    public readonly data: Data;
    public readonly id: number;

    protected scene: S2BaseScene;
    protected parent: S2BaseElement | null = null;
    protected prevUpdateId: number = -1;

    private listeners: Set<S2ElementListener> = new Set();
    private dependencies: Set<S2BaseElement> = new Set();

    setIsActive(isActive: boolean): this {
        this.data.isActive = isActive;
        if (this.parent) {
            this.parent.updateSVGChildren();
        }
        return this;
    }

    setParent(parent: S2BaseElement | null): this {
        if (this.parent === parent) return this;
        if (this.parent !== null) {
            this.parent.removeDependency(this);
        }
        if (parent !== null) {
            this.addDependency(parent);
        }
        this.parent = parent;
        return this;
    }

    getParent(): S2BaseElement | null {
        return this.parent;
    }

    addListener(listener: S2ElementListener): void {
        this.listeners.add(listener);
    }

    removeListener(listener: S2ElementListener): void {
        this.listeners.delete(listener);
    }

    addDependency(dep: S2BaseElement): void {
        this.dependencies.add(dep);
        dep.addListener(this.updateFromDependency.bind(this));
    }

    // TODO : Vérifier la fonctionnalité
    removeDependency(dep: S2BaseElement): void {
        if (this.dependencies.delete(dep)) {
            dep.removeListener(this.updateFromDependency.bind(this));
        }
    }

    protected updateFromDependency(dep: S2BaseElement, updateId?: number): void {
        if (this.shouldSkipUpdate(updateId)) return;
        this.updateFromDependencyImpl(dep, updateId);
        this.emitUpdate(updateId);
    }

    protected updateFromDependencyImpl(dep: S2BaseElement, updateId?: number): void {
        void dep;
        this.updateImpl(updateId);
    }

    protected emitUpdate(updateId?: number): void {
        for (const listener of this.listeners) {
            listener(this, updateId);
        }
    }

    update(updateId?: number): this {
        if (this.shouldSkipUpdate(updateId)) return this;
        this.updateImpl(updateId);
        this.emitUpdate(updateId);
        return this;
    }

    protected abstract updateImpl(updateId?: number): void;

    protected shouldSkipUpdate(updateId?: number): boolean {
        if (updateId === undefined) {
            this.prevUpdateId = this.scene.getNextUpdateId();
            return false;
        } else if (this.prevUpdateId !== updateId) {
            this.prevUpdateId = updateId;
            return false;
        }
        return true;
    }

    constructor(scene: S2BaseScene, data: Data) {
        this.data = data;
        this.scene = scene;
        this.id = scene.getNextElementId();
    }

    // TODO : abstrait ?
    // Appel dans setParent et setIsActive et setLayer ?
    updateSVGChildren(): this {
        return this;
    }

    abstract getSVGElement(): SVGElement;
}

export class S2ElementUtils {
    static updateSVGChildren(svgElement: SVGElement, children: S2BaseElement[]): void {
        children.sort((a: S2BaseElement, b: S2BaseElement): number => {
            if (a.data.layer.value !== b.data.layer.value) return a.data.layer.value - b.data.layer.value;
            return a.id - b.id;
        });
        const elements: SVGElement[] = [];
        for (const child of children) {
            if (child.data.isActive) {
                elements.push(child.getSVGElement());
            }
        }
        svgElement.replaceChildren(...elements);
    }

    static appendChild(element: S2BaseElement, children: S2BaseElement[], child: S2BaseElement): void {
        if (children.includes(child)) return;
        children.push(child);
        child.setParent(element);
    }

    static removeChild(children: S2BaseElement[], child: S2BaseElement): void {
        const index = children.indexOf(child);
        if (index !== -1) {
            children.splice(index, 1);
            child.setParent(null);
        }
    }
}
