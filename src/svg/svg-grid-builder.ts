import { Vector2 } from '../math/vector2';
import { S2Camera } from '../s2/math/s2-camera';
import { SVGBuilder } from './svg-builder';

class SVGGridBuilder {
    svgBuilder: SVGBuilder;
    camera: S2Camera;
    lower: Vector2 = new Vector2(0, 0);
    upper: Vector2 = new Vector2(1, 1);
    xStep: number = 1;
    yStep: number = 1;
    epsilon: number = 0.005;

    constructor(svgBuilder: SVGBuilder) {
        this.svgBuilder = svgBuilder;
        this.camera = svgBuilder.camera;
    }

    setLower(x: number, y: number): SVGGridBuilder {
        this.lower.set(x, y);
        return this;
    }

    setUpper(x: number, y: number): SVGGridBuilder {
        this.upper.set(x, y);
        return this;
    }

    setLowerV(lower: Vector2): SVGGridBuilder {
        this.lower = lower;
        return this;
    }

    setUpperV(upper: Vector2): SVGGridBuilder {
        this.upper = upper;
        return this;
    }

    setXStep(xStep: number): SVGGridBuilder {
        this.xStep = xStep;
        return this;
    }

    setYStep(yStep: number): SVGGridBuilder {
        this.yStep = yStep;
        return this;
    }

    build(): SVGGElement {
        const groupElement = SVGBuilder.createGElement();
        for (let x = this.lower.x; x < this.upper.x + this.epsilon; x += this.xStep) {
            groupElement.appendChild(this.svgBuilder.createLine(x, this.lower.y, x, this.upper.y));
        }
        for (let y = this.lower.y; y < this.upper.y + this.epsilon; y += this.yStep) {
            groupElement.appendChild(this.svgBuilder.createLine(this.lower.x, y, this.upper.x, y));
        }
        return groupElement;
    }
}

export { SVGGridBuilder };
