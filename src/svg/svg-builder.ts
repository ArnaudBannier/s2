import { Vector2 } from '../math/vector2';
import { S2Camera } from '../s2/math/s2-camera';

type SVGAttributeMap = Record<string, string>;

class SVGUtils {
    static getNumber(attrMap: SVGAttributeMap | undefined, key: string, defaultValue: number = 0): number {
        if (attrMap && key in attrMap) {
            const parsed = parseFloat(attrMap[key]);
            return isNaN(parsed) ? defaultValue : parsed;
        }
        return defaultValue;
    }

    static getBoolean(attrMap: SVGAttributeMap | undefined, key: string, defaultValue: boolean = false): boolean {
        if (attrMap && key in attrMap) {
            return attrMap[key].toLowerCase() === 'true';
        }
        return defaultValue;
    }

    static setAttributes(element: SVGElement, attrMap?: Record<string, string>): void {
        if (attrMap === undefined) return;
        for (const [key, value] of Object.entries(attrMap)) {
            element.setAttribute(key, value);
        }
    }
}

class SVGBuilder {
    camera: S2Camera;
    svgElement: SVGSVGElement;
    static readonly namespace = 'http://www.w3.org/2000/svg';

    constructor(camera: S2Camera, svgElement: SVGSVGElement) {
        this.camera = camera;
        this.svgElement = svgElement;
    }

    static createCircleElement(attrMap?: SVGAttributeMap): SVGCircleElement {
        const element = document.createElementNS(this.namespace, 'circle') as SVGCircleElement;
        SVGUtils.setAttributes(element, attrMap);
        return element;
    }

    static createDefsElement(): SVGDefsElement {
        return document.createElementNS(this.namespace, 'defs') as SVGDefsElement;
    }

    static createLineElement(attrMap?: SVGAttributeMap): SVGLineElement {
        const element = document.createElementNS(this.namespace, 'line') as SVGLineElement;
        SVGUtils.setAttributes(element, attrMap);
        return element;
    }

    static createGElement(attrMap?: SVGAttributeMap): SVGGElement {
        const element = document.createElementNS(this.namespace, 'g') as SVGGElement;
        SVGUtils.setAttributes(element, attrMap);
        return element;
    }

    static createMarkerElement(attrMap?: SVGAttributeMap): SVGMarkerElement {
        const element = document.createElementNS(this.namespace, 'marker') as SVGMarkerElement;
        SVGUtils.setAttributes(element, attrMap);
        return element;
    }

    static createPathElement(attrMap?: SVGAttributeMap): SVGPathElement {
        const element = document.createElementNS(this.namespace, 'path') as SVGPathElement;
        SVGUtils.setAttributes(element, attrMap);
        return element;
    }

    static createRectElement(attrMap?: SVGAttributeMap): SVGRectElement {
        const element = document.createElementNS(this.namespace, 'rect') as SVGRectElement;
        SVGUtils.setAttributes(element, attrMap);
        return element;
    }

    static createSymbolElement(attrMap?: SVGAttributeMap): SVGSymbolElement {
        const element = document.createElementNS(this.namespace, 'symbol') as SVGSymbolElement;
        SVGUtils.setAttributes(element, attrMap);
        return element;
    }

    static createTextElement(attrMap?: SVGAttributeMap): SVGTextElement {
        const element = document.createElementNS(this.namespace, 'text') as SVGTextElement;
        SVGUtils.setAttributes(element, attrMap);
        return element;
    }

    static createUseElement(attrMap?: SVGAttributeMap): SVGUseElement {
        const element = document.createElementNS(this.namespace, 'use') as SVGUseElement;
        SVGUtils.setAttributes(element, attrMap);
        return element;
    }

    appendChild(element: SVGElement): SVGBuilder {
        this.svgElement.appendChild(element);
        return this;
    }

    insertBefore(element: SVGElement, reference: SVGElement | null): SVGBuilder {
        this.svgElement.insertBefore(element, reference);
        return this;
    }

    replaceChild(element: SVGElement, toReplace?: SVGElement): SVGBuilder {
        if (toReplace && this.svgElement.contains(toReplace)) {
            this.svgElement.replaceChild(element, toReplace);
        } else {
            this.svgElement.appendChild(element);
        }
        return this;
    }

    appendChildren(children: SVGElement[]): SVGBuilder {
        this.svgElement.append(...children);
        return this;
    }

    createCircle(cx: number, cy: number, r: number, attrMap?: SVGAttributeMap): SVGCircleElement {
        const circle = SVGBuilder.createCircleElement(attrMap);
        const center = this.camera.worldToView(cx, cy);
        const radius = this.camera.worldToViewLength(r);
        circle.setAttribute('cx', center.x.toString());
        circle.setAttribute('cy', center.y.toString());
        circle.setAttribute('r', radius.toString());
        return circle;
    }

    createCircleV(center: Vector2, r: number, attrMap?: SVGAttributeMap): SVGCircleElement {
        return this.createCircle(center.x, center.y, r, attrMap);
    }

    createLine(x1: number, y1: number, x2: number, y2: number, attrMap?: SVGAttributeMap): SVGLineElement {
        const lineElement = SVGBuilder.createLineElement(attrMap);
        const point1 = this.camera.worldToView(x1, y1);
        const point2 = this.camera.worldToView(x2, y2);
        lineElement.setAttribute('x1', point1.x.toString());
        lineElement.setAttribute('y1', point1.y.toString());
        lineElement.setAttribute('x2', point2.x.toString());
        lineElement.setAttribute('y2', point2.y.toString());
        return lineElement;
    }

