import { S2BaseAnimation } from './s2-base-animation';

export abstract class S2BaseDurationAnimation extends S2BaseAnimation {
    setCycleDuration(cycleDuration: number): this {
        this.cycleDuration = cycleDuration;
        this.updateRawDuration();
        return this;
    }
}
