import './style.css';
import { S2Vec2 } from '../core/math/s2-vec2.ts';
import { S2Camera } from '../core/math/s2-camera.ts';
import { MTL } from '../utils/mtl-colors.ts';
import { S2Scene } from '../core/s2-scene.ts';
import { S2Node } from '../core/element/node/s2-node.ts';
import { S2LineEdge } from '../core/element/node/s2-edge.ts';
import { S2Group } from '../core/element/s2-group.ts';
import { S2StepAnimator } from '../core/animation/s2-step-animator.ts';
import { S2LerpAnimFactory } from '../core/animation/s2-lerp-anim.ts';
import { ease } from '../core/animation/s2-easing.ts';
import { S2MathUtils } from '../core/math/s2-utils.ts';
import { S2ElementData, S2FontData } from '../core/element/base/s2-base-data.ts';
import { S2DataSetter } from '../core/element/base/s2-data-setter.ts';
import { S2Code, tokenizeAlgorithm } from '../core/element/s2-code.ts';
import { S2AnimGroup } from '../core/animation/s2-anim-group.ts';
import type { S2BaseAnimation } from '../core/animation/s2-base-animation.ts';
import type { S2PlainNode } from '../core/element/node/s2-plain-node.ts';

const viewport = new S2Vec2(640.0, 360.0).scale(1.5);
const camera = new S2Camera(new S2Vec2(0.0, 0.0), new S2Vec2(8.0, 4.5), viewport, 1.0);

const algorithm =
    '**kw:fonction** parcoursInfixe(**var:n**: **type:Noeud**):\n' +
    '  **kw:si** **var:n**.**var:gauche** existe **kw:alors**\n' +
    '    **fn:parcoursInfixe**(**var:n**.**var:gauche**)\n' +
    '  **fn:traiter**(**var:n**)\n' +
    '  **kw:si** **var:n**.**var:droit** existe **kw:alors**\n' +
    '    **fn:parcoursInfixe**(**var:n**.**var:droit**)';

class BTreeStyle {
    public scene: S2Scene;

    constructor(scene: S2Scene) {
        this.scene = scene;
    }

    setNodeDefault(node: S2PlainNode): void {
        const data = node.data;
        data.background.fill.color.copy(MTL.GREY_6);
        data.background.stroke.color.copy(MTL.GREY_4);
        data.background.stroke.width.set(4, 'view');
        data.text.fill.color.copy(MTL.WHITE);
        data.text.horizontalAlign.set('center');
        data.text.verticalAlign.set('middle');
        //data.text.font.weight.set(700);
        data.padding.set(0, 0, 'view');
        data.minExtents.set(0.5, 0.35, 'world');
        data.background.cornerRadius.set(10, 'view');
    }

    setNodeSelected(node: S2PlainNode): void {
        const data = node.data;
        data.background.fill.color.copy(MTL.GREY_8);
        data.background.stroke.color.copy(MTL.BLUE_5);
        data.text.fill.color.copy(MTL.BLUE_2);
    }

    createSelectNodeAnim(node: S2PlainNode): S2AnimGroup {
        const data = node.data;
        const animGroup = new S2AnimGroup(this.scene);
        animGroup.addLerpProperties(
            [data.background.fill.color, data.background.stroke.color, data.text.fill.color],
            300,
            ease.inOut,
        );
        this.setNodeSelected(node);
        animGroup.commitLerpFinalStates();
        return animGroup;
    }

    setNodeExplored(node: S2PlainNode): void {
        const data = node.data;
        data.background.fill.color.copy(MTL.CYAN_7);
        data.background.stroke.color.copy(MTL.CYAN_3);
        data.text.fill.color.copy(MTL.WHITE);
    }

    createExploreNodeAnim(node: S2PlainNode): S2AnimGroup {
        const data = node.data;
        const animGroup = new S2AnimGroup(this.scene);
        animGroup.addLerpProperties(
            [data.background.fill.color, data.background.stroke.color, data.text.fill.color],
            300,
            ease.inOut,
        );
        this.setNodeExplored(node);
        animGroup.commitLerpFinalStates();
        return animGroup;
    }

