import { S2FillData, S2FontData, S2LayerData, S2StrokeData } from './s2-base-data.ts';
import {
    S2Color,
    S2Enum,
    S2Extents,
    S2Length,
    S2Number,
    S2Position,
    S2Transform,
    S2TypeState,
    type S2Space,
} from '../../s2-types';
import { S2Vec2 } from '../../math/s2-vec2';
import { S2AnchorUtils, type S2Anchor, type S2LineCap, type S2LineJoin } from '../../s2-globals.ts';
import { S2BaseScene } from '../../s2-base-scene.ts';
import type { S2PolyCurve } from '../../math/s2-curve.ts';
import { S2PathUtils } from '../s2-path.ts';

export class S2DataUtils {
    static applyStroke(stroke: S2StrokeData, element: SVGElement, scene: S2BaseScene): void {
        if (stroke.opacity.state === S2TypeState.Inactive && stroke.color.state === S2TypeState.Inactive) return;

        if (stroke.width.state === S2TypeState.Active) {
            const width = stroke.width.toSpace('view', scene.getActiveCamera());
            element.setAttribute('stroke-width', width.toString());
        } else {
            element.removeAttribute('stroke-width');
        }

        if (stroke.color.state === S2TypeState.Active) {
            element.setAttribute('stroke', stroke.color.toRgb());
        } else {
            element.removeAttribute('stroke');
        }

        if (stroke.opacity.state === S2TypeState.Active && stroke.opacity.value <= 1) {
            element.setAttribute('stroke-opacity', stroke.opacity.toFixed());
        } else {
            element.removeAttribute('stroke-opacity');
        }

        if (stroke.lineCap.state === S2TypeState.Active) {
            element.setAttribute('stroke-linecap', stroke.lineCap.value);
        } else {
            element.removeAttribute('stroke-linecap');
        }

        if (stroke.lineJoin.state === S2TypeState.Active) {
            element.setAttribute('stroke-linejoin', stroke.lineJoin.value);
        } else {
            element.removeAttribute('stroke-linejoin');
        }
    }

    static applyFill(fill: S2FillData, element: SVGElement, scene: S2BaseScene): void {
        void scene;
        if (fill.opacity.state === S2TypeState.Inactive && fill.color.state === S2TypeState.Inactive) return;

        if (fill.color.state === S2TypeState.Active) {
            element.setAttribute('fill', fill.color.toRgb());
        } else {
            element.removeAttribute('fill');
        }

        if (fill.opacity.state === S2TypeState.Active && fill.opacity.value <= 1) {
            element.setAttribute('fill-opacity', fill.opacity.toFixed());
        } else {
            element.removeAttribute('fill-opacity');
        }
    }

    static applyColor(color: S2Color, element: SVGElement, scene: S2BaseScene): void {
        void scene;
        if (color.state === S2TypeState.Active) {
            element.setAttribute('fill', color.toRgb());
        } else {
            element.removeAttribute('fill');
        }
    }

    static applyOpacity(opacity: S2Number, element: SVGElement, scene: S2BaseScene): void {
        void scene;
        if (opacity.state === S2TypeState.Active) {
            element.setAttribute('opacity', opacity.toFixed(2));
        } else {
            element.removeAttribute('opacity');
        }
    }

    static applyTransform(transform: S2Transform, element: SVGElement, scene: S2BaseScene): void {
        void scene;
        if (transform.state === S2TypeState.Active) {
            element.setAttribute('transform', transform.toFixed(2));
        } else {
            element.removeAttribute('transform');
        }
    }

    static applyFont(font: S2FontData, element: SVGElement, scene: S2BaseScene): void {
        if (font.size.state === S2TypeState.Active) {
            const size = font.size.toSpace('view', scene.getActiveCamera());
            element.setAttribute('font-size', size.toFixed(1));
        } else {
            element.removeAttribute('font-size');
        }

        if (font.weight.state === S2TypeState.Active) {
            element.setAttribute('font-weight', font.weight.toFixed(0));
        } else {
            element.removeAttribute('font-weight');
        }

        if (font.family.state === S2TypeState.Active) {
            element.setAttribute('font-family', font.family.toString());
        } else {
            element.removeAttribute('font-family');
        }

        if (font.style.state === S2TypeState.Active) {
            element.setAttribute('font-style', font.style.value);
        } else {
            element.removeAttribute('font-style');
        }
    }

