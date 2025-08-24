import './style.css';
import { Vector2 } from './math/vector2.ts';
import { S2Camera } from './s2/math/s2-camera.ts';
import { MTL_COLORS } from './utils/mtl-colors.ts';
import { S2Circle } from './s2/element/s2-circle.ts';
import { S2AnimatedScene } from './s2/s2-animated-scene.ts';
import { S2Path } from './s2/element/s2-path.ts';
import { S2Length } from './s2/math/s2-space.ts';
import { S2Attributes } from './s2/s2-attributes.ts';
import { S2Node } from './s2/element/s2-node.ts';

/*
    TODO:
    - Layer et ID (num de création)
    - visible qui indique s'il faut l'ajouter au SVG
    - S2Container: update trie ses enfants selon le layer puis l'ID
    - S2Attributes potentiellement sans copie profonde
        - Contient toutes les propriétés, y compris pour les noeuds.
    - S2Animatable avec une copie profonde
*/

const viewportScale = 1.5;
const viewport = new Vector2(640.0, 360.0).scale(viewportScale);
const camera = new S2Camera(new Vector2(0.0, 0.0), new Vector2(8.0, 4.5), viewport, 1.0);

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
            strokeWidth: new S2Length(8, 'view'),
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
        this.path.makePartial(0, 0);

        this.circle = this.addCircle();
        this.circle.setAttributes(this.styles.backBase).setPosition(0, 0, 'world').setRadius(2, 'world');

        this.node = this.addNode().setAttributes(this.styles.backSlct);
        this.node.setPosition(-5, -2);
        this.node.createRectBackground();
        this.node.addLine().addContent('Coucou');

        this.update();
        this.createAnimation();
    }

    createAnimation(): void {
        this.animator.saveState(this.circle);
        this.animator.saveState(this.path);
        this.animator.saveState(this.node);

        this.path.makePartial(0.2, 0.5);
        this.circle.setAttributes(this.styles.backSlct);

        this.animator.animate(this.circle, { duration: 1000, easing: 'outCubic' }, '+=0');
        this.animator.animate(this.path, { duration: 1000, ease: 'outCubic' }, '<<+=200');

        this.path.makePartial(0.5, 1.0).setStrokeColor(MTL_COLORS.LIGHT_GREEN_5);
        this.node.setPosition(-5, 0);

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