    createLineV(point1: Vector2, point2: Vector2, attrMap?: SVGAttributeMap): SVGLineElement {
        return this.createLine(point1.x, point1.y, point2.x, point2.y, attrMap);
    }

    createArrowTipMarker(): SVGMarkerElement {
        const marker = SVGBuilder.createMarkerElement();
        marker.setAttribute('markerWidth', '4');
        marker.setAttribute('markerHeight', '4');
        marker.setAttribute('refX', '5');
        marker.setAttribute('refY', '5');
        marker.setAttribute('orient', 'auto');
        marker.setAttribute('markerUnits', 'strokeWidth');
        marker.setAttribute('viewBox', '0 0 10 10');
        const arrowPath = SVGBuilder.createPathElement();
        arrowPath.setAttribute('d', 'M 0 0 L 10 5 L 0 10 L 2 5 z');
        arrowPath.setAttribute('fill', 'context-stroke');
        marker.appendChild(arrowPath);
        return marker;
    }

    createArrowTipSymbol(): SVGSymbolElement {
        const arrowPath = SVGBuilder.createPathElement();
        arrowPath.setAttribute('d', 'M 0 0 L 10 5 L 0 10 L 2 5 z');
        const symbol = SVGBuilder.createSymbolElement();
        symbol.setAttribute('viewBox', '0 0 10 10');
        symbol.setAttribute('width', '20');
        symbol.setAttribute('height', '20');
        symbol.appendChild(arrowPath);
        return symbol;
    }

    createRect(x: number, y: number, width: number, height: number, attrMap?: SVGAttributeMap): SVGRectElement {
        const rect = SVGBuilder.createRectElement(attrMap);
        const position = this.camera.worldToView(x, y);
        const viewW = this.camera.worldToViewLength(width);
        const viewH = this.camera.worldToViewLength(height);
        const viewRX = this.camera.worldToViewLength(SVGUtils.getNumber(attrMap, 'rx', 0));
        const viewRY = this.camera.worldToViewLength(SVGUtils.getNumber(attrMap, 'ry', 0));
        rect.setAttribute('x', position.x.toString());
        rect.setAttribute('y', position.x.toString());
        rect.setAttribute('width', viewW.toString());
        rect.setAttribute('height', viewH.toString());
        rect.setAttribute('rx', viewRX.toString());
        rect.setAttribute('ry', viewRY.toString());
        return rect;
    }

    createRectV(position: Vector2, width: number, height: number, attrMap?: SVGAttributeMap): SVGRectElement {
        return this.createRect(position.x, position.y, width, height, attrMap);
    }

    createText(content: string, x: number, y: number, attrMap?: SVGAttributeMap): SVGTextElement {
        const position = this.camera.worldToView(x, y);
        const textElement = SVGBuilder.createTextElement(attrMap);
        textElement.setAttribute('x', position.x.toString());
        textElement.setAttribute('y', position.x.toString());
        textElement.textContent = content;
        return textElement;
    }

    createTextV(content: string, position: Vector2, attrMap?: SVGAttributeMap): SVGTextElement {
        return this.createText(content, position.x, position.y, attrMap);
    }

    rotateDeg(element: SVGGraphicsElement, angle: number, cx: number, cy: number): SVGGraphicsElement {
        const center = this.camera.worldToView(cx, cy);
        const transform = this.svgElement.createSVGTransform();
        transform.setRotate(-angle, center.x, center.y);
        element.transform.baseVal.appendItem(transform);
        return element;
    }

    rotateRad(element: SVGGraphicsElement, angle: number, cx: number, cy: number): SVGGraphicsElement {
        return this.rotateDeg(element, (angle * Math.PI) / 180.0, cx, cy);
    }

    translate(element: SVGGraphicsElement, tx: number, ty: number): SVGGraphicsElement {
        const v = this.camera.worldToView(tx, ty);
        const transform = this.svgElement.createSVGTransform();
        transform.setTranslate(v.x, v.y);
        element.transform.baseVal.appendItem(transform);
        return element;
    }
}

export { SVGBuilder, SVGUtils };
export type { SVGAttributeMap };

// function getEndPoint(element: SVGGeometryElement): Vector2 | null {
//     if (element instanceof SVGLineElement) {
//         // Pour une ligne, on lit directement x2, y2
//         return new Vector2(element.x2.baseVal.value, element.y2.baseVal.value);
//     } else if (element instanceof SVGPathElement) {
//         // Pour un path, on prend le point au maximum de la longueur
//         const totalLength = element.getTotalLength();
//         const point = element.getPointAtLength(totalLength);
//         return new Vector2(point.x, point.y);
//     } else if (element instanceof SVGPolylineElement || element instanceof SVGPolygonElement) {
//         const points = element.points;
//         if (points.length > 0) {
//             const lastPoint = points.getItem(points.length - 1);
//             return new Vector2(lastPoint.x, lastPoint.y);
//         }
//         return null;
//     } else {
//         // Autres cas : on peut essayer de prendre le point à la longueur max
//         try {
//             const totalLength = element.getTotalLength();
//             const point = element.getPointAtLength(totalLength);
//             return new Vector2(point.x, point.y);
//         } catch (e) {
//             console.warn('Unsupported SVG element for end point detection.', e);
//             return null;
//         }
//     }
// }