    static applyPosition(
        position: S2Position,
        element: SVGElement,
        scene: S2BaseScene,
        xAttribute: string = 'x',
        yAttribute: string = 'y',
    ): void {
        if (position.state === S2TypeState.Active) {
            const p = position.toSpace('view', scene.getActiveCamera());
            element.setAttribute(xAttribute, p.x.toFixed(2));
            element.setAttribute(yAttribute, p.y.toFixed(2));
        } else {
            element.removeAttribute(xAttribute);
            element.removeAttribute(yAttribute);
        }
    }

    static applyAnchoredPosition(
        position: S2Position,
        extents: S2Extents,
        anchor: S2Enum<S2Anchor>,
        element: SVGElement,
        scene: S2BaseScene,
    ): void {
        if (position.state === S2TypeState.Active) {
            const northWest = S2AnchorUtils.getNorthWest(
                anchor.getInherited(),
                'view',
                scene.getActiveCamera(),
                position,
                extents,
            );
            element.setAttribute('x', northWest.x.toString());
            element.setAttribute('y', northWest.y.toString());
        } else {
            element.removeAttribute('x');
            element.removeAttribute('y');
        }
    }

    static applyExtents(extents: S2Extents, element: SVGElement, scene: S2BaseScene): void {
        if (extents.state === S2TypeState.Active) {
            const e = extents.toSpace('view', scene.getActiveCamera()).scale(2);
            element.setAttribute('width', e.width.toFixed(2));
            element.setAttribute('height', e.height.toFixed(2));
        } else {
            element.removeAttribute('width');
            element.removeAttribute('height');
        }
    }

    static applyRadius(radius: S2Length, element: SVGElement, scene: S2BaseScene): void {
        if (radius.state === S2TypeState.Active) {
            const r = radius.toSpace('view', scene.getActiveCamera());
            element.setAttribute('r', r.toFixed(2));
        } else {
            element.removeAttribute('r');
        }
    }

    static applyCornerRadius(radius: S2Length, element: SVGElement, scene: S2BaseScene): void {
        if (radius.state === S2TypeState.Active) {
            const r = radius.toSpace('view', scene.getActiveCamera());
            element.setAttribute('rx', r.toFixed(2));
            element.setAttribute('ry', r.toFixed(2));
        } else {
            element.removeAttribute('rx');
            element.removeAttribute('ry');
        }
    }

    static applyPath(
        polyCurve: S2PolyCurve,
        space: S2Enum<S2Space>,
        pathFrom: S2Number,
        pathTo: S2Number,
        element: SVGElement,
        scene: S2BaseScene,
    ): void {
        polyCurve.updateLength();
        const d = S2PathUtils.polyCurveToSVGPath(
            polyCurve,
            pathFrom.getInherited(),
            pathTo.getInherited(),
            scene.getActiveCamera(),
            space.getInherited(),
        );
        if (d.length >= 0) {
            element.setAttribute('d', d);
        } else {
            element.removeAttribute('d');
        }
    }

    static setAnchor(data: S2LayerData, anchor: S2Anchor): void {
        if ('anchor' in data && data.anchor instanceof S2Enum) {
            data.anchor.set(anchor);
        }
    }

    static setColor(data: S2LayerData, color: S2Color): void {
        if ('color' in data && data.color instanceof S2Color) {
            data.color.copy(color);
        }
        if ('fill' in data && data.fill instanceof S2FillData) {
            data.fill.color.copy(color);
        }
        if ('stroke' in data && data.stroke instanceof S2StrokeData) {
            data.stroke.color.copy(color);
        }
    }

    static setColorRGB(
        data: S2LayerData,
        r: number,
        g: number,
        b: number,
        state: S2TypeState = S2TypeState.Active,
    ): void {
        if ('color' in data && data.color instanceof S2Color) {
            data.color.set(r, g, b, state);
        }
        if ('fill' in data && data.fill instanceof S2FillData) {
            data.fill.color.set(r, g, b, state);
        }
        if ('stroke' in data && data.stroke instanceof S2StrokeData) {
            data.stroke.color.set(r, g, b, state);
        }
    }

    static setColorHex(data: S2LayerData, hex: string, state: S2TypeState = S2TypeState.Active): void {
        if ('color' in data && data.color instanceof S2Color) {
            data.color.setFromHex(hex, state);
        }
        if ('fill' in data && data.fill instanceof S2FillData) {
            data.fill.color.setFromHex(hex, state);
        }
        if ('stroke' in data && data.stroke instanceof S2StrokeData) {
            data.stroke.color.setFromHex(hex, state);
        }
    }

