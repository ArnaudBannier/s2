import type { S2Space } from '../../math/s2-space';
import type { S2BaseScene } from '../../scene/s2-base-scene';
import type { S2Dirtyable } from '../../shared/s2-globals';
import { S2Vec2 } from '../../math/s2-vec2';
import { svgNS } from '../../shared/s2-globals';
import { S2BaseRichText } from './s2-rich-text';
import { S2Element } from '../base/s2-element';
import { S2ElementData, S2FillData, S2FontData, S2StrokeData } from '../base/s2-base-data';
import { S2DataUtils } from '../base/s2-data-utils';
import { S2TextData } from './s2-text-data';
import { S2Length } from '../../shared/s2-length';
import { S2Number } from '../../shared/s2-number';
import { S2Transform } from '../../shared/s2-transform';
import { S2Point } from '../../shared/s2-point';
import { S2Extents } from '../../shared/s2-extents';
import { S2Anchor } from '../../shared/s2-anchor';

export class S2TextLineData extends S2TextData {
    public readonly skip: S2Length;
    public readonly horizontalAlign: S2Number;

    constructor(scene: S2BaseScene) {
        super(scene);
        this.skip = new S2Length(0, scene.getViewSpace());
        this.horizontalAlign = new S2Number(-1);
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        super.setOwner(owner);
        this.skip.setOwner(owner);
        this.horizontalAlign.setOwner(owner);
    }

    clearDirty(): void {
        super.clearDirty();
        this.skip.clearDirty();
        this.horizontalAlign.clearDirty();
    }
}

export class S2TextLine extends S2BaseRichText<S2TextLineData> {
    constructor(scene: S2BaseScene) {
        super(scene, new S2TextLineData(scene));
    }
}

export class S2TextGroupData extends S2ElementData {
    public readonly fill: S2FillData;
    public readonly stroke: S2StrokeData;
    public readonly opacity: S2Number;
    public readonly transform: S2Transform;
    public readonly position: S2Point;

    public readonly font: S2FontData;
    public readonly skip: S2Length;
    public readonly horizontalAlign: S2Number;
    public readonly verticalAlign: S2Number;
    public readonly minExtents: S2Extents;
    public readonly anchor: S2Anchor;

    constructor(scene: S2BaseScene) {
        super();
        this.fill = new S2FillData();
        this.stroke = new S2StrokeData(scene);
        this.opacity = new S2Number(1);
        this.transform = new S2Transform();
        this.position = new S2Point(0, 0, scene.getWorldSpace());
        this.font = new S2FontData(scene);
        this.skip = new S2Length(0, scene.getViewSpace());
        this.horizontalAlign = new S2Number(-1);
        this.verticalAlign = new S2Number(0);
        this.minExtents = new S2Extents(0, 0, scene.getViewSpace());
        this.anchor = new S2Anchor(0, 0);

        this.stroke.width.set(0, scene.getViewSpace());
        this.fill.opacity.set(1);
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        this.fill.setOwner(owner);
        this.stroke.setOwner(owner);
        this.opacity.setOwner(owner);
        this.transform.setOwner(owner);
        this.position.setOwner(owner);
        this.font.setOwner(owner);
        this.skip.setOwner(owner);
        this.horizontalAlign.setOwner(owner);
        this.verticalAlign.setOwner(owner);
        this.minExtents.setOwner(owner);
        this.anchor.setOwner(owner);
    }

    clearDirty(): void {
        super.clearDirty();
        this.fill.clearDirty();
        this.stroke.clearDirty();
        this.opacity.clearDirty();
        this.transform.clearDirty();
        this.position.clearDirty();
        this.font.clearDirty();
        this.skip.clearDirty();
        this.horizontalAlign.clearDirty();
        this.verticalAlign.clearDirty();
        this.minExtents.clearDirty();
        this.anchor.clearDirty();
    }
}

export class S2TextGroup extends S2Element<S2TextGroupData> {
    protected readonly element: SVGGElement;
    protected readonly textLines: S2TextLine[] = [];
    protected readonly center: S2Point;
    protected readonly textExtents: S2Extents;
    protected readonly extents: S2Extents;

