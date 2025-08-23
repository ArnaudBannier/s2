import { Timeline } from 'animejs';
import { type S2BaseElement } from '../element/s2-element';
import { S2Parameters, type S2BaseScene } from '../s2-interface';
import { type AnimationParams } from 'animejs';
import { S2Shape } from '../element/s2-shape';
import { S2ElementAnim } from './s2-animation';

class S2AnimState {
    initialParams: S2Parameters;
    currentParams: S2Parameters;
    constructor(state: S2Parameters) {
        this.initialParams = state.clone();
        this.currentParams = state.clone();
    }
}

export class S2Animator {
    protected scene: S2BaseScene;
    protected targetStepIndex: number = 0;
    protected currStepIndex: number = -1;
    protected timeline: Timeline;
    protected stepCount: number = 0;
    public stateMap: Map<S2BaseElement, S2AnimState> = new Map();

    constructor(scene: S2BaseScene) {
        this.scene = scene;
        this.timeline = new Timeline({ autoplay: false });
    }

    getStepCount(): number {
        return this.stepCount;
    }

    getTargetStepIndex(): number {
        return this.targetStepIndex;
    }

    setTargetStepIndex(targetIndex: number): this {
        this.targetStepIndex = targetIndex;
        return this;
    }

    saveState(target: S2BaseElement): this {
        this.stateMap.set(target, new S2AnimState(target.getParameters()));
        return this;
    }

    finalize(): void {
        this.stateMap.forEach((state, target) => {
            target.setParameters(state.initialParams).update();
        });
    }

    makeStep(): boolean {
        this.currStepIndex++;
        this.stepCount = this.currStepIndex;
        return this.targetStepIndex < 0 ? false : this.currStepIndex > this.targetStepIndex;
    }

    resetTimeline(): void {
        this.timeline.cancel();
        this.timeline = new Timeline({ autoplay: false });
        this.currStepIndex = 0;
    }

    getTimeline(): Timeline {
        return this.timeline;
    }

    animate(target: S2Shape<SVGGraphicsElement>, parameters: AnimationParams, timelinePos?: number | string): void {
        const savedState = this.stateMap.get(target);
        if (savedState === undefined) {
            console.warn('Target not saved.');
            return;
        }
        const currentParams = target.getParameters();
        if (this.currStepIndex < this.targetStepIndex) {
            savedState.initialParams.copy(currentParams);
        }
        if (this.currStepIndex === this.targetStepIndex || this.targetStepIndex < 0) {
            const anim = new S2ElementAnim(this.scene, target, savedState.currentParams, currentParams);
            const animeTarget = { t: 0 };
            this.timeline.add(
                animeTarget,
                {
                    t: { to: [0, 1] },
                    ...parameters,
                    onUpdate: (_) => {
                        void _;
                        anim.update(animeTarget.t);
                    },
                },
                timelinePos,
            );
            savedState.currentParams.copy(currentParams);
        } else if (this.currStepIndex < this.targetStepIndex) {
            savedState.currentParams.copy(currentParams);
            target.update();
        }
    }
}
