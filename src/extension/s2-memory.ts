import { S2Element } from '../core/element/base/s2-element';
import { S2Line } from '../core/element/s2-line';
import { S2Rect } from '../core/element/s2-rect';
import { S2PlainText } from '../core/element/text/s2-plain-text';
import { S2Vec2 } from '../core/math/s2-vec2';
import type { S2BaseScene } from '../core/scene/s2-base-scene';
import { S2AnchorUtils, svgNS } from '../core/shared/s2-globals';
import { S2Position, type S2Space } from '../core/shared/s2-types';
import { S2MemoryData } from './s2-memory-data';

class S2MemoryRow {
    protected scene: S2BaseScene;
    public parentMemory: S2Memory;
    public index: number;
    public currValue: S2PlainText;
    public prevValue: S2PlainText;
    public name: S2PlainText;
    public address: S2PlainText;
    public hLine: S2Line;
    public isStacked: boolean;
    public lowerBound: S2Position;
    public upperBound: S2Position;

    constructor(parent: S2Memory, index: number) {
        const scene = parent.getScene();
        this.scene = scene;
        this.parentMemory = parent;
        this.index = index;
        this.currValue = new S2PlainText(scene);
        this.prevValue = new S2PlainText(scene);
        this.name = new S2PlainText(scene);
        this.address = new S2PlainText(scene);
        this.hLine = new S2Line(scene);
        this.currValue.setParent(parent);
        this.prevValue.setParent(parent);
        this.name.setParent(parent);
        this.address.setParent(parent);
        this.hLine.setParent(parent);
        this.isStacked = false;

        this.address.data.textAnchor.set('end');
        this.currValue.data.textAnchor.set('start');
        this.name.data.textAnchor.set('start');

        this.lowerBound = new S2Position();
        this.upperBound = new S2Position();

        this.prevValue.setActive(false);
    }

    setAddress(address: string): void {
        this.address.setContent(address);
    }

    setValue(value: string): void {
        this.prevValue.setContent(this.currValue.getContent());
        this.currValue.setContent(value);
    }

    setName(name: string): void {
        this.name.setContent(name);
    }

    setWorldBounds(lowerBound: S2Vec2, upperBound: S2Vec2): void {
        this.lowerBound.setV(lowerBound, 'world');
        this.upperBound.setV(upperBound, 'world');
    }

    updateGeometry(): void {
        const space: S2Space = 'world';
        const camera = this.scene.getActiveCamera();
        const parentData = this.parentMemory.data;
        const lowerBound = this.lowerBound.toSpace(space, camera);
        const upperBound = this.upperBound.toSpace(space, camera);
        const height = upperBound.y - lowerBound.y;
        const width = upperBound.x - lowerBound.x;
        this.currValue.data.position.set(lowerBound.x + 0.25 * width, lowerBound.y + height / 2, space);
        this.name.data.position.set(lowerBound.x + 0.75 * width, lowerBound.y + height / 2, space);
        if (this.isStacked) {
            this.hLine.data.startPosition.set(lowerBound.x, upperBound.y, space);
            this.hLine.data.endPosition.set(upperBound.x, upperBound.y, space);
        } else {
            this.hLine.data.startPosition.set(lowerBound.x, lowerBound.y, space);
            this.hLine.data.endPosition.set(upperBound.x, lowerBound.y, space);
        }

        const font = parentData.text.font;
        const ascenderHeight = font.relativeAscenderHeight.value * font.size.toSpace(space, camera);
        const textY = lowerBound.y + height / 2 - ascenderHeight / 2;
        const padding = parentData.padding.toSpace(space, camera).x;
        this.currValue.data.position.set(lowerBound.x + padding, textY, space);
        this.name.data.position.set(lowerBound.x + padding + 0.5 * width, textY, space);
        this.address.data.position.set(lowerBound.x - padding, textY, space);
    }

    update(): void {
        this.updateGeometry();
        this.currValue.update();
        this.name.update();
        this.address.update();
        this.hLine.update();
    }
}

export class S2Memory extends S2Element<S2MemoryData> {
    protected element: SVGGElement;
    protected addressCount: number;
    protected background: S2Rect;
    protected vLine: S2Line;
    protected rows: S2MemoryRow[];
    protected index: number;
    protected isStacked: boolean;

