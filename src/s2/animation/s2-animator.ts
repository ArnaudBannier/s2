import { Timeline } from 'animejs';
import { type S2BaseElement } from '../element/s2-element';
import { S2Attributes, type S2BaseScene } from '../s2-interface';
import { type AnimationParams } from 'animejs';
import { S2Shape } from '../element/s2-shape';
import { S2ElementAnim } from './s2-animation';

class S2AnimState {
    params: S2Attributes;
    index: number;
    constructor(params: S2Attributes, index: number = 0) {
        this.params = params.clone();
        this.index = index;
    }
}

export class S2Animator {
    protected scene: S2BaseScene;
    protected targetStepIndex: number = 0;
    protected currStepIndex: number = -1;
    protected timeline: Timeline;
    protected stepCount: number = 0;
    public statesMap: Map<S2BaseElement, S2AnimState[]> = new Map();

    constructor(scene: S2BaseScene) {
        this.scene = scene;
        this.timeline = new Timeline({ autoplay: false });
    }

    private getSavedParams(states: S2AnimState[], index: number): S2Attributes {
        for (let i = states.length - 1; i >= 0; i--) {
            if (states[i].index < index) {
                return states[i].params;
            }
        }
        return states[0].params;
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
        this.statesMap.set(target, [new S2AnimState(target.getParameters(), this.currStepIndex)]);
        return this;
    }

    finalize(): void {
        this.statesMap.forEach((states, target) => {
            const state = this.getSavedParams(states, this.targetStepIndex);
            target.setParameters(state).update();
        });
        this.stepCount = this.currStepIndex;
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
        const states = this.statesMap.get(target);
        if (states === undefined || states.length === 0) {
            console.warn('Target not saved.');
            return;
        }
        const savedParams = this.getSavedParams(states, this.currStepIndex);
        const currentParams = target.getParameters();
        if (this.currStepIndex === this.targetStepIndex || this.targetStepIndex < 0) {
            const anim = new S2ElementAnim(this.scene, target, savedParams, currentParams);
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
        }
        states.push(new S2AnimState(currentParams, this.currStepIndex));
    }
}

// class S2AnimatorStep {
//     public animations: S2Animation[] = [];
//     timelinePos: Array<number | string> = [];

//     addAnimation(animation: S2Animation, timelinePos: number | string = '+=0'): this {
//         this.animations.push(animation);
//         this.timelinePos.push(timelinePos);
//         return this;
//     }

//     // appendToTimeline(timeline: Timeline): void {
//     //     this.animations.forEach((anim, index) => {
//     //         const animeTarget = { t: 0 };
//     //         timeline.add(
//     //             animeTarget,
//     //             {
//     //                 t: { to: [0, 1] },
//     //                 ...anim.parameters,
//     //                 onUpdate: (_) => {
//     //                     void _;
//     //                     anim.update(animeTarget.t);
//     //                 },
//     //             },
//     //             this.timelinePos[index],
//     //         );
//     //     });
//     // }
// }