    setEdgeBase(edge: S2LineEdge): void {
        S2DataSetter.setTargets(edge.data)
            .setStrokeColor(MTL.GREY_6)
            .setStrokeWidth(4, 'view')
            .setStrokeLineCap('round')
            .setEdgeStartDistance(0, 'view')
            .setEdgeEndDistance(10, 'view');
    }

    setEdgeEmphasized(edge: S2LineEdge): void {
        S2DataSetter.setTargets(edge.data)
            .setStrokeColor(MTL.WHITE)
            .setStrokeWidth(5, 'view')
            .setStrokeLineCap('round')
            .setEdgeStartDistance(0, 'view')
            .setEdgeEndDistance(11, 'view');

        const arrowTip = edge.createArrowTip();
        //arrowTip.setTipInset(-0.25);
        arrowTip.data.pathStrokeFactor.set(0.3);
    }

    setEdgeSelected(edge: S2LineEdge): void {
        edge.data.stroke.color.copy(MTL.BLUE_5);
    }

    createSelectEdgeAnim(edge: S2LineEdge): S2BaseAnimation {
        const anim = S2LerpAnimFactory.create(this.scene, edge.data.stroke.color)
            .setCycleDuration(300)
            .setEasing(ease.inOut);
        this.setEdgeSelected(edge);
        anim.commitFinalState();
        return anim;
    }

    setEdgeExplored(edge: S2LineEdge): void {
        edge.data.stroke.color.copy(MTL.GREY_7);
    }

    createExploreEdgeAnim(edge: S2LineEdge): S2BaseAnimation {
        const anim = S2LerpAnimFactory.create(this.scene, edge.data.stroke.color)
            .setCycleDuration(300)
            .setEasing(ease.inOut);
        this.setEdgeExplored(edge);
        anim.commitFinalState();
        return anim;
    }
}

interface UserTreeNode<T> {
    data: T;
    left?: UserTreeNode<T>;
    right?: UserTreeNode<T>;
}

class BTree {
    public root: BTreeNode | null;
    protected style: BTreeStyle;
    protected scene: S2Scene;
    protected edgeGroup: S2Group<S2ElementData>;
    protected nodeGroup: S2Group<S2ElementData>;

    levelDistance: number = 1.8;
    baseSep: number = 0.8;
    height: number;

    protected center: S2Vec2;
    protected extents: S2Vec2;

    constructor(scene: S2Scene, userTree: UserTreeNode<number>, style: BTreeStyle = new BTreeStyle(scene)) {
        this.scene = scene;
        this.style = style;
        this.center = new S2Vec2();
        this.extents = new S2Vec2();
        this.edgeGroup = scene.addGroup(new S2ElementData());
        this.nodeGroup = scene.addGroup(new S2ElementData());

        this.height = 0;
        this.root = this.createNodes(userTree);

        this.computeLayout(new S2Vec2(0, 0));
        this.createNodeLines(this.root, null);
        //this.update();
    }

    private createNodes(userTree: UserTreeNode<number>, depth: number = 0): BTreeNode {
        const node = new BTreeNode(this.scene, userTree.data);
        this.height = Math.max(this.height, depth);
        node.node.setParent(this.nodeGroup);
        this.style.setNodeDefault(node.node);

        if (userTree.left) {
            const child = this.createNodes(userTree.left, depth + 1);
            node.setLeft(child);
        }
        if (userTree.right) {
            const child = this.createNodes(userTree.right, depth + 1);
            node.setRight(child);
        }
        return node;
    }

