import type { S2FillData, S2FontData, S2StrokeData } from './s2-base-data.ts';
import type { S2Enum } from '../../shared/s2-enum.ts';
import type { S2AnchorOld, S2PointerEvents, S2TextAnchor } from '../../shared/s2-globals.ts';
import type { S2BaseScene } from '../../scene/s2-base-scene.ts';
import type { S2PolyCurveOLD } from '../../math/s2-curve.ts';
import type { S2Color } from '../../shared/s2-color.ts';
import type { S2Number } from '../../shared/s2-number.ts';
import type { S2Transform } from '../../shared/s2-transform.ts';
import type { S2Length } from '../../shared/s2-length.ts';
import type { S2Boolean } from '../../shared/s2-boolean.ts';
import type { S2Offset } from '../../shared/s2-offset.ts';
import type { S2Extents } from '../../shared/s2-extents.ts';
import type { S2Space } from '../../math/s2-space.ts';
import type { S2SpaceRef } from '../../shared/s2-space-ref.ts';
import { S2Vec2 } from '../../math/s2-vec2.ts';
import { S2AnchorUtils } from '../../shared/s2-globals.ts';
import { S2CubicCurveOLD, S2LineCurveOLD } from '../../math/s2-curve.ts';
import { S2Point } from '../../shared/s2-point.ts';

export class S2DataUtils {
    static applyPointerEvents(pointerEvents: S2Enum<S2PointerEvents>, element: SVGElement, scene: S2BaseScene): void {
        void scene;
        if (pointerEvents.isDirty()) {
            element.style.pointerEvents = pointerEvents.value;
        }
    }

    static applyStroke(stroke: S2StrokeData, element: SVGElement, scene: S2BaseScene): void {
        if (stroke.isDirty() === false) return;
        if (stroke.width.isDirty()) {
            const width = stroke.width.get(scene.getViewSpace());
            element.setAttribute('stroke-width', width.toFixed(2));
        }
        if (stroke.color.isDirty()) {
            element.setAttribute('stroke', stroke.color.toString());
        }
        if (stroke.opacity.isDirty()) {
            if (stroke.opacity.value <= 1) {
                element.setAttribute('stroke-opacity', stroke.opacity.toFixed(2));
            } else {
                element.removeAttribute('stroke-opacity');
            }
        }
        if (stroke.lineCap.isDirty()) {
            element.setAttribute('stroke-linecap', stroke.lineCap.value);
        }
        if (stroke.lineJoin.isDirty()) {
            element.setAttribute('stroke-linejoin', stroke.lineJoin.value);
        }
    }

    static applyFill(fill: S2FillData, element: SVGElement, scene: S2BaseScene): void {
        void scene;
        if (fill.isDirty() === false) return;
        if (fill.color.isDirty()) {
            element.setAttribute('fill', fill.color.toString());
        }
        if (fill.opacity.isDirty()) {
            if (fill.opacity.value <= 1) {
                element.setAttribute('fill-opacity', fill.opacity.toFixed(2));
            } else {
                element.removeAttribute('fill-opacity');
            }
        }
    }

    static applyColor(color: S2Color, element: SVGElement, scene: S2BaseScene): void {
        void scene;
        if (color.isDirty()) {
            element.setAttribute('fill', color.toString());
        }
    }

    static applyOpacity(opacity: S2Number, element: SVGElement, scene: S2BaseScene): void {
        void scene;
        if (opacity.isDirty()) {
            if (opacity.value <= 1) {
                element.setAttribute('opacity', opacity.toFixed(2));
            } else {
                element.removeAttribute('opacity');
            }
        }
    }

    static applyTransform(transform: S2Transform, element: SVGElement, scene: S2BaseScene): void {
        void scene;
        if (transform.isDirty()) {
            if (transform.value.isIdentity() === false) {
                element.setAttribute('transform', transform.toFixed(2));
            } else {
                element.removeAttribute('transform');
            }
        }
    }

    static applyFont(font: S2FontData, element: SVGElement, scene: S2BaseScene): void {
        if (font.isDirty() === false) return;
        if (font.size.isDirty()) {
            const size = font.size.get(scene.getViewSpace());
            element.setAttribute('font-size', size.toFixed(1));
        }
        if (font.weight.isDirty()) {
            element.setAttribute('font-weight', font.weight.toFixed(0));
        }
        if (font.family.isDirty()) {
            element.setAttribute('font-family', font.family.toString());
        }
        if (font.style.isDirty()) {
            element.setAttribute('font-style', font.style.value);
        }
    }

    static applyPosition(
        position: S2Point,
        element: SVGElement,
        scene: S2BaseScene,
        xAttribute: string = 'x',
        yAttribute: string = 'y',
    ): void {
        if (position.isDirty()) {
            const p = _vec0;
            position.getInto(p, scene.getViewSpace());
            element.setAttribute(xAttribute, p.x.toFixed(2));
            element.setAttribute(yAttribute, p.y.toFixed(2));
        }
    }

