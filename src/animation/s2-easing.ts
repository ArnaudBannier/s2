export type S2EaseType = (t: number) => number;

export function easeLinear(t: number): number {
    return t;
}

export function easeIn(t: number): number {
    return t * t;
}

export function easeOut(t: number): number {
    const s = 1 - t;
    return 1 - s * s;
}

export function easeInOut(t: number): number {
    if (t < 0.5) {
        return 2 * t * t;
    } else {
        const s = 1 - t;
        return 1 - 2 * s * s;
    }
}

export function easeCos(t: number): number {
    return 0.5 * (1 - Math.cos(Math.PI * t));
}

// const halfPI = PI / 2;
// const doublePI = PI * 2;
// /** @type {PowerEasing} */
// export const easeInPower = (p = 1.68) => t => pow(t, +p);

// /** @type {Record<String, EasesFactory|EasingFunction>} */
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
