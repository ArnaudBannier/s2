import type { S2Space } from '../math/s2-space';
import type { S2Vec2 } from '../math/s2-vec2';
import type { S2BaseScene } from '../scene/s2-base-scene';
import type { S2Color } from '../shared/s2-color';
import type { S2ColorTheme } from '../shared/s2-color-theme';
import type { S2Extents } from '../shared/s2-extents';
import type { S2Point } from '../shared/s2-point';
import type { S2BaseAnimation } from './s2-base-animation';
import { S2BaseDurationAnimation } from './s2-base-duration-animation';
import type { S2EaseType } from './s2-easing';
import { ease } from './s2-easing';
import { S2LerpAnim, S2LerpAnimFactory } from './s2-lerp-anim';
import { S2Playable } from './s2-playable';

export abstract class S2Animatable<Anim extends S2BaseAnimation = S2BaseAnimation> {
    protected scene: S2BaseScene;
    protected animation: Anim;
    protected readonly playable: S2Playable;

    constructor(scene: S2BaseScene, animation: Anim) {
        this.scene = scene;
        this.animation = animation;
        this.playable = new S2Playable(this.animation);

        this.setDuration(500);
        this.animation.setEasing(ease.outExpo);
    }

    setDuration(duration: number): this {
        if (this.animation instanceof S2BaseDurationAnimation) {
            this.animation.setCycleDuration(duration);
        }
        return this;
    }

    setEasing(ease: S2EaseType): this {
        this.animation.setEasing(ease);
        return this;
    }
}

export class S2AnimatablePoint extends S2Animatable<S2LerpAnim> {
    public readonly point: S2Point;

    constructor(scene: S2BaseScene, point: S2Point) {
        const animation = S2LerpAnimFactory.create(scene, point);
        super(scene, animation);
        this.point = point;
    }

    set(x: number = 0, y: number = 0, space?: S2Space): this {
        this.animation.commitInitialState();
        this.point.set(x, y, space);
        this.animation.commitFinalState();
        this.playable.setRange(0, this.animation.getDuration());
        this.playable.play();
        return this;
    }

    setV(v: S2Vec2, space?: S2Space): this {
        return this.set(v.x, v.y, space);
    }
}

export class S2AnimatableColor extends S2Animatable<S2LerpAnim> {
    public readonly color: S2Color;

    constructor(scene: S2BaseScene, color: S2Color) {
        const lerpAnim = S2LerpAnimFactory.create(scene, color);
        super(scene, lerpAnim);
        this.color = color;
    }

    copyFrom(color: S2Color): this {
        this.animation.commitInitialState();
        this.color.copy(color);
        if (this.color.isDirty() === false) {
            return this;
        }
        this.animation.commitFinalState();
        this.playable.setRange(0, this.animation.getDuration());
        this.playable.play();
        return this;
    }

    setFromTheme(colorTheme: S2ColorTheme, name: string, scale: number): this {
        this.animation.commitInitialState();
        this.color.setFromTheme(colorTheme, name, scale);
        if (this.color.isDirty() === false) {
            return this;
        }
        this.animation.commitFinalState();
        this.playable.setRange(0, this.animation.getDuration());
        this.playable.play();
        return this;
    }
}

export class S2AnimatableExtents extends S2Animatable<S2LerpAnim> {
    public readonly extents: S2Extents;

    constructor(scene: S2BaseScene, extents: S2Extents) {
        const lerpAnim = S2LerpAnimFactory.create(scene, extents);
        super(scene, lerpAnim);
        this.extents = extents;
    }

    copyFrom(extents: S2Extents): this {
        this.animation.commitInitialState();
        this.extents.copy(extents);
        if (this.extents.isDirty() === false) {
            return this;
        }
        this.animation.commitFinalState();
        this.playable.setRange(0, this.animation.getDuration());
        this.playable.play();
        return this;
    }
}
