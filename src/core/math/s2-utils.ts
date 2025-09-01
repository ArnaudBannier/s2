export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

export function lerp(x: number, y: number, t: number): number {
    return (1 - t) * x + t * y;
}

export function invLerp(x: number, y: number, value: number): number {
    if (x !== y) {
        return (value - x) / (y - x);
    } else {
        return 0;
    }
}

export function remap(origFrom: number, origTo: number, targetFrom: number, targetTo: number, value: number): number {
    return lerp(targetFrom, targetTo, invLerp(origFrom, origTo, value));
}

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
        return lerp(targetFrom, targetTo, invLerp(origFrom, origTo, value));
    }
}