    static setCornerRadius(data: S2LayerData, radius: number, space: S2Space): void {
        if ('cornerRadius' in data && data.cornerRadius instanceof S2Length) {
            data.cornerRadius.set(radius, space);
        }
    }

    static setExtents(data: S2LayerData, x: number, y: number, space: S2Space): void {
        if ('extents' in data && data.extents instanceof S2Extents) {
            data.extents.set(x, y, space);
        }
    }

    static setExtentsV(data: S2LayerData, v: S2Vec2, space: S2Space): void {
        if ('extents' in data && data.extents instanceof S2Extents) {
            data.extents.setV(v, space);
        }
    }

    static setFillColor(data: S2LayerData, color: S2Color): void {
        if ('fill' in data && data.fill instanceof S2FillData) {
            data.fill.color.copy(color);
        }
    }

    static setFillColorRGB(
        data: S2LayerData,
        r: number,
        g: number,
        b: number,
        state: S2TypeState = S2TypeState.Active,
    ): void {
        if ('fill' in data && data.fill instanceof S2FillData) {
            data.fill.color.set(r, g, b, state);
        }
    }

    static setFillColorHex(data: S2LayerData, hex: string, state: S2TypeState = S2TypeState.Active): void {
        if ('fill' in data && data.fill instanceof S2FillData) {
            data.fill.color.setFromHex(hex, state);
        }
    }

    static setFillOpacity(data: S2LayerData, opacity: number, state: S2TypeState = S2TypeState.Active): void {
        if ('fill' in data && data.fill instanceof S2FillData) {
            data.fill.opacity.set(opacity, state);
        }
    }

    static setOpacity(data: S2LayerData, opacity: number, state: S2TypeState = S2TypeState.Active): void {
        if ('opacity' in data && data.opacity instanceof S2Number) {
            data.opacity.set(opacity, state);
        }
    }

    static setPathFrom(data: S2LayerData, pathFrom: number, state: S2TypeState = S2TypeState.Active): void {
        if ('pathFrom' in data && data.pathFrom instanceof S2Number) {
            data.pathFrom.set(pathFrom, state);
        }
    }

    static setPathTo(data: S2LayerData, pathTo: number, state: S2TypeState = S2TypeState.Active): void {
        if ('pathTo' in data && data.pathTo instanceof S2Number) {
            data.pathTo.set(pathTo, state);
        }
    }

    static setPosition(
        data: S2LayerData,
        x: number,
        y: number,
        space?: S2Space,
        state: S2TypeState = S2TypeState.Active,
    ): void {
        if ('position' in data && data.position instanceof S2Position) {
            data.position.set(x, y, space, state);
        }
    }

    static setPositionV(data: S2LayerData, v: S2Vec2, space?: S2Space, state: S2TypeState = S2TypeState.Active): void {
        if ('position' in data && data.position instanceof S2Position) {
            data.position.setV(v, space, state);
        }
    }

    static setRadius(
        data: S2LayerData,
        radius: number,
        space?: S2Space,
        state: S2TypeState = S2TypeState.Active,
    ): void {
        if ('radius' in data && data.radius instanceof S2Length) {
            data.radius.set(radius, space, state);
        }
    }

    static setStrokeColor(data: S2LayerData, color: S2Color): void {
        if ('stroke' in data && data.stroke instanceof S2StrokeData) {
            data.stroke.color.copy(color);
        }
    }

    static setSpace(data: S2LayerData, space: S2Space, state: S2TypeState = S2TypeState.Active): void {
        if ('space' in data && data.space instanceof S2Enum) {
            data.space.set(space, state);
        }
    }

    static setStrokeColorRGB(
        data: S2LayerData,
        r: number,
        g: number,
        b: number,
        state: S2TypeState = S2TypeState.Active,
    ): void {
        if ('stroke' in data && data.stroke instanceof S2StrokeData) {
            data.stroke.color.set(r, g, b, state);
        }
    }

    static setStrokeColorHex(data: S2LayerData, hex: string, state: S2TypeState = S2TypeState.Active): void {
        if ('stroke' in data && data.stroke instanceof S2StrokeData) {
            data.stroke.color.setFromHex(hex, state);
        }
    }

