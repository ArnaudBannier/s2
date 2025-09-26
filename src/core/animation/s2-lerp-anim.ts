import { S2BaseScene } from '../s2-base-scene';
import { S2Color, S2Extents, S2Length, S2Number, S2Position } from '../s2-types';
import { type S2AnimProperty } from './s2-base-animation';
import { S2BaseDurationAnimation } from './s2-base-duration-animation';

// Factory class
export class S2LerpAnimFactory {
    static create(scene: S2BaseScene, property: S2AnimProperty): S2LerpAnim {
        switch (property.kind) {
            case 'number':
                return new S2LerpAnimNumber(scene, property as S2Number);
            case 'color':
                return new S2LerpAnimColor(scene, property as S2Color);
            case 'position':
                return new S2LerpAnimPosition(scene, property as S2Position);
            case 'length':
                return new S2LerpAnimLength(scene, property as S2Length);
            case 'extents':
                return new S2LerpAnimExtents(scene, property as S2Extents);
            default:
                throw new Error('Unsupported property type');
        }
    }
}

export abstract class S2LerpAnim extends S2BaseDurationAnimation {
    abstract commitInitialState(): this;
    abstract commitFinalState(): this;
}

export class S2LerpAnimNumber extends S2LerpAnim {
    protected property: S2Number;
    protected state0: S2Number;
    protected state1: S2Number;

    constructor(scene: S2BaseScene, property: S2Number) {
        super(scene);
        this.property = property;
        this.state0 = property.clone();
        this.state1 = property.clone();
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
        const alpha = this.wrapedCycleAlpha;
        this.property.lerp(this.state0, this.state1, alpha);
    }
}

export class S2LerpAnimColor extends S2LerpAnim {
    protected property: S2Color;
    protected state0: S2Color;
    protected state1: S2Color;

    constructor(scene: S2BaseScene, property: S2Color) {
        super(scene);
        this.property = property;
        this.state0 = property.clone();
        this.state1 = property.clone();
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
        const alpha = this.wrapedCycleAlpha;
        this.property.lerp(this.state0, this.state1, alpha);
    }
}

export class S2LerpAnimLength extends S2LerpAnim {
    protected property: S2Length;
    protected state0: S2Length;
    protected state1: S2Length;

    constructor(scene: S2BaseScene, property: S2Length) {
        super(scene);
        this.property = property;
        this.state0 = property.clone();
        this.state1 = property.clone();
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
        const alpha = this.wrapedCycleAlpha;
        const camera = this.scene.getActiveCamera();
        this.property.lerp(this.state0, this.state1, alpha, camera);
    }
}

export class S2LerpAnimPosition extends S2LerpAnim {
    protected property: S2Position;
    protected state0: S2Position;
    protected state1: S2Position;

    constructor(scene: S2BaseScene, property: S2Position) {
        super(scene);
        this.property = property;
        this.state0 = property.clone();
        this.state1 = property.clone();
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
        const alpha = this.wrapedCycleAlpha;
        const camera = this.scene.getActiveCamera();
        this.property.lerp(this.state0, this.state1, alpha, camera);
    }
}

export class S2LerpAnimExtents extends S2LerpAnim {
    protected property: S2Extents;
    protected state0: S2Extents;
    protected state1: S2Extents;

    constructor(scene: S2BaseScene, property: S2Extents) {
        super(scene);
        this.property = property;
        this.state0 = property.clone();
        this.state1 = property.clone();
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
        const alpha = this.wrapedCycleAlpha;
        const camera = this.scene.getActiveCamera();
        this.property.lerp(this.state0, this.state1, alpha, camera);
    }
}
