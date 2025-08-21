import { type S2Camera } from './math/s2-camera';
import { S2Scene } from './s2-scene';
import { S2Graphics } from './element/s2-graphics';
import { Timeline, type TweenKeyValue } from 'animejs';
import { type AnimationParams } from 'animejs';
import { type S2StyleDecl } from './s2-globals';
import { clamp } from '../math/utils';

export class S2AnimatedScene extends S2Scene {
    protected targetStepIndex: number = 0;
    protected currStepIndex: number = -1;
    protected timeline: Timeline;
    protected stepCount: number = 0;

    constructor(element: SVGSVGElement, camera: S2Camera) {
        super(element, camera);
        this.timeline = new Timeline({ autoplay: false });
    }

    makeStep(): boolean {
        this.currStepIndex++;
        this.stepCount = this.currStepIndex;
        return this.currStepIndex > this.targetStepIndex;
    }

    setTargetAnimIndex(targetIndex: number): this {
        this.targetStepIndex = targetIndex;
        return this;
    }

    createPrevStep(): void {
        this.targetStepIndex = clamp(this.targetStepIndex - 1, 0, this.stepCount);
        this.createAnimation();
    }

    createNextStep(): void {
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
        this.timeline.restart();
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
        currStyle: S2StyleDecl,
        nextStyle: S2StyleDecl,
        parameters: AnimationParams,
        position?: number | string,
    ): void {
        if (this.currStepIndex < this.targetStepIndex) {
            target.setStyle(nextStyle);
        } else if (this.currStepIndex === this.targetStepIndex) {
            this.timeline.add(
                target.getElement(),
                {
                    ...this.getTween(currStyle, nextStyle),
                    ...parameters,
                },
                position,
            );
        }
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
