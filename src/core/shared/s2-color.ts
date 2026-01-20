import type { S2HasClone, S2HasCopy, S2HasLerp } from './s2-base-type';
import type { S2ColorTheme } from './s2-color-theme';
import { S2BaseType } from './s2-base-type';
import { S2MathUtils } from '../math/s2-math-utils';

export class S2Color extends S2BaseType implements S2HasClone<S2Color>, S2HasCopy<S2Color>, S2HasLerp<S2Color> {
    readonly kind = 'color' as const;
    public r: number;
    public g: number;
    public b: number;
    public a: number = 1.0;

    constructor(r: number = 0, g: number = 0, b: number = 0, locked: boolean = false) {
        super();
        this.r = S2Color.sRGB255ToLinear(r);
        this.g = S2Color.sRGB255ToLinear(g);
        this.b = S2Color.sRGB255ToLinear(b);
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
        color.r = this.r;
        color.g = this.g;
        color.b = this.b;
        color.a = this.a;
        color.locked = this.locked;
        return color;
    }

    copyIfUnlocked(color: S2Color): this {
        if (this.locked) return this;
        return this.copy(color);
    }

    copy(color: S2Color): this {
        if (this.r === color.r && this.g === color.g && this.b === color.b) return this;
        this.r = color.r;
        this.g = color.g;
        this.b = color.b;
        this.a = color.a;
        this.markDirty();
        return this;
    }

    lerp(state0: S2Color, state1: S2Color, t: number): this {
        const r = S2MathUtils.lerp(state0.r, state1.r, t);
        const g = S2MathUtils.lerp(state0.g, state1.g, t);
        const b = S2MathUtils.lerp(state0.b, state1.b, t);
        const a = S2MathUtils.lerp(state0.a, state1.a, t);
        this.set(r, g, b, a);
        return this;
    }

    static lerp(color0: S2Color, color1: S2Color, t: number): S2Color {
        return new S2Color().lerp(color0, color1, t);
    }

    set(r: number, g: number, b: number, a: number): this {
        if (this.r === r && this.g === g && this.b === b && this.a === a) return this;
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
        this.markDirty();
        return this;
    }

    setFromHex(hex: string): this {
        if (/^#([0-9A-Fa-f]{6})$/.test(hex)) {
            const num = parseInt(hex.substring(1), 16);
            this.r = S2Color.sRGB255ToLinear((num >> 16) & 0xff);
            this.g = S2Color.sRGB255ToLinear((num >> 8) & 0xff);
            this.b = S2Color.sRGB255ToLinear(num & 0xff);
            this.a = 1.0;
        } else if (/^#([0-9A-Fa-f]{8})$/.test(hex)) {
            const num = parseInt(hex.substring(1), 16);
            this.r = S2Color.sRGB255ToLinear((num >> 24) & 0xff);
            this.g = S2Color.sRGB255ToLinear((num >> 16) & 0xff);
            this.b = S2Color.sRGB255ToLinear((num >> 8) & 0xff);
            this.a = S2Color.sRGB255ToLinear(num & 0xff);
        } else {
            throw new Error(`Invalid hex color: ${hex}`);
        }
        this.markDirty();
        return this;
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
        return `#${c(this.r)}${c(this.g)}${c(this.b)}`;
    }

    get(): { r: number; g: number; b: number; a: number } {
        const c = (x: number) => S2Color.linearToSRGB255(x);
        return { r: c(this.r), g: c(this.g), b: c(this.b), a: c(this.a) };
    }
}
