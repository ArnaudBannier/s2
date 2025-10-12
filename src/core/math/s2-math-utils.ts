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

    static mod(x: number, n: number): number {
        return ((x % n) + n) % n;
    }

    static damp(x: number, y: number, lambda: number, dt: number): number {
        return S2MathUtils.lerp(x, y, 1 - Math.exp(-lambda * dt));
    }

    static snap(value: number, step: number): number {
        if (step === 0) return value;
        return Math.round(value / step) * step;
    }

    static snapToArray(value: number, array: number[]): number {
        if (array.length === 0) return value;
        return array.reduce((closest, currValue) =>
            Math.abs(currValue - value) < Math.abs(closest - value) ? currValue : closest,
        );
    }
}
