// import { Timeline } from 'animejs';
// import { S2Element } from '../core/element/s2-element';
// import { type S2BaseScene } from '../core/s2-interface';
// import { type AnimationParams } from 'animejs';
// import { S2Shape } from '../core/element/s2-shape';
// import { S2ElementAnim } from './s2-animation';
// import { S2Animatable } from '../core/s2-attributes';

// class S2AnimState {
//     attributes: S2Animatable;
//     index: number;
//     constructor(params: S2Animatable, index: number = 0) {
//         this.attributes = params.clone();
//         this.index = index;
//     }
// }

// export class S2Animator {
//     protected scene: S2BaseScene;
//     protected currStepIndex: number = 0;
//     protected timeline: Timeline;
//     protected stepTimelines: Timeline[];
//     protected stepCount: number = 0;
//     public statesMap: Map<S2Element, S2AnimState[]> = new Map();

//     constructor(scene: S2BaseScene) {
//         this.scene = scene;
//         this.timeline = new Timeline({ autoplay: false });
//         this.stepTimelines = [new Timeline({ autoplay: false })];
//     }

//     private getSavedParams(states: S2AnimState[], index: number): S2Animatable {
//         for (let i = states.length - 1; i >= 0; i--) {
//             if (states[i].index < index) {
//                 return states[i].attributes;
//             }
//         }
//         return states[0].attributes;
//     }

//     getStepCount(): number {
//         return this.stepCount;
//     }

//     saveState(target: S2Element): this {
//         this.statesMap.set(target, [new S2AnimState(target.getAnimatableAttributes(), this.currStepIndex - 1)]);
//         return this;
//     }

//     setupStep(index: number): void {
//         this.statesMap.forEach((states, target) => {
//             const state = this.getSavedParams(states, index);
//             target.setAnimatableAttributes(state).update();
//         });
//     }

//     finalize(): void {
//         this.stepCount = this.currStepIndex;

//         for (const step of this.stepTimelines) {
//             this.timeline.sync(step);
//         }
//     }

//     makeStep(): void {
//         this.currStepIndex++;
//         this.stepCount = this.currStepIndex;
//         this.stepTimelines.push(new Timeline({ autoplay: false }));
//     }

//     getTimeline(): Timeline {
//         return this.timeline;
//     }

//     getStepTimeline(index: number): Timeline {
//         return this.stepTimelines[index];
//     }

//     animate(target: S2Shape, parameters: AnimationParams, timelinePos?: number | string): void {
//         const states = this.statesMap.get(target);
//         if (states === undefined || states.length === 0) {
//             console.warn('Target not saved.');
//             return;
//         }
//         const savedParams = this.getSavedParams(states, this.currStepIndex);
//         const currentParams = target.getAnimatableAttributes();
//         const anim = new S2ElementAnim(this.scene, target, savedParams, currentParams);
//         const animeTarget = { t: 0 };
//         this.stepTimelines[this.currStepIndex].add(
//             animeTarget,
//             {
//                 t: { to: [0, 1] },
//                 ...parameters,
//                 onUpdate: (_) => {
//                     void _;
//                     anim.update(animeTarget.t);
//                 },
//             },
//             timelinePos,
//         );
//         states.push(new S2AnimState(currentParams, this.currStepIndex));
//     }
// }
