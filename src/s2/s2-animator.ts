import { Timeline } from 'animejs';
import { S2Path } from './element/s2-path';
import { type S2BaseElement } from './element/s2-element';
import { type S2Parameters, type S2BaseScene, type S2HasPosition } from './s2-interface';
import { type AnimationParams } from 'animejs';
import { lerp } from '../math/utils';
import type { S2Shape } from './element/s2-shape';

class AnimState {
    initialParams: S2Parameters;
    currentParams: S2Parameters;
    constructor(state: S2Parameters) {
        this.initialParams = state;
        this.currentParams = state;
    }
}

export class S2Animator {
    protected scene: S2BaseScene;
    protected targetStepIndex: number = 0;
    protected currStepIndex: number = -1;
    protected timeline: Timeline;
    protected stepCount: number = 0;
    protected currParamMap: Map<S2BaseElement, S2Parameters> = new Map();
    protected startParamsMap: Map<S2BaseElement, S2Parameters> = new Map();
    protected stateMap: Map<S2BaseElement, AnimState> = new Map();

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
        this.currParamMap.set(target, target.getParameters());
        this.startParamsMap.set(target, target.getParameters());
        this.stateMap.set(target, new AnimState(target.getParameters()));
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

    animateStyle(
        target: S2Shape<SVGGraphicsElement>,
        parameters: AnimationParams,
        timelinePos?: number | string,
    ): void {
        const savedState = this.stateMap.get(target);
        if (savedState === undefined) {
            console.warn('Target not saved.');
            return;
        }
        if (this.currStepIndex === this.targetStepIndex || this.targetStepIndex < 0) {
            const fill0 = savedState.currentParams.fill ?? target.fill;
            const fill1 = target.fill;
            const animeTarget = { fill: fill0 };
            this.timeline.add(
                animeTarget,
                {
                    fill: { to: [fill0, fill1] },
                    ...parameters,
                    onUpdate: (_) => {
                        void _;
                        target.setFill(animeTarget.fill).update();
                    },
                },
                timelinePos,
            );
            savedState.currentParams.fill = fill1;
        } else if (this.currStepIndex < this.targetStepIndex) {
            savedState.currentParams.fill = target.fill;
            target.update();
        }
    }

    animateMove(
        target: S2BaseElement & S2HasPosition,
        parameters: AnimationParams,
        timelinePos?: number | string,
    ): void {
        const savedState = this.stateMap.get(target);
        const savedPosition = savedState?.currentParams.position;
        if (savedPosition === undefined) {
            console.warn('Target not saved.');
            return;
        }
        const position = target.getS2Position();
        if (this.currStepIndex === this.targetStepIndex || this.targetStepIndex < 0) {
            const p0 = savedPosition.toSpace(position.space, this.scene.activeCamera);
            const p1 = position.value;
            const animeTarget = { x: p0.x, y: p0.y };
            this.timeline.add(
                animeTarget,
                {
                    x: { to: [p0.x, p1.x] },
                    y: { to: [p0.y, p1.y] },
                    ...parameters,
                    onUpdate: (_) => {
                        void _;
                        target.setPosition(animeTarget.x, animeTarget.y, position.space).update();
                    },
                },
                timelinePos,
            );
            savedPosition.copy(position);
        } else if (this.currStepIndex < this.targetStepIndex) {
            savedPosition.copy(position);
            target.update();
        }
    }

    animateDraw(target: S2Path, parameters: AnimationParams, timelinePos?: number | string): void {
        const savedState = this.stateMap.get(target);
        if (savedState?.currentParams.pathFrom === undefined || savedState?.currentParams.pathTo === undefined) {
            console.warn('Target not recorded.');
            return;
        }
        const pathFrom1 = target.getPartialFrom();
        const pathTo1 = target.getPartialTo();
        if (this.currStepIndex === this.targetStepIndex || this.targetStepIndex < 0) {
            const pathFrom0 = savedState.currentParams.pathFrom;
            const pathTo0 = savedState.currentParams.pathTo;
            const animeTarget = { progress: 0 };
            this.timeline.add(
                animeTarget,
                {
                    progress: { to: [0, 1] },
                    ...parameters,
                    onUpdate: (_) => {
                        void _;
                        const p = animeTarget.progress;
                        const from = lerp(pathFrom0, pathFrom1, p);
                        const to = lerp(pathTo0, pathTo1, p);
                        target.makePartial(from, to).update();
                    },
                },
                timelinePos,
            );
            savedState.currentParams.pathFrom = pathFrom1;
            savedState.currentParams.pathTo = pathTo1;
        } else if (this.currStepIndex < this.targetStepIndex) {
            savedState.currentParams.pathFrom = pathFrom1;
            savedState.currentParams.pathTo = pathTo1;
            target.update();
        }
    }
}
