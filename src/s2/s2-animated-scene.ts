import { S2Camera } from './math/s2-camera';
import { S2Scene } from './s2-scene';
import { S2Graphics } from './element/s2-graphics';
import { Timeline, type TweenKeyValue } from 'animejs';
import { type AnimationParams } from 'animejs';
import { type S2StyleDecl } from './s2-globals';
import { clamp, lerp } from '../math/utils';
import { S2Path } from './element/s2-path';
import { S2Position } from './s2-space';
import { type S2BaseElement } from './element/s2-element';
import { type S2HasPosition } from './s2-interface';
import { S2Shape } from './element/s2-shape';

interface RecordedParams {
    position?: S2Position;
    partialFrom?: number;
    partialTo?: number;
}

export class S2AnimatedScene extends S2Scene {
    protected targetStepIndex: number = 0;
    protected currStepIndex: number = -1;
    protected timeline: Timeline;
    protected stepCount: number = 0;
    protected paramMap: WeakMap<S2BaseElement, RecordedParams> = new WeakMap();

    constructor(element: SVGSVGElement, camera: S2Camera) {
        super(element, camera);
        this.timeline = new Timeline({ autoplay: false });
    }

    recordElement(target: S2BaseElement): this {
        const params: RecordedParams = {};
        if (target instanceof S2Shape) {
            params.position = target.getS2Position();
        }
        if (target instanceof S2Path) {
            params.partialFrom = target.getPartialFrom();
            params.partialTo = target.getPartialTo();
        }
        this.paramMap.set(target, params);
        return this;
    }

    makeStep(): boolean {
        this.currStepIndex++;
        this.stepCount = this.currStepIndex;
        return this.targetStepIndex < 0 ? false : this.currStepIndex > this.targetStepIndex;
    }

    setTargetAnimIndex(targetIndex: number): this {
        this.targetStepIndex = targetIndex;
        return this;
    }

    createFullAnimation(): void {
        this.targetStepIndex = -1;
        this.createAnimation();
        this.timeline.play();
    }

    createPrevStep(): void {
        this.targetStepIndex = clamp(this.targetStepIndex - 1, 0, this.stepCount);
        this.createAnimation();
    }

    createNextStep(): void {
        if (this.targetStepIndex >= this.stepCount) return;
        this.targetStepIndex = clamp(this.targetStepIndex + 1, 0, this.stepCount);
        this.createAnimation();
        this.timeline.play();
    }

    reset(): void {
        this.targetStepIndex = 0;
        this.createAnimation();
        this.timeline.restart();
    }

    play(): void {
        this.createAnimation();
        this.timeline.play();
    }

    protected resetTimeline(): void {
        console.log('current target', this.targetStepIndex);
        this.timeline.cancel();
        this.timeline = new Timeline({ autoplay: false });
        this.currStepIndex = 0;
    }

    createAnimation(): void {}

    addStyleAnimation(
        target: S2Graphics<SVGGraphicsElement>,
        targetStyle: S2StyleDecl,
        parameters: AnimationParams,
        position?: number | string,
    ): void {
        if (this.currStepIndex === this.targetStepIndex || this.targetStepIndex < 0) {
            this.timeline.add(
                target.getElement(),
                {
                    ...targetStyle,
                    ...parameters,
                },
                position,
            );
        } else if (this.currStepIndex < this.targetStepIndex) {
            target.setStyle(targetStyle);
        }
    }

    animateMove(target: S2BaseElement & S2HasPosition, parameters: AnimationParams, position?: number | string): void {
        const recordedPos = this.paramMap.get(target)?.position;
        if (recordedPos === undefined) {
            console.warn('Position of target not recorded.');
            return;
        }
        const currPos = target.getS2Position();
        if (this.currStepIndex === this.targetStepIndex || this.targetStepIndex < 0) {
            const startPos = recordedPos.toSpace(currPos.space, this.activeCamera);
            const endPos = currPos.value;
            const animeTarget = { x: startPos.x, y: startPos.y };
            this.timeline.add(
                animeTarget,
                {
                    x: { to: [startPos.x, endPos.x] },
                    y: { to: [startPos.y, endPos.y] },
                    ...parameters,
                    onUpdate: (_) => {
                        void _;
                        target.setPosition(animeTarget.x, animeTarget.y, currPos.space).update();
                    },
                },
                position,
            );
            recordedPos.copy(currPos);
        } else if (this.currStepIndex < this.targetStepIndex) {
            recordedPos.copy(currPos);
            target.update();
        }
    }

    addDrawAnimation(target: S2Path, parameters: AnimationParams, position?: number | string): void {
        const params = this.paramMap.get(target);
        if (params?.partialFrom === undefined || params?.partialTo === undefined) {
            console.warn('Position of target not recorded.');
            return;
        }
        const endPartialFrom = target.getPartialFrom();
        const endPartialTo = target.getPartialTo();
        if (this.currStepIndex === this.targetStepIndex || this.targetStepIndex < 0) {
            const startPartialFrom = params.partialFrom;
            const startPartialTo = params.partialTo;
            const animeTarget = { progress: 0 };
            this.timeline.add(
                animeTarget,
                {
                    progress: { to: [0, 1] },
                    ...parameters,
                    onUpdate: (_) => {
                        void _;
                        const p = animeTarget.progress;
                        const from = lerp(startPartialFrom, endPartialFrom, p);
                        const to = lerp(startPartialTo, endPartialTo, p);
                        target.makePartial(from, to).update();
                    },
                },
                position,
            );
            params.partialFrom = endPartialFrom;
            params.partialTo = endPartialTo;
        } else if (this.currStepIndex < this.targetStepIndex) {
            params.partialFrom = endPartialFrom;
            params.partialTo = endPartialTo;
            target.update();
        }

        // if (this.currStepIndex === this.targetStepIndex || this.targetStepIndex < 0) {
        //     const currPartialFrom = target.getPartialFrom();
        //     const currPartialTo = target.getPartialTo();
        //     const animeTarget = { progress: 0 };
        //     this.timeline.add(
        //         animeTarget,
        //         {
        //             progress: { to: [0, 1] },
        //             ...parameters,
        //             onUpdate: (_) => {
        //                 void _;
        //                 const p = animeTarget.progress;
        //                 const from = lerp(currPartialFrom, targetPartialFrom, p);
        //                 const to = lerp(currPartialTo, targetPartialTo, p);
        //                 target.makePartial(from, to).update();
        //             },
        //         },
        //         position,
        //     );
        // } else if (this.currStepIndex < this.targetStepIndex) {
        //     target.makePartial(targetPartialFrom, targetPartialTo).update();
        // }
    }

    getTween(currStyle: S2StyleDecl, nextStyle: S2StyleDecl): { [key: string]: TweenKeyValue } {
        const res: { [key: string]: TweenKeyValue } = {};
        for (const [key, value] of Object.entries(nextStyle)) {
            if (key in currStyle) {
                res[key] = { to: [currStyle[key], value] };
            }
        }
        return res;
    }
}
