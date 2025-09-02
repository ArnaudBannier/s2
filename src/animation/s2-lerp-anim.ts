import { type S2BaseScene } from '../core/s2-interface';
import { S2Color, S2Extents, S2Length, S2Number, S2Position } from '../core/s2-types';
import { S2AnimationNEW } from './s2-animation';

type S2LerpableProperty<T> = { object: T; state0: T; state1: T };
type S2LerpablePropertyMap<T> = Map<T, S2LerpableProperty<T>>;
export class S2LerpAnim extends S2AnimationNEW {
    protected maps: {
        number: S2LerpablePropertyMap<S2Number>;
        position: S2LerpablePropertyMap<S2Position>;
        color: S2LerpablePropertyMap<S2Color>;
        length: S2LerpablePropertyMap<S2Length>;
        extents: S2LerpablePropertyMap<S2Extents>;
    };

    constructor(scene: S2BaseScene) {
        super(scene);
        this.maps = {
            number: new Map(),
            position: new Map(),
            color: new Map(),
            length: new Map(),
            extents: new Map(),
        };
    }

    bindNumber(property: S2Number, to?: S2Number): this {
        if (to instanceof S2Number) {
            this.maps.number.set(property, {
                object: property,
                state0: property.clone(),
                state1: to.clone(),
            });
            property.copy(to);
        } else {
            this.maps.number.set(property, {
                object: property,
                state0: property.clone(),
                state1: property.clone(),
            });
        }
        return this;
    }

    bind(property: S2Number, to?: S2Number): this;
    bind(property: S2Position, to?: S2Position): this;
    bind(property: S2Color, to?: S2Color): this;
    bind(property: S2Length, to?: S2Length): this;
    bind(property: S2Extents, to?: S2Extents): this;
    bind(
        property: S2Number | S2Position | S2Color | S2Length | S2Extents,
        to?: S2Number | S2Position | S2Color | S2Length | S2Extents,
    ): this {
        switch (property.kind) {
            case 'number':
                if (to instanceof S2Number) {
                    this.maps.number.set(property, {
                        object: property,
                        state0: property.clone(),
                        state1: to.clone(),
                    });
                    property.copy(to);
                } else {
                    this.maps.number.set(property, {
                        object: property,
                        state0: property.clone(),
                        state1: property.clone(),
                    });
                }
                break;
            case 'position':
                if (to instanceof S2Position) {
                    this.maps.position.set(property, {
                        object: property,
                        state0: property.clone(),
                        state1: to.clone(),
                    });
                    property.copy(to);
                } else {
                    this.maps.position.set(property, {
                        object: property,
                        state0: property.clone(),
                        state1: property.clone(),
                    });
                }
                break;
            case 'color':
                if (to instanceof S2Color) {
                    this.maps.color.set(property, {
                        object: property,
                        state0: property.clone(),
                        state1: to.clone(),
                    });
                    property.copy(to);
                } else {
                    this.maps.color.set(property, {
                        object: property,
                        state0: property.clone(),
                        state1: property.clone(),
                    });
                }
                break;
            case 'length':
                if (to instanceof S2Length) {
                    this.maps.length.set(property, {
                        object: property,
                        state0: property.clone(),
                        state1: to.clone(),
                    });
                    property.copy(to);
                } else {
                    this.maps.length.set(property, {
                        object: property,
                        state0: property.clone(),
                        state1: property.clone(),
                    });
                }
                break;
            case 'extents':
                if (to instanceof S2Extents) {
                    this.maps.extents.set(property, {
                        object: property,
                        state0: property.clone(),
                        state1: to.clone(),
                    });
                    property.copy(to);
                } else {
                    this.maps.extents.set(property, {
                        object: property,
                        state0: property.clone(),
                        state1: property.clone(),
                    });
                }
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
        for (const values of this.maps.position.values()) {
            values.state1.copy(values.object);
        }
        for (const values of this.maps.color.values()) {
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

    protected onUpdate(): void {
        super.onUpdate();

        const t = this.getLoopProgression();
        for (const values of this.maps.number.values()) {
            values.object.lerp(values.state0, values.state1, t);
        }
        for (const values of this.maps.position.values()) {
            values.object.lerp(values.state0, values.state1, t);
        }
        for (const values of this.maps.color.values()) {
            values.object.lerp(values.state0, values.state1, t);
        }
        for (const values of this.maps.length.values()) {
            values.object.lerp(values.state0, values.state1, t);
        }
        for (const values of this.maps.extents.values()) {
            values.object.lerp(values.state0, values.state1, t);
        }
    }
}
