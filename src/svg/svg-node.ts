import { Vector2 } from '../math/vector2';
import { S2Camera } from '../s2/math/s2-camera';
import { ShapeUtils } from '../math/shape-utils';
import { SVGBuilder, SVGUtils } from './svg-builder';
import { SVGPathBuilder } from './svg-path-builder';
import type { SVGAttributeMap } from './svg-builder';

class SVGNode {
    svgBuilder: SVGBuilder;
    camera: S2Camera;
    group: SVGGElement;
    text: SVGTextElement | null;
    background: SVGGeometryElement | null;
    position: Vector2;
    bbox: DOMRect;
    radius: number;

    constructor(svgBuilder: SVGBuilder) {
        this.svgBuilder = svgBuilder;
        this.camera = svgBuilder.camera;
        this.group = SVGBuilder.createGElement();
        this.text = null;
        this.background = null;
        this.bbox = new DOMRect(0, 0, 0, 0);
        this.radius = 0;
        this.position = new Vector2(0, 0);
    }

    setPosition(x: number, y: number): SVGNode {
        this.position.set(x, y);
        const viewPos = this.camera.worldToViewV(this.position);
        this.group.setAttribute('transform', `translate(${viewPos.x} ${viewPos.y})`);
        return this;
    }

    setPositionV(position: Vector2): SVGNode {
        this.position.copy(position);
        const viewPos = this.camera.worldToViewV(this.position);
        this.group.setAttribute('transform', `translate(${viewPos.x} ${viewPos.y})`);
        return this;
    }

    addText(content: string, attrMap?: SVGAttributeMap): SVGNode {
        const text = SVGBuilder.createTextElement(attrMap);
        text.textContent = content;
        if (text.hasAttribute('text-anchor') === false) {
            text.setAttribute('text-anchor', 'middle');
        }
        if (text.hasAttribute('dominant-baseline') === false) {
            text.setAttribute('dominant-baseline', 'middle');
        }

        if (this.text && this.text.parentNode === this.group) {
            this.group.replaceChild(text, this.text);
        } else {
            this.group.appendChild(text);
        }
        this.text = text;
        return this;
    }

    addBackground(attrMap?: SVGAttributeMap): SVGNode {
        if (this.text === null) return this;
        const background = SVGBuilder.createCircleElement(attrMap);
        background.setAttribute('cx', '0');
        background.setAttribute('cy', '0');
        if (background.hasAttribute('r') === false) {
            background.setAttribute('r', '10');
        }

        if (this.background && this.background.parentNode === this.group) {
            this.group.replaceChild(background, this.background);
        } else {
            this.group.insertBefore(background, this.text);
        }
        this.background = background;
        return this;
    }

    setSize(r: number): SVGNode {
        if (this.background) {
            const viewRadius = this.camera.worldToViewLength(r);
            this.radius = r;
            this.background.setAttribute('r', viewRadius.toString());
        }
        return this;
    }

    adjustSize(padding: number = 10): SVGNode {
        if (!this.text || !this.background) return this;
        this.bbox = this.text.getBBox();
        const radiusView = 0.5 * Math.max(this.bbox.width, this.bbox.height) + padding;
        this.radius = this.camera.viewToWorldLength(radiusView);
        this.background.setAttribute('r', radiusView.toString());
        return this;
    }

    getSVGElement(): SVGGElement {
        return this.group;
    }

    getPosition(): Vector2 {
        return this.position.clone();
    }

    getPointInDirection(direction: Vector2, outerSep: number = 0.5): Vector2 {
        const dist = this.radius + outerSep;
        const shift = direction.clone().normalize().scale(dist);
        return this.position.clone().addV(shift);
    }

    lineEdgeTo(target: SVGNode, attrMaps: { path?: SVGAttributeMap; edge?: SVGAttributeMap } = {}): SVGLineElement {
        const edge = attrMaps.edge ?? {};
        const outerSep1 = SVGUtils.getNumber(edge, 'start-outer-sep', 0);
        const outerSep2 = SVGUtils.getNumber(edge, 'end-outer-sep', 0.5);

        const toTarget = target.getPosition().subV(this.position);
        const point1 = this.getPointInDirection(toTarget, outerSep1);
        const point2 = target.getPointInDirection(toTarget.negate(), outerSep2);
        return this.svgBuilder.createLineV(point1, point2, attrMaps.path);
    }

    curveEdgeTo(target: SVGNode, attrMaps: { path?: SVGAttributeMap; edge?: SVGAttributeMap } = {}): SVGPathElement {
        const edge = attrMaps.edge ?? {};
        const outerSep1 = SVGUtils.getNumber(edge, 'start-outer-sep', 0);
        const outerSep2 = SVGUtils.getNumber(edge, 'end-outer-sep', 0.5);
        const angle = SVGUtils.getNumber(edge, 'angle', 30);
        const tension = SVGUtils.getNumber(edge, 'tension', 0.25);
        const tension1 = SVGUtils.getNumber(edge, 'start-tension', tension);
        const tension2 = SVGUtils.getNumber(edge, 'end-tension', tension);
        const sign = SVGUtils.getBoolean(edge, 's-curve', false) ? 1 : -1;

        const toTarget = target.getPosition().subV(this.position);
        const dir1 = toTarget.clone().rotateDeg(angle).scale(tension1);
        const dir2 = toTarget
            .negate()
            .rotateDeg(sign * angle)
            .scale(tension2);
        const point1 = this.getPointInDirection(dir1, outerSep1);
        const point2 = target.getPointInDirection(dir2, outerSep2);
        const path = new SVGPathBuilder(this.svgBuilder)
            .setAttributes(attrMaps.path)
            .moveToV(point1)
            .curveToV(dir1, dir2, point2)
            .build();
        return path;
    }

    circleEdgeTo(target: SVGNode, attrMaps: { path?: SVGAttributeMap; edge?: SVGAttributeMap } = {}): SVGPathElement {
        const edge = attrMaps.edge ?? {};
        const radius = SVGUtils.getNumber(edge, 'r', 4);
        const outerSep1 = SVGUtils.getNumber(edge, 'start-outer-sep', 0);
        const outerSep2 = SVGUtils.getNumber(edge, 'end-outer-sep', 0.5);
        const largeArcFlag = SVGUtils.getNumber(edge, 'large-arc-flag', 0);
        const sweepFlag = SVGUtils.getNumber(edge, 'sweep-flag', 0);

        const center = ShapeUtils.getArcCenter(this.position, target.position, radius, sweepFlag === 1);

        const intersections1 = ShapeUtils.circleVsCircle(
            this.position.x,
            this.position.y,
            this.radius + outerSep1,
            center.x,
            center.y,
            radius,
        );
        const point1 = ShapeUtils.getClosestPoint(target.position, intersections1);
        const intersections2 = ShapeUtils.circleVsCircle(
            target.position.x,
            target.position.y,
            target.radius + outerSep2,
            center.x,
            center.y,
            radius,
        );
        const point2 = ShapeUtils.getClosestPoint(this.position, intersections2);
        const path = new SVGPathBuilder(this.svgBuilder)
            .setAttributes(attrMaps.path)
            .moveToV(point1)
            .circleArcTo(radius, point2.x, point2.y, largeArcFlag, sweepFlag)
            .build();
        return path;
    }
}

export { SVGNode };
