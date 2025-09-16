export type S2EaseType = (t: number) => number;
export type S2ParamEaseType = (param?: number) => S2EaseType;

// Linear easing function (t)
function easeLinear(t: number): number {
    return t;
}

// Quadratic easing functions (t^2)
function easeInQuad(t: number): number {
    return t * t;
}

function easeOutQuad(t: number): number {
    const s = 1 - t;
    return 1 - s * s;
}

function easeInOutQuad(t: number): number {
    if (t < 0.5) {
        return 2 * t * t;
    } else {
        const s = 1 - t;
        return 1 - 2 * s * s;
    }
}

// Cubic easing functions (t^3)
function easeInCubic(t: number): number {
    return t * t * t;
}

function easeOutCubic(t: number): number {
    const s = 1 - t;
    return 1 - s * s * s;
}

function easeInOutCubic(t: number): number {
    if (t < 0.5) {
        return 4 * t * t * t;
    } else {
        const s = 1 - t;
        return 1 - 2 * s * s * s;
    }
}

// Quartic easing functions (t^4)
function easeInQuart(t: number): number {
    return t * t * t * t;
}

function easeOutQuart(t: number): number {
    const s = 1 - t;
    return 1 - s * s * s * s;
}

function easeInOutQuart(t: number): number {
    if (t < 0.5) {
        return 8 * t * t * t * t;
    } else {
        const s = 1 - t;
        return 1 - 8 * s * s * s * s;
    }
}

// Sine easing functions
function easeInSine(t: number): number {
    return 1 - Math.cos(t * (Math.PI / 2));
}

function easeOutSine(t: number): number {
    return Math.sin(t * (Math.PI / 2));
}

function easeInOutSine(t: number): number {
    return 0.5 * (1 - Math.cos(Math.PI * t));
}

function easeSmoothStep(t: number): number {
    return t * t * (3 - 2 * t);
}

function easeSmootherStep(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
}

export const ease: Record<string, S2EaseType> = {
    linear: easeLinear,
    in: easeInQuad,
    inSine: easeInSine,
    inQuad: easeInQuad,
    inCubic: easeInCubic,
    inQuart: easeInQuart,
    out: easeOutQuad,
    outSine: easeOutSine,
    outQuad: easeOutQuad,
    outCubic: easeOutCubic,
    outQuart: easeOutQuart,
    inOut: easeInOutQuad,
    inOutSine: easeInOutSine,
    inOutQuad: easeInOutQuad,
    inOutCubic: easeInOutCubic,
    inOutQuart: easeInOutQuart,
    smoothStep: easeSmoothStep,
    smootherStep: easeSmootherStep,
} as const;

function easeInPower(power: number = 2): S2EaseType {
    return (t: number) => Math.pow(t, power);
}

function easeOutPower(power: number = 2): S2EaseType {
    return (t: number) => 1 - Math.pow(1 - t, power);
}

function easeInOutPower(power: number = 2): S2EaseType {
    return (t: number) => {
        if (t < 0.5) {
            return Math.pow(2 * t, power) / 2;
        } else {
            return 1 - Math.pow(2 * (1 - t), power) / 2;
        }
    };
}

function easeOutBack(overshoot: number = 1.70158): S2EaseType {
    return (t: number) => {
        const s = 1 - t;
        return 1 - (1 + overshoot) * s * s * s + overshoot * s * s;
    };
}

export const easeParam: Record<string, S2ParamEaseType> = {
    inPower: easeInPower,
    outPower: easeOutPower,
    inOutPower: easeInOutPower,
    outBack: easeOutBack,
} as const;

// const halfPI = PI / 2;
// const doublePI = PI * 2;
// /** @type {PowerEasing} */
// export const easeInPower = (p = 1.68) => t => pow(t, +p);

///** @type {Record<String, EasesFactory|EasingFunction>} */
// const easeInFunctions = {
//   [emptyString]: easeInPower,
//   Quad: easeInPower(2),
//   Cubic: easeInPower(3),
//   Quart: easeInPower(4),
//   Quint: easeInPower(5),
//   /** @type {EasingFunction} */
//   Sine: t => 1 - cos(t * halfPI),
//   /** @type {EasingFunction} */
//   Circ: t => 1 - sqrt(1 - t * t),
//   /** @type {EasingFunction} */
//   Expo: t => t ? pow(2, 10 * t - 10) : 0,
//   /** @type {EasingFunction} */
//   Bounce: t => {
//     let pow2, b = 4;
//     while (t < ((pow2 = pow(2, --b)) - 1) / 11);
//     return 1 / pow(4, 3 - b) - 7.5625 * pow((pow2 * 3 - 2) / 22 - t, 2);
//   },
//   /** @type {BackEasing} */
//   Back: (overshoot = 1.70158) => t => (+overshoot + 1) * t * t * t - +overshoot * t * t,
//   /** @type {ElasticEasing} */
//   Elastic: (amplitude = 1, period = .3) => {
//     const a = clamp(+amplitude, 1, 10);
//     const p = clamp(+period, minValue, 2);
//     const s = (p / doublePI) * asin(1 / a);
//     const e = doublePI / p;
//     return t => t === 0 || t === 1 ? t : -a * pow(2, -10 * (1 - t)) * sin(((1 - t) - s) * e);
//   }
// }

// /**
//  * @callback EaseType
//  * @param {EasingFunction} Ease
//  * @return {EasingFunction}
//  */

// /** @type {Record<String, EaseType>} */
// export const easeTypes = {
//   in: easeIn => t => easeIn(t),
//   out: easeIn => t => 1 - easeIn(1 - t),
//   inOut: easeIn => t => t < .5 ? easeIn(t * 2) / 2 : 1 - easeIn(t * -2 + 2) / 2,
//   outIn: easeIn => t => t < .5 ? (1 - easeIn(1 - t * 2)) / 2 : (easeIn(t * 2 - 1) + 1) / 2,
// }
