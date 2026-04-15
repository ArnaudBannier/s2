import { GraphDsaturFigure } from './graph-dsatur-figure';

const containerA = document.getElementById('graph-dsatur-figure-a');
if (!containerA) {
    throw new Error('Figure container not found');
}

const containerB = document.getElementById('graph-dsatur-figure-b');
if (!containerB) {
    throw new Error('Figure container not found');
}

new GraphDsaturFigure(containerA, 0);
new GraphDsaturFigure(containerB, 1);
