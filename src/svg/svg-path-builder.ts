import { Vector2 } from '../math/vector2';
import { S2Camera } from '../s2/math/s2-camera';
import { SVGBuilder } from './svg-builder';
import type { SVGAttributeMap } from './svg-builder';

class SVGPathBuilder {
    svgBuilder: SVGBuilder;
    camera: S2Camera;
    parts: string[] = [];
    start: Vector2 = new Vector2();
    end: Vector2 = new Vector2();
    attrMap: SVGAttributeMap | undefined = undefined;

    constructor(svgBuilder: SVGBuilder) {
        this.svgBuilder = svgBuilder;
        this.camera = svgBuilder.camera;
    }

    moveTo(x: number, y: number): SVGPathBuilder {
        this.end.set(x, y);
        const point = this.camera.worldToView(x, y);
        this.parts.push(`M ${point.x} ${point.y}`);
        return this;
    }

    moveToV(v: Vector2): SVGPathBuilder {
        return this.moveTo(v.x, v.y);
    }

    lineTo(x: number, y: number): SVGPathBuilder {
        this.end.set(x, y);
        const point = this.camera.worldToView(x, y);
        this.parts.push(`L ${point.x} ${point.y}`);
        return this;
    }

    lineToV(v: Vector2): SVGPathBuilder {
        return this.lineTo(v.x, v.y);
    }

    curveTo(dx1: number, dy1: number, dx2: number, dy2: number, x: number, y: number): SVGPathBuilder {
        const d1 = this.camera.worldToView(this.end.x + dx1, this.end.y + dy1);
        const d2 = this.camera.worldToView(x + dx2, y + dy2);
        const point = this.camera.worldToView(x, y);
        this.end.set(x, y);
        this.parts.push(`C ${d1.x} ${d1.y}, ${d2.x} ${d2.y}, ${point.x} ${point.y}`);
        return this;
    }

    curveToV(dv1: Vector2, dv2: Vector2, v: Vector2): SVGPathBuilder {
        return this.curveTo(dv1.x, dv1.y, dv2.x, dv2.y, v.x, v.y);
    }

    circleArcTo(r: number, x: number, y: number, largeArcFlag: number = 0, sweepFlag: number = 0): SVGPathBuilder {
        const wr = this.camera.worldToViewLength(r);
        const point = this.camera.worldToView(x, y);
        this.end.set(x, y);
        this.parts.push(`A ${wr} ${wr} 0 ${largeArcFlag} ${sweepFlag} ${point.x} ${point.y}`);
        return this;
    }
    // rx ry x-axis-rotation large-arc-flag sweep-flag x y
    arcTo(
        rx: number,
        ry: number,
        angleDeg: number,
        x: number,
        y: number,
        largeArcFlag: number = 0,
        sweepFlag: number = 0,
    ): SVGPathBuilder {
        const wrx = this.camera.worldToViewLength(rx);
        const wry = this.camera.worldToViewLength(ry);
        const point = this.camera.worldToView(x, y);
        this.end.set(x, y);
        this.parts.push(`A ${wrx} ${wry} ${angleDeg} ${largeArcFlag} ${sweepFlag} ${point.y} ${point.x}`);
        return this;
    }

    close(): SVGPathBuilder {
        this.end = this.start;
        this.parts.push('Z');
        return this;
    }

    setAttributes(attrMap?: SVGAttributeMap): SVGPathBuilder {
        this.attrMap = attrMap;
        return this;
    }

    build(): SVGPathElement {
        const path = SVGBuilder.createPathElement(this.attrMap);
        path.setAttribute('d', this.parts.join(' '));
        return path;
    }
}

export { SVGPathBuilder };
