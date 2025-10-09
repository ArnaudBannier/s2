export class S2MathUtils {
    static clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
    }

    static lerp(x: number, y: number, t: number): number {
        return (1 - t) * x + t * y;
    }

    static invLerp(x: number, y: number, value: number): number {
        if (x !== y) {
            return (value - x) / (y - x);
        } else {
            return 0;
        }
    }

    static remap(origFrom: number, origTo: number, targetFrom: number, targetTo: number, value: number): number {
        return S2MathUtils.lerp(targetFrom, targetTo, S2MathUtils.invLerp(origFrom, origTo, value));
    }
}
