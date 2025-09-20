import { S2FillData, S2FontData, S2StrokeData } from './s2-base-data.ts';
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
import { S2AnchorUtils, type S2Anchor } from '../../s2-globals.ts';
import { S2BaseScene } from '../../s2-base-scene.ts';
import type { S2PolyCurve } from '../../math/s2-curve.ts';
import { S2PathUtils } from '../s2-path.ts';

export type S2DataApplicationMode = 'always' | 'if-active';

export class S2DataUtils {
    static applyStroke(
        stroke: S2StrokeData,
        element: SVGElement,
        scene: S2BaseScene,
        mode: S2DataApplicationMode = 'if-active',
    ): void {
        if (stroke.width.state === S2TypeState.Active || mode === 'always') {
            const width = stroke.width.getInherited('view', scene.getActiveCamera());
            element.setAttribute('stroke-width', width.toString());
        } else {
            element.removeAttribute('stroke-width');
        }

        if (stroke.color.state === S2TypeState.Active || mode === 'always') {
            element.setAttribute('stroke', stroke.color.getInheritedRgb());
        } else {
            element.removeAttribute('stroke');
        }

        if ((stroke.opacity.state === S2TypeState.Active && stroke.opacity.value <= 1) || mode === 'always') {
            element.setAttribute('stroke-opacity', stroke.opacity.getInherited().toFixed(2));
        } else {
            element.removeAttribute('stroke-opacity');
        }

        if (stroke.lineCap.state === S2TypeState.Active || mode === 'always') {
            element.setAttribute('stroke-linecap', stroke.lineCap.getInherited());
        } else {
            element.removeAttribute('stroke-linecap');
        }

        if (stroke.lineJoin.state === S2TypeState.Active || mode === 'always') {
            element.setAttribute('stroke-linejoin', stroke.lineJoin.getInherited());
        } else {
            element.removeAttribute('stroke-linejoin');
        }
    }

    static applyFill(
        fill: S2FillData,
        element: SVGElement,
        scene: S2BaseScene,
        mode: S2DataApplicationMode = 'if-active',
    ): void {
        void scene;
        // if (fill.color.dirty) {
        if (fill.color.state === S2TypeState.Active || mode === 'always') {
            element.setAttribute('fill', fill.color.getInheritedRgb());
        } else {
            element.removeAttribute('fill');
        }
        // }

        if ((fill.opacity.state === S2TypeState.Active && fill.opacity.value <= 1) || mode === 'always') {
            element.setAttribute('fill-opacity', fill.opacity.getInherited().toFixed(2));
        } else {
            element.removeAttribute('fill-opacity');
        }
    }

    static applyColor(
        color: S2Color,
        element: SVGElement,
        scene: S2BaseScene,
        mode: S2DataApplicationMode = 'if-active',
    ): void {
        void scene;
        if (color.state === S2TypeState.Active || mode === 'always') {
            element.setAttribute('fill', color.getInheritedRgb());
        } else {
            element.removeAttribute('fill');
        }
    }

    static applyOpacity(
        opacity: S2Number,
        element: SVGElement,
        scene: S2BaseScene,
        mode: S2DataApplicationMode = 'if-active',
    ): void {
        void scene;
        if (opacity.state === S2TypeState.Active || mode === 'always') {
            element.setAttribute('opacity', opacity.getInherited().toFixed(2));
        } else {
            element.removeAttribute('opacity');
        }
    }

    static applyTransform(
        transform: S2Transform,
        element: SVGElement,
        scene: S2BaseScene,
        mode: S2DataApplicationMode = 'if-active',
    ): void {
        void scene;
        if (transform.state === S2TypeState.Active || mode === 'always') {
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
}
