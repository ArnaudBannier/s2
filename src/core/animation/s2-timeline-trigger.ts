export class S2TimelineTrigger {
    protected triggerTime: number;

    constructor(triggerTime: number = 0) {
        this.triggerTime = triggerTime;
    }
    getTriggerTime(): number {
        return this.triggerTime;
    }

    setTriggerTime(triggerTime: number): this {
        this.triggerTime = triggerTime;
        return this;
    }

    onBeforeTrigger(): void {}
    onAfterTrigger(): void {}
}