    static setStrokeLineCap(data: S2LayerData, lineCap: S2LineCap, state: S2TypeState = S2TypeState.Active): void {
        if ('stroke' in data && data.stroke instanceof S2StrokeData) {
            data.stroke.lineCap.set(lineCap, state);
        }
    }

    static setStrokeLineJoin(data: S2LayerData, lineJoin: S2LineJoin, state: S2TypeState = S2TypeState.Active): void {
        if ('stroke' in data && data.stroke instanceof S2StrokeData) {
            data.stroke.lineJoin.set(lineJoin, state);
        }
    }

    static setStrokeOpacity(data: S2LayerData, opacity: number, state: S2TypeState = S2TypeState.Active): void {
        if ('stroke' in data && data.stroke instanceof S2StrokeData) {
            data.stroke.opacity.set(opacity, state);
        }
    }

    static setStrokeWidth(
        data: S2LayerData,
        width: number,
        space?: S2Space,
        state: S2TypeState = S2TypeState.Active,
    ): void {
        if ('stroke' in data && data.stroke instanceof S2StrokeData) {
            data.stroke.width.set(width, space, state);
        }
    }

    static setEdgeStartDistance(
        data: S2LayerData,
        distance: number,
        space: S2Space = 'view',
        state: S2TypeState = S2TypeState.Active,
    ): void {
        if ('startDistance' in data && data.startDistance instanceof S2Length) {
            data.startDistance.set(distance, space, state);
        }
    }

    static setEdgeEndDistance(
        data: S2LayerData,
        distance: number,
        space: S2Space = 'view',
        state: S2TypeState = S2TypeState.Active,
    ): void {
        if ('endDistance' in data && data.endDistance instanceof S2Length) {
            data.endDistance.set(distance, space, state);
        }
    }

    static setEdgeStartAngle(data: S2LayerData, angle: number, state: S2TypeState = S2TypeState.Active): void {
        if ('startAngle' in data && data.startAngle instanceof S2Number) {
            data.startAngle.set(angle, state);
        }
    }

    static setEdgeEndAngle(data: S2LayerData, angle: number, state: S2TypeState = S2TypeState.Active): void {
        if ('endAngle' in data && data.endAngle instanceof S2Number) {
            data.endAngle.set(angle, state);
        }
    }

    static setEdgeBendAngle(data: S2LayerData, angle: number, state: S2TypeState = S2TypeState.Active): void {
        if ('curveBendAngle' in data && data.curveBendAngle instanceof S2Number) {
            data.curveBendAngle.set(angle, state);
        }
    }

    static setEdgeTension(data: S2LayerData, tension: number, state: S2TypeState = S2TypeState.Active): void {
        if ('curveStartTension' in data && data.curveStartTension instanceof S2Number) {
            data.curveStartTension.set(tension, state);
        }
        if ('curveEndTension' in data && data.curveEndTension instanceof S2Number) {
            data.curveEndTension.set(tension, state);
        }
    }

    static setEdgeStartTension(data: S2LayerData, tension: number, state: S2TypeState = S2TypeState.Active): void {
        if ('curveStartTension' in data && data.curveStartTension instanceof S2Number) {
            data.curveStartTension.set(tension, state);
        }
    }

    static setEdgeEndTension(data: S2LayerData, tension: number, state: S2TypeState = S2TypeState.Active): void {
        if ('curveEndTension' in data && data.curveEndTension instanceof S2Number) {
            data.curveEndTension.set(tension, state);
        }
    }

    static setGridBoundA(
        data: S2LayerData,
        x: number,
        y: number,
        space?: S2Space,
        state: S2TypeState = S2TypeState.Active,
    ): void {
        if ('boundA' in data && data.boundA instanceof S2Position) {
            data.boundA.set(x, y, space, state);
        }
    }

    static setGridBoundB(
        data: S2LayerData,
        x: number,
        y: number,
        space?: S2Space,
        state: S2TypeState = S2TypeState.Active,
    ): void {
        if ('boundB' in data && data.boundB instanceof S2Position) {
            data.boundB.set(x, y, space, state);
        }
    }

    static setGridReferencePoint(
        data: S2LayerData,
        x: number,
        y: number,
        space?: S2Space,
        state: S2TypeState = S2TypeState.Active,
    ): void {
        if ('referencePoint' in data && data.referencePoint instanceof S2Position) {
            data.referencePoint.set(x, y, space, state);
        }
    }

