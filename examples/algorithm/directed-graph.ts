// export interface VertexData {
//     label?: string;
//     // libre : position, couleur, etc.
// }
// export interface EdgeData {
//     weight?: number;
//     capacity?: number;
// }

export type VertexId = string;
export interface Edge<EdgeData = {}> {
    to: VertexId;
    data: EdgeData;
}

// This graph does not support multiple edges between the same vertices.
// If multiple relationships are needed, they should be encoded in the edge data.

export class DirectedGraph<VertexData = {}, EdgeData = {}> {
    protected vertices = new Map<VertexId, VertexData>();
    protected adjacency = new Map<VertexId, Edge<EdgeData>[]>();

    addVertex(id: VertexId, data: VertexData) {
        if (this.vertices.has(id)) {
            throw new Error(`Vertex ${id} already exists`);
        }
        this.vertices.set(id, data);
        this.adjacency.set(id, []);
    }

    setEdge(from: VertexId, to: VertexId, data: EdgeData) {
        if (!this.vertices.has(from) || !this.vertices.has(to)) {
            throw new Error('Vertex does not exist');
        }
        const edges = this.adjacency.get(from)!;
        const edge = edges.find((e) => e.to === to);
        if (edge) {
            edge.data = data;
        } else {
            edges.push({ to, data });
        }
    }

    removeEdge(from: VertexId, to: VertexId) {
        const edges = this.adjacency.get(from);
        if (edges) {
            const index = edges.findIndex((e) => e.to === to);
            if (index !== -1) {
                edges.splice(index, 1);
            }
        }
    }

    removeEdgesFrom(vertex: VertexId) {
        const edges = this.adjacency.get(vertex);
        if (edges) {
            edges.length = 0;
        }
    }

    clearEdges() {
        for (const edges of this.adjacency.values()) {
            edges.length = 0;
        }
    }

    hasEdge(from: VertexId, to: VertexId): boolean {
        return this.adjacency.get(from)?.some((e) => e.to === to) ?? false;
    }

    edgesOf(id: VertexId): readonly Edge<EdgeData>[] {
        return this.adjacency.get(id) ?? [];
    }

    getVertices(): VertexId[] {
        return [...this.vertices.keys()];
    }

    getVertex(id: VertexId): VertexData {
        const data = this.vertices.get(id);
        if (!data) {
            throw new Error(`Vertex ${id} does not exist`);
        }
        return data;
    }
}
