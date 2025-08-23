import { Timeline } from 'animejs';
import { S2Path } from '../element/s2-path';
import { type S2BaseElement } from '../element/s2-element';
import { type S2Parameters, type S2BaseScene, type S2HasPosition } from '../s2-interface';
import { type AnimationParams } from 'animejs';
import { lerp } from '../../math/utils';
import type { S2Shape } from '../element/s2-shape';
import { S2Position, S2Length } from '../s2-space';
import { S2Color } from '../s2-globals';

abstract class S2Animation {
    protected scene: S2BaseScene;
    constructor(scene: S2BaseScene) {
        this.scene = scene;
    }
    abstract update(t: number): void;
}

class S2ElementAnim extends S2Animation {
    target: S2BaseElement;
    targetParams: S2Parameters = {};

    position?: [S2Position, S2Position];
    pathFrom?: [number, number];
    pathTo?: [number, number];
    fillColor?: [S2Color, S2Color];
    fillOpacity?: [number, number];
    opacity?: [number, number];
    strokeColor?: [S2Color, S2Color];
    strokeWidth?: [S2Length, S2Length];

    constructor(scene: S2BaseScene, target: S2BaseElement, from: S2Parameters, to: S2Parameters) {
        super(scene);
        this.target = target;
        if (from.position && to.position) {
            this.position = [from.position, to.position];
        }
        if (from.strokeWidth && to.strokeWidth) {
            this.strokeWidth = [from.strokeWidth, to.strokeWidth];
        }
        if (from.pathFrom !== undefined && to.pathFrom !== undefined) {
            this.pathFrom = [from.pathFrom, to.pathFrom];
        }
        if (from.pathTo !== undefined && to.pathTo !== undefined) {
            this.pathTo = [from.pathTo, to.pathTo];
        }
        if (from.fillColor && to.fillColor) {
            this.fillColor = [from.fillColor, to.fillColor];
        }
        if (from.strokeColor && to.strokeColor) {
            this.strokeColor = [from.strokeColor, to.strokeColor];
        }
        if (from.fillOpacity !== undefined && to.fillOpacity !== undefined) {
            this.fillOpacity = [from.fillOpacity, to.fillOpacity];
        }
        if (from.opacity !== undefined && to.opacity !== undefined) {
            this.opacity = [from.opacity, to.opacity];
        }
    }

    update(t: number): void {
        if (this.position) {
            const from = this.position[0];
            const to = this.position[1];
            from.changeSpace(to.space, this.scene.activeCamera);
            this.targetParams.position = new S2Position(
                lerp(from.value.x, to.value.x, t),
                lerp(from.value.y, to.value.y, t),
                to.space,
            );
        }
        if (this.strokeWidth) {
            const from = this.strokeWidth[0];
            const to = this.strokeWidth[1];
            from.changeSpace(to.space, this.scene.activeCamera);
            this.targetParams.strokeWidth = new S2Length(lerp(from.value, to.value, t), to.space);
        }
        if (this.pathFrom) {
            this.targetParams.pathFrom = lerp(this.pathFrom[0], this.pathFrom[1], t);
        }
        if (this.pathTo) {
            this.targetParams.pathTo = lerp(this.pathTo[0], this.pathTo[1], t);
        }
        if (this.fillColor) {
            this.targetParams.fillColor = S2Color.lerp(this.fillColor[0], this.fillColor[1], t);
        }
        if (this.strokeColor) {
            this.targetParams.strokeColor = S2Color.lerp(this.strokeColor[0], this.strokeColor[1], t);
        }
        if (this.opacity) {
            this.targetParams.opacity = lerp(this.opacity[0], this.opacity[1], t);
        }
        if (this.fillOpacity) {
            this.targetParams.fillOpacity = lerp(this.fillOpacity[0], this.fillOpacity[1], t);
        }
        this.target.setParameters(this.targetParams).update();
    }
}

class S2AnimState {
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
    protected stateMap: Map<S2BaseElement, S2AnimState> = new Map();

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
        if (this.currStepIndex === this.targetStepIndex || this.targetStepIndex < 0) {
            const anim = new S2ElementAnim(this.scene, target, savedState.currentParams, target.getParameters());
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
        } else if (this.currStepIndex < this.targetStepIndex) {
            savedState.currentParams = target.getParameters();
            target.update();
        }
    }

    animateStyle(
        target: S2Shape<SVGGraphicsElement>,
        parameters: AnimationParams,
        timelinePos?: number | string,
    ): void {
        // const savedState = this.stateMap.get(target);
        // if (savedState === undefined) {
        //     console.warn('Target not saved.');
        //     return;
        // }
        // if (this.currStepIndex === this.targetStepIndex || this.targetStepIndex < 0) {
        //     const fill0 = savedState.currentParams.fill ?? target.fill;
        //     const fill1 = target.fill;
        //     const animeTarget = { fill: fill0 };
        //     this.timeline.add(
        //         animeTarget,
        //         {
        //             fill: { to: [fill0, fill1] },
        //             ...parameters,
        //             onUpdate: (_) => {
        //                 void _;
        //                 target.setFill(animeTarget.fill).update();
        //             },
        //         },
        //         timelinePos,
        //     );
        //     savedState.currentParams.fill = fill1;
        // } else if (this.currStepIndex < this.targetStepIndex) {
        //     savedState.currentParams.fill = target.fill;
        //     target.update();
        // }
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
