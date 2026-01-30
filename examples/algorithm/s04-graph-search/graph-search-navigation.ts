import type { S2Scene } from '../../../src/core/scene/s2-scene';

export class GraphSearchNavigation {
    protected container: HTMLElement;
    protected scene: S2Scene;

    constructor(container: HTMLElement, scene: S2Scene) {
        this.container = container;
        this.scene = scene;
    }

    init(): void {
        this.container.classList.add('graph-search-navigation');

        // this.container.append(
        //     this.createTraversalCard(),
        //     this.createDirectionOrderCard(),
        //     this.createInteractionModeCard(),
        //     this.createAnimationModeCard(),
        // );
    }
}
