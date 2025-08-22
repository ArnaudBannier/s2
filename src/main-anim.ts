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
        this.circle.setPosition(0, 0, 'world').setRadius(2, 'world').setStyleDecl(this.styles.backBase);
        this.path.setStyleDecl(this.styles.path);
        this.path.setSpace('world').setStart(-5, 0).cubicTo(0, -4, 0, -4, +5, 0).cubicTo(0, +4, 0, +4, -5, 0);
        this.path.makePartial(0, 0);
    }

    createAnimation(): void {
        this.animator.resetTimeline();
        this.createInitialState();
        this.update();

        this.animator.saveState(this.circle);
        this.animator.saveState(this.path);

        this.path.makePartial(0.2, 0.5);
        this.circle.setStyleDecl(this.styles.backSlct);

        this.animator.makeStep();
        this.animator.animateStyle(this.circle, { duration: 1000, easing: 'outCubic' }, '+=0');
        this.animator.animateDraw(this.path, { duration: 1000, ease: 'outCubic' }, '<<+=200');

        this.path.makePartial(0.5, 1.0).setStyleDecl(this.styles.path2);
        this.circle.setStyleDecl(this.styles.backExpl);

        this.animator.makeStep();
        this.animator.animateStyle(this.circle, { duration: 1000, easing: 'outBounce' }, '+=0');
        this.animator.animateDraw(this.path, { duration: 1000, ease: 'outBounce' }, '<<+=200');
        this.animator.animateStyle(this.path, { duration: 1000 }, '<<');

        const circle = this.addCircle()
            .setStyleDecl({ ...this.styles.backExpl, ...this.styles.backTransparent })
            .setPosition(5, 0, 'world')
            .setRadius(10, 'view')
            .update();
        this.animator.saveState(circle);
        circle.setStyleDecl(this.styles.backOpaque);
        this.circle.setPosition(-1, 1, 'world');

        this.animator.makeStep();
        this.animator.animateMove(this.circle, { duration: 1000, ease: 'inOut' }, '+=0');
        this.animator.animateStyle(circle, { duration: 500 }, '<<');

        // this.animator.makeStep();
        // this.animator.animateStyle(circle, this.styles.backTransparent, { duration: 500 }, '+=0');
        // this.circle.setPosition(+1, 1, 'world');
        // this.animator.animateMove(this.circle, { duration: 1000, ease: 'inOut' }, '<<');

        // this.animator.makeStep();
        // this.animator.animateStyle(this.circle, this.styles.backBase, { duration: 1000 }, '+=0');
        // this.path.makePartial(0, 1);
        // this.animator.animateDraw(this.path, { duration: 1000, ease: 'inOut' }, '<<');
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
