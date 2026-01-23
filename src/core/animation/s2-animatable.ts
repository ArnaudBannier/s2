import type { S2Space } from '../math/s2-space';
import type { S2Vec2 } from '../math/s2-vec2';
import type { S2BaseScene } from '../scene/s2-base-scene';
import type { S2Color } from '../shared/s2-color';
import type { S2ColorTheme } from '../shared/s2-color-theme';
import type { S2Point } from '../shared/s2-point';
import type { S2EaseType } from './s2-easing';
import { ease } from './s2-easing';
import { S2LerpAnim, S2LerpAnimFactory } from './s2-lerp-anim';
import { S2Playable } from './s2-playable';

export abstract class S2Animatable {
    protected scene: S2BaseScene;
    protected readonly lerpAnim: S2LerpAnim;
    protected readonly playable: S2Playable;

    constructor(scene: S2BaseScene, lerpAnim: S2LerpAnim) {
        this.scene = scene;
        this.lerpAnim = lerpAnim;
        this.lerpAnim.setCycleDuration(500).setEasing(ease.outExpo);
        this.playable = new S2Playable(this.lerpAnim);
    }

    setDuration(duration: number): this {
        this.lerpAnim.setCycleDuration(duration);
        return this;
    }

    setEasing(ease: S2EaseType): this {
        this.lerpAnim.setEasing(ease);
        return this;
    }
}

export class S2AnimatablePoint extends S2Animatable {
    public readonly point: S2Point;

    constructor(scene: S2BaseScene, point: S2Point) {
        const lerpAnim = S2LerpAnimFactory.create(scene, point);
        super(scene, lerpAnim);
        this.point = point;
    }

    set(x: number = 0, y: number = 0, space?: S2Space): this {
        this.lerpAnim.commitInitialState();
        this.point.set(x, y, space);
        this.lerpAnim.commitFinalState();
        this.playable.setRange(0, this.lerpAnim.getDuration());
        this.playable.play();
        return this;
    }

    setV(v: S2Vec2, space?: S2Space): this {
        return this.set(v.x, v.y, space);
    }
}

export class S2AnimatableColor extends S2Animatable {
    public readonly color: S2Color;

    constructor(scene: S2BaseScene, color: S2Color) {
        const lerpAnim = S2LerpAnimFactory.create(scene, color);
        super(scene, lerpAnim);
        this.color = color;
    }

    copyFrom(color: S2Color): this {
        this.lerpAnim.commitInitialState();
        this.color.copy(color);
        if (this.color.isDirty() === false) {
            return this;
        }
        this.lerpAnim.commitFinalState();
        this.playable.setRange(0, this.lerpAnim.getDuration());
        this.playable.play();
        return this;
    }

    setFromTheme(colorTheme: S2ColorTheme, name: string, scale: number): this {
        this.lerpAnim.commitInitialState();
        this.color.setFromTheme(colorTheme, name, scale);
        if (this.color.isDirty() === false) {
            return this;
        }
        this.lerpAnim.commitFinalState();
        this.playable.setRange(0, this.lerpAnim.getDuration());
        this.playable.play();
        return this;
    }
}