    constructor(scene: S2BaseScene, addressCount: number, isStacked = false) {
        super(scene, new S2MemoryData());
        this.element = document.createElementNS(svgNS, 'g');
        this.addressCount = addressCount;
        this.index = 0;
        this.isStacked = isStacked;
        this.background = new S2Rect(scene);
        this.vLine = new S2Line(scene);

        this.background.setParent(this);
        this.vLine.setParent(this);
        this.rows = [];
        for (let i = 0; i < this.addressCount; i++) {
            const row = new S2MemoryRow(this, i);
            row.isStacked = isStacked;
            if (isStacked) {
                row.setAddress(`@${this.addressCount - 1 - i}`);
            } else {
                row.setAddress(`@${i}`);
            }
            this.rows.push(row);
        }
        this.rows[this.addressCount - 1].hLine.setActive(false);
        //this.updateBackground();
        this.element.dataset.role = 'memory';
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    getExtents(space: S2Space): S2Vec2 {
        return this.data.extents.toSpace(space, this.scene.getActiveCamera());
    }

    getCenter(space: S2Space): S2Vec2 {
        return S2AnchorUtils.getCenter(
            this.data.anchor.get(),
            space,
            this.scene.getActiveCamera(),
            this.data.position,
            this.data.extents,
        );
    }

    addVariable(name: string, value: string): this {
        const row = this.rows[this.index];
        row.setName(name);
        row.setValue(value);
        this.index++;
        return this;
    }

    protected updateBackground(): void {
        //const camera = this.scene.getActiveCamera();
        const space: S2Space = 'view';
        const center = this.getCenter(space);
        const extents = this.getExtents(space);

        this.background.data.stroke.copyIfUnlocked(this.data.background.stroke);
        this.background.data.fill.copyIfUnlocked(this.data.background.fill);
        this.background.data.opacity.copyIfUnlocked(this.data.background.opacity);
        if (this.background instanceof S2Rect) {
            this.background.data.cornerRadius.copyIfUnlocked(this.data.background.cornerRadius);
        }

        // Position background
        this.background.data.position.setV(center, space);
        this.background.data.extents.setV(extents, space);
        this.background.data.anchor.set('center');

        this.background.update();
    }

    protected updateSeparators(): void {
        const space: S2Space = 'view';
        const center = this.getCenter(space);
        const extents = this.getExtents(space);

        this.vLine.data.startPosition.set(center.x, center.y + extents.y, space);
        this.vLine.data.endPosition.set(center.x, center.y - extents.y, space);
        this.vLine.data.stroke.color.copyIfUnlocked(this.data.background.stroke.color);
        this.vLine.data.stroke.width.copyIfUnlocked(this.data.background.stroke.width);

        this.vLine.update();

        // const stepY = (2 * extents.y) / this.addressCount;
        // let lineY = center.y - extents.y + stepY;
        // for (const hLine of this.hLines) {
        //     hLine.data.startPosition.set(center.x - extents.x, lineY, space);
        //     hLine.data.endPosition.set(center.x + extents.x, lineY, space);
        //     hLine.data.stroke.color.copyIfUnlocked(this.data.background.stroke.color);
        //     hLine.data.stroke.width.copyIfUnlocked(this.data.background.stroke.width);
        //     hLine.update();
        //     lineY += stepY;
        // }
    }

    protected updateVariables(): void {
        const space: S2Space = 'world';
        const center = this.getCenter(space);
        const extents = this.getExtents(space);
        const sign = this.isStacked ? 1 : -1;
        const stepY = (2 * extents.y) / this.addressCount;
        for (let i = 0; i < this.rows.length; i++) {
            const variable = this.rows[i];
            const centerY = center.y + sign * ((i + 0.5) * stepY - extents.y);
            const lowerBound = new S2Vec2(center.x - extents.x, centerY - 0.5 * stepY);
            const upperBound = new S2Vec2(center.x + extents.x, centerY + 0.5 * stepY);
            variable.setWorldBounds(lowerBound, upperBound);
            variable.hLine.data.stroke.color.copyIfUnlocked(this.data.background.stroke.color);
            variable.hLine.data.stroke.width.copyIfUnlocked(this.data.background.stroke.width);
        }

        if (this.data.text.font.isDirty()) {
            for (const row of this.rows) {
                row.currValue.data.font.copyIfUnlocked(this.data.text.font);
                row.name.data.font.copyIfUnlocked(this.data.text.font);
                row.address.data.font.copyIfUnlocked(this.data.text.font);
            }
        }

        for (const row of this.rows) {
            row.update();
        }
    }

    update(): void {
        if (this.skipUpdate()) return;

        this.updateSVGChildren();
        this.updateBackground();
        this.updateSeparators();
        this.updateVariables();

        this.clearDirty();
    }
}