    private createNodeLines(bTreeNode: BTreeNode | null, parent: BTreeNode | null) {
        if (bTreeNode === null) return;
        if (parent) {
            bTreeNode.parentEdge = this.scene.addLineEdge(parent.node, bTreeNode.node, this.edgeGroup);
            bTreeNode.parentEmphEdge = this.scene.addLineEdge(parent.node, bTreeNode.node, this.edgeGroup);
            // bTreeNode.parentEdge.update();
            // bTreeNode.parentEmphEdge.update();

            bTreeNode.parentEmphEdge.data.pathFrom.set(0.0);

            this.style.setEdgeBase(bTreeNode.parentEdge);
            this.style.setEdgeEmphasized(bTreeNode.parentEmphEdge);
        }

        this.createNodeLines(bTreeNode.left, bTreeNode);
        this.createNodeLines(bTreeNode.right, bTreeNode);
    }

    computeLayout(center: S2Vec2) {
        this.center.copy(center);
        this.extents.x = (this.nodeGroup.getChildCount() - 1) * this.baseSep;
        this.extents.y = this.height * this.levelDistance;
        this.extents.scale(0.5);
        this.computeLayoutRec(this.root, 0, 0);
    }

    private computeLayoutRec(bTreeNode: BTreeNode | null, index: number, depth: number): number {
        if (bTreeNode === null) return index;
        index = this.computeLayoutRec(bTreeNode.left, index, depth + 1);
        bTreeNode.node.data.position.set(
            this.center.x - this.extents.x + index * this.baseSep,
            this.center.y + this.extents.y - depth * this.levelDistance,
            'world',
        );
        index++;
        index = this.computeLayoutRec(bTreeNode.right, index, depth + 1);
        return index;
    }

    update(): this {
        for (let i = 0; i < this.nodeGroup.getChildCount(); i++) {
            const node = this.nodeGroup.getChild(i) as S2Node;
            node.update(); //refreshExtents();
        }
        this.nodeGroup.update();
        this.edgeGroup.update();
        return this;
    }

    animateSelectNode(animator: S2StepAnimator, bTreeNode: BTreeNode) {
        if (bTreeNode.parentEmphEdge) {
            bTreeNode.parentEmphEdge.data.pathTo.set(0.0);
            const parentAnim = S2LerpAnimFactory.create(this.scene, bTreeNode.parentEmphEdge.data.pathTo)
                .setCycleDuration(500)
                .setEasing(ease.inOut);

            bTreeNode.parentEmphEdge.data.pathTo.set(1.0);
            animator.addAnimation(parentAnim.commitFinalState());
        }

        let anim: S2BaseAnimation | null = null;
        anim = this.style.createSelectNodeAnim(bTreeNode.node);
        animator.addAnimation(anim, 'previous-start', bTreeNode.parentEdge ? 100 : 0);

        if (bTreeNode.left && bTreeNode.left.parentEdge) {
            anim = this.style.createSelectEdgeAnim(bTreeNode.left.parentEdge);
            animator.addAnimation(anim, 'previous-start', 0);
        }
        if (bTreeNode.right && bTreeNode.right.parentEdge) {
            anim = this.style.createSelectEdgeAnim(bTreeNode.right.parentEdge);
            animator.addAnimation(anim, 'previous-start', 0);
        }
    }

    animateExploreNode(animator: S2StepAnimator, bTreeNode: BTreeNode) {
        const anim = this.style.createExploreNodeAnim(bTreeNode.node);
        animator.addAnimation(anim, 'previous-end', 0);
    }

    animateExitParentEdge(animator: S2StepAnimator, bTreeNode: BTreeNode) {
        if (!bTreeNode.parentEdge || !bTreeNode.parentEmphEdge) return;

        const parentAnim = S2LerpAnimFactory.create(this.scene, bTreeNode.parentEmphEdge.data.pathTo)
            .setCycleDuration(500)
            .setEasing(ease.inOut);

        bTreeNode.parentEmphEdge.data.pathTo.set(0.0);
        animator.addAnimation(parentAnim.commitFinalState(), 'previous-end', 0);

        let anim = this.style.createExploreEdgeAnim(bTreeNode.parentEdge);
        animator.addAnimation(anim, 'previous-start', 200);
    }
}

