export interface S2DependencyDirtyable {
    isDirty(): boolean;
    markDirty(): void;
    clearDirty(): void;
}

export interface S2DependencyAware {
    getDependencyGraph(): S2DependencyGraph | null;
}

/**
 * Centralized dependency graph used for dirty propagation.
 *
 * Edges are directed: source -> dependent.
 * When source is invalidated, dirty state propagates to all reachable dependents.
 */
export class S2DependencyGraph {
    private readonly adjacency: Map<S2DependencyDirtyable, Set<S2DependencyDirtyable>> = new Map();
    private readonly reverseAdjacency: Map<S2DependencyDirtyable, Set<S2DependencyDirtyable>> = new Map();
    private readonly queue: S2DependencyDirtyable[] = [];
    private propagationDepth: number = 0;

    static tryResolve(value: unknown): S2DependencyGraph | null {
        if (!value || typeof value !== 'object') return null;
        const candidate = value as Partial<S2DependencyAware>;
        if (typeof candidate.getDependencyGraph !== 'function') return null;
        return candidate.getDependencyGraph() ?? null;
    }

    isPropagating(): boolean {
        return this.propagationDepth > 0;
    }

    link(source: S2DependencyDirtyable, dependent: S2DependencyDirtyable): void {
        if (source === dependent) return;

        let dependents = this.adjacency.get(source);
        if (!dependents) {
            dependents = new Set<S2DependencyDirtyable>();
            this.adjacency.set(source, dependents);
        }
        dependents.add(dependent);

        let sources = this.reverseAdjacency.get(dependent);
        if (!sources) {
            sources = new Set<S2DependencyDirtyable>();
            this.reverseAdjacency.set(dependent, sources);
        }
        sources.add(source);
    }

    unlink(source: S2DependencyDirtyable, dependent: S2DependencyDirtyable): void {
        const dependents = this.adjacency.get(source);
        if (dependents) {
            dependents.delete(dependent);
            if (dependents.size === 0) {
                this.adjacency.delete(source);
            }
        }

        const sources = this.reverseAdjacency.get(dependent);
        if (sources) {
            sources.delete(source);
            if (sources.size === 0) {
                this.reverseAdjacency.delete(dependent);
            }
        }
    }

    replaceDependency(
        source: S2DependencyDirtyable,
        prevDependent: S2DependencyDirtyable | null,
        nextDependent: S2DependencyDirtyable | null,
    ): void {
        if (prevDependent) {
            this.unlink(source, prevDependent);
        }
        if (nextDependent) {
            this.link(source, nextDependent);
        }
    }

    unlinkAllFrom(source: S2DependencyDirtyable): void {
        const dependents = this.adjacency.get(source);
        if (!dependents) return;

        for (const dependent of dependents) {
            const sources = this.reverseAdjacency.get(dependent);
            if (!sources) continue;
            sources.delete(source);
            if (sources.size === 0) {
                this.reverseAdjacency.delete(dependent);
            }
        }
        this.adjacency.delete(source);
    }

    unlinkAllTo(dependent: S2DependencyDirtyable): void {
        const sources = this.reverseAdjacency.get(dependent);
        if (!sources) return;

        for (const source of sources) {
            const dependents = this.adjacency.get(source);
            if (!dependents) continue;
            dependents.delete(dependent);
            if (dependents.size === 0) {
                this.adjacency.delete(source);
            }
        }
        this.reverseAdjacency.delete(dependent);
    }

    invalidate(source: S2DependencyDirtyable): void {
        this.queue.push(source);
        if (this.isPropagating()) return;
        this.flush();
    }

    flush(): void {
        if (this.isPropagating()) return;

        this.propagationDepth++;
        try {
            const visited: Set<S2DependencyDirtyable> = new Set();
            while (this.queue.length > 0) {
                const current = this.queue.pop();
                if (!current || visited.has(current)) continue;
                visited.add(current);

                const dependents = this.adjacency.get(current);
                if (!dependents) continue;

                for (const dependent of dependents) {
                    if (!dependent.isDirty()) {
                        dependent.markDirty();
                    }
                    this.queue.push(dependent);
                }
            }
        } finally {
            this.propagationDepth--;
            if (!this.isPropagating()) {
                this.queue.length = 0;
            }
        }
    }

    clear(): void {
        this.adjacency.clear();
        this.reverseAdjacency.clear();
        this.queue.length = 0;
        this.propagationDepth = 0;
    }
}
