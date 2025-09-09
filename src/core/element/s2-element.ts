import { type S2BaseScene } from '../s2-interface';
import { S2LayerData } from './s2-base-data';

export type S2BaseElement = S2Element<S2LayerData>;

type S2ElementListener = (source: S2BaseElement, updateId?: number) => void;

export abstract class S2Element<Data extends S2LayerData> {
    public readonly data: Data;
    public readonly id: number;

    protected scene: S2BaseScene;
    protected parent: S2BaseElement | null = null;
    protected prevUpdateId: number = -1;

    private listeners: Set<S2ElementListener> = new Set();
    private dependencies: Set<S2BaseElement> = new Set();

    get layer(): number {
        return this.data.layer.value;
    }

    set layer(layer: number) {
        this.data.layer.value = layer;
    }

    setLayer(layer: number = 0): this {
        this.data.layer.value = layer;
        return this;
    }

    setIsActive(isActive: boolean): this {
        this.data.isActive = isActive;
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
        void updateId;
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

    // TODO : Ajouter un updateID pour ne pas faire plusieurs fois le même update dans une frame
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

    protected static updateSVGChildren(parent: SVGElement, children: S2BaseElement[]): void {
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
        parent.replaceChildren(...elements);
    }

    abstract getSVGElement(): SVGElement;
}