class BTreeNode {
    data: number;
    parent: BTreeNode | null = null;
    left: BTreeNode | null = null;
    right: BTreeNode | null = null;

    node: S2PlainNode;
    parentEdge: S2LineEdge | null = null;
    parentEmphEdge: S2LineEdge | null = null;

    constructor(scene: S2Scene, data: number = 0) {
        this.data = data;
        this.node = scene.addPlainNode();
        this.node.setContent(data.toString());
        this.node.createRectBackground();
    }

    setLeft(bTreeNode: BTreeNode) {
        this.left = bTreeNode;
        bTreeNode.parent = this;
    }

    setRight(bTreeNode: BTreeNode) {
        this.right = bTreeNode;
        bTreeNode.parent = this;
    }
}

class SceneFigure extends S2Scene {
    public tree: BTree;
    public animator: S2StepAnimator;
    protected codeStack: S2Code[] = [];

    setCodeStyle(code: S2Code): void {
        const font = new S2FontData();
        font.family.set('monospace');
        font.size.set(16, 'view');
        font.relativeLineHeight.set(1.3);

        code.data.text.font.copy(font);
        code.data.text.fill.color.copy(MTL.WHITE);
        code.data.padding.set(20, 10, 'view');
        code.data.background.fill.color.copy(MTL.GREY_9);
        code.data.background.stroke.color.copy(MTL.GREY_7);
        code.data.background.stroke.width.set(2, 'view');
        code.data.currentLine.opacity.set(1);
        code.data.currentLine.fill.color.copy(MTL.BLACK);
        code.data.currentLine.fill.opacity.set(0.5);
        code.data.currentLine.stroke.color.copy(MTL.WHITE);
        code.data.currentLine.stroke.width.set(1, 'view');
        code.data.currentLine.stroke.opacity.set(0.2);
        code.data.currentLine.padding.set(-0.5, 2, 'view');
        code.data.currentLine.index.set(0);
    }

    constructor(
        svgElement: SVGSVGElement,
        userTree: UserTreeNode<number>,
        order: 'in-order' | 'pre-order' | 'post-order',
    ) {
        super(svgElement, camera);
        this.animator = new S2StepAnimator(this);

        const fillRect = this.addFillRect();
        S2DataSetter.setTargets(fillRect.data).setColor(MTL.GREY_8);

        // const grid = this.addWorldGrid();
        // S2DataSetter.addTarget(grid.data).setStrokeColor(MTL.GREY_6);

        // Tree
        this.tree = new BTree(this, userTree);
        this.tree.computeLayout(new S2Vec2(2, 0));

        for (let i = 0; i <= this.tree.height; i++) {
            const code = new S2Code(this);
            code.setParent(this.getSVG());
            this.codeStack.push(code);

            this.setCodeStyle(code);
            code.setContent(tokenizeAlgorithm(algorithm));
            code.data.anchor.set('north-west');
            code.data.position.set(-7 + 0.2 * i, 4 - 0.2 * i, 'world');
        }

        this.update();

        switch (order) {
            case 'in-order':
                this.createInOrderAnimation(this.tree.root);
                break;
            case 'pre-order':
                this.createPreOrderAnimation(this.tree.root);
                break;
            case 'post-order':
                this.createPostOrderAnimation(this.tree.root);
                break;
        }
    }

