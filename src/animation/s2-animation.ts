import { NewS2Element, S2Element, S2LayerData } from '../core/element/s2-element';
import { type S2BaseScene } from '../core/s2-interface';
import { lerp } from '../core/math/s2-utils';
import { S2Position, S2Length } from '../core/math/s2-space';
import { S2Color } from '../core/s2-globals';
import { S2Animatable } from '../core/s2-attributes';
import { easeIn, easeLinear, easeOut, type S2Easing } from './s2-easing';

// Créer deux catégories -> timeAnim eventAnim ?
// Comment gérer les smoothDamped ?

export class S2Timer {
    protected currentTime: number = 0;
    protected delta: number = 0;
    protected unscaledDelta: number = 0;
    protected scale: number = 1;
    protected maxDelta: number = 200;
    protected elapsed: number = 0;
    protected unscaledElapsed: number = 0;

    start(timestamp: number): this {
        this.currentTime = timestamp;
        this.delta = 0;
        return this;
    }

    update(timestamp: number): this {
        const delta = timestamp - this.currentTime;
        this.unscaledDelta = Math.min(delta, this.maxDelta);
        this.delta = this.unscaledDelta * this.scale;
        this.currentTime = timestamp;
        this.unscaledElapsed += this.unscaledDelta;
        this.elapsed += this.delta;
        return this;
    }

    setMaximumDeltaTime(maxDelta: number): this {
        this.maxDelta = maxDelta;
        return this;
    }

    setTimeScale(scale: number): this {
        this.scale = scale;
        return this;
    }

    getTimeScale(): number {
        return this.scale;
    }

    getDelta(): number {
        return this.delta;
    }

    getUnscaledDelta(): number {
        return this.unscaledDelta;
    }

    getElapsed(): number {
        return this.elapsed;
    }

    getUnscaledElapsed(): number {
        return this.unscaledElapsed;
    }
}

export class S2AnimationManager {
    protected static _instance: S2AnimationManager | null = null;
    protected timer: S2Timer;
    protected animations: S2AnimationNEW[];

    private constructor() {
        this.timer = new S2Timer();
        this.animations = [];
    }

    private firstFrame(timestamp: number): void {
        this.timer.start(timestamp);
    }

    static getInstance(): S2AnimationManager {
        if (!S2AnimationManager._instance) {
            const animManager = new S2AnimationManager();
            console.log(animManager.timer);
            requestAnimationFrame(animManager.firstFrame.bind(animManager));
            requestAnimationFrame(animManager.update.bind(animManager));
            S2AnimationManager._instance = animManager;
        }

        return S2AnimationManager._instance;
    }

    protected update(timestamp: number): void {
        this.timer.update(timestamp);
        const delta = this.timer.getDelta();
        for (const anim of this.animations) {
            anim.update(delta);
        }
        requestAnimationFrame(this.update.bind(this));
    }

    addAnimation(animation: S2AnimationNEW): this {
        this.animations.push(animation);
        return this;
    }
}

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
    protected onLoop(): void {
        console.log('loop');
    }
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

    setLoopProgression(t: number, loopIndex?: number): void {
        this.loopAccu = t * this.loopDuration;
        if (loopIndex !== undefined) this.loopIndex = loopIndex;
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

export class S2LerpAnim extends S2AnimationNEW {
    public color0: S2Color;
    public color1: S2Color;
    public target: NewS2Element<S2LayerData> | null = null;
    public member: S2Color | null = null;

    constructor(scene: S2BaseScene) {
        super(scene);
        this.color0 = new S2Color();
        this.color1 = new S2Color();
        //this.alternate = true;
        //this.reversed = true;
        //this.ease = easeOut;
    }

    protected onUpdate(): void {
        super.onUpdate();
        if (this.member !== null) {
            this.member.copy(S2Color.lerp(this.color0, this.color1, this.getLoopProgression()));
        }
        if (this.target !== null) {
            this.target.update();
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
