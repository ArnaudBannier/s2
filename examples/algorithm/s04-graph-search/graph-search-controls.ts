import { S2MathUtils } from '../../../src/core/math/s2-math-utils.ts';
import { GraphSearchScene, type Direction } from './graph-search-scene.ts';

export class GraphSearchControls {
    private container: HTMLElement;
    private scene: GraphSearchScene;
    private stepIndex: number = -1;

    constructor(container: HTMLElement, scene: GraphSearchScene) {
        this.container = container;
        this.scene = scene;
    }

    init(): void {
        this.container.classList.add('graph-search-controls');

        this.container.append(
            this.createTraversalCard(),
            this.createDirectionOrderCard(),
            this.createInteractionModeCard(),
            this.createAnimationModeCard(),
        );
    }

    // ─────────────────────────────────────────────
    // Carte 1 — BFS / DFS
    // ─────────────────────────────────────────────
    private createTraversalCard(): HTMLElement {
        const card = this.createCard('Type de parcours', 'Choisit la stratégie d’exploration du graphe.');

        const dfs = this.createRadio('traversal', 'dfs', 'DFS', true);
        const bfs = this.createRadio('traversal', 'bfs', 'BFS', false);
        bfs.input.addEventListener('change', () => {
            this.scene.setTraversal('bfs');
        });

        dfs.input.addEventListener('change', () => {
            this.scene.setTraversal('dfs');
        });
        card.body.append(dfs.label, bfs.label);
        return card.root;
    }

    // ─────────────────────────────────────────────
    // Carte 2 — Ordre des voisins
    // ─────────────────────────────────────────────
    private createDirectionOrderCard(): HTMLElement {
        const card = this.createCard('Ordre des voisins', 'Définit l’ordre dans lequel les voisins sont explorés.');

        const list = document.createElement('ul');
        list.className = 'dir-list';

        const dirs: { dir: Direction; icon: string }[] = [
            { dir: 'U', icon: 'fa-up-long' },
            { dir: 'D', icon: 'fa-down-long' },
            { dir: 'L', icon: 'fa-left-long' },
            { dir: 'R', icon: 'fa-right-long' },
        ];

        let dragged: HTMLElement | null = null;

        for (const d of dirs) {
            const li = document.createElement('li');
            li.draggable = true;
            li.dataset.dir = d.dir;

            const i = document.createElement('i');
            i.classList.add('fa-solid', d.icon);
            li.append(i);

            li.addEventListener('dragstart', () => {
                dragged = li;
                li.classList.add('dragging');
            });

            li.addEventListener('dragend', () => {
                dragged = null;
                li.classList.remove('dragging');
            });

            li.addEventListener('dragover', (e) => {
                e.preventDefault();
                if (!dragged || dragged === li) return;

                const target = e.target as HTMLElement;
                target.classList.add('over');
            });

            li.addEventListener('dragleave', (e) => {
                e.preventDefault();
                if (!dragged || dragged === li) return;

                const target = e.target as HTMLElement;
                target.classList.remove('over');
            });

            li.addEventListener('drop', (e) => {
                e.preventDefault();
                if (!dragged || dragged === li) return;
                li.classList.remove('over');
            });

            list.appendChild(li);
        }

        list.addEventListener('drop', (e) => {
            e.preventDefault();

            const target = e.target as HTMLElement;
            if (!dragged || target === dragged || target.tagName !== 'LI') return;

            target.classList.remove('over');

            const rect = dragged.getBoundingClientRect();
            const offset = e.clientX - rect.x;

            if (offset < 0) {
                list.insertBefore(dragged, target);
            } else {
                list.insertBefore(dragged, target.nextSibling);
            }

            const order = Array.from(list.children).map((li) => (li as HTMLElement).dataset.dir as Direction);
            this.scene.setDirectionOrder(order);
        });

        card.body.appendChild(list);
        return card.root;
    }

    // ─────────────────────────────────────────────
    // Carte 3 — Interaction
    // ─────────────────────────────────────────────
    private createInteractionModeCard(): HTMLElement {
        const card = this.createCard('Interaction', 'Choisit ce que fait un clic sur la grille.');

        const select = document.createElement('select');
        select.innerHTML = `
            <option value="search">Choisir le départ</option>
            <option value="wall">Modifier les murs</option>
        `;

        select.addEventListener('change', () => {
            this.scene.animator.stop();
            const value = select.value as 'wall' | 'search';
            this.scene.setMode(value);
        });

        card.body.appendChild(select);
        return card.root;
    }

