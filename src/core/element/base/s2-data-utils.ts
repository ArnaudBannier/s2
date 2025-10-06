import { S2FillData, S2FontData, S2StrokeData } from './s2-base-data.ts';
import {
    S2Boolean,
    S2Color,
    S2Enum,
    S2Extents,
    S2Length,
    S2Number,
    S2Position,
    S2Transform,
    type S2Space,
} from '../../shared/s2-types.ts';
import { S2AnchorUtils, type S2Anchor, type S2TextAnchor } from '../../shared/s2-globals.ts';
import { S2BaseScene } from '../../scene/s2-base-scene.ts';
import type { S2PolyCurve } from '../../math/s2-curve.ts';
import { S2PathUtils } from '../s2-path.ts';

export class S2DataUtils {
    static applyStroke(stroke: S2StrokeData, element: SVGElement, scene: S2BaseScene): void {
        if (stroke.isDirty() === false) return;
        if (stroke.width.isDirty()) {
            const width = stroke.width.get('view', scene.getActiveCamera());
            element.setAttribute('stroke-width', width.toFixed(2));
        }
        if (stroke.color.isDirty()) {
            element.setAttribute('stroke', stroke.color.toRgb());
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
            element.setAttribute('fill', fill.color.toRgb());
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
            element.setAttribute('fill', color.toRgb());
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
            const size = font.size.toSpace('view', scene.getActiveCamera());
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
        position: S2Position,
        element: SVGElement,
        scene: S2BaseScene,
        xAttribute: string = 'x',
        yAttribute: string = 'y',
    ): void {
        if (position.isDirty()) {
            const p = position.toSpace('view', scene.getActiveCamera());
            element.setAttribute(xAttribute, p.x.toFixed(2));
            element.setAttribute(yAttribute, p.y.toFixed(2));
        }
    }

    static applyShiftedPosition(
        position: S2Position,
        shift: S2Extents,
        element: SVGElement,
        scene: S2BaseScene,
        xAttribute: string = 'x',
        yAttribute: string = 'y',
    ): void {
        if (position.isDirty() || shift.isDirty()) {
            const p = position.toSpace('view', scene.getActiveCamera());
            const s = shift.toSpace('view', scene.getActiveCamera());
            element.setAttribute(xAttribute, (p.x + s.x).toFixed(2));
            element.setAttribute(yAttribute, (p.y + s.y).toFixed(2));
        }
    }

    static applyAnchoredPosition(
        position: S2Position,
        extents: S2Extents,
        anchor: S2Enum<S2Anchor>,
        element: SVGElement,
        scene: S2BaseScene,
    ): void {
        if (position.isDirty() || extents.isDirty() || anchor.isDirty()) {
            const northWest = S2AnchorUtils.getNorthWest(
                anchor.value,
                'view',
                scene.getActiveCamera(),
                position,
                extents,
            );
            element.setAttribute('x', northWest.x.toFixed(2));
            element.setAttribute('y', northWest.y.toFixed(2));
        }
    }

    static applyExtents(extents: S2Extents, element: SVGElement, scene: S2BaseScene): void {
        if (extents.isDirty()) {
            const e = extents.toSpace('view', scene.getActiveCamera()).scale(2);
            element.setAttribute('width', e.width.toFixed(2));
            element.setAttribute('height', e.height.toFixed(2));
        }
    }

    static applyRadius(radius: S2Length, element: SVGElement, scene: S2BaseScene): void {
        if (radius.isDirty()) {
            const r = radius.toSpace('view', scene.getActiveCamera());
            element.setAttribute('r', r.toFixed(2));
        }
    }

    static applyCornerRadius(radius: S2Length, element: SVGElement, scene: S2BaseScene): void {
        if (radius.isDirty()) {
            const r = radius.toSpace('view', scene.getActiveCamera());
            element.setAttribute('rx', r.toFixed(2));
            element.setAttribute('ry', r.toFixed(2));
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
            pathFrom.get(),
            pathTo.get(),
            scene.getActiveCamera(),
            space.get(),
        );
        if (d.length >= 0) {
            element.setAttribute('d', d);
        } else {
            element.removeAttribute('d');
        }
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
