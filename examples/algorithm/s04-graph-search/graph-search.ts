import { GraphSearchFigure } from './graph-search-figure';

// Todo :
// - Ajouter les numéros

const container = document.getElementById('graph-search-figure');
if (!container) {
    throw new Error('Figure container not found');
}

new GraphSearchFigure(container);
