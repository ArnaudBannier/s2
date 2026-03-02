import { GraphDijkstraScene } from './graph-dijkstra-scene';
import { GraphDijkstraNavigation } from './graph-dijkstra-navigation';

export class GraphDijkstraFigure {
    protected scene: GraphDijkstraScene;
    protected navigation: GraphDijkstraNavigation;

    constructor(container: HTMLElement) {
        // conteneur figure
        const divFigure = document.createElement('div');
        divFigure.className = 'figure';

        // panneau de navigation
        const divNavigation = document.createElement('div');
        divNavigation.className = 'navigation';

        // création du SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.classList.add('responsive-svg');
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

        divFigure.appendChild(svg);
        container.append(divFigure, divNavigation);

        // création de la scène et de l'interface
        this.scene = new GraphDijkstraScene(svg);

        this.navigation = new GraphDijkstraNavigation(divNavigation, this.scene);
        this.navigation.init();
    }
}
