import './style.css';
import { Vector2 } from './math/vector2.ts';
import { S2Camera } from './s2/math/s2-camera.ts';
import { MTL } from './utils/mtl-colors.ts';
import { S2Circle } from './s2/element/s2-circle.ts';
import { S2AnimatedScene } from './s2/s2-animated-scene.ts';

const viewport = new Vector2(1.5 * 640.0, 1.5 * 360.0);
const camera = new S2Camera(new Vector2(0.0, 0.0), new Vector2(8.0, 4.5), viewport, 1.0);

class SceneFigure extends S2AnimatedScene {
    protected circle: S2Circle;
    protected styles = {
        backBase: {
            fill: MTL.GREY_6,
            stroke: MTL.GREY_4,
            'stroke-width': '4',
        },
        backSlct: {
            fill: MTL.BLUE_GREY_9,
            stroke: MTL.LIGHT_BLUE_5,
        },
        backExpl: {
            fill: MTL.LIGHT_BLUE_7,
            stroke: MTL.LIGHT_BLUE_2,
        },
    };

    constructor(svgElement: SVGSVGElement) {
        super(svgElement, camera);
        this.addFillRect().setAttribute('fill', MTL.GREY_8);
        this.addGrid().setExtents(8, 5).setSteps(1, 1).setStrokeWidth(2, 'view').setAttribute('stroke', MTL.GREY_7);

        this.circle = this.addCircle();
        this.circle.setPosition(0, 0, 'world').setRadius(2, 'world').setStyle(this.styles.backBase);

        this.update();
        this.createAnimation();
    }

    createAnimation(): void {
        this.resetTimeline();

        this.circle.setStyle(this.styles.backBase);
        this.makeStep();
        console.log('step', this.targetStepIndex);
        this.addStyleAnimation(
            this.circle,
            this.styles.backBase,
            this.styles.backSlct,
            { duration: 1000, easing: 'inOut' },
            '+=0',
        );
        this.makeStep();
        this.addStyleAnimation(
            this.circle,
            this.styles.backSlct,
            this.styles.backExpl,
            { duration: 1000, easing: 'inOut' },
            '+=0',
        );
        this.makeStep();
        this.addStyleAnimation(
            this.circle,
            this.styles.backExpl,
            this.styles.backBase,
            { duration: 1000, easing: 'inOut' },
            '+=0',
        );
    }
}

const appDiv = document.querySelector<HTMLDivElement>('#app');
if (appDiv) {
    appDiv.innerHTML = `
        <div>
            <h1>My first SVG</h1>
            <svg xmlns="http://www.w3.org/2000/svg" id=test-svg></svg>
            <div>
                <button id="reset-button">Recommencer</button>
                <button id="prev-button">Retour</button>
                <button id="next-button">Suivant</button>
                <button id="play-button">Rejouer</button>
            </div>
        </div>`;
}

const svgElement = appDiv?.querySelector<SVGSVGElement>('#test-svg');

if (svgElement) {
    const scene = new SceneFigure(svgElement);

    document.querySelector<HTMLButtonElement>('#reset-button')?.addEventListener('click', () => {
        scene.reset();
    });
    document.querySelector<HTMLButtonElement>('#prev-button')?.addEventListener('click', () => {
        scene.createPrevStep();
    });
    document.querySelector<HTMLButtonElement>('#next-button')?.addEventListener('click', () => {
        scene.createNextStep();
    });
    document.querySelector<HTMLButtonElement>('#play-button')?.addEventListener('click', () => {
        scene.play();
    });
}
