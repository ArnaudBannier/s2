import type { S2AbstractSpace } from '../../math/s2-abstract-space';
import type { S2BaseScene } from '../../scene/s2-base-scene';
import { S2Vec2 } from '../../math/s2-vec2';
import { svgNS } from '../../shared/s2-globals';
import { S2Element } from '../base/s2-element';
import { S2DataUtils } from '../base/s2-data-utils';
import { S2TSpan } from './s2-tspan';
import { S2TextData } from './s2-text-data';
import { S2Extents } from '../../shared/s2-extents';
import { S2Point } from '../../shared/s2-point';

export class S2BaseRichText<Data extends S2TextData> extends S2Element<Data> {
    protected element: SVGTextElement;
    protected tspans: Array<S2TSpan>;
    protected extents: S2Extents;
    protected localCenter: S2Point;

    constructor(scene: S2BaseScene, data: Data) {
        super(scene, data);
        this.element = document.createElementNS(svgNS, 'text');
        this.tspans = [];
        this.extents = new S2Extents(0, 0, scene.getViewSpace());
        this.localCenter = new S2Point(0, 0, scene.getViewSpace());

        this.extents.setOwner(this);
        this.localCenter.setOwner(this);
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    getPosition(space: S2AbstractSpace): S2Vec2 {
        return this.data.position.get(space);
    }

    addTSpan(content: string, category?: string): S2TSpan {
        const tspan = new S2TSpan(this.scene, this);
        tspan.setParent(this);
        tspan.setContent(content);
        tspan.category = category ?? '';

        this.tspans.push(tspan);
        this.extents.markDirty();
        this.localCenter.markDirty();
        return tspan;
    }

    getExtents(space: S2AbstractSpace): S2Vec2 {
        return this.extents.get(space);
    }

    getCenter(space: S2AbstractSpace): S2Vec2 {
        const localCenter = this.localCenter.get(space);
        const position = this.getPosition(space);
        return localCenter.addV(position);
    }

    getTSpans(): Array<S2TSpan> {
        return this.tspans;
    }

    getTSpanCount(): number {
        return this.tspans.length;
    }

    getTSpan(index: number): S2TSpan {
        return this.tspans[index];
    }

    findTSpan(options: { content?: string; category?: string }): S2TSpan | undefined {
        return this.tspans.find((tspan) => {
            return (
                (options.content ? tspan.getContent() === options.content : true) &&
                (options.category ? tspan.category === options.category : true)
            );
        });
    }

    clearText(): this {
        this.children.length = 0;
        this.tspans.length = 0;
        this.element.replaceChildren();
        this.updateSVGChildren();
        this.extents.markDirty();
        this.localCenter.markDirty();
        return this;
    }

    updateExtents(): this {
        const viewSpace = this.scene.getViewSpace();
        const lowerBound = new S2Vec2(Infinity, Infinity);
        const upperBound = new S2Vec2(-Infinity, -Infinity);
        for (const tspan of this.tspans) {
            const pos = tspan.getLocalCenter(viewSpace);
            const ext = tspan.getExtents(viewSpace);
            lowerBound.x = Math.min(lowerBound.x, pos.x - ext.x);
            lowerBound.y = Math.min(lowerBound.y, pos.y - ext.y);
            upperBound.x = Math.max(upperBound.x, pos.x + ext.x);
            upperBound.y = Math.max(upperBound.y, pos.y + ext.y);
        }
        this.extents.set((upperBound.x - lowerBound.x) / 2, (upperBound.y - lowerBound.y) / 2, viewSpace);
        this.localCenter.set((upperBound.x + lowerBound.x) / 2, (upperBound.y + lowerBound.y) / 2, viewSpace);
        this.extents.clearDirty();
        this.localCenter.clearDirty();
        return this;
    }

    update(): void {
        if (this.skipUpdate()) return;

        this.updateSVGChildren();

        // S2DataUtils.applyFill(this.data.fill, this.element, this.scene);
        // S2DataUtils.applyStroke(this.data.stroke, this.element, this.scene);
        S2DataUtils.applyOpacity(this.data.opacity, this.element, this.scene);
        S2DataUtils.applyTransform(this.data.transform, this.element, this.scene);
        S2DataUtils.applyShiftedPosition(this.data.position, this.data.localShift, this.element, this.scene, 'x', 'y');
        S2DataUtils.applyPreserveWhitespace(this.data.preserveWhitespace, this.element, this.scene);
        S2DataUtils.applyTextAnchor(this.data.textAnchor, this.element, this.scene);

        for (const tspan of this.tspans) {
            if (this.data.fill.isDirty() || tspan.isDirty()) {
                tspan.data.fill.copyIfUnlocked(this.data.fill);
            }
            if (this.data.stroke.isDirty() || tspan.isDirty()) {
                tspan.data.stroke.copyIfUnlocked(this.data.stroke);
            }
            if (this.data.font.isDirty() || tspan.isDirty()) {
                tspan.data.font.copyIfUnlocked(this.data.font);
            }
            tspan.update();
        }
        this.updateExtents();

        this.clearDirty();
    }
}

export class S2RichText extends S2BaseRichText<S2TextData> {
    constructor(scene: S2BaseScene) {
        super(scene, new S2TextData(scene));
    }
}
