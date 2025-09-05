import './style.css';
import { S2Vec2 } from './core/math/s2-vec2.ts';
import { S2Camera } from './core/math/s2-camera.ts';
import { MTL_COLORS } from './utils/mtl-colors.ts';
import { NewS2Circle } from './core/element/s2-circle.ts';
import { S2Length } from './core/s2-types.ts';
import { S2Animatable } from './core/s2-attributes.ts';
import { S2LerpAnim } from './animation/s2-lerp-anim.ts';
//import { S2AnimationManager } from './animation/s2-animation-manager.ts';
import { easeCos } from './animation/s2-easing.ts';
import { S2Scene } from './core/s2-scene.ts';
import { S2Timeline } from './animation/s2-timeline.ts';
import { S2PlayableAnimation } from './animation/s2-animation-manager.ts';
import { NewS2Grid } from './core/element/s2-grid.ts';
import { NewS2FillRect } from './core/element/s2-fill-rect.ts';

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

class SceneFigure extends S2Scene {
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
    protected anim: S2Timeline;

    constructor(svgElement: SVGSVGElement) {
        super(svgElement, camera);

        //this.addFillRect().setFillColor(MTL_COLORS.GREY_8);
        //this.addGrid().setExtents(8, 5).setSteps(1, 1).setStrokeWidth(2, 'view').setStrokeColor(MTL_COLORS.GREY_7);
        this.anim = new S2Timeline(this);

        this.circle = new NewS2Circle(this);
        this.circle.data.fill.color.copy(MTL_COLORS.GREY_6);
        this.circle.data.stroke.color.copy(MTL_COLORS.GREY_4);
        this.circle.data.stroke.width.set(4);
        this.circle.data.radius.set(1, 'world');
        this.circle.fillOpacity.set(1.0);
        this.circle.update();

        const lerpAnim1 = new S2LerpAnim(this)
            .addUpdateTarget(this.circle)
            .bind(this.circle.fillColor)
            .bind(this.circle.strokeColor)
            .bind(this.circle.fillOpacity)
            .setCycleDuration(1000)
            .setEasing(easeCos);

        this.circle.fillColor.copy(MTL_COLORS.BLUE_GREY_9);
        this.circle.strokeColor.copy(MTL_COLORS.LIGHT_BLUE_5);
        this.circle.fillOpacity.set(0.5);

        lerpAnim1.commitFinalStates();

        const lerpAnim2 = new S2LerpAnim(this)
            .addUpdateTarget(this.circle)
            .bind(this.circle.fillColor)
            .bind(this.circle.strokeColor)
            .setCycleDuration(1000)
            .setEasing(easeCos);

        this.circle.fillColor.copy(MTL_COLORS.RED_8);
        this.circle.strokeColor.copy(MTL_COLORS.RED_1);
        lerpAnim2.commitFinalStates();

        this.anim.addAnimation(lerpAnim1);
        this.anim.addAnimation(lerpAnim2, 'previous-end', 500);

        this.anim.setCycleCount(2).setReversed(false).setAlternate(true);
        this.anim.setElapsed(0);

        this.update();
        const playable = new S2PlayableAnimation(this.anim);
        playable.play(false).setSpeed(5).setElapsed(1000);

        const fillRect = new NewS2FillRect(this);
        fillRect.color.copy(MTL_COLORS.GREY_8);
        fillRect.opacity.set(1.0);
        fillRect.update();
        svgElement.appendChild(fillRect.getSVGElement());

        const grid = new NewS2Grid(this);
        grid.strokeWidth.set(2, 'view');
        grid.strokeColor.copy(MTL_COLORS.GREY_5);
        grid.lowerBound.set(10, 10, 'view');
        grid.upperBound.set(viewport.x - 10, viewport.y - 10, 'view');
        grid.anchor.set(0, 0, 'world');
        grid.steps.set(1, 1, 'world');
        grid.update();
        svgElement.appendChild(grid.getSVGElement());

        svgElement.appendChild(this.circle.getSVGElement());
    }

    setAnimationValue(t: number): void {
        console.log('\n');
        console.log('Setting animation to', t);
        this.anim.setElapsed(t * 5000);
        console.log(this.anim);
        //this.circle.update();
        //this.update();
    }
}

const appDiv = document.querySelector<HTMLDivElement>('#app');
if (appDiv) {
    appDiv.innerHTML = `
        <div>
            <h1>Test</h1>
            <svg xmlns="http://www.w3.org/2000/svg" id=test-svg class="responsive-svg" preserveAspectRatio="xMidYMid meet"></svg>
            <div class="figure-nav">
                <div>Animation : <input type="range" id="slider" min="0" max="100" step="2" value="0" style="width:50%"></div>
            </div>
        </div>`;
}

const svgElement = appDiv?.querySelector<SVGSVGElement>('#test-svg');
const slider = document.querySelector<HTMLInputElement>('#slider');

if (svgElement && slider) {
    const scene = new SceneFigure(svgElement);

    slider.addEventListener('input', () => {
        scene.setAnimationValue(slider.valueAsNumber / 100);
    });
}
