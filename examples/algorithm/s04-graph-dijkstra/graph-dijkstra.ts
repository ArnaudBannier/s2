import { GraphDijkstraFigure } from './graph-dijkstra-figure';

const container = document.getElementById('graph-dijkstra-figure');
if (!container) {
    throw new Error('Figure container not found');
}

new GraphDijkstraFigure(container);
