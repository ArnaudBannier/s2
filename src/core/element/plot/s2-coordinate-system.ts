import type { S2BaseScene } from '../../scene/s2-base-scene';
import type { S2Anchor, S2Dirtyable } from '../../shared/s2-globals';
import { S2Mat2x3 } from '../../math/s2-mat2x3';
import { S2Vec2 } from '../../math/s2-vec2';
import { S2Enum } from '../../shared/s2-enum';
import { S2Extents } from '../../shared/s2-extents';
import { S2AnchorUtils, svgNS } from '../../shared/s2-globals';
import { S2Number } from '../../shared/s2-number';
import { S2Point } from '../../shared/s2-point';
import { S2BaseData, S2ElementData, S2StrokeData } from '../base/s2-base-data';
import { S2Element } from '../base/s2-element';
import { S2Grid } from '../s2-grid';
import type { S2Line } from '../s2-line';
import { S2CurvePlot } from './s2-curve-plot';
import { S2PlotModifier } from './s2-plot-modifier';
import { S2Length } from '../../shared/s2-length';
import type { S2AbstractSpace } from '../../math/s2-abstract-space';

export class S2CoordinateSystemData extends S2ElementData {
    public readonly stroke: S2StrokeData;
    public readonly opacity: S2Number = new S2Number(1);
    public readonly position: S2Point;
    public readonly extents: S2Extents;
    public readonly anchor: S2Enum<S2Anchor> = new S2Enum<S2Anchor>('center');
    public readonly axisX: S2AxisData = new S2AxisData();
    public readonly axisY: S2AxisData = new S2AxisData();
    public readonly lineEndPadding: S2Length;

    constructor(scene: S2BaseScene) {
        super();
        this.stroke = new S2StrokeData(scene);
        this.position = new S2Point(0, 0, scene.getWorldSpace());
        this.extents = new S2Extents(1, 1, scene.getWorldSpace());
        this.lineEndPadding = new S2Length(20, scene.getViewSpace());
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        super.setOwner(owner);
        this.stroke.setOwner(owner);
        this.opacity.setOwner(owner);
        this.position.setOwner(owner);
        this.extents.setOwner(owner);
        this.anchor.setOwner(owner);
        this.axisX.setOwner(owner);
        this.axisY.setOwner(owner);
    }

    clearDirty(): void {
        super.clearDirty();
        this.stroke.clearDirty();
        this.opacity.clearDirty();
        this.position.clearDirty();
        this.extents.clearDirty();
        this.anchor.clearDirty();
        this.axisX.clearDirty();
        this.axisY.clearDirty();
    }
}

export class S2AxisData extends S2BaseData {
    public readonly min: S2Number = new S2Number(0);
    public readonly max: S2Number = new S2Number(1);
    public readonly majorStep: S2Number = new S2Number(0.5);
    public readonly minorStep: S2Number = new S2Number(0.1);
    public readonly origin: S2Number = new S2Number(0);

    setOwner(owner: S2Dirtyable | null = null): void {
        this.min.setOwner(owner);
        this.max.setOwner(owner);
        this.majorStep.setOwner(owner);
        this.minorStep.setOwner(owner);
        this.origin.setOwner(owner);
    }

    clearDirty(): void {
        this.min.clearDirty();
        this.max.clearDirty();
        this.majorStep.clearDirty();
        this.minorStep.clearDirty();
        this.origin.clearDirty();
    }
}

export class S2CoordinateSystem extends S2Element<S2CoordinateSystemData> {
    protected element: SVGGElement;
    protected plotModifier: S2PlotModifier = new S2PlotModifier();
    protected attachedModifiers: S2PlotModifier[] = [];
    protected majorGrid: S2Grid | null = null;
    protected minorGrid: S2Grid | null = null;
    protected lineX: S2Line | null = null;
    protected lineY: S2Line | null = null;
    protected coordToPointMatrix: S2Mat2x3 = new S2Mat2x3();
    protected pointToCoordMatrix: S2Mat2x3 = new S2Mat2x3();
    protected origin: S2Point;
    protected lower: S2Point;
    protected upper: S2Point;

    constructor(scene: S2BaseScene) {
        super(scene, new S2CoordinateSystemData(scene));
        this.element = document.createElementNS(svgNS, 'g');
        this.origin = new S2Point(0, 0, scene.getWorldSpace());
        this.lower = new S2Point(0, 0, scene.getWorldSpace());
        this.upper = new S2Point(0, 0, scene.getWorldSpace());
        this.data.stroke.width.set(2, scene.getViewSpace());
        this.data.stroke.opacity.set(1);
        this.element.role = 'coordinate-system';

        this.plotModifier.set((v: S2Vec2) => {
            v.apply2x3(this.coordToPointMatrix);
        });
    }

