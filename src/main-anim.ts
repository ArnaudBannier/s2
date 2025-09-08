import './style.css';
import { S2Vec2 } from './core/math/s2-vec2.ts';
import { S2Camera } from './core/math/s2-camera.ts';
import { MTL_COLORS } from './utils/mtl-colors.ts';
import { S2Circle } from './core/element/s2-circle.ts';
import { S2AnimatedScene } from './animation/s2-animated-scene.ts';
import { S2Path } from './core/element/s2-path.ts';
import { S2Length } from './core/s2-types.ts';
import { S2Attributes } from './core/s2-attributes.ts';
import { S2Node } from './core/element/s2-node.ts';

/*
    TODO:
    - isActive à tester.
    - Possibilité d'ajouter des label sur un edge (qui devient un groupe)
    - Tracer une fonction
    - Ajouter dans le Readme la feature de chemins partiels
    - Ajouter des descriptions/titres sur les éléments
    - Ajouter un système d'event au S2Element
    - Coder une interaction avec la souris dans le monde
    - Interpolation de Mat2x3
    - Définir un marker perso qui vient s'ajouter et s'adapter à un S2Edge
        - Il n'est pas défini en global mais créé pour chaque path
    - Définir un système de listener pour les update
    - S2SVG contient des fonctionnalités supplémentaires, comme ajouter des styles
*/
// Slides.com
// Reveal.js

const viewportScale = 1.5;
const viewport = new S2Vec2(640.0, 360.0).scale(viewportScale);
const camera = new S2Camera(new S2Vec2(0.0, 0.0), new S2Vec2(8.0, 4.5), viewport, 1.0);

class SceneFigure extends S2AnimatedScene {
    protected circle: S2Circle;
    protected path: S2Path;
    protected node: S2Node;
    protected styles = {
        backBase: new S2Attributes({
            fillColor: MTL_COLORS.GREY_6,
            strokeColor: MTL_COLORS.GREY_4,
            strokeWidth: new S2Length(4, 'view'),
            textFillColor: MTL_COLORS.GREY_1,
        }),
        backSlct: new S2Attributes({
            fillColor: MTL_COLORS.BLUE_GREY_9,
            strokeColor: MTL_COLORS.LIGHT_BLUE_5,
            strokeWidth: new S2Length(4, 'view'),
            textFillColor: MTL_COLORS.LIGHT_BLUE_1,
        }),
        path: new S2Attributes({
            strokeColor: MTL_COLORS.CYAN_5,
            strokeWidth: new S2Length(4, 'view'),
            fillOpacity: 0,
            lineCap: 'round',
        }),
    };

    constructor(svgElement: SVGSVGElement) {
        super(svgElement, camera);

        this.addFillRect().setFillColor(MTL_COLORS.GREY_8);
        this.addGrid().setExtents(8, 5).setSteps(1, 1).setStrokeWidth(2, 'view').setStrokeColor(MTL_COLORS.GREY_7);

        this.path = this.addPath();
        this.path.setAttributes(this.styles.path);
        this.path.setSpace('world').setStart(-5, 0).cubicTo(0, -4, 0, -4, +5, 0).cubicTo(0, +4, 0, +4, -5, 0);
        this.path.setPathRange(0, 0);

        this.circle = this.addCircle();
        this.circle.setAttributes(this.styles.backBase).setPosition(0, 0, 'world').setRadius(20, 'view');

        this.node = this.addNode();
        this.node.setAttributes(this.styles.backBase);
        this.node.setPosition(-5, -2);
        this.node.createRectBackground();
        this.node.addLine().addContent('Coucou');

        const group = this.addGroup<S2Circle>();

        const circle1 = this.addCircle(group).setPosition(3, 0).setFillColor(MTL_COLORS.RED_5);
        const circle2 = this.addCircle(group).setPosition(4, 0).setFillColor(MTL_COLORS.GREEN_5);
        const circle3 = this.addCircle(group).setPosition(3.5, 0.5).setFillColor(MTL_COLORS.BLUE_5);

        circle1.setLayer(2);
        circle2.setLayer(1);
        circle3.setIsActive(true);

        this.update();

        this.createAnimation();
    }

    createAnimation(): void {
        this.animator.saveState(this.circle);
        this.animator.saveState(this.path);
        this.animator.saveState(this.node);

        this.path.setPathRange(0.2, 0.5);
        this.circle.setAttributes(this.styles.backSlct);
        this.node.setAttributes(this.styles.backSlct);

        this.animator.animate(this.circle, { duration: 1000, easing: 'outCubic' }, '+=0');
        this.animator.animate(this.node, { duration: 1000, easing: 'outCubic' }, '<<');
        this.animator.animate(this.path, { duration: 1000, ease: 'outCubic' }, '<<+=200');

        this.path.setPathRange(0.5, 1.0).setStrokeColor(MTL_COLORS.LIGHT_GREEN_5);
        this.node.setPosition(-5, 0); //.setAttributes(this.styles.backBase);

        this.animator.makeStep();
        this.animator.animate(this.node, { duration: 1000, easing: 'outBounce' }, '+=0');
        this.animator.animate(this.path, { duration: 1000, ease: 'outBounce' }, '<<+=200');

        this.circle.setPosition(-1, 1, 'world');

        this.animator.makeStep();
        this.animator.animate(this.circle, { duration: 1000, ease: 'inOut' }, '+=0');

        this.circle.setPosition(1, 1, 'world');
        this.circle.setAttributes(this.styles.backBase);

        this.animator.makeStep();
        this.path.setStrokeWidth(0.5, 'world').setStrokeColor(MTL_COLORS.GREY_7);
        this.animator.animate(this.circle, { duration: 1000, ease: 'inOut' }, '+=0');
        this.animator.animate(this.path, { duration: 800, ease: 'out' }, '<<+=200');
        this.animator.finalize();
    }
}

const appDiv = document.querySelector<HTMLDivElement>('#app');
if (appDiv) {
    appDiv.innerHTML = `
        <div>
            <h1>My first SVG</h1>
            <svg xmlns="http://www.w3.org/2000/svg" id=test-svg class="responsive-svg" preserveAspectRatio="xMidYMid meet"></svg>
            <div class="figure-nav">
                <button id="reset-button"><i class="fa-solid fa-backward-fast"></i></button>
                <button id="prev-button"><i class="fa-solid fa-step-backward"></i></button>
                <button id="play-button"><i class="fa-solid fa-redo"></i></button>
                <button id="next-button"><i class="fa-solid fa-step-forward"></i></button>
                <button id="full-button"><i class="fa-solid fa-play"></i></button>
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