    createInOrderAnimation(bTreeNode: BTreeNode | null, depth: number = 0) {
        if (!bTreeNode) return;
        const prevCode = depth > 0 ? this.codeStack[depth - 1] : null;
        const code = this.codeStack[depth];

        const tab = [];
        if (prevCode) {
            tab.push(prevCode.data.text.opacity);
        }

        this.tree.animateSelectNode(this.animator, bTreeNode);

        const position = new S2Vec2(-7.5 + 0.2 * depth, 4 - 0.2 * depth);
        code.data.currentLine.index.set(0);
        code.data.opacity.set(0);
        code.data.position.set(position.x + 0.5, position.y, 'world');
        let anim = new S2AnimGroup(this).addLerpProperties(
            [code.data.opacity, code.data.position, code.data.currentLine.index, ...tab],
            500,
            ease.out,
        );

        code.data.opacity.set(1);
        code.data.position.setV(position, 'world');
        if (prevCode) {
            prevCode.data.text.opacity.set(0.1);
        }
        anim.commitLerpFinalStates();
        this.animator.addAnimation(anim, 'previous-end', 0);

        // Select
        this.animator.makeStep();

        // Left
        let lerpAnim = S2LerpAnimFactory.create(this, code.data.currentLine.index)
            .setCycleDuration(500)
            .setEasing(ease.inOut);
        code.data.currentLine.index.set(1);
        this.animator.addAnimation(lerpAnim.commitFinalState(), 'previous-end', 0);
        this.animator.makeStep();

        if (bTreeNode.left) {
            lerpAnim = S2LerpAnimFactory.create(this, code.data.currentLine.index)
                .setCycleDuration(500)
                .setEasing(ease.inOut);
            code.data.currentLine.index.set(2);
            this.animator.addAnimation(lerpAnim.commitFinalState(), 'previous-end', 0);
            this.animator.makeStep();

            this.createInOrderAnimation(bTreeNode.left, depth + 1);
        }

        // Explore
        lerpAnim = S2LerpAnimFactory.create(this, code.data.currentLine.index)
            .setCycleDuration(500)
            .setEasing(ease.inOut);
        code.data.currentLine.index.set(3);
        this.animator.addAnimation(lerpAnim.commitFinalState(), 'previous-end', 0);
        this.animator.makeStep();

        this.tree.animateExploreNode(this.animator, bTreeNode);
        this.animator.makeStep();

        // Right
        lerpAnim = S2LerpAnimFactory.create(this, code.data.currentLine.index)
            .setCycleDuration(500)
            .setEasing(ease.inOut);
        code.data.currentLine.index.set(4);
        this.animator.addAnimation(lerpAnim.commitFinalState(), 'previous-end', 0);
        this.animator.makeStep();
        if (bTreeNode.right) {
            lerpAnim = S2LerpAnimFactory.create(this, code.data.currentLine.index)
                .setCycleDuration(500)
                .setEasing(ease.inOut);
            code.data.currentLine.index.set(5);
            this.animator.addAnimation(lerpAnim.commitFinalState(), 'previous-end', 0);
            this.animator.makeStep();

            this.createInOrderAnimation(bTreeNode.right, depth + 1);
        }

        // Quit
        this.tree.animateExitParentEdge(this.animator, bTreeNode);

        anim = new S2AnimGroup(this).addLerpProperties([code.data.opacity, code.data.position, ...tab], 500, ease.out);
        code.data.opacity.set(0);
        code.data.position.set(position.x + 0.5, position.y, 'world');
        if (prevCode) {
            prevCode.data.text.opacity.set(1);
        }
        anim.commitLerpFinalStates();
        this.animator.addAnimation(anim, 'previous-end', 0);

        this.animator.makeStep();
    }

    createPreOrderAnimation(bTreeNode: BTreeNode | null, depth: number = 0) {
        if (!bTreeNode) return;
        // Select
        this.tree.animateSelectNode(this.animator, bTreeNode);
        this.animator.makeStep();
        // Explore
        this.tree.animateExploreNode(this.animator, bTreeNode);
        this.animator.makeStep();
        // Left
        this.createPreOrderAnimation(bTreeNode.left, depth + 1);
        // Right
        this.createPreOrderAnimation(bTreeNode.right, depth + 1);
        // Quit
        this.tree.animateExitParentEdge(this.animator, bTreeNode);
        this.animator.makeStep();
    }