    createMajorGrid(): S2Grid {
        const grid = new S2Grid(this.scene);
        this.attachMajorGrid(grid);
        grid.setParent(this);
        return grid;
    }

    createMinorGrid(): S2Grid {
        const grid = new S2Grid(this.scene);
        this.attachMinorGrid(grid);
        grid.setParent(this);
        return grid;
    }

    attachMajorGrid(grid: S2Grid): this {
        this.majorGrid = grid;
        return this;
    }

    detachMajorGrid(): this {
        this.majorGrid = null;
        return this;
    }

    attachMinorGrid(grid: S2Grid): this {
        this.minorGrid = grid;
        return this;
    }

    detachMinorGrid(): this {
        this.minorGrid = null;
        return this;
    }

    getMajorGrid(): S2Grid | null {
        return this.majorGrid;
    }

    getMinorGrid(): S2Grid | null {
        return this.minorGrid;
    }

    attachPlotModifier(modifier: S2PlotModifier): this {
        if (this.attachedModifiers.indexOf(modifier) !== -1) return this;
        this.attachedModifiers.push(modifier);
        this.markDirty();
        return this;
    }

    getSVGElement(): SVGElement {
        return this.element;
    }

    getPosition(space: S2AbstractSpace): S2Vec2 {
        return this.data.position.get(space);
    }

    getCenter(space: S2AbstractSpace): S2Vec2 {
        return S2AnchorUtils.getCenter(
            this.data.anchor.get(),
            space,
            this.scene,
            this.data.position,
            this.data.extents,
        );
    }

    getExtents(space: S2AbstractSpace): S2Vec2 {
        return this.data.extents.get(space);
    }

    getCoordToPointMatrix(): S2Mat2x3 {
        return this.coordToPointMatrix;
    }

    getPointToCoordMatrix(): S2Mat2x3 {
        return this.pointToCoordMatrix;
    }

    protected updateTransforms(): void {
        const space = this.data.position.space;
        const extents = this.getExtents(space);
        const lower = this.getCenter(space).subV(extents);
        const minX = this.data.axisX.min.get();
        const maxX = this.data.axisX.max.get();
        const originX = this.data.axisX.origin.get();
        const minY = this.data.axisY.min.get();
        const maxY = this.data.axisY.max.get();
        const originY = this.data.axisY.origin.get();

        const scale = extents
            .clone()
            .scale(2)
            .mul(1 / (maxX - minX), 1 / (maxY - minY));
        this.coordToPointMatrix.set(scale.x, 0, lower.x - scale.x * minX, 0, scale.y, lower.y - scale.y * minY);
        this.pointToCoordMatrix.copy(this.coordToPointMatrix).invert();

        this.origin.value.set(originX, originY).apply2x3(this.coordToPointMatrix);
        this.origin.space = space;
        this.lower.set(lower.x, lower.y, space);
        this.upper.set(lower.x + extents.x * 2, lower.y + extents.y * 2, space);
    }

    update(): void {
        if (this.skipUpdate()) return;

        const space = this.data.position.space;

        this.updateTransforms();
        for (const modifier of this.attachedModifiers) {
            modifier.copyIfUnlocked(this.plotModifier);
            modifier.markDirty();
        }

        const grids = [this.majorGrid, this.minorGrid];
        const stepsArray = [
            new S2Vec2(this.data.axisX.majorStep.get(), this.data.axisY.majorStep.get()),
            new S2Vec2(this.data.axisX.minorStep.get(), this.data.axisY.minorStep.get()),
        ];
        for (let i = 0; i < grids.length; i++) {
            const grid = grids[i];
            if (grid === null) continue;
            const geometry = grid.data.geometry;
            const steps = stepsArray[i].apply2x3Offset(this.coordToPointMatrix);
            geometry.boundA.copyIfUnlocked(this.lower);
            geometry.boundB.copyIfUnlocked(this.upper);
            geometry.referencePoint.copyIfUnlocked(this.origin);
            geometry.steps.set(steps.x, steps.y, space);
            geometry.space.set(space);
            grid.update();
        }

        this.updateSVGChildren();
        for (const child of this.children) {
            if (child instanceof S2CurvePlot) {
                child.data.plotModifier.copyIfUnlocked(this.plotModifier);
                child.data.plotModifier.markDirty();
            }
            child.update();
        }

        this.clearDirty();
    }
}
