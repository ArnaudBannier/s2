import type { S2BaseScene } from '../scene/s2-base-scene';
import { S2Color, S2Extents, S2Length, S2Number, S2Position } from '../shared/s2-types';
import { S2BaseAnimation, type S2AnimProperty } from './s2-base-animation';
import type { S2EaseType } from './s2-easing';
import { S2LerpAnim, S2LerpAnimFactory } from './s2-lerp-anim';

export class S2AnimGroup extends S2BaseAnimation {
    protected animations: S2BaseAnimation[];
    protected propertyToAnimation: Map<S2AnimProperty, S2BaseAnimation>;

    constructor(scene: S2BaseScene) {
        super(scene);
        this.animations = [];
        this.propertyToAnimation = new Map();
    }

    addAnimation(animation: S2BaseAnimation): this {
        this.animations.push(animation);
        for (const property of animation.getProperties()) {
            this.properties.add(property);
            this.propertyToAnimation.set(property, animation);
        }
        this.cycleDuration = Math.max(this.cycleDuration, animation.getDuration());
        this.updateRawDuration();
        return this;
    }

    addAnimations(...animations: S2BaseAnimation[]): this {
        for (const animation of animations) {
            this.addAnimation(animation);
        }
        return this;
    }

    addLerpProperties(properties: S2AnimProperty[], duration: number, easing: S2EaseType): this {
        for (const property of properties) {
            if (property instanceof S2Number) {
                this.addAnimation(
                    S2LerpAnimFactory.create(this.scene, property).setCycleDuration(duration).setEasing(easing),
                );
            } else if (property instanceof S2Color) {
                this.addAnimation(
                    S2LerpAnimFactory.create(this.scene, property).setCycleDuration(duration).setEasing(easing),
                );
            } else if (property instanceof S2Position) {
                this.addAnimation(
                    S2LerpAnimFactory.create(this.scene, property).setCycleDuration(duration).setEasing(easing),
                );
            } else if (property instanceof S2Length) {
                this.addAnimation(
                    S2LerpAnimFactory.create(this.scene, property).setCycleDuration(duration).setEasing(easing),
                );
            } else if (property instanceof S2Extents) {
                this.addAnimation(
                    S2LerpAnimFactory.create(this.scene, property).setCycleDuration(duration).setEasing(easing),
                );
            }
        }
        return this;
    }

    commitLerpInitialStates(): this {
        for (const animation of this.animations) {
            if (animation instanceof S2LerpAnim) {
                animation.commitInitialState();
            }
        }
        return this;
    }

    commitLerpFinalStates(): this {
        for (const animation of this.animations) {
            if (animation instanceof S2LerpAnim) {
                animation.commitFinalState();
            }
        }
        return this;
    }

    protected setElapsedPropertyImpl(property: S2AnimProperty): void {
        const animation = this.propertyToAnimation.get(property);
        animation?.setElapsedProperty(property, this.wrapedCycleElapsed);
    }
}
