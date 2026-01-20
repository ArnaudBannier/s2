export type S2ColorName = string;
export type S2ColorScale = number;
export type S2HexColor = `#${string}`;
export type S2Palette = Record<S2ColorName, Record<S2ColorScale, S2HexColor>>;

export class S2ColorTheme {
    protected readonly palette: S2Palette;

    constructor(palette: S2Palette) {
        this.palette = palette;
    }

    color(name: S2ColorName, scale: S2ColorScale): S2HexColor {
        const color = this.palette[name]?.[scale];
        if (!color) {
            throw new Error(`Color not found: ${name} / ${scale}`);
        }
        return color;
    }
}
