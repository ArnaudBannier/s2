import { S2MathUtils } from '../math/s2-utils';
import { S2BaseType, type S2HasClone, type S2HasCopy, type S2HasLerp } from './s2-base-type';

export class S2Color extends S2BaseType implements S2HasClone<S2Color>, S2HasCopy<S2Color>, S2HasLerp<S2Color> {
    readonly kind = 'color' as const;
    public r: number;
    public g: number;
    public b: number;

    constructor(r: number = 0, g: number = 0, b: number = 0, locked: boolean = false) {
        super();
        this.r = r;
        this.g = g;
        this.b = b;
        this.locked = locked;
    }

    clone(): S2Color {
        return new S2Color(this.r, this.g, this.b, this.locked);
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
        this.markDirty();
        return this;
    }

    lerp(state0: S2Color, state1: S2Color, t: number): this {
        const value0 = state0.get();
        const value1 = state1.get();
        const r = S2MathUtils.lerp(value0.r, value1.r, t);
        const g = S2MathUtils.lerp(value0.g, value1.g, t);
        const b = S2MathUtils.lerp(value0.b, value1.b, t);
        this.set(r, g, b);
        return this;
    }

    static lerp(color0: S2Color, color1: S2Color, t: number): S2Color {
        return new S2Color().lerp(color0, color1, t);
    }

    set(r: number, g: number, b: number): this {
        if (this.r === r && this.g === g && this.b === b) return this;
        this.r = r;
        this.g = g;
        this.b = b;
        this.markDirty();
        return this;
    }

    setFromHex(hex: string): this {
        if (!/^#([0-9A-Fa-f]{6})$/.test(hex)) {
            throw new Error(`Invalid hex color: ${hex}`);
        }
        const num = parseInt(hex.substring(1), 16);
        this.r = (num >> 16) & 0xff;
        this.g = (num >> 8) & 0xff;
        this.b = num & 0xff;
        this.markDirty();
        return this;
    }

    static fromHex(hex: string): S2Color {
        return new S2Color().setFromHex(hex);
    }

    toHex(): string {
        return '#' + [this.r, this.g, this.b].map((c) => c.toString(16).padStart(2, '0')).join('');
    }

    toRgb(): string {
        return `rgb(${Math.floor(this.r)}, ${Math.floor(this.g)}, ${Math.floor(this.b)})`;
    }

    get(): { r: number; g: number; b: number } {
        return { r: this.r, g: this.g, b: this.b };
    }
}
