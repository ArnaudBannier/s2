import { GraphSearchScene } from './graph-search-scene';
import { GraphSearchControls } from './graph-search-controls';
import { GraphSearchNavigation } from './graph-search-navigation';

export class GraphSearchFigure {
    protected scene: GraphSearchScene;
    protected controls: GraphSearchControls;
    protected navigation: GraphSearchNavigation;

    constructor(container: HTMLElement) {
        // panneau de contrôle
        const divControls = document.createElement('div');
        divControls.className = 'controls';

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
        container.append(divControls, divFigure, divNavigation);

        // création de la scène et de l'interface
        this.scene = new GraphSearchScene(svg);
        this.controls = new GraphSearchControls(divControls, this.scene);
        this.controls.init();

        this.navigation = new GraphSearchNavigation(divNavigation, this.scene);
        this.navigation.init();
    }
}
