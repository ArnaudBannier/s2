import { GraphDsaturFigure } from './graph-dsatur-figure';

const container = document.getElementById('graph-dsatur-figure');
if (!container) {
    throw new Error('Figure container not found');
}

new GraphDsaturFigure(container);
