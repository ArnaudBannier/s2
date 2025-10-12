import type { S2BaseScene } from '../scene/s2-base-scene';
import type { S2Anchor, S2HorizontalAlign, S2TextAnchor, S2VerticalAlign } from '../shared/s2-globals';
import type { S2Enum } from '../shared/s2-enum';
import type { S2EaseType } from './s2-easing';
import type { S2Number } from '../shared/s2-number';
import type { S2Color } from '../shared/s2-color';
import type { S2Position } from '../shared/s2-position';
import type { S2Direction } from '../shared/s2-direction';
import type { S2Length } from '../shared/s2-length';
import type { S2Extents } from '../shared/s2-extents';
import type { S2Boolean } from '../shared/s2-boolean';
import type { S2String } from '../shared/s2-string';
import type { S2Space } from '../shared/s2-base-type';
import { S2MathUtils } from '../math/s2-math-utils';
import { ease } from './s2-easing';

export type S2AnimProperty =
    | S2Number
    | S2Color
    | S2Position
    | S2Direction
    | S2Length
    | S2Extents
    | S2Boolean
    | S2Enum<S2Space>
    | S2String
    | S2Enum<S2Anchor>
    | S2Enum<S2TextAnchor>
    | S2Enum<S2VerticalAlign>
    | S2Enum<S2HorizontalAlign>;

export abstract class S2BaseAnimation {
    protected scene: S2BaseScene;
    protected cycleIndex: number = 0;
    protected cycleCount: number = 1;
    protected cycleDuration: number = 0;
    protected rawCycleAlpha: number = 0;
    protected rawElapsed: number = 0;
    protected rawDuration: number = 0;
    protected wrapedCycleAlpha: number = 0;
    protected wrapedCycleElapsed: number = 0;
    protected ease: S2EaseType = ease.linear;
    protected reversed: boolean = false;
    protected alternate: boolean = false;
    protected properties: Set<S2AnimProperty>;

    constructor(scene: S2BaseScene) {
        this.scene = scene;
        this.properties = new Set();
    }

    getScene(): S2BaseScene {
        return this.scene;
    }

    getProperties(): Set<S2AnimProperty> {
        return this.properties;
    }

    getElapsed(): number {
        return this.rawElapsed;
    }

    getDuration(): number {
        return this.rawDuration;
    }

    getCycleDuration(): number {
        return this.cycleDuration;
    }

    getCycleIndex(): number {
        return this.cycleIndex;
    }

    getCycleCount(): number {
        return this.cycleCount;
    }

    setCycleCount(cycleCount: number): this {
        this.cycleCount = cycleCount;
        this.updateRawDuration();
        return this;
    }

    setEasing(ease: S2EaseType): this {
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

    setElapsed(elapsed: number): this {
        this.setRawElapsed(elapsed);
        for (const target of this.properties) {
            this.setElapsedPropertyImpl(target);
        }
        return this;
    }

    setElapsedProperty(property: S2AnimProperty, elapsed: number): this {
        this.setRawElapsed(elapsed);
        this.setElapsedPropertyImpl(property);
        return this;
    }

    protected abstract setElapsedPropertyImpl(property: S2AnimProperty): void;

    protected updateRawDuration(): void {
        this.rawDuration = this.cycleDuration * (this.cycleCount < 0 ? 1 : this.cycleCount);
    }

    private setRawElapsed(elapsed: number): void {
        if (this.rawElapsed === elapsed) return;
        this.rawElapsed = elapsed;
        this.cycleIndex = S2MathUtils.clamp(Math.floor(this.rawElapsed / this.cycleDuration), 0, this.cycleCount - 1);

        if (elapsed >= this.cycleCount * this.cycleDuration) {
            this.rawCycleAlpha = 1;
        } else {
            this.rawCycleAlpha = (this.rawElapsed % this.cycleDuration) / this.cycleDuration;
        }
        this.wrapedCycleAlpha = this.reversed ? 1 - this.rawCycleAlpha : this.rawCycleAlpha;
        if (this.alternate && this.cycleIndex % 2 === 1) this.wrapedCycleAlpha = 1 - this.wrapedCycleAlpha;
        this.wrapedCycleAlpha = this.ease(this.wrapedCycleAlpha);
        this.wrapedCycleElapsed = S2MathUtils.clamp(this.wrapedCycleAlpha, 0, 1) * this.cycleDuration;
    }
}