    constructor(scene: S2BaseScene) {
        super(scene, new S2TextGroupData(scene));
        this.element = document.createElementNS(svgNS, 'g');
        this.textExtents = new S2Extents(0, 0, scene.getViewSpace());
        this.extents = new S2Extents(0, 0, scene.getViewSpace());
        this.center = new S2Point(0, 0, scene.getWorldSpace());
        this.element.dataset.role = 'text-group';
        this.element.style.whiteSpaceCollapse = 'preserve';
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    addLine(options?: { align?: number; skip?: number }): S2TextLine {
        const textLine = new S2TextLine(this.scene);
        textLine.setParent(this);

        if (options?.align) {
            textLine.data.horizontalAlign.set(options.align);
            textLine.data.horizontalAlign.lock();
        }
        if (options?.skip !== undefined) {
            textLine.data.skip.set(options.skip);
        }
        this.textLines.push(textLine);
        this.updateSVGChildren();
        return textLine;
    }

    getLineCount(): number {
        return this.textLines.length;
    }

    getLine(index: number): S2TextLine {
        return this.textLines[index];
    }

    getContentExtentsInto(dst: S2Vec2, space: S2Space): this {
        this.textExtents.getInto(dst, space);
        return this;
    }

    getExtentsInto(dst: S2Vec2, space: S2Space): this {
        this.extents.getInto(dst, space);
        return this;
    }

    getCenterInto(dst: S2Vec2, space: S2Space): this {
        this.center.getInto(dst, space);
        return this;
    }

    update(): void {
        if (this.skipUpdate()) return;
        if (this.textLines.length === 0) return;

        const viewSpace = this.scene.getViewSpace();
        this.updateSVGChildren();

        S2DataUtils.applyTransform(this.data.transform, this.element, this.scene);

        // Update text styles (for correct measurement) and compute content extents
        const font = this.data.font;
        const fontSize = font.size.get(viewSpace);
        const lineHeight = font.relativeLineHeight.get() * fontSize;

        this.textExtents.space = viewSpace;
        const textExtents = this.textExtents.value;
        textExtents.set(0, 0);
        for (const line of this.textLines) {
            line.data.font.copyIfUnlocked(this.data.font);
            line.data.fill.copyIfUnlocked(this.data.fill);
            line.data.stroke.copyIfUnlocked(this.data.stroke);
            line.data.opacity.copyIfUnlocked(this.data.opacity);
            line.data.horizontalAlign.copyIfUnlocked(this.data.horizontalAlign);
            line.data.skip.copyIfUnlocked(this.data.skip);
            line.update();

            line.getExtentsInto(_vec0, viewSpace);
            textExtents.x = Math.max(textExtents.x, _vec0.x);
            textExtents.y += 0.5 * (lineHeight + line.data.skip.get(viewSpace));
        }

        // Update group extents
        this.extents.space = viewSpace;
        const extents = this.extents.value;
        this.data.minExtents.getInto(extents, viewSpace);
        extents.maxV(textExtents);

        // Update center
        this.center.space = viewSpace;
        const center = this.center.value;
        this.data.position.getInto(center, viewSpace);
        this.data.anchor.getCenterIntoV(center, center, extents);

        console.log('text group extents', extents.x, extents.y);
        console.log('text group content extents', textExtents.x, textExtents.y);

        // Update line positions

        const sign = viewSpace.isDirectSpace() ? 1 : -1;
        const ascenderHeight = font.relativeAscenderHeight.get() * fontSize;
        const vAlign = sign * this.data.verticalAlign.get();

        let lineY = center.y + vAlign * (extents.y - textExtents.y);
        lineY += sign * (textExtents.y - 0.5 * ascenderHeight);
        for (let i = 0; i < this.textLines.length; i++) {
            const line = this.textLines[i];
            const hAlign = line.data.horizontalAlign.get();
            line.getExtentsInto(_vec0, viewSpace);
            const lineX = center.x + hAlign * (extents.x - _vec0.x);
            line.data.position.set(lineX, lineY, viewSpace);
            line.update();

            lineY += lineHeight + line.data.skip.get(viewSpace);
        }
        // const groupNW = this.getCenter(viewSpace).subV(extents); // TODO
        // let lineX = 0;
        // let lineY = groupNW.y + ascenderHeight;
        // switch (this.data.verticalAlign.get()) {
        //     case 'top':
        //         break;
        //     case 'middle':
        //         lineY += extents.y - contentExtents.y;
        //         break;
        //     case 'bottom':
        //         lineY += 2 * (extents.y - contentExtents.y);
        //         break;
        // }

        // for (let i = 0; i < this.textLines.length; i++) {
        //     const line = this.textLines[i];
        //     switch (line.data.horizontalAlign.get()) {
        //         case 'left':
        //             lineX = groupNW.x;
        //             line.data.textAnchor.set('start');
        //             break;
        //         case 'center':
        //             lineX = groupNW.x + extents.x;
        //             line.data.textAnchor.set('middle');
        //             break;
        //         case 'right':
        //             lineX = groupNW.x + 2 * extents.x;
        //             line.data.textAnchor.set('end');
        //             break;
        //     }
        //     console.log('line position', i, lineX, lineY);
        //     line.data.position.set(lineX, lineY, viewSpace);
        //     lineY += line.data.skip.value + lineHeight;
        // }

        // for (const line of this.textLines) {
        //     line.update();
        // }

        this.clearDirty();
    }
}

const _vec0 = new S2Vec2();
// const _vec1 = new S2Vec2();
// const _vec2 = new S2Vec2();
// const _vec3 = new S2Vec2();
