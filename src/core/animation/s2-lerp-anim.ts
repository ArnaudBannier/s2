import { type S2BaseScene } from '../s2-base-scene';
import { S2Color, S2Extents, S2Length, S2Number, S2Position } from '../s2-types';
import { S2Animation } from './s2-animation';

type S2LerpableProperty<T> = { object: T; state0: T; state1: T };
type S2LerpablePropertyMap<T> = Map<T, S2LerpableProperty<T>>;
export class S2LerpAnim extends S2Animation {
    protected maps: {
        number: S2LerpablePropertyMap<S2Number>;
        color: S2LerpablePropertyMap<S2Color>;
        position: S2LerpablePropertyMap<S2Position>;
        length: S2LerpablePropertyMap<S2Length>;
        extents: S2LerpablePropertyMap<S2Extents>;
    };

    constructor(scene: S2BaseScene) {
        super(scene);
        this.maps = {
            number: new Map(),
            color: new Map(),
            position: new Map(),
            length: new Map(),
            extents: new Map(),
        };
    }

    bindNumber(property: S2Number, to?: S2Number): this {
        this.maps.number.set(property, {
            object: property,
            state0: property.clone(),
            state1: to !== undefined ? to.clone() : property.clone(),
        });
        return this;
    }

    bindColor(property: S2Color, to?: S2Color): this {
        this.maps.color.set(property, {
            object: property,
            state0: property.clone(),
            state1: to !== undefined ? to.clone() : property.clone(),
        });
        return this;
    }

    bindPosition(property: S2Position, to?: S2Position): this {
        this.maps.position.set(property, {
            object: property,
            state0: property.clone(),
            state1: to !== undefined ? to.clone() : property.clone(),
        });
        return this;
    }

    bindLength(property: S2Length, to?: S2Length): this {
        this.maps.length.set(property, {
            object: property,
            state0: property.clone(),
            state1: to !== undefined ? to.clone() : property.clone(),
        });
        return this;
    }

    bindExtents(property: S2Extents, to?: S2Extents): this {
        this.maps.extents.set(property, {
            object: property,
            state0: property.clone(),
            state1: to !== undefined ? to.clone() : property.clone(),
        });
        return this;
    }

    bind(property: S2Number, to?: S2Number): this;
    bind(property: S2Color, to?: S2Color): this;
    bind(property: S2Position, to?: S2Position): this;
    bind(property: S2Length, to?: S2Length): this;
    bind(property: S2Extents, to?: S2Extents): this;
    bind(
        property: S2Number | S2Color | S2Position | S2Length | S2Extents,
        to?: S2Number | S2Color | S2Position | S2Length | S2Extents,
    ): this {
        switch (property.kind) {
            case 'number':
                this.bindNumber(property, to as S2Number | undefined);
                break;
            case 'color':
                this.bindColor(property, to as S2Color | undefined);
                break;
            case 'position':
                this.bindPosition(property, to as S2Position | undefined);
                break;
            case 'length':
                this.bindLength(property, to as S2Length | undefined);
                break;
            case 'extents':
                this.bindExtents(property, to as S2Extents | undefined);
                break;
            default:
                throw new Error('Unsupported member type');
        }
        return this;
    }

    commitFinalStates(): this {
        for (const values of this.maps.number.values()) {
            values.state1.copy(values.object);
        }
        for (const values of this.maps.color.values()) {
            values.state1.copy(values.object);
        }
        for (const values of this.maps.position.values()) {
            values.state1.copy(values.object);
        }
        for (const values of this.maps.length.values()) {
            values.state1.copy(values.object);
        }
        for (const values of this.maps.extents.values()) {
            values.state1.copy(values.object);
        }
        return this;
    }

    refreshState(): this {
        return this;
    }

    protected setElapsedImpl(updateId?: number): void {
        void updateId;
        const alpha = this.wrapedCycleAlpha;
        const camera = this.scene.getActiveCamera();
        for (const values of this.maps.number.values()) {
            values.object.lerp(values.state0, values.state1, alpha);
        }
        for (const values of this.maps.color.values()) {
            values.object.lerp(values.state0, values.state1, alpha);
        }
        for (const values of this.maps.position.values()) {
            values.object.lerp(values.state0, values.state1, alpha, camera);
        }
        for (const values of this.maps.length.values()) {
            values.object.lerp(values.state0, values.state1, alpha, camera);
        }
        for (const values of this.maps.extents.values()) {
            values.object.lerp(values.state0, values.state1, alpha, camera);
        }
    }

    protected applyInitialStateImpl(): void {
        for (const values of this.maps.number.values()) {
            values.object.copy(values.state0);
        }
        for (const values of this.maps.color.values()) {
            values.object.copy(values.state0);
        }
        for (const values of this.maps.position.values()) {
            values.object.copy(values.state0);
        }
        for (const values of this.maps.length.values()) {
            values.object.copy(values.state0);
        }
        for (const values of this.maps.extents.values()) {
            values.object.copy(values.state0);
        }
    }

    protected applyFinalStateImpl(): void {
        for (const values of this.maps.number.values()) {
            values.object.copy(values.state1);
        }
        for (const values of this.maps.color.values()) {
            values.object.copy(values.state1);
        }
        for (const values of this.maps.position.values()) {
            values.object.copy(values.state1);
        }
        for (const values of this.maps.length.values()) {
            values.object.copy(values.state1);
        }
        for (const values of this.maps.extents.values()) {
            values.object.copy(values.state1);
        }
    }
}
