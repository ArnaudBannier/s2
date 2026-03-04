import type { S2StepAnimator } from '../../../src/core/animation/s2-step-animator';
import { S2MathUtils } from '../../../src/core/math/s2-math-utils';
import type { GraphDijkstraScene } from './graph-dijkstra-scene';

export class GraphDijkstraNavigation {
    protected container: HTMLElement;
    protected scene: GraphDijkstraScene;
    protected stepIndex: number = -1;
    protected animator: S2StepAnimator;

    protected isUpdatingFromSlider: boolean = false;
    protected isPlaying: boolean = false;
    protected wasPlaying: boolean = true;

    protected slider: HTMLInputElement;
    protected playbackDiv: HTMLDivElement;
    protected playButton: HTMLButtonElement;
    protected stopButton: HTMLButtonElement;
    protected nextButton: HTMLButtonElement;
    protected prevButton: HTMLButtonElement;
    protected sliderMax: number = 1024;

    constructor(container: HTMLElement, scene: GraphDijkstraScene, animator: S2StepAnimator) {
        this.container = container;
        this.scene = scene;
        this.animator = animator;

        this.slider = document.createElement('input');
        this.playbackDiv = document.createElement('div');
        this.stopButton = document.createElement('button');
        this.playButton = document.createElement('button');
        this.nextButton = document.createElement('button');
        this.prevButton = document.createElement('button');

        this.animator.addListener((anim) => {
            if (!this.isUpdatingFromSlider && this.slider) {
                const ratio = anim.getElapsed() / anim.getDuration();
                this.slider.valueAsNumber = ratio * this.sliderMax;
            }
            this.updatePlayButton();
        });
    }

    init(): void {
        this.container.classList.add('graph-dijkstra-navigation');

        this.initSlider();
        this.initPlaybackControls();
        this.container.append(this.slider, this.playbackDiv);
    }

    private updatePlayButton(): void {
        if (this.isPlaying === this.wasPlaying) return;

        this.playButton.innerHTML = this.isPlaying
            ? '<i class="fa-solid fa-pause"></i>'
            : '<i class="fa-solid fa-play"></i>';
        this.wasPlaying = this.isPlaying;
    }

    private initSlider(): void {
        this.slider.type = 'range';
        this.slider.style.width = '50%';
        this.slider.valueAsNumber = 0;
        this.slider.max = this.sliderMax.toString();

        this.slider.addEventListener('input', () => {
            this.isUpdatingFromSlider = true;
            const ratio = this.slider.valueAsNumber / this.sliderMax;
            const elapsed = ratio * this.scene.animator.getMasterDuration();
            this.scene.animator.stop();
            this.scene.animator.setMasterElapsed(elapsed);
            this.scene.update();
            this.isUpdatingFromSlider = false;
        });
    }

    private initPlaybackControls(): void {
        this.playbackDiv.classList.add('playback-controls');

        this.stopButton.innerHTML = '<i class="fa-solid fa-stop"></i>';
        this.nextButton.innerHTML = '<i class="fa-solid fa-step-forward"></i>';
        this.prevButton.innerHTML = '<i class="fa-solid fa-step-backward"></i>';

        this.stopButton.classList.add('anim-button');
        this.playButton.classList.add('anim-button');
        this.nextButton.classList.add('anim-button');
        this.prevButton.classList.add('anim-button');
        this.updatePlayButton();

        this.stopButton.addEventListener('click', () => {
            console.log('stop');
            this.playButton.innerHTML = '<i class="fa-solid fa-play"></i>';
            this.stepIndex = -1;
            this.scene.animator.stop();
            this.scene.animator.setRangeAsMaster();
            this.scene.animator.setMasterElapsed(0);
            this.scene.update();
            this.isPlaying = false;
            this.updatePlayButton();
        });

        this.playButton.addEventListener('click', () => {
            console.log('play/pause');
            if (this.isPlaying) {
                this.scene.animator.pause();
            } else {
                this.scene.animator.setRangeAsMaster();
                const currentElapsed = this.scene.animator.getElapsed();
                if (currentElapsed >= this.scene.animator.getMasterDuration()) {
                    this.scene.animator.setMasterElapsed(0);
                }
                this.scene.animator.resume();
            }
            this.isPlaying = !this.isPlaying;
            this.updatePlayButton();
        });

        this.nextButton.addEventListener('click', () => {
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
            this.isPlaying = true;
            this.updatePlayButton();
        });

        this.prevButton.addEventListener('click', () => {
            const elapsed = this.scene.animator.getElapsed();
            if (elapsed < 1.0) {
                this.stepIndex = -1;
            } else {
                this.stepIndex = this.scene.animator.getStepIndexFromElapsed(elapsed - 1.0);
            }
            this.animator.pause();
            this.scene.animator.resetStep(this.stepIndex);
            this.scene.update();
            this.isPlaying = false;
            this.updatePlayButton();
        });

        this.playbackDiv.append(this.playButton, this.stopButton, this.prevButton, this.nextButton);
    }
}
