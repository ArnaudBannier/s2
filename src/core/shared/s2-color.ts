import type { S2HasClone, S2HasCopy, S2HasLerp } from './s2-base-type';
import type { S2ColorTheme } from './s2-color-theme';
import { S2BaseType } from './s2-base-type';
import { S2MathUtils } from '../math/s2-math-utils';

export class S2Color extends S2BaseType implements S2HasClone<S2Color>, S2HasCopy<S2Color>, S2HasLerp<S2Color> {
    readonly kind = 'color' as const;
    public linearR: number;
    public linearG: number;
    public linearB: number;
    public linearA: number;

    constructor(r: number = 0, g: number = 0, b: number = 0, locked: boolean = false) {
        super();
        this.linearR = S2Color.sRGB255ToLinear(r);
        this.linearG = S2Color.sRGB255ToLinear(g);
        this.linearB = S2Color.sRGB255ToLinear(b);
        this.linearA = 1.0;
        this.locked = locked;
    }

    static sRGBToLinear(c: number): number {
        if (c <= 0.04045) {
            c = c * 0.0773993808;
        } else {
            c = Math.pow(c * 0.9478672986 + 0.0521327014, 2.4);
        }
        return S2MathUtils.clamp01(c);
    }

    static linearToSRGB(c: number): number {
        if (c <= 0.0031308) {
            c = c * 12.92;
        } else {
            c = 1.055 * Math.pow(c, 0.41666) - 0.055;
        }
        return S2MathUtils.clamp01(c);
    }

    static sRGB255ToLinear(c: number): number {
        return S2Color.sRGBToLinear(c / 255);
    }

    static linearToSRGB255(c: number): number {
        return Math.round(S2Color.linearToSRGB(c) * 255);
    }

    clone(): S2Color {
        const color = new S2Color();
        color.linearR = this.linearR;
        color.linearG = this.linearG;
        color.linearB = this.linearB;
        color.linearA = this.linearA;
        color.locked = this.locked;
        return color;
    }

    copyIfUnlocked(color: S2Color): this {
        if (this.locked) return this;
        return this.copy(color);
    }

    copy(color: S2Color): this {
        if (this.linearR === color.linearR && this.linearG === color.linearG && this.linearB === color.linearB)
            return this;
        this.linearR = color.linearR;
        this.linearG = color.linearG;
        this.linearB = color.linearB;
        this.linearA = color.linearA;
        this.markDirty();
        return this;
    }

    lerp(state0: S2Color, state1: S2Color, t: number): this {
        const r = S2MathUtils.lerp(state0.linearR, state1.linearR, t);
        const g = S2MathUtils.lerp(state0.linearG, state1.linearG, t);
        const b = S2MathUtils.lerp(state0.linearB, state1.linearB, t);
        const a = S2MathUtils.lerp(state0.linearA, state1.linearA, t);
        this.set(r, g, b, a);
        return this;
    }

    static lerp(color0: S2Color, color1: S2Color, t: number): S2Color {
        return new S2Color().lerp(color0, color1, t);
    }

    set(linearR: number, linearG: number, linearB: number, linearA: number): this {
        if (
            this.linearR === linearR &&
            this.linearG === linearG &&
            this.linearB === linearB &&
            this.linearA === linearA
        )
            return this;
        this.linearR = linearR;
        this.linearG = linearG;
        this.linearB = linearB;
        this.linearA = linearA;
        this.markDirty();
        return this;
    }

    setFromHex(hex: string): this {
        let linearR = 0;
        let linearG = 0;
        let linearB = 0;
        let linearA = 1.0;

        if (/^#([0-9A-Fa-f]{6})$/.test(hex)) {
            const num = parseInt(hex.substring(1), 16);
            linearR = S2Color.sRGB255ToLinear((num >> 16) & 0xff);
            linearG = S2Color.sRGB255ToLinear((num >> 8) & 0xff);
            linearB = S2Color.sRGB255ToLinear(num & 0xff);
        } else if (/^#([0-9A-Fa-f]{8})$/.test(hex)) {
            const num = parseInt(hex.substring(1), 16);
            linearR = S2Color.sRGB255ToLinear((num >> 24) & 0xff);
            linearG = S2Color.sRGB255ToLinear((num >> 16) & 0xff);
            linearB = S2Color.sRGB255ToLinear((num >> 8) & 0xff);
            linearA = S2Color.sRGB255ToLinear(num & 0xff);
        } else {
            throw new Error(`Invalid hex color: ${hex}`);
        }
        return this.set(linearR, linearG, linearB, linearA);
    }

    static fromHex(hex: string): S2Color {
        return new S2Color().setFromHex(hex);
    }

    setFromTheme(colorTheme: S2ColorTheme, name: string, scale: number): this {
        return this.setFromHex(colorTheme.color(name, scale));
    }

    static fromTheme(colorTheme: S2ColorTheme, name: string, scale: number): S2Color {
        return new S2Color().setFromTheme(colorTheme, name, scale);
    }

    toString(): string {
        const c = (x: number) => S2Color.linearToSRGB255(x).toString(16).padStart(2, '0');
        return `#${c(this.linearR)}${c(this.linearG)}${c(this.linearB)}${c(this.linearA)}`;
    }

    get(): { r: number; g: number; b: number; a: number } {
        const c = (x: number) => S2Color.linearToSRGB255(x);
        return { r: c(this.linearR), g: c(this.linearG), b: c(this.linearB), a: c(this.linearA) };
    }
}
