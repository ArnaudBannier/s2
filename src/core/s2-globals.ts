import type { S2Camera } from './math/s2-camera';
import { S2Vec2 } from './math/s2-vec2';
import { type S2Space, S2Position, S2Extents } from './math/s2-space';
import { lerp } from './math/s2-utils';

export const svgNS = 'http://www.w3.org/2000/svg';
export type S2SVGAttributes = Record<string, string>;

export class S2Color {
    r: number;
    g: number;
    b: number;

    static fromHex(hex: string): S2Color {
        const color = new S2Color();
        const num = parseInt(hex.substring(1), 16);
        color.r = (num >> 16) & 0xff;
        color.g = (num >> 8) & 0xff;
        color.b = num & 0xff;
        return color;
    }

    constructor(r: number = 0, g: number = 0, b: number = 0) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    clone(): S2Color {
        return new S2Color(this.r, this.g, this.b);
    }

    copy(color?: S2Color): this {
        if (!color) return this;
        this.r = color.r;
        this.g = color.g;
        this.b = color.b;
        return this;
    }

    toHex(): string {
        return '#' + [this.r, this.g, this.b].map((c) => c.toString(16).padStart(2, '0')).join('');
    }

    toRgb(): string {
        return `rgb(${Math.floor(this.r)}, ${Math.floor(this.g)}, ${Math.floor(this.b)})`;
    }

    static lerp(color0: S2Color, color1: S2Color, t: number): S2Color {
        const r = lerp(color0.r, color1.r, t);
        const g = lerp(color0.g, color1.g, t);
        const b = lerp(color0.b, color1.b, t);
        return new S2Color(r, g, b);
    }
}

export type S2LineCap = 'butt' | 'round' | 'square';
export type S2LineJoin = 'miter' | 'round' | 'bevel';

export type S2Anchor =
    | 'north west'
    | 'north'
    | 'north east'
    | 'west'
    | 'center'
    | 'east'
    | 'south west'
    | 'south'
    | 'south east';

export class S2AnchorUtils {
    static getCenter(
        anchor: S2Anchor,
        space: S2Space,
        camera: S2Camera,
        position: S2Position,
        extents: S2Extents,
    ): S2Vec2 {
        const sign = space === 'world' ? +1 : -1;
        const center = position.toSpace(space, camera);
        const ext = extents.toSpace(space, camera);
        switch (anchor) {
            case 'north west':
                center.shiftY(-sign * ext.y).shiftX(+ext.x);
                break;
            case 'north':
                center.shiftY(-sign * ext.y);
                break;
            case 'north east':
                center.shiftY(-sign * ext.y).shiftX(-ext.x);
                break;
            case 'west':
                center.shiftX(+ext.x);
                break;
            case 'center':
                break;
            case 'east':
                center.shiftX(-ext.x);
                break;
            case 'south west':
                center.shiftY(+sign * ext.y).shiftX(+ext.x);
                break;
            case 'south':
                center.shiftY(+sign * ext.y);
                break;
            case 'south east':
                center.shiftY(+sign * ext.y).shiftX(-ext.x);
                break;
        }
        return center;
    }

    static getNorthWest(anchor: S2Anchor, space: S2Space, position: S2Vec2, extents: S2Vec2): S2Vec2 {
        const sign = space === 'world' ? +1 : -1;
        const nw = position.clone();
        switch (anchor) {
            case 'north west':
                break;
            case 'north':
                nw.shiftX(-extents.x);
                break;
            case 'north east':
                nw.shiftX(-2 * extents.x);
                break;
            case 'west':
                nw.shiftY(sign * extents.y);
                break;
            case 'center':
                nw.shiftY(sign * extents.y).shiftX(-extents.x);
                break;
            case 'east':
                nw.shiftY(sign * extents.y).shiftX(-2 * extents.x);
                break;
            case 'south west':
                nw.shiftY(2 * sign * extents.y);
                break;
            case 'south':
                nw.shiftY(2 * sign * extents.y).shiftX(-extents.x);
                break;
            case 'south east':
                nw.shiftY(2 * sign * extents.y).shiftX(-2 * extents.x);
                break;
        }
        return nw;
    }
}

export class FlexUtils {
    static computeSizes(
        itemSizes: Array<number>,
        grows: Array<number>,
        desiredSize: number,
        padding: number,
        itemSep: number,
    ): number {
        const growSum = grows.reduce((accu, x) => accu + x, 0);
        const fixedSep = 2 * padding + itemSep * Math.max(itemSizes.length - 1, 0);
        const unit = Math.max(
            (desiredSize - fixedSep) / growSum,
            itemSizes.map((x, i) => x / grows[i]).reduce((accu, x) => Math.max(accu, x), 0),
        );
        for (let i = 0; i < itemSizes.length; i++) {
            itemSizes[i] = grows[i] * unit;
        }
        return unit * growSum + fixedSep;
    }
}