    static setGridSteps(
        data: S2LayerData,
        x: number,
        y: number,
        space?: S2Space,
        state: S2TypeState = S2TypeState.Active,
    ): void {
        if ('steps' in data && data.steps instanceof S2Extents) {
            data.steps.set(x, y, space, state);
        }
    }
}

export class S2DataSetter {
    public readonly targets: S2LayerData[] = [];

    static addTarget(target: S2LayerData): S2DataSetter {
        const setter = new S2DataSetter();
        setter.targets.push(target);
        return setter;
    }

    static addTargets(targets: S2LayerData[]): S2DataSetter {
        const setter = new S2DataSetter();
        setter.targets.push(...targets);
        return setter;
    }

    setAnchor(anchor: S2Anchor): this {
        for (const target of this.targets) {
            S2DataUtils.setAnchor(target, anchor);
        }
        return this;
    }

    setColor(color: S2Color): this {
        for (const target of this.targets) {
            S2DataUtils.setColor(target, color);
        }
        return this;
    }

    setColorRGB(r: number, g: number, b: number, state: S2TypeState = S2TypeState.Active): this {
        for (const target of this.targets) {
            S2DataUtils.setColorRGB(target, r, g, b, state);
        }
        return this;
    }

    setColorHex(hex: string, state: S2TypeState = S2TypeState.Active): this {
        for (const target of this.targets) {
            S2DataUtils.setColorHex(target, hex, state);
        }
        return this;
    }

    setCornerRadius(radius: number, space: S2Space): this {
        for (const target of this.targets) {
            S2DataUtils.setCornerRadius(target, radius, space);
        }
        return this;
    }

    setExtents(x: number, y: number, space: S2Space): this {
        for (const target of this.targets) {
            S2DataUtils.setExtents(target, x, y, space);
        }
        return this;
    }

    setExtentsV(v: S2Vec2, space: S2Space): this {
        for (const target of this.targets) {
            S2DataUtils.setExtentsV(target, v, space);
        }
        return this;
    }

    setFillColor(color: S2Color): this {
        for (const target of this.targets) {
            S2DataUtils.setFillColor(target, color);
        }
        return this;
    }

    setFillColorRGB(r: number, g: number, b: number, state: S2TypeState = S2TypeState.Active): this {
        for (const target of this.targets) {
            S2DataUtils.setFillColorRGB(target, r, g, b, state);
        }
        return this;
    }

    setFillColorHex(hex: string, state: S2TypeState = S2TypeState.Active): this {
        for (const target of this.targets) {
            S2DataUtils.setFillColorHex(target, hex, state);
        }
        return this;
    }

    setFillOpacity(opacity: number, state: S2TypeState = S2TypeState.Active): this {
        for (const target of this.targets) {
            S2DataUtils.setFillOpacity(target, opacity, state);
        }
        return this;
    }

    setOpacity(opacity: number, state: S2TypeState = S2TypeState.Active): this {
        for (const target of this.targets) {
            S2DataUtils.setOpacity(target, opacity, state);
        }
        return this;
    }

    setPathFrom(pathFrom: number, state: S2TypeState = S2TypeState.Active): this {
        for (const target of this.targets) {
            S2DataUtils.setPathFrom(target, pathFrom, state);
        }
        return this;
    }

    setPathTo(pathTo: number, state: S2TypeState = S2TypeState.Active): this {
        for (const target of this.targets) {
            S2DataUtils.setPathTo(target, pathTo, state);
        }
        return this;
    }

    setPosition(x: number, y: number, space?: S2Space, state: S2TypeState = S2TypeState.Active): this {
        for (const target of this.targets) {
            S2DataUtils.setPosition(target, x, y, space, state);
        }
        return this;
    }

    setPositionV(v: S2Vec2, space?: S2Space, state: S2TypeState = S2TypeState.Active): this {
        for (const target of this.targets) {
            S2DataUtils.setPositionV(target, v, space, state);
        }
        return this;
    }

    setRadius(radius: number, space?: S2Space, state: S2TypeState = S2TypeState.Active): this {
        for (const target of this.targets) {
            S2DataUtils.setRadius(target, radius, space, state);
        }
        return this;
    }

    setStrokeColor(color: S2Color): this {
        for (const target of this.targets) {
            S2DataUtils.setStrokeColor(target, color);
        }
        return this;
    }

    setSpace(space: S2Space, state: S2TypeState = S2TypeState.Active): this {
        for (const target of this.targets) {
            S2DataUtils.setSpace(target, space, state);
        }
        return this;
    }

