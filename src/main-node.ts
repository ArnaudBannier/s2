import './style.css';
import { S2Vec2 } from './core/math/s2-vec2.ts';
import { S2Camera } from './core/math/s2-camera.ts';
import { MTL } from './utils/mtl-colors.ts';
import { S2Node } from './core/element/s2-node.ts';
import { lerp } from './core/math/s2-utils.ts';
import { S2LineEdge } from './core/element/s2-edge.ts';
import { S2Length } from './s2-types.ts';
import type { S2SVGAttributes } from './core/s2-globals.ts';
import { S2Scene } from './core/s2-scene.ts';

const viewport = new S2Vec2(2 * 640.0, 2 * 360.0);
const camera = new S2Camera(new S2Vec2(0.0, 0.0), new S2Vec2(8.0, 4.5), viewport, 1.0);

class SceneFigure extends S2Scene {
    protected arc: S2LineEdge;
    protected nodes: Array<S2Node> = [];

    constructor(svgElement: SVGSVGElement) {
        super(svgElement, camera);

        this.addRect().setPosition(0, 0, 'view').setExtentsV(viewport).setSVGAttribute('fill', MTL.GREY_1);

        const style = this.addStyle();
        style.addRule('.s2-node-background', { fill: MTL.BLUE_3, stroke: MTL.BLUE_8 });
        style.addRule('circle', { fill: MTL.BLUE });
        style.addRule('.line', {
            stroke: MTL.BLUE_8,
            'stroke-width': '4',
            'fill-opacity': '0',
        });
        const sepStyle: S2SVGAttributes = {
            stroke: MTL.BLUE_8,
            'stroke-width': '4',
        };
        style.update();

        this.addGrid().setExtents(8, 5).setSteps(1, 1).setStrokeWidth(2, 'view').setSVGAttribute('stroke', MTL.GREY);

        for (let i = 0; i < 2; i++) {
            const node = this.addNode(3);
            node.addLine({ partIndex: 0 }).addContent('Premier groupe');
            node.addLine({ partIndex: 1, align: 'right' }).addContent('Seconde groupe, l1');
            node.addLine({ partIndex: 1 }).addContent('Seconde groupe, l2');
            node.addLine({ partIndex: 2 }).addContent('Dernier');
            node.setTextGrowFactor(1, 1);
            node.setTextAlign('center');
            if (i === 1) {
                node.createRectBackground().setStrokeWidth(4, 'view');
            } else {
                node.createCircleBackground().setStrokeWidth(4, 'view');
            }
            node.setMinExtents(2, 1, 'world');
            node.setSeparatorStyle(sepStyle);

            this.nodes.push(node);
        }

        this.nodes[0].setPosition(-3, -3, 'world').setAnchor('south east');
        this.nodes[1]
            .setPosition(0, 2, 'world')
            .setAnchor('north west')
            .setTextAlign('left')
            .setTextVerticalAlign('bottom');

        this.arc = this.addCubicEdge(this.nodes[0], this.nodes[1], {
            startDistance: new S2Length(0.5, 'world'),
            endDistance: new S2Length(10, 'view'),
            curveAngle: 30,
            curveTension: 0.3,
        });
        this.arc.addClass('line').update();

        this.update();
    }

    updateCamera(): void {
        this.update();
    }

    updateFigure(angle: number, radius: number, distance: number): void {
        void angle;
        void distance;
        this.nodes[0].setRadius(radius, 'world');
        this.nodes[0].update();
    }
}

const appDiv = document.querySelector<HTMLDivElement>('#app');
if (appDiv) {
    appDiv.innerHTML = `
        <div>
        <h1>My first SVG</h1>
        <svg xmlns="http://www.w3.org/2000/svg" id=test-svg class="responsive-svg" preserveAspectRatio="xMidYMid meet"></svg>
        <div>
            <label for="slide-angle">Angle :</label>
            <input type="range" id="slider-angle" min="0" max="360" value="0">
        </div>
        <div>Radius : <input type="range" id="slider-radius" min="0" max="100" value="0"></div>
        <div>distance : <input type="range" id="slider-distance" min="0" max="100" value="0"></div>
        <div>Zoom : <input type="range" id="slider-zoom" min="1" max="20" value="10"></div>
        <div>
            <button id="reverse-button">Retour</button>
            <button id="animate-button">Avancer</button>
            <button id="timeline-button">Full</button>
        </div>
        </div>
    `;
}

const svgElement = appDiv?.querySelector<SVGSVGElement>('#test-svg');
const sliderAngle = document.querySelector<HTMLInputElement>('#slider-angle');
const sliderRadius = document.querySelector<HTMLInputElement>('#slider-radius');
const sliderDistance = document.querySelector<HTMLInputElement>('#slider-distance');
const sliderZoom = document.querySelector<HTMLInputElement>('#slider-zoom');

if (svgElement && sliderAngle && sliderRadius && sliderDistance) {
    const scene = new SceneFigure(svgElement);
    const update = () => {
        scene.updateFigure(
            sliderAngle.valueAsNumber,
            (2 * sliderRadius.valueAsNumber) / 100,
            lerp(-20, 20, sliderDistance.valueAsNumber / 100),
        );
    };

    sliderAngle.addEventListener('input', update);
    sliderRadius.addEventListener('input', update);
    sliderDistance.addEventListener('input', update);
    sliderZoom?.addEventListener('input', () => {
        camera.viewScale = sliderZoom.valueAsNumber / 10;
        scene.updateCamera();
    });
}
