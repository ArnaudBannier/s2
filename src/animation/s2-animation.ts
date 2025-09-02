import { NewS2Element, S2Element, S2LayerData, type S2BaseElement } from '../core/element/s2-element';
import { type S2BaseScene } from '../core/s2-interface';
import { lerp } from '../core/math/s2-utils';
import { S2Position, S2Length, S2Extents, S2Number, S2BaseType } from '../core/s2-types';
import { S2Animatable, S2Attributes } from '../core/s2-attributes';
import { easeIn, easeLinear, easeOut, type S2Easing } from './s2-easing';

import { S2Color } from '../core/s2-types';

// Créer deux catégories -> timeAnim eventAnim ?
// Comment gérer les smoothDamped ?

// Créer une S2ActionAnim qui effectue des changement immédiats
// => Les callbacks onStart peuvent faire la même chose. beforeStart, afterComplete ?

export abstract class S2AnimationNEW {
    protected scene: S2BaseScene;
    protected loopAccu: number = 0;
    protected loopIndex: number = 0;
    protected loopCount: number = 1;
    protected loopDuration: number = 1000;
    protected speed: number = 1;
    protected ease: S2Easing = easeLinear;

    protected reversed: boolean = false;
    protected alternate: boolean = false;
    protected paused: boolean = false;
    protected delay: number = 0;

    protected updateTargets: Set<S2BaseElement>;

    addUpdateTarget(target: S2BaseElement): this {
        this.updateTargets.add(target);
        return this;
    }

    constructor(scene: S2BaseScene) {
        this.scene = scene;
        this.updateTargets = new Set();
    }

    begin(): void {
        this.loopAccu = 0;
        this.loopIndex = 0;
        this.onBegin();
    }

    complete(): void {
        this.loopAccu = this.loopDuration;
        this.loopIndex = this.loopCount;
        this.onComplete();
    }

    update(dt: number): void {
        if (this.paused) return;
        const nextAccu = this.loopAccu + this.speed * dt;
        if (this.loopAccu <= 0 && nextAccu > 0) {
            this.loopAccu = 0;
            this.onBegin();
        }
        this.loopAccu = nextAccu;

        while (this.loopAccu >= this.loopDuration) {
            this.onLoop();
            this.loopAccu -= this.loopDuration;
            this.loopIndex++;
            if (this.loopCount > 0 && this.loopIndex >= this.loopCount) {
                this.paused = true;
                this.loopAccu = this.loopDuration;
                this.onComplete();
                break;
            }
        }
        this.onUpdate();
        for (const target of this.updateTargets) {
            target.update();
        }
    }

    pause(): void {
        this.paused = true;
        this.onPause();
    }

    play(): void {
        this.loopAccu = -this.delay;
        this.loopIndex = 0;
        this.paused = false;
    }

    resume(): void {
        this.paused = false;
    }

    protected onBegin(): void {}
    protected onComplete(): void {}
    protected onLoop(): void {}
    protected onUpdate(): void {}
    protected onPause(): void {}

    setLoopCount(loopCount: number): this {
        this.loopCount = loopCount;
        return this;
    }

    setLoopDuration(loopDuration: number): this {
        this.loopDuration = loopDuration;
        return this;
    }

    setLoopProgression(t: number, loopIndex?: number): this {
        this.loopAccu = t * this.loopDuration;
        if (loopIndex !== undefined) this.loopIndex = loopIndex;
        return this;
    }

    setEasing(ease: S2Easing): this {
        this.ease = ease;
        return this;
    }

    setReversed(reversed: boolean = true): this {
        this.reversed = reversed;
        return this;
    }

    setAlternate(alternate: boolean = true): this {
        this.alternate = alternate;
        return this;
    }

    getLoopProgression(): number {
        let t = this.loopAccu / this.loopDuration;
        if (this.alternate) t = t < 0.5 ? 2 * t : 2 - 2 * t;
        if (this.reversed) t = 1 - t;
        return this.ease(t);
    }

    getLoopDuration(): number {
        return this.loopDuration;
    }

    getLoopIndex(): number {
        return this.loopIndex;
    }

    getLoopCount(): number {
        return this.loopCount;
    }

    getTotalDuration(): number {
        const loopCount = this.loopCount < 0 ? 1 : this.loopCount;
        return (loopCount * this.loopDuration + this.delay) / this.speed;
    }
}

