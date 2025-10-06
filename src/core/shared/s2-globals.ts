import type { S2ArrowTip } from '../element/s2-arrow-tip';
import type { S2Camera } from '../math/s2-camera';
import { S2Vec2 } from '../math/s2-vec2';
import { type S2Space } from './s2-base-type';
import type { S2Extents } from './s2-extents';
import type { S2Position } from './s2-position';

export const svgNS = 'http://www.w3.org/2000/svg';
export type S2SVGAttributes = Record<string, string>;

export type S2LineCap = 'butt' | 'round' | 'square';
export type S2LineJoin = 'miter' | 'round' | 'bevel';
export type S2TextAnchor = 'start' | 'middle' | 'end';
export type S2HorizontalAlign = 'left' | 'center' | 'right';
export type S2VerticalAlign = 'top' | 'middle' | 'bottom';
export type S2FontStyle = 'normal' | 'italic' | 'oblique';

export interface S2Dirtyable {
    isDirty(): boolean;
    markDirty(): void;
    clearDirty(): void;
}

export class S2TipTransform {
    public space: S2Space = 'world';
    public position: S2Vec2 = new S2Vec2();
    public tangent: S2Vec2 = new S2Vec2();
    public strokeWidth: number = 1;
    public pathLength: number = 1;
}

export interface S2Tipable {
    createArrowTip(): S2ArrowTip;
    getTip(index: number): S2ArrowTip;
    getTipCount(): number;
    detachTip(index: number): this;
    detachTipElement(tip: S2ArrowTip): this;
    detachTipElements(): this;
    getTipTransformAt(t: number): S2TipTransform;
}

export type S2Anchor =
    | 'north-west'
    | 'north'
    | 'north-east'
    | 'west'
    | 'center'
    | 'east'
    | 'south-west'
    | 'south'
    | 'south-east';

export class S2AnchorUtils {
    static getCenter(
        anchor: S2Anchor,
        space: S2Space,
        camera: S2Camera,
        position: S2Position,
        extents: S2Extents,
    ): S2Vec2 {
        const sign = space === 'world' ? +1 : -1;
        const ext = extents.toSpace(space, camera);
        const center = position.toSpace(space, camera);
        switch (anchor) {
            case 'north-west':
                center.shiftY(-sign * ext.y).shiftX(+ext.x);
                break;
            case 'north':
                center.shiftY(-sign * ext.y);
                break;
            case 'north-east':
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
            case 'south-west':
                center.shiftY(+sign * ext.y).shiftX(+ext.x);
                break;
            case 'south':
                center.shiftY(+sign * ext.y);
                break;
            case 'south-east':
                center.shiftY(+sign * ext.y).shiftX(-ext.x);
                break;
        }
        return center;
    }

    static getNorthWest(
        anchor: S2Anchor,
        space: S2Space,
        camera: S2Camera,
        position: S2Position,
        extents: S2Extents,
    ): S2Vec2 {
        const sign = space === 'world' ? +1 : -1;
        const ext = extents.toSpace(space, camera);
        const nw = position.toSpace(space, camera);
        switch (anchor) {
            case 'north-west':
                break;
            case 'north':
                nw.shiftX(-ext.x);
                break;
            case 'north-east':
                nw.shiftX(-2 * ext.x);
                break;
            case 'west':
                nw.shiftY(sign * ext.y);
                break;
            case 'center':
                nw.shiftY(sign * ext.y).shiftX(-ext.x);
                break;
            case 'east':
                nw.shiftY(sign * ext.y).shiftX(-2 * ext.x);
                break;
            case 'south-west':
                nw.shiftY(2 * sign * ext.y);
                break;
            case 'south':
                nw.shiftY(2 * sign * ext.y).shiftX(-ext.x);
                break;
            case 'south-east':
                nw.shiftY(2 * sign * ext.y).shiftX(-2 * ext.x);
                break;
        }
        return nw;
    }
}

export class S2FlexUtils {
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