    // ─────────────────────────────────────────────
    // Carte 4 — Animation
    // ─────────────────────────────────────────────
    private createAnimationModeCard(): HTMLElement {
        const card = this.createCard('Animation', 'Contrôle la vitesse de l’animation.');
        let isPlaying = false;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';

        const label = document.createElement('label');
        label.append(checkbox, document.createTextNode(' Pas à pas'));

        const playbackControls = document.createElement('div');
        playbackControls.className = 'playback-controls';

        const stopButton = document.createElement('button');
        stopButton.innerHTML = '<i class="fa-solid fa-stop"></i>';
        stopButton.classList.add('anim-button');

        const playButton = document.createElement('button');
        playButton.innerHTML = '<i class="fa-solid fa-play"></i>';
        playButton.classList.add('anim-button');

        const nextButton = document.createElement('button');
        nextButton.innerHTML = '<i class="fa-solid fa-step-forward"></i>';
        nextButton.disabled = true;
        nextButton.classList.add('anim-button');

        const prevButton = document.createElement('button');
        prevButton.innerHTML = '<i class="fa-solid fa-step-backward"></i>';
        prevButton.disabled = true;
        prevButton.classList.add('anim-button');

        stopButton.addEventListener('click', () => {
            console.log('stop');
            playButton.innerHTML = '<i class="fa-solid fa-play"></i>';
            this.stepIndex = -1;
            this.scene.animator.stop();
            this.scene.animator.setRangeAsMaster();
            this.scene.animator.setMasterElapsed(0);
            this.scene.update();
            isPlaying = false;
        });

        playButton.addEventListener('click', () => {
            console.log('play/pause');
            if (isPlaying) {
                this.scene.animator.pause();
                playButton.innerHTML = '<i class="fa-solid fa-play"></i>';
            } else {
                this.scene.animator.setRangeAsMaster();
                const currentElapsed = this.scene.animator.getElapsed();
                if (currentElapsed >= this.scene.animator.getMasterDuration()) {
                    this.scene.animator.setMasterElapsed(0);
                }
                this.scene.animator.resume();
                playButton.innerHTML = '<i class="fa-solid fa-pause"></i>';
            }
            isPlaying = !isPlaying;
        });

        nextButton.addEventListener('click', () => {
            playButton.innerHTML = '<i class="fa-solid fa-play"></i>';
            const elapsed = this.scene.animator.getElapsed();
            if (elapsed < 1.0) {
                this.stepIndex = -1;
            } else {
                this.stepIndex = this.scene.animator.getStepIndexFromElapsed(elapsed - 1.0);
            }
            this.stepIndex = S2MathUtils.clamp(this.stepIndex + 1, 0, this.scene.animator.getStepCount() - 1);
            this.scene.animator.setRangeAsStep(this.stepIndex);
            this.scene.animator.resetStep(this.stepIndex);
            this.scene.animator.resume();
        });

        prevButton.addEventListener('click', () => {
            playButton.innerHTML = '<i class="fa-solid fa-play"></i>';
            const elapsed = this.scene.animator.getElapsed();
            if (elapsed < 1.0) {
                this.stepIndex = -1;
            } else {
                this.stepIndex = this.scene.animator.getStepIndexFromElapsed(elapsed - 1.0);
            }
            this.scene.animator.resetStep(this.stepIndex);
            this.scene.update();
        });

        checkbox.addEventListener('change', () => {
            this.scene.setStepByStep(checkbox.checked);
            if (checkbox.checked) {
                nextButton.disabled = false;
                prevButton.disabled = false;
            } else {
                nextButton.disabled = true;
                prevButton.disabled = true;
            }
        });

        playbackControls.append(playButton, stopButton, prevButton, nextButton);
        card.body.append(label, playbackControls);
        return card.root;
    }

    // ─────────────────────────────────────────────
    // Helpers UI
    // ─────────────────────────────────────────────
    private createCard(title: string, description: string) {
        const root = document.createElement('div');
        root.className = 'ui-card';

        const h = document.createElement('h3');
        h.textContent = title;

        const p = document.createElement('p');
        p.textContent = description;

        const body = document.createElement('div');
        body.className = 'ui-card-body';

        root.append(h, p, body);
        return { root, body };
    }

    private createRadio(name: string, value: string, labelText: string, checked = false) {
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = name;
        input.value = value;
        input.checked = checked;

        const label = document.createElement('label');
        label.append(input, document.createTextNode(' ' + labelText));

        return { input, label };
    }
}
