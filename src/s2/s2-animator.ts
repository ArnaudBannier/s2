import { Timeline } from 'animejs';
import { S2Path } from './element/s2-path';
import { type S2BaseElement } from './element/s2-element';
import { type S2Parameters, type S2BaseScene, type S2HasPosition } from './s2-interface';
import { type AnimationParams } from 'animejs';
import { lerp } from '../math/utils';

export class S2Animator {
    protected scene: S2BaseScene;
    protected targetStepIndex: number = 0;
    protected currStepIndex: number = -1;
    protected timeline: Timeline;
    protected stepCount: number = 0;
    protected stateMap: WeakMap<S2BaseElement, S2Parameters> = new WeakMap();

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
        this.stateMap.set(target, target.getAnimationState());
        return this;
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

    animateStyle(target: S2BaseElement, parameters: AnimationParams, timelinePos?: number | string): void {
        const savedState = this.stateMap.get(target);
        const savedStyle = savedState?.style;
        if (savedState === undefined || savedStyle === undefined) {
            console.warn('Target not saved.');
            return;
        }
        const style = target.getStyle();
        if (this.currStepIndex === this.targetStepIndex || this.targetStepIndex < 0) {
            const p0 = { ...savedStyle };
            const p1 = target.getStyle();
            const animeTarget: Record<string, { to: [string, string] }> = {};
            Object.entries(p0).forEach(([key, value]) => {
                if (Object.hasOwn(p1, key)) {
                    animeTarget[key] = { to: [value, p1[key]] };
                }
            });
            this.timeline.add(
                target.getElement(),
                {
                    ...animeTarget,
                    ...parameters,
                },
                timelinePos,
            );
            savedState.style = style;
        } else if (this.currStepIndex < this.targetStepIndex) {
            savedState.style = style;
            target.update();
        }
    }

    animateMove(
        target: S2BaseElement & S2HasPosition,
        parameters: AnimationParams,
        timelinePos?: number | string,
    ): void {
        const savedState = this.stateMap.get(target);
        const savedPosition = savedState?.position;
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
        if (savedState?.pathFrom === undefined || savedState?.pathTo === undefined) {
            console.warn('Target not recorded.');
            return;
        }
        const pathFrom1 = target.getPartialFrom();
        const pathTo1 = target.getPartialTo();
        if (this.currStepIndex === this.targetStepIndex || this.targetStepIndex < 0) {
            const pathFrom0 = savedState.pathFrom;
            const pathTo0 = savedState.pathTo;
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
            savedState.pathFrom = pathFrom1;
            savedState.pathTo = pathTo1;
        } else if (this.currStepIndex < this.targetStepIndex) {
            savedState.pathFrom = pathFrom1;
            savedState.pathTo = pathTo1;
            target.update();
        }
    }
}