    static applyShiftedPosition(
        position: S2Point,
        shift: S2Offset,
        element: SVGElement,
        scene: S2BaseScene,
        xAttribute: string = 'x',
        yAttribute: string = 'y',
    ): void {
        if (position.isDirty() || shift.isDirty()) {
            const view = scene.getViewSpace();
            const p = _vec0;
            const s = _vec1;
            position.getInto(p, view);
            shift.getInto(s, view);
            element.setAttribute(xAttribute, (p.x + s.x).toFixed(2));
            element.setAttribute(yAttribute, (p.y + s.y).toFixed(2));
        }
    }

    static applyAnchoredPosition(
        position: S2Point,
        extents: S2Extents,
        anchor: S2Enum<S2AnchorOld>,
        element: SVGElement,
        scene: S2BaseScene,
    ): void {
        if (position.isDirty() || extents.isDirty() || anchor.isDirty()) {
            const northWest = S2AnchorUtils.getNorthWest(anchor.value, scene.getViewSpace(), scene, position, extents);
            element.setAttribute('x', northWest.x.toFixed(2));
            element.setAttribute('y', northWest.y.toFixed(2));
        }
    }

    static applyExtents(extents: S2Extents, element: SVGElement, scene: S2BaseScene): void {
        if (extents.isDirty()) {
            const e = _vec0;
            extents.getInto(e, scene.getViewSpace());
            e.scale(2);
            element.setAttribute('width', e.width.toFixed(2));
            element.setAttribute('height', e.height.toFixed(2));
        }
    }

    static applyRadius(radius: S2Length, element: SVGElement, scene: S2BaseScene): void {
        if (radius.isDirty()) {
            const r = radius.get(scene.getViewSpace());
            element.setAttribute('r', r.toFixed(2));
        }
    }

    static applyCornerRadius(radius: S2Length, element: SVGElement, scene: S2BaseScene): void {
        if (radius.isDirty()) {
            const r = radius.get(scene.getViewSpace());
            element.setAttribute('rx', r.toFixed(2));
            element.setAttribute('ry', r.toFixed(2));
        }
    }

    static applyPath(
        polyCurve: S2PolyCurveOLD,
        space: S2SpaceRef,
        pathFrom: S2Number,
        pathTo: S2Number,
        element: SVGElement,
        scene: S2BaseScene,
    ): void {
        polyCurve.updateLength();
        const d = S2DataUtils.polyCurveToSVGPath(polyCurve, pathFrom.get(), pathTo.get(), space.get(), scene);
        if (d.length >= 0) {
            element.setAttribute('d', d);
        } else {
            element.removeAttribute('d');
        }
    }

    protected static polyCurveToSVGPath(
        polyCurve: S2PolyCurveOLD,
        pathFrom: number,
        pathTo: number,
        space: S2Space,
        scene: S2BaseScene,
    ): string {
        if (pathFrom > 0 && pathTo < 1) {
            polyCurve = polyCurve.createPartialCurveRange(pathFrom, pathTo);
        } else if (pathFrom > 0) {
            polyCurve = polyCurve.createPartialCurveFrom(pathFrom);
        } else if (pathTo < 1) {
            polyCurve = polyCurve.createPartialCurveTo(pathTo);
        }

        const curveCount = polyCurve.getCurveCount();
        if (curveCount <= 0 || pathFrom >= pathTo) return '';

        let svgPath = '';
        const currStart = polyCurve.getCurve(0).getStart();
        const prevEnd = new S2Vec2(Infinity, Infinity);
        const point = new S2Vec2();
        const viewSpace = scene.getViewSpace();

        for (let i = 0; i < curveCount; i++) {
            const curve = polyCurve.getCurve(i);

            if (!S2Vec2.equalsV(prevEnd, curve.getStart())) {
                currStart.copy(curve.getStart());
                space.convertPointIntoV(point, currStart, viewSpace);
                svgPath += `M ${point.x.toFixed(2)},${point.y.toFixed(2)} `;
            }

            if (curve instanceof S2LineCurveOLD) {
                space.convertPointIntoV(point, curve.getEnd(), viewSpace);
                svgPath += `L ${point.x.toFixed(2)},${point.y.toFixed(2)} `;
            } else if (curve instanceof S2CubicCurveOLD) {
                const bezierPoints = curve.getBezierPoints();
                svgPath += 'C ';
                for (let j = 1; j < bezierPoints.length; j++) {
                    space.convertPointIntoV(point, bezierPoints[j], viewSpace);
                    svgPath += `${point.x.toFixed(2)},${point.y.toFixed(2)} `;
                }
            }
            const end = curve.getEnd();
            if (S2Vec2.equalsV(currStart, end)) {
                svgPath += 'Z ';
            }
            prevEnd.copy(end);
        }
        return svgPath.trimEnd();
    }

    static applyPreserveWhitespace(preserve: S2Boolean, element: SVGElement, scene: S2BaseScene): void {
        void scene;
        if (preserve.isDirty()) {
            if (preserve.value) {
                element.style.whiteSpaceCollapse = 'preserve';
            } else {
                element.style.whiteSpace = '';
            }
        }
    }

    static applyTextAnchor(anchor: S2Enum<S2TextAnchor>, element: SVGElement, scene: S2BaseScene): void {
        void scene;
        if (anchor.isDirty()) {
            element.setAttribute('text-anchor', anchor.value);
        }
    }
}

const _vec0 = new S2Vec2();
const _vec1 = new S2Vec2();
