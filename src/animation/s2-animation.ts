import { NewS2Element, S2Element, S2LayerData } from '../core/element/s2-element';
import { type S2BaseScene } from '../core/s2-interface';
import { lerp } from '../core/math/s2-utils';
import { S2Position, S2Length, S2Extents, S2Number, S2BaseType } from '../core/s2-types';
import { S2Animatable, S2Attributes } from '../core/s2-attributes';
import { easeIn, easeLinear, easeOut, type S2Easing } from './s2-easing';

import { S2Color } from '../core/s2-types';

// Créer deux catégories -> timeAnim eventAnim ?
// Comment gérer les smoothDamped ?

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

    constructor(scene: S2BaseScene) {
        this.scene = scene;
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
        if (this.loopCount < 0) return -1;
        return (this.loopCount * this.loopDuration + this.delay) / this.speed;
    }
}

type S2MemberMap<T> = Map<T, [T, T]>;
//type S2AnimatableType = S2Position | S2Length | S2Extents | S2Color | number;

export class S2LerpAnim extends S2AnimationNEW {
    protected positionMap: S2MemberMap<S2Position>;
    protected lengthMap: S2MemberMap<S2Length>;
    protected extentsMap: S2MemberMap<S2Extents>;
    protected colorMap: S2MemberMap<S2Color>;
    protected numberMap: S2MemberMap<S2Number>;
    protected targets: Set<NewS2Element<S2LayerData>>;

    constructor(scene: S2BaseScene) {
        super(scene);
        this.colorMap = new Map();
        this.positionMap = new Map();
        this.numberMap = new Map();
        this.lengthMap = new Map();
        this.extentsMap = new Map();
        this.targets = new Set<NewS2Element<S2LayerData>>();
    }

    addTarget(target: NewS2Element<S2LayerData>): this {
        this.targets.add(target);
        return this;
    }

    saveMember(member: S2Number, to?: S2Number): this;
    saveMember(member: S2Position, to?: S2Position): this;
    saveMember(member: S2Color, to?: S2Color): this;
    // saveMember(member: S2Length, to?: S2Length): this;
    // saveMember(member: S2Extents, to?: S2Extents): this;
    // saveMember(member: S2Number, to?: S2Number): this;
    saveMember(member: S2Number | S2Position | S2Color, to?: S2Number | S2Position | S2Color): this {
        switch (member.kind) {
            case 'number':
                this.numberMap.set(member, [member.clone(), to instanceof S2Number ? to.clone() : member.clone()]);
                break;
            case 'position':
                this.positionMap.set(member, [member.clone(), to instanceof S2Position ? to.clone() : member.clone()]);
                break;
            case 'color':
                this.colorMap.set(member, [member.clone(), to instanceof S2Color ? to.clone() : member.clone()]);
                break;
            default:
                throw new Error('Unsupported member type');
        }
        return this;
    }
    saveLength(member: S2Length, to?: S2Length): this {
        this.lengthMap.set(member, [member.clone(), to?.clone() ?? member.clone()]);
        return this;
    }
    saveExtents(member: S2Extents, to?: S2Extents): this {
        this.extentsMap.set(member, [member.clone(), to?.clone() ?? member.clone()]);
        return this;
    }
    // saveNumber(member: number, to?: number): this {
    //     this.extentsMap.set(member, [member.clone(), to?.clone() ?? member.clone()]);
    //     return this;
    // }
    // saveNumber<O extends object, K extends keyof O>(object: O, key: K & O[K] extends number): this {
    //     // ici object[key] est garanti number
    //     const value: number = object[key]; // type-safe
    //     return this;
    // }
    saveNumber(member: S2Number, to?: S2Number): this {
        this.numberMap.set(member, [member.clone(), to?.clone() ?? member.clone()]);
        return this;
    }

    finalize(): this {
        for (const [member, values] of this.colorMap) {
            values[1].copy(member);
        }
        return this;
    }

    protected onUpdate(): void {
        super.onUpdate();

        for (const [member, values] of this.colorMap) {
            member.copy(S2Color.lerp(values[0], values[1], this.getLoopProgression()));
        }
        for (const target of this.targets) {
            target.update();
        }
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
    public animation: S2Animation;
    public range: [number, number];

    constructor(animation: S2Animation, t0: number, t1: number) {
        this.animation = animation;
        this.range = [t0, t1];
    }
}
export class S2TimelineAnim extends S2AnimationNEW {
    protected parts: S2TimelinePart[] = [];
    protected animations: S2AnimationNEW[] = [];
    // beginToAnim
    // EndToAnim
    // Eventuellement des tableaux de parts

    constructor(scene: S2BaseScene) {
        super(scene);
    }

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
