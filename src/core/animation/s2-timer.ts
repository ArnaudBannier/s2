export class S2Timer {
    protected currentTime: number = 0;
    protected delta: number = 0;
    protected unscaledDelta: number = 0;
    protected scale: number = 1;
    protected maxDelta: number = 200;
    protected elapsed: number = 0;
    protected unscaledElapsed: number = 0;

    start(timestamp: number): this {
        this.currentTime = timestamp;
        this.delta = 0;
        return this;
    }

    update(timestamp: number): this {
        const delta = timestamp - this.currentTime;
        this.unscaledDelta = Math.min(delta, this.maxDelta);
        this.delta = this.unscaledDelta * this.scale;
        this.currentTime = timestamp;
        this.unscaledElapsed += this.unscaledDelta;
        this.elapsed += this.delta;
        return this;
    }

    setMaximumDeltaTime(maxDelta: number): this {
        this.maxDelta = maxDelta;
        return this;
    }

    setTimeScale(scale: number): this {
        this.scale = scale;
        return this;
    }

    getTimeScale(): number {
        return this.scale;
    }

    getDelta(): number {
        return this.delta;
    }

    getUnscaledDelta(): number {
        return this.unscaledDelta;
    }

    getElapsed(): number {
        return this.elapsed;
    }

    getUnscaledElapsed(): number {
        return this.unscaledElapsed;
    }
}
