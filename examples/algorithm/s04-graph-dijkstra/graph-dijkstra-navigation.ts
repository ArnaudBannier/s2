import type { GraphDijkstraScene } from './graph-dijkstra-scene';

export class GraphDijkstraNavigation {
    protected container: HTMLElement;
    protected scene: GraphDijkstraScene;
    protected index: number = -1;

    constructor(container: HTMLElement, scene: GraphDijkstraScene) {
        this.container = container;
        this.scene = scene;
    }

    init(): void {
        this.container.classList.add('graph-dijkstra-navigation');

        this.container.append(this.createSlider());
    }

    private createSlider(): HTMLElement {
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.style.width = '50%';

        slider.addEventListener('input', () => {
            const ratio = slider.valueAsNumber / 100;
            const elapsed = ratio * this.scene.animator.getMasterDuration();
            this.scene.animator.stop();
            this.scene.animator.setMasterElapsed(elapsed);
            this.index = this.scene.animator.getStepIndexFromElapsed(elapsed);
            this.scene.getSVG().update();
        });

        return slider;
    }
}
