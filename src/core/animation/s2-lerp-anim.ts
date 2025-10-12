import type { S2BaseScene } from '../scene/s2-base-scene';
import type { S2HasClone, S2HasCopy, S2HasLerp, S2HasLerpWithCamera } from '../shared/s2-base-type';
import type { S2Color } from '../shared/s2-color';
import type { S2Direction } from '../shared/s2-direction';
import type { S2Extents } from '../shared/s2-extents';
import type { S2Length } from '../shared/s2-length';
import type { S2Number } from '../shared/s2-number';
import type { S2Position } from '../shared/s2-position';
import type { S2AnimProperty } from './s2-base-animation';
import { S2BaseDurationAnimation } from './s2-base-duration-animation';

// Factory class
export class S2LerpAnimFactory {
    static create(scene: S2BaseScene, property: S2Number): S2LerpAnim;
    static create(scene: S2BaseScene, property: S2Color): S2LerpAnim;
    static create(scene: S2BaseScene, property: S2Position): S2LerpAnim;
    static create(scene: S2BaseScene, property: S2Direction): S2LerpAnim;
    static create(scene: S2BaseScene, property: S2Length): S2LerpAnim;
    static create(scene: S2BaseScene, property: S2Extents): S2LerpAnim;
    static create(
        scene: S2BaseScene,
        property: S2Number | S2Color | S2Position | S2Direction | S2Length | S2Extents,
    ): S2LerpAnim {
        switch (property.kind) {
            case 'number':
                return new S2BaseLerpAnim<S2Number>(scene, property as S2Number);
            case 'color':
                return new S2BaseLerpAnim<S2Color>(scene, property as S2Color);
            case 'position':
                return new S2BaseLerpAnimWithCamera<S2Position>(scene, property as S2Position);
            case 'direction':
                return new S2BaseLerpAnimWithCamera<S2Direction>(scene, property as S2Direction);
            case 'length':
                return new S2BaseLerpAnimWithCamera<S2Length>(scene, property as S2Length);
            case 'extents':
                return new S2BaseLerpAnimWithCamera<S2Extents>(scene, property as S2Extents);
            default:
                throw new Error('Unsupported property type');
        }
    }
}

export abstract class S2LerpAnim extends S2BaseDurationAnimation {
    abstract commitInitialState(): this;
    abstract commitFinalState(): this;
}

export class S2BaseLerpAnim<T extends S2AnimProperty & S2HasClone<T> & S2HasCopy<T> & S2HasLerp<T>> extends S2LerpAnim {
    protected property: T;
    protected state0: T;
    protected state1: T;

    constructor(scene: S2BaseScene, property: T) {
        super(scene);
        this.property = property;
        this.state0 = property.clone() as T;
        this.state1 = property.clone() as T;
        this.properties.add(property);
    }

    commitInitialState(): this {
        this.state0.copy(this.property);
        return this;
    }

    commitFinalState(): this {
        this.state1.copy(this.property);
        return this;
    }

    protected setElapsedPropertyImpl(property: S2AnimProperty): void {
        if (property !== this.property) return;
        this.property.lerp(this.state0, this.state1, this.wrapedCycleAlpha);
    }
}

export class S2BaseLerpAnimWithCamera<
    T extends S2AnimProperty & S2HasClone<T> & S2HasCopy<T> & S2HasLerpWithCamera<T>,
> extends S2LerpAnim {
    protected property: T;
    protected state0: T;
    protected state1: T;

    constructor(scene: S2BaseScene, property: T) {
        super(scene);
        this.property = property;
        this.state0 = property.clone() as T;
        this.state1 = property.clone() as T;
        this.properties.add(property);
    }

    commitInitialState(): this {
        this.state0.copy(this.property);
        return this;
    }

    commitFinalState(): this {
        this.state1.copy(this.property);
        return this;
    }

    protected setElapsedPropertyImpl(property: S2AnimProperty): void {
        if (property !== this.property) return;
        this.property.lerp(this.state0, this.state1, this.wrapedCycleAlpha, this.scene.getActiveCamera());
    }
}

export class S2LerpAnimNumber extends S2BaseLerpAnim<S2Number> {}
export class S2LerpAnimColor extends S2BaseLerpAnim<S2Color> {}
export class S2LerpAnimPosition extends S2BaseLerpAnimWithCamera<S2Position> {}
export class S2LerpAnimDirection extends S2BaseLerpAnimWithCamera<S2Direction> {}
export class S2LerpAnimLength extends S2BaseLerpAnimWithCamera<S2Length> {}
export class S2LerpAnimExtents extends S2BaseLerpAnimWithCamera<S2Extents> {}
