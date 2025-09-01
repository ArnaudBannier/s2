import './style.css';
import { S2Vec2 } from './core/math/s2-vec2.ts';
import { S2Camera } from './core/math/s2-camera.ts';
import { MTL_COLORS } from './utils/mtl-colors.ts';
import { NewS2Circle, S2Circle } from './core/element/s2-circle.ts';
import { S2AnimatedScene } from './animation/s2-animated-scene.ts';
import { S2Length, S2Position } from './core/math/s2-space.ts';
import { S2Animatable } from './core/s2-attributes.ts';
import { S2ElementAnim, S2LerpAnim, type S2Animation } from './animation/s2-animation.ts';
import { S2AnimationManager } from './animation/s2-animation-manager.ts';
import { easeCos } from './animation/s2-easing.ts';

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
    - S2Attributes potentiellement sans copie profonde
        - Contient toutes les propriétés, y compris pour les noeuds
    - S2Animatable avec une copie profonde
    - Erreur sur animate
        - Il ne faut pas sauvegarder l'état avec currStepIndex mais avec une ID
        - Cela pose pb si le même objet est animé plusieurs fois dans un step
    - Creer ma propre lib d'animation, Regarder singleton pour le moteur
*/

const viewportScale = 1.5;
const viewport = new S2Vec2(640.0, 360.0).scale(viewportScale);
const camera = new S2Camera(new S2Vec2(0.0, 0.0), new S2Vec2(8.0, 4.5), viewport, 1.0);

class SceneFigure extends S2AnimatedScene {
    protected styles = {
        backBase: new S2Animatable({
            fillColor: MTL_COLORS.GREY_6,
            strokeColor: MTL_COLORS.GREY_4,
            strokeWidth: new S2Length(4, 'view'),
        }),
        backSlct: new S2Animatable({
            fillColor: MTL_COLORS.BLUE_GREY_9,
            strokeColor: MTL_COLORS.LIGHT_BLUE_5,
            strokeWidth: new S2Length(4, 'view'),
        }),
    };
    protected circle: NewS2Circle;
    //protected anim: S2Animation;
    protected animManager: S2AnimationManager = S2AnimationManager.getInstance();
    protected anim: S2LerpAnim;

    constructor(svgElement: SVGSVGElement) {
        super(svgElement, camera);

        this.addFillRect().setFillColor(MTL_COLORS.GREY_8);
        this.addGrid().setExtents(8, 5).setSteps(1, 1).setStrokeWidth(2, 'view').setStrokeColor(MTL_COLORS.GREY_7);
        this.anim = new S2LerpAnim(this);

        this.circle = new NewS2Circle(this);
        this.circle.data.fill.color.copy(MTL_COLORS.GREY_6);
        this.circle.data.stroke.color.copy(MTL_COLORS.GREY_4);
        this.circle.data.stroke.width.value = 4;
        this.circle.data.radius.value = 1;
        this.circle.data.radius.space = 'world';
        this.circle.update();

        this.anim
            .addTarget(this.circle)
            .saveColor(this.circle.data.fill.color)
            .saveColor(this.circle.data.stroke.color)
            .setLoopDuration(4000)
            .setAlternate()
            .setEasing(easeCos);

        this.circle.data.fill.color.copy(MTL_COLORS.BLUE_GREY_9);
        this.circle.data.stroke.color.copy(MTL_COLORS.LIGHT_BLUE_5);

        this.anim.finalize();

        this.anim.setLoopCount(-1).play();

        this.animManager.addAnimation(this.anim);

        this.update();
        svgElement.appendChild(this.circle.getSVGElement());
    }
}

const appDiv = document.querySelector<HTMLDivElement>('#app');
if (appDiv) {
    appDiv.innerHTML = `
        <div>
            <h1>Test</h1>
            <svg xmlns="http://www.w3.org/2000/svg" id=test-svg class="responsive-svg" preserveAspectRatio="xMidYMid meet"></svg>
            <div class="figure-nav">
                <div>Animation : <input type="range" id="slider" min="0" max="100" value="0" style="width:50%"></div>
            </div>
        </div>`;
}

const svgElement = appDiv?.querySelector<SVGSVGElement>('#test-svg');
const slider = document.querySelector<HTMLInputElement>('#slider');

if (svgElement && slider) {
    const scene = new SceneFigure(svgElement);
    void scene;

    // slider.addEventListener('input', () => {
    //     scene.setAnimationValue(slider.valueAsNumber / 100);
    // });
}