    createPostOrderAnimation(bTreeNode: BTreeNode | null, depth: number = 0) {
        if (!bTreeNode) return;
        // Select
        this.tree.animateSelectNode(this.animator, bTreeNode);
        this.animator.makeStep();
        // Left
        this.createPostOrderAnimation(bTreeNode.left, depth + 1);
        // Right
        this.createPostOrderAnimation(bTreeNode.right, depth + 1);
        // Explore
        this.tree.animateExploreNode(this.animator, bTreeNode);
        this.animator.makeStep();
        // Quit
        this.tree.animateExitParentEdge(this.animator, bTreeNode);
        this.animator.makeStep();
    }
}

const appDiv = document.querySelector<HTMLDivElement>('#app');
if (appDiv) {
    appDiv.innerHTML = `
        <div>
            <h1>Parcours d'un arbre binaire</h1>
            <svg xmlns="http://www.w3.org/2000/svg" id="test-svg" class="responsive-svg" preserveAspectRatio="xMidYMid meet"></svg>
            <div class="figure-nav">
                <div>Animation : <input type="range" id="slider" min="0" max="100" step="1" value="0" style="width:50%"></div>
                <select id="order-select">
                    <option value="pre-order">Préfixe</option>
                    <option value="in-order">Infixe</option>
                    <option value="post-order">Suffixe</option>
                </select>
                <button id="reset-button"><i class="fa-solid fa-backward-fast"></i></button>
                <button id="prev-button"><i class="fa-solid fa-step-backward"></i></button>
                <button id="play-button"><i class="fa-solid fa-redo"></i></button>
                <button id="next-button"><i class="fa-solid fa-step-forward"></i></button>
                <button id="full-button"><i class="fa-solid fa-play"></i></button>
            </div>
        </div>`;
}

const svgElement = appDiv?.querySelector<SVGSVGElement>('#test-svg');
const slider = document.querySelector<HTMLInputElement>('#slider');

if (svgElement && slider) {
    const userTree = {
        data: 0,
        left: {
            data: 1,
            left: { data: 3, right: { data: 7 } },
            right: { data: 4, left: { data: 8 } },
        },
        right: {
            data: 2,
            left: { data: 5, left: { data: 9 }, right: { data: 10 } },
            right: { data: 6, left: { data: 11 } },
        },
    };
    let scene = new SceneFigure(svgElement, userTree, 'pre-order');

    let index = -1;
    scene.animator.reset();

    document.querySelector<HTMLButtonElement>('#reset-button')?.addEventListener('click', () => {
        index = -1;
        scene.animator.stop();
        scene.animator.reset();
    });
    document.querySelector<HTMLButtonElement>('#prev-button')?.addEventListener('click', () => {
        index = S2MathUtils.clamp(index - 1, 0, scene.animator.getStepCount() - 1);
        scene.animator.playStep(index);
    });
    document.querySelector<HTMLButtonElement>('#next-button')?.addEventListener('click', () => {
        index = S2MathUtils.clamp(index + 1, 0, scene.animator.getStepCount() - 1);
        scene.animator.playStep(index);
    });
    document.querySelector<HTMLButtonElement>('#play-button')?.addEventListener('click', () => {
        scene.animator.playStep(index);
    });
    document.querySelector<HTMLButtonElement>('#full-button')?.addEventListener('click', () => {
        scene.animator.playMaster();
    });

    slider.addEventListener('input', () => {
        const ratio = slider.valueAsNumber / 100;
        scene.animator.stop();
        scene.animator.setMasterElapsed(ratio * scene.animator.getMasterDuration());
        scene.getSVG().update();
    });

    const selectElement = document.getElementById('order-select') as HTMLSelectElement;

    selectElement.addEventListener('change', (event) => {
        const target = event.target as HTMLSelectElement;
        switch (target.value) {
            case 'in-order':
                scene = new SceneFigure(svgElement, userTree, 'in-order');
                break;
            case 'pre-order':
                scene = new SceneFigure(svgElement, userTree, 'pre-order');
                break;
            case 'post-order':
            default:
                scene = new SceneFigure(svgElement, userTree, 'post-order');
                break;
        }
    });
}
