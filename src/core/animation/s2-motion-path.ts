import type { S2BaseScene } from '../scene/s2-base-scene';
import type { S2Space } from '../math/s2-camera';
import type { S2Offset } from '../shared/s2-offset';
import type { S2OldPoint } from '../shared/s2-point';
import type { S2AnimProperty } from './s2-base-animation';
import { S2BaseDurationAnimation } from './s2-base-duration-animation';
import { S2PolyCurve } from '../math/s2-curve';

export abstract class S2BaseMotionPath extends S2BaseDurationAnimation {
    protected space: S2Space;
    protected polyCurve: S2PolyCurve;
    constructor(scene: S2BaseScene) {
        super(scene);
        this.space = 'world';
        this.polyCurve = new S2PolyCurve();
    }

    getSpace(): S2Space {
        return this.space;
    }

    setSpace(space: S2Space): this {
        this.space = space;
        return this;
    }

    getCurve(): S2PolyCurve {
        return this.polyCurve;
    }
}

export class S2MotionPathPosition extends S2BaseMotionPath {
    protected property: S2OldPoint;

    constructor(scene: S2BaseScene, property: S2OldPoint) {
        super(scene);
        this.property = property;
        this.properties.add(property);
        this.space = property.space;
    }

    protected setElapsedPropertyImpl(property: S2AnimProperty): void {
        if (property !== this.property) return;
        const point = this.polyCurve.getPointAt(this.wrapedCycleAlpha);
        this.property.setV(point, this.space);
    }
}

export class S2MotionPathDirection extends S2BaseMotionPath {
    protected property: S2Offset;

    constructor(scene: S2BaseScene, property: S2Offset) {
        super(scene);
        this.property = property;
        this.properties.add(property);
        this.space = property.space;
    }

    protected setElapsedPropertyImpl(property: S2AnimProperty): void {
        if (property !== this.property) return;
        const point = this.polyCurve.getPointAt(this.wrapedCycleAlpha);
        this.property.setV(point, this.space);
    }
}
