import './style.css';
import { Vector2 } from './math/vector2.ts';
import { S2Camera } from './s2/math/s2-camera.ts';
import { MTL } from './utils/mtl-colors.ts';
import { S2Circle } from './s2/element/s2-circle.ts';
import { S2AnimatedScene } from './s2/s2-animated-scene.ts';
import type { S2Path } from './s2/element/s2-path.ts';

const viewportScale = 1.5;
const viewport = new Vector2(640.0, 360.0).scale(viewportScale);
const camera = new S2Camera(new Vector2(0.0, 0.0), new Vector2(8.0, 4.5), viewport, 1.0);

class SceneFigure extends S2AnimatedScene {
    protected circle: S2Circle;
    protected path: S2Path;
    protected styles = {
        backBase: {
            fill: MTL.GREY_6,
            stroke: MTL.GREY_4,
            'stroke-width': '4',
        },
        backSlct: {
            fill: MTL.BLUE_GREY_9,
            stroke: MTL.LIGHT_BLUE_5,
            'stroke-width': '4',
        },
        backExpl: {
            fill: MTL.LIGHT_BLUE_7,
            stroke: MTL.LIGHT_BLUE_2,
            'stroke-width': '4',
        },
        backOpaque: {
            opacity: '1',
        },
        backTransparent: {
            opacity: '0',
        },
        path: {
            stroke: MTL.CYAN,
            'stroke-width': '4',
            'fill-opacity': '0',
        },
        path2: {
            stroke: MTL.AMBER,
        },
    };

    constructor(svgElement: SVGSVGElement) {
        super(svgElement, camera);
        this.circle = this.addCircle();
        this.path = this.addPath();
        this.createAnimation();
    }

    createInitialState(): void {
        this.svg.removeChildren();
        this.addFillRect().setAttribute('fill', MTL.GREY_8);
        this.addGrid().setExtents(8, 5).setSteps(1, 1).setStrokeWidth(2, 'view').setAttribute('stroke', MTL.GREY_7);

        this.circle = this.addCircle();
        this.path = this.addPath();
        this.circle.setPosition(0, 0, 'world').setRadius(2, 'world').setStyle(this.styles.backBase);
        this.path.setStyle(this.styles.path);
        this.path.setSpace('world').setStart(-5, 0).cubicTo(0, -4, 0, -4, +5, 0).cubicTo(0, +4, 0, +4, -5, 0);
        this.path.makePartial(0, 0);
    }

    createAnimation(): void {
        this.resetTimeline();
        this.createInitialState();
        this.update();

        this.recordElement(this.circle);
        this.recordElement(this.path);

        this.makeStep();
        this.addStyleAnimation(this.circle, this.styles.backSlct, { duration: 1000, easing: 'outCubic' }, '+=0');
        this.path.makePartial(0.2, 0.5);
        this.addDrawAnimation(this.path, { duration: 1000, ease: 'outCubic' }, '<<+=200');

        this.makeStep();
        this.addStyleAnimation(this.circle, this.styles.backExpl, { duration: 1000, easing: 'outBounce' }, '+=0');
        this.path.makePartial(0.5, 1.0);
        this.addDrawAnimation(this.path, { duration: 1000, ease: 'outBounce' }, '<<+=200');
        this.addStyleAnimation(this.path, this.styles.path2, { duration: 1000 }, '<<');

        const circle = this.addCircle()
            .setStyle({ ...this.styles.backExpl, ...this.styles.backTransparent })
            .setPosition(5, 0, 'world')
            .setRadius(10, 'view')
            .update();

        this.circle.setPosition(-1, 1, 'world');
        this.animateMove(this.circle, { duration: 1000, ease: 'inOut' }, '<<');
        this.addStyleAnimation(circle, this.styles.backOpaque, { duration: 500 }, '<<');

        this.makeStep();
        this.addStyleAnimation(circle, this.styles.backTransparent, { duration: 500 }, '+=0');
        this.circle.setPosition(+1, 1, 'world');
        this.animateMove(this.circle, { duration: 1000, ease: 'inOut' }, '<<');

        this.makeStep();
        this.addStyleAnimation(this.circle, this.styles.backBase, { duration: 1000 }, '+=0');
        this.path.makePartial(0, 1);
        this.addDrawAnimation(this.path, { duration: 1000, ease: 'inOut' }, '<<');
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
                <button id="play-button">Rejouer</button>
                <button id="next-button">Suivant</button>
                <button id="full-button">Tout</button>
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
    document.querySelector<HTMLButtonElement>('#full-button')?.addEventListener('click', () => {
        scene.createFullAnimation();
    });
}