//             |     |
// A - < # > . . < > . < # > . .
// B - . . < # # > . . < > . . .
// C - . < > . . . < # # > . . .
// D - . . . . . < # # # # # # >
// Commencer par tous les starts des animation suivantes dans l'ordre de beginTime décroissant
// Continuer par tous les complete des animation précédentes dans l'ordre de endTime croissant
// Finir par les animations en cours

// Faut-il sauvegarder les cibles des animations ?

class S2TimelinePart {
    public animation: S2AnimationNEW;
    public offset: number;

    constructor(animation: S2AnimationNEW, offset: number = 0) {
        this.animation = animation;
        this.offset = offset;
    }
}

type S2TimelinePositionTypes = 'absolute' | 'previous-start' | 'previous-end';
export class S2Timeline extends S2AnimationNEW {
    protected parts: S2TimelinePart[] = [];
    protected animations: S2AnimationNEW[] = [];
    protected sortedStart: Array<{ start: number; animation: S2AnimationNEW }> = [];
    protected sortedEnd: Array<{ end: number; animation: S2AnimationNEW }> = [];

    constructor(scene: S2BaseScene) {
        super(scene);
    }

    createRanges(): void {
        this.sortedStart.length = 0;
        this.sortedEnd.length = 0;
        for (const part of this.parts) {
            const anim = part.animation;
            this.sortedStart.push({ start: part.offset, animation: anim });
            this.sortedEnd.push({ end: part.offset + anim.getTotalDuration(), animation: anim });
        }
        this.sortedStart.sort((a, b) => a.start - b.start);
        this.sortedEnd.sort((a, b) => a.end - b.end);
    }

    addAnimation(
        animation: S2AnimationNEW,
        position: S2TimelinePositionTypes = 'previous-end',
        offset: number = 0,
    ): this {
        const previousPart = this.parts.length > 0 ? this.parts[this.parts.length - 1] : null;
        switch (position) {
            case 'absolute':
                break;
            case 'previous-start':
                if (previousPart) {
                    offset += previousPart.offset;
                }
                break;
            case 'previous-end':
                if (previousPart) {
                    offset += previousPart.offset + previousPart.animation.getTotalDuration();
                }
                break;
        }
        this.loopDuration += animation.getTotalDuration();
        this.parts.push(new S2TimelinePart(animation, offset));
        return this;
    }

    // Penser à setLoopDuration !

    update(dt: number): void {
        super.update(dt);

        //  for beginToAnim
        //      if (this.accu < currBeginTime) break;
        //      if (this.accu > currEndTime) -> anim active
    }
}

export abstract class S2Animation {
    protected scene: S2BaseScene;
    constructor(scene: S2BaseScene) {
        this.scene = scene;
    }
    abstract update(t: number): void;
}

export class S2ElementAnim extends S2Animation {
    target: S2Element;
    targetParams: S2Animatable = new S2Animatable();

    position?: [S2Position, S2Position];
    pathFrom?: [number, number];
    pathTo?: [number, number];
    fillColor?: [S2Color, S2Color];
    fillOpacity?: [number, number];
    opacity?: [number, number];
    strokeColor?: [S2Color, S2Color];
    strokeWidth?: [S2Length, S2Length];

    constructor(scene: S2BaseScene, target: S2Element, from: S2Animatable, to: S2Animatable) {
        super(scene);
        this.target = target;
        if (from.position && to.position) {
            this.position = [from.position.clone(), to.position.clone()];
        }
        if (from.strokeWidth && to.strokeWidth) {
            this.strokeWidth = [from.strokeWidth.clone(), to.strokeWidth.clone()];
        }
        if (from.pathFrom !== undefined && to.pathFrom !== undefined) {
            this.pathFrom = [from.pathFrom, to.pathFrom];
        }
        if (from.pathTo !== undefined && to.pathTo !== undefined) {
            this.pathTo = [from.pathTo, to.pathTo];
        }
        if (from.fillColor && to.fillColor) {
            this.fillColor = [from.fillColor.clone(), to.fillColor.clone()];
        }
        if (from.strokeColor && to.strokeColor) {
            this.strokeColor = [from.strokeColor.clone(), to.strokeColor.clone()];
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
        this.target.setAnimatableAttributes(this.targetParams).update();
    }
}
