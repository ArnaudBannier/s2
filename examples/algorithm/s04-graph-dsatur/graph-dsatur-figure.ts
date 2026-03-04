import { GraphDsaturScene } from './graph-dsatur-scene';
import { GraphDsaturNavigation } from './graph-dsatur-navigation';

export class GraphDsaturFigure {
    protected scene: GraphDsaturScene;
    protected navigation: GraphDsaturNavigation;

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
        this.scene = new GraphDsaturScene(svg);

        this.navigation = new GraphDsaturNavigation(divNavigation, this.scene, this.scene.animator);
        this.navigation.init();
    }
}