    setStrokeColorRGB(r: number, g: number, b: number, state: S2TypeState = S2TypeState.Active): this {
        for (const target of this.targets) {
            S2DataUtils.setStrokeColorRGB(target, r, g, b, state);
        }
        return this;
    }

    setStrokeColorHex(hex: string, state: S2TypeState = S2TypeState.Active): this {
        for (const target of this.targets) {
            S2DataUtils.setStrokeColorHex(target, hex, state);
        }
        return this;
    }

    setStrokeLineCap(lineCap: S2LineCap, state: S2TypeState = S2TypeState.Active): this {
        for (const target of this.targets) {
            S2DataUtils.setStrokeLineCap(target, lineCap, state);
        }
        return this;
    }

    setStrokeLineJoin(lineJoin: S2LineJoin, state: S2TypeState = S2TypeState.Active): this {
        for (const target of this.targets) {
            S2DataUtils.setStrokeLineJoin(target, lineJoin, state);
        }
        return this;
    }

    setStrokeOpacity(opacity: number, state: S2TypeState = S2TypeState.Active): this {
        for (const target of this.targets) {
            S2DataUtils.setStrokeOpacity(target, opacity, state);
        }
        return this;
    }

    setStrokeWidth(width: number, space?: S2Space, state: S2TypeState = S2TypeState.Active): this {
        for (const target of this.targets) {
            S2DataUtils.setStrokeWidth(target, width, space, state);
        }
        return this;
    }

    setEdgeStartDistance(distance: number, space: S2Space = 'view', state: S2TypeState = S2TypeState.Active): this {
        for (const target of this.targets) {
            S2DataUtils.setEdgeStartDistance(target, distance, space, state);
        }
        return this;
    }

    setEdgeEndDistance(distance: number, space: S2Space = 'view', state: S2TypeState = S2TypeState.Active): this {
        for (const target of this.targets) {
            S2DataUtils.setEdgeEndDistance(target, distance, space, state);
        }
        return this;
    }

    setEdgeStartAngle(angle: number, state: S2TypeState = S2TypeState.Active): this {
        for (const target of this.targets) {
            S2DataUtils.setEdgeStartAngle(target, angle, state);
        }
        return this;
    }

    setEdgeEndAngle(angle: number, state: S2TypeState = S2TypeState.Active): this {
        for (const target of this.targets) {
            S2DataUtils.setEdgeEndAngle(target, angle, state);
        }
        return this;
    }

    setEdgeBendAngle(angle: number, state: S2TypeState = S2TypeState.Active): this {
        for (const target of this.targets) {
            S2DataUtils.setEdgeBendAngle(target, angle, state);
        }
        return this;
    }

    setEdgeTension(tension: number, state: S2TypeState = S2TypeState.Active): this {
        for (const target of this.targets) {
            S2DataUtils.setEdgeTension(target, tension, state);
        }
        return this;
    }

    setEdgeStartTension(tension: number, state: S2TypeState = S2TypeState.Active): this {
        for (const target of this.targets) {
            S2DataUtils.setEdgeStartTension(target, tension, state);
        }
        return this;
    }

    setEdgeEndTension(tension: number, state: S2TypeState = S2TypeState.Active): this {
        for (const target of this.targets) {
            S2DataUtils.setEdgeEndTension(target, tension, state);
        }
        return this;
    }

    setGridBoundA(x: number, y: number, space?: S2Space, state: S2TypeState = S2TypeState.Active): this {
        for (const target of this.targets) {
            S2DataUtils.setGridBoundA(target, x, y, space, state);
        }
        return this;
    }

    setGridBoundB(x: number, y: number, space?: S2Space, state: S2TypeState = S2TypeState.Active): this {
        for (const target of this.targets) {
            S2DataUtils.setGridBoundB(target, x, y, space, state);
        }
        return this;
    }

    setGridReferencePoint(x: number, y: number, space?: S2Space, state: S2TypeState = S2TypeState.Active): this {
        for (const target of this.targets) {
            S2DataUtils.setGridReferencePoint(target, x, y, space, state);
        }
        return this;
    }

    setGridSteps(x: number, y: number, space?: S2Space, state: S2TypeState = S2TypeState.Active): this {
        for (const target of this.targets) {
            S2DataUtils.setGridSteps(target, x, y, space, state);
        }
        return this;
    }
}
