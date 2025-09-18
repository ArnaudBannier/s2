import './style.css';
import { S2Vec2 } from './core/math/s2-vec2.ts';
import { S2Camera } from './core/math/s2-camera.ts';
import { MTL_HEX } from './utils/mtl-colors.ts';
import { type S2SVGAttributes } from './core/s2-globals.ts';
import { S2Scene } from './core/s2-scene.ts';
import { invLerp } from './core/math/s2-utils.ts';
import type { S2Path } from './core/element/s2-path.ts';
import type { S2Line } from './core/element/s2-line.ts';

const viewport = new S2Vec2(640.0, 360.0);
const camera = new S2Camera(new S2Vec2(0.0, 0.0), new S2Vec2(8.0, 4.5), viewport, 1.0);

class SceneFigure extends S2Scene {
    protected path: S2Path;
    protected tangent: S2Line;
    protected tangentStyle: S2SVGAttributes = {
        stroke: MTL_HEX.RED,
        'stroke-width': '3',
    };

    constructor(svgElement: SVGSVGElement) {
        super(svgElement, camera);

        this.addFillRect().setSVGAttribute('fill', MTL_HEX.GREY_2);

        const pathStyle: S2SVGAttributes = {
            stroke: MTL_HEX.GREEN,
            'stroke-width': '6',
            'fill-opacity': '0',
        };

        this.addGrid()
            .setExtents(8, 5)
            .setSteps(1, 1)
            .setStrokeWidth(2, 'view')
            .setSVGAttribute('stroke', MTL_HEX.GREY);

        const p0 = new S2Vec2(-3, -2);
        const co0 = new S2Vec2(4, 8);
        const ci1 = new S2Vec2(-3, -6);
        const p1 = new S2Vec2(4, -2);
        const ci2 = new S2Vec2(-1, 2);
        const p2 = new S2Vec2(2, 0);

        const path = this.addPath();
        path.setSpace('world')
            .setSampleCount(32)
            .setStartV(p0)
            .cubicToV(co0, ci1, p1)
            .smoothCubicToV(ci2, p2)
            .lineToV(S2Vec2.sub(p2, ci2));
        path.setSVGAttributes(pathStyle);
        //path.setPathRange(0.15, 0.95);
        this.path = path;

        this.tangent = this.addLine().setSVGAttributes(this.tangentStyle);

        this.update();
    }

    updateMouse(x: number, y: number): void {
        const worldPoint = this.activeCamera.viewToWorld(x, y);
        const lower = this.activeCamera.getLower().shiftX(+1);
        const upper = this.activeCamera.getUpper().shiftX(-1);
        const t = invLerp(lower.x, upper.x, worldPoint.x);
        this.path.setPathTo(t).update();

        if (0 < t && t < 1) {
            this.svg.appendChild(this.tangent);
            this.tangent.setStartV(this.path.getPointAt(t));
            this.tangent.setEndV(S2Vec2.add(this.path.getPointAt(t), this.path.getTangentAt(t).normalize()));
            this.tangent.update();
        } else {
            this.svg.removeChild(this.tangent);
        }
    }

    updateCamera(): void {
        this.update();
    }
}

const appDiv = document.querySelector<HTMLDivElement>('#app');
if (appDiv) {
    appDiv.innerHTML = `
        <div>
        <h1>My first SVG</h1>
            <svg xmlns="http://www.w3.org/2000/svg" id=test-svg class="responsive-svg" preserveAspectRatio="xMidYMid meet"></svg>
        <div>Zoom : <input type="range" id="slider-zoom" min="1" max="20" value="10"></div>
        </div>
    `;
}

const svgElement = appDiv?.querySelector<SVGSVGElement>('#test-svg');
const sliderZoom = document.querySelector<HTMLInputElement>('#slider-zoom');

if (svgElement) {
    const scene = new SceneFigure(svgElement);
    sliderZoom?.addEventListener('input', () => {
        camera.viewScale = sliderZoom.valueAsNumber / 10;
        scene.updateCamera();
    });
    svgElement.addEventListener('mousemove', (event) => {
        const pt = new DOMPoint(event.clientX, event.clientY);
        const ctm = svgElement.getScreenCTM();
        if (!ctm) return;

        const local = pt.matrixTransform(ctm.inverse());
        scene.updateMouse(local.x, local.y);
    });
}
