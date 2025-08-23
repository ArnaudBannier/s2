import './style.css';
import { Vector2 } from './math/vector2.ts';
import { S2Camera } from './s2/math/s2-camera.ts';
import { MTL_COLORS } from './utils/mtl-colors.ts';
import { S2Circle } from './s2/element/s2-circle.ts';
import { S2AnimatedScene } from './s2/s2-animated-scene.ts';
import { S2Path } from './s2/element/s2-path.ts';
import { S2Length } from './s2/s2-space.ts';
import { S2Parameters } from './s2/s2-interface.ts';

const viewportScale = 1.5;
const viewport = new Vector2(640.0, 360.0).scale(viewportScale);
const camera = new S2Camera(new Vector2(0.0, 0.0), new Vector2(8.0, 4.5), viewport, 1.0);

class SceneFigure extends S2AnimatedScene {
    protected circle: S2Circle;
    protected path: S2Path;
    protected styles = {
        backBase: new S2Parameters(),
        backSlct: new S2Parameters(),
        path: new S2Parameters(),
    };

    constructor(svgElement: SVGSVGElement) {
        super(svgElement, camera);

        this.styles.backBase.fillColor = MTL_COLORS.GREY_6;
        this.styles.backBase.strokeColor = MTL_COLORS.GREY_4;
        this.styles.backBase.strokeWidth = new S2Length(4, 'view');

        this.styles.backSlct.fillColor = MTL_COLORS.BLUE_GREY_9;
        this.styles.backSlct.strokeColor = MTL_COLORS.LIGHT_BLUE_5;
        this.styles.backSlct.strokeWidth = new S2Length(8, 'view');

        this.styles.path.strokeColor = MTL_COLORS.CYAN_5;
        this.styles.path.strokeWidth = new S2Length(4, 'view');
        this.styles.path.fillOpacity = 0;

        this.circle = this.addCircle();
        this.path = this.addPath();
        this.createAnimation();
    }

    createInitialState(): void {
        this.svg.removeChildren();
        this.addFillRect().setFillColor(MTL_COLORS.GREY_8);
        this.addGrid().setExtents(8, 5).setSteps(1, 1).setStrokeWidth(2, 'view').setStrokeColor(MTL_COLORS.GREY_7);

        this.path = this.addPath();
        this.path.setParameters(this.styles.path);
        this.path.setSpace('world').setStart(-5, 0).cubicTo(0, -4, 0, -4, +5, 0).cubicTo(0, +4, 0, +4, -5, 0);
        this.path.makePartial(0, 0);

        this.circle = this.addCircle();
        this.circle.setParameters(this.styles.backBase).setPosition(0, 0, 'world').setRadius(2, 'world');
    }

    createAnimation(): void {
        this.animator.resetTimeline();
        this.createInitialState();
        this.update();

        this.animator.saveState(this.circle);
        this.animator.saveState(this.path);

        this.path.makePartial(0.2, 0.5);
        this.circle.setParameters(this.styles.backSlct);

        this.animator.makeStep();
        this.animator.animate(this.circle, { duration: 1000, easing: 'outCubic' }, '+=0');
        this.animator.animate(this.path, { duration: 1000, ease: 'outCubic' }, '<<+=200');

        this.path.makePartial(0.5, 1.0).setStrokeColor(MTL_COLORS.LIGHT_GREEN_5);

        this.animator.makeStep();
        this.animator.animate(this.circle, { duration: 1000, easing: 'outBounce' }, '+=0');
        this.animator.animate(this.path, { duration: 1000, ease: 'outBounce' }, '<<+=200');

        this.circle.setPosition(-1, 1, 'world');

        this.animator.makeStep();
        this.animator.animate(this.circle, { duration: 1000, ease: 'inOut' }, '+=0');

        console.log(this.animator.stateMap.get(this.path));

        this.circle.setPosition(1, 1, 'world');
        this.circle.setParameters(this.styles.backBase);

        this.animator.makeStep();
        this.path.setStrokeWidth(0.5, 'world').setStrokeColor(MTL_COLORS.GREY_7);
        this.animator.animate(this.circle, { duration: 1000, ease: 'inOut' }, '+=0');
        this.animator.animate(this.path, { duration: 800, ease: 'out' }, '<<+=200');
        this.animator.finalize();

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
