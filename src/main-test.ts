import './style.css';
import { S2Vec2 } from './core/math/s2-vec2.ts';
import { S2Camera } from './core/math/s2-camera.ts';
import { MTL_COLORS } from './utils/mtl-colors.ts';
import { S2Circle } from './core/element/s2-circle.ts';
import { S2LerpAnim } from './animation/s2-lerp-anim.ts';
import { easeCos } from './animation/s2-easing.ts';
import { S2Scene } from './core/s2-scene.ts';
import { S2Timeline } from './animation/s2-timeline.ts';
import { S2PlayableAnimation } from './animation/s2-animation-manager.ts';
import type { S2Node } from './core/element/s2-node.ts';

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
    protected circle: S2Circle;
    protected anim: S2Timeline;
    protected node1: S2Node;

    constructor(svgElement: SVGSVGElement) {
        super(svgElement, camera);

        const fillRect = this.addFillRect().setLayer(-1);
        fillRect.color.copy(MTL_COLORS.GREY_8);
        fillRect.opacity.set(1.0);
        fillRect.update();

        const grid = this.addGrid().setLayer(-1);
        grid.strokeWidth.set(2, 'view');
        grid.strokeColor.copy(MTL_COLORS.GREY_5);
        grid.lowerBound.set(10, 10, 'view');
        grid.upperBound.set(viewport.x - 10, viewport.y - 10, 'view');
        grid.anchor.set(0, 0, 'world');
        grid.steps.set(1, 1, 'world');
        grid.update();

        this.anim = new S2Timeline(this);

        this.circle = this.addCircle();
        this.circle.data.fill.color.copy(MTL_COLORS.GREY_6);
        this.circle.data.stroke.color.copy(MTL_COLORS.GREY_4);
        this.circle.setPosition(0, 0, 'world').setFillOpacity(1.0).setRadius(1, 'world').setStrokeWidth(4, 'view');
        this.circle.update();

        const lerpAnim1 = new S2LerpAnim(this)
            .addUpdateTarget(this.circle)
            .bind(this.circle.fillColor)
            .bind(this.circle.strokeColor)
            .bind(this.circle.fillOpacity)
            .setCycleDuration(500)
            .setEasing(easeCos);

        this.circle.fillColor.copy(MTL_COLORS.BLUE_GREY_9);
        this.circle.strokeColor.copy(MTL_COLORS.LIGHT_BLUE_5);
        this.circle.fillOpacity.set(0.5);

        lerpAnim1.commitFinalStates();

        const lerpAnim2 = new S2LerpAnim(this)
            .addUpdateTarget(this.circle)
            .bind(this.circle.fillColor)
            .bind(this.circle.strokeColor)
            .setCycleDuration(500)
            .setEasing(easeCos);

        this.circle.fillColor.copy(MTL_COLORS.RED_8);
        this.circle.strokeColor.copy(MTL_COLORS.RED_1);
        lerpAnim2.commitFinalStates();

        const node1 = this.addNode(1);
        node1.setPosition(-5, 0, 'world').setAnchor('center');
        node1.data.background.fill.color.copy(MTL_COLORS.GREY_6);
        node1.data.background.stroke.color.copy(MTL_COLORS.GREY_4);
        node1.data.background.stroke.width.set(4, 'view');
        node1.data.text.font.size.set(20, 'view');
        node1.data.text.horizontalAlign.set('left');
        node1.backCornerRadius.set(20, 'view');
        node1.padding.set(20, 10, 'view');
        node1.createRectBackground();
        node1.addLine().addContent('Hello World');
        const line = node1.addLine().addContent('potoo');
        line.data.font.weight.set(700);
        line.data.font.style.set('italic');
        node1.setLayer(1);
        node1.update();
        this.node1 = node1;

        const lerpAnim3 = new S2LerpAnim(this)
            .addUpdateTarget(node1)
            .bind(node1.data.position)
            .bind(node1.getTextGroup(0).data.font.size)
            .setCycleDuration(500)
            .setEasing(easeCos);

        node1.data.position.set(-5, 1, 'world');
        node1.getTextGroup(0).data.font.size.set(25, 'view');
        lerpAnim3.commitFinalStates();

        this.anim.addAnimation(lerpAnim1);
        this.anim.addAnimation(lerpAnim2, 'previous-end', 500);
        this.anim.addAnimation(lerpAnim3, 'previous-start', 0);

        this.anim.setCycleCount(2).setReversed(false).setAlternate(true);
        this.anim.setElapsed(0);

        const playable = new S2PlayableAnimation(this.anim);
        playable.play(false).setSpeed(1);

        const node2 = this.addNode();
        node2.data.position.set(3, 1, 'world');
        node2.data.anchor.set('center');
        node2.data.background.fill.color.copy(MTL_COLORS.GREY_6);
        node2.data.background.stroke.color.copy(MTL_COLORS.GREY_4);
        node2.data.background.stroke.width.set(4, 'view');
        node2.createCircleBackground();
        node2.addLine().addContent('Hello World');
        node2.setLayer(1);
        node2.update();

        const edge = this.addCubicEdge(node1, node2);
        edge.data.stroke.color.copy(MTL_COLORS.RED_5);
        edge.setStrokeLineCap('round').setStrokeWidth(8, 'view').setLayer(0);
        edge.data.startDistance.set(20, 'view');
        edge.data.endDistance.set(20, 'view');
        edge.setCurveBendAngle(30);
        // edge.data.curveBendAngle.set(30);
        // edge.setCurveTension(0.5);
        // edge.data.startAngle.set(-90);
        // edge.data.endAngle.set(180);
        edge.update();

        this.update();
    }

    setAnimationValue(t: number): void {
        // console.log('\n');
        // console.log('Setting animation to', t);
        // console.log(this.node1.getTextGroup(0).data.font.size);
        this.anim.setElapsed(t * 5000);
    }
}

const appDiv = document.querySelector<HTMLDivElement>('#app');
if (appDiv) {
    appDiv.innerHTML = `
        <div>
            <h1>Test</h1>
            <svg xmlns="http://www.w3.org/2000/svg" id=test-svg class="responsive-svg" preserveAspectRatio="xMidYMid meet"></svg>
            <div class="figure-nav">
                <div>Animation : <input type="range" id="slider" min="0" max="100" step="1" value="0" style="width:50%"></div>
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
