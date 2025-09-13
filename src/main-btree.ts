import './style.css';
import { S2Vec2 } from './core/math/s2-vec2.ts';
import { S2Camera } from './core/math/s2-camera.ts';
import { MTL } from './utils/mtl-colors.ts';
import { S2Scene } from './core/s2-scene.ts';
import { S2Node } from './core/element/s2-node.ts';
import { S2LineEdge } from './core/element/s2-edge.ts';
import { S2Group } from './core/element/s2-group.ts';
import { S2StepAnimator } from './animation/s2-step-animator.ts';
import { S2LerpAnim } from './animation/s2-lerp-anim.ts';
import { ease } from './animation/s2-easing.ts';
import { S2MathUtils } from './core/math/s2-utils.ts';

const viewport = new S2Vec2(640.0, 360.0);
const camera = new S2Camera(new S2Vec2(0.0, 0.0), new S2Vec2(8.0, 4.5), viewport, 1.0);

class BTreeStyle {
    setNodeDefault(node: S2Node): void {
        const data = node.data;
        data.background.fill.color.copy(MTL.GREY_6);
        data.background.stroke.color.copy(MTL.GREY_4);
        data.background.stroke.width.set(4, 'view');
        data.text.fill.color.copy(MTL.WHITE);
        data.text.horizontalAlign.set('center');
        data.text.verticalAlign.set('middle');
        data.padding.set(0, 0, 'view');
        data.minExtents.set(0.5, 0, 'world');
    }

    setNodeSelected(node: S2Node): void {
        const data = node.data;
        data.background.fill.color.copy(MTL.GREY_8);
        data.background.stroke.color.copy(MTL.BLUE_5);
        data.text.fill.color.copy(MTL.BLUE_2);
    }

    bindNodeSelected(anim: S2LerpAnim, node: S2Node): void {
        anim.addUpdateTarget(node)
            .bind(node.data.background.fill.color)
            .bind(node.data.background.stroke.color)
            .bind(node.data.text.fill.color);
    }

    setNodeExplored(node: S2Node): void {
        const data = node.data;
        data.background.fill.color.copy(MTL.CYAN_7);
        data.background.stroke.color.copy(MTL.CYAN_3);
        data.text.fill.color.copy(MTL.WHITE);
    }

    bindNodeExplored(anim: S2LerpAnim, node: S2Node): void {
        anim.addUpdateTarget(node)
            .bind(node.data.background.fill.color)
            .bind(node.data.background.stroke.color)
            .bind(node.data.text.fill.color);
    }

    setEdgeBase(edge: S2LineEdge): void {
        edge.setStrokeColor(MTL.GREY_6)
            .setStrokeWidth(4, 'view')
            .setStrokeLineCap('round')
            .setStartDistance(0, 'view')
            .setEndDistance(10, 'view');
    }

    setEdgeEmphasized(edge: S2LineEdge): void {
        edge.setStrokeColor(MTL.WHITE)
            .setStrokeWidth(6, 'view')
            .setStrokeLineCap('round')
            .setStartDistance(0, 'view')
            .setEndDistance(10, 'view');
    }

    setEdgeSelected(edge: S2LineEdge): void {
        edge.setStrokeColor(MTL.BLUE_5);
    }

    bindEdgeSelected(anim: S2LerpAnim, edge: S2LineEdge): void {
        anim.addUpdateTarget(edge).bind(edge.strokeColor);
    }

    setEdgeExplored(edge: S2LineEdge): void {
        edge.setStrokeColor(MTL.GREY_7);
    }

    bindEdgeExplored(anim: S2LerpAnim, edge: S2LineEdge): void {
        anim.addUpdateTarget(edge).bind(edge.strokeColor);
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
    protected edgeGroup: S2Group<S2LineEdge>;
    protected nodeGroup: S2Group<S2Node>;

    levelDistance: number = 1.8;
    baseSep: number = 0.8;
    height: number;

    protected center: S2Vec2;
    protected extents: S2Vec2;

    constructor(scene: S2Scene, userTree: UserTreeNode<number>, style: BTreeStyle = new BTreeStyle()) {
        this.scene = scene;
        this.style = style;
        this.center = new S2Vec2();
        this.extents = new S2Vec2();
        this.edgeGroup = scene.addGroup<S2LineEdge>();
        this.nodeGroup = scene.addGroup<S2Node>();

        this.height = 0;
        this.root = this.createNodes(userTree);

        this.computeLayout(new S2Vec2(0, 0));
        this.createNodeLines(this.root, null);
    }

    private createNodes(userTree: UserTreeNode<number>, depth: number = 0): BTreeNode {
        const node = new BTreeNode(this.scene, userTree.data);
        this.height = Math.max(this.height, depth);
        this.nodeGroup.appendChild(node.node);
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
            bTreeNode.parentEdge = this.scene.addLineEdge(parent.node, bTreeNode.node, this.edgeGroup).update();
            bTreeNode.parentEmphEdge = this.scene
                .addLineEdge(parent.node, bTreeNode.node, this.edgeGroup)
                .setPathFrom(0)
                .setPathTo(0.2);

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
        bTreeNode.node.setPosition(
            this.center.x - this.extents.x + index * this.baseSep,
            this.center.y + this.extents.y - depth * this.levelDistance,
            'world',
        );
        index++;
        index = this.computeLayoutRec(bTreeNode.right, index, depth + 1);
        return index;
    }

    update(): this {
        this.nodeGroup.update();
        this.edgeGroup.update();
        return this;
    }

    animateSelectNode(animator: S2StepAnimator, bTreeNode: BTreeNode) {
        let anim: S2LerpAnim | null = null;
        if (bTreeNode.parentEmphEdge) {
            bTreeNode.parentEmphEdge.setPathTo(0.0);
            anim = new S2LerpAnim(this.scene)
                .addUpdateTarget(bTreeNode.parentEmphEdge)
                .bind(bTreeNode.parentEmphEdge.pathTo)
                .setCycleDuration(500)
                .setEasing(ease.inOut);

            bTreeNode.parentEmphEdge.setPathTo(1.0).update();
            animator.addAnimation(anim.commitFinalStates());
        }

        anim = new S2LerpAnim(this.scene).setCycleDuration(300).setEasing(ease.inOut);

        this.style.bindNodeSelected(anim, bTreeNode.node);
        this.style.setNodeSelected(bTreeNode.node);
        animator.addAnimation(anim.commitFinalStates(), 'previous-start', bTreeNode.parentEdge ? 100 : 0);

        if (bTreeNode.left && bTreeNode.left.parentEdge) {
            anim = new S2LerpAnim(this.scene).setCycleDuration(300).setEasing(ease.inOut);

            this.style.bindEdgeSelected(anim, bTreeNode.left.parentEdge);
            this.style.setEdgeSelected(bTreeNode.left.parentEdge);
            animator.addAnimation(anim.commitFinalStates(), 'previous-start', 0);
        }
        if (bTreeNode.right && bTreeNode.right.parentEdge) {
            anim = new S2LerpAnim(this.scene).setCycleDuration(300).setEasing(ease.inOut);

            this.style.bindEdgeSelected(anim, bTreeNode.right.parentEdge);
            this.style.setEdgeSelected(bTreeNode.right.parentEdge);
            animator.addAnimation(anim.commitFinalStates(), 'previous-start', 0);
        }
    }

    animateExploreNode(animator: S2StepAnimator, bTreeNode: BTreeNode) {
        let anim = new S2LerpAnim(this.scene).setCycleDuration(300).setEasing(ease.inOut);

        this.style.bindNodeExplored(anim, bTreeNode.node);
        this.style.setNodeExplored(bTreeNode.node);
        animator.addAnimation(anim.commitFinalStates(), 'previous-end', 0);
    }

    animateExitParentEdge(animator: S2StepAnimator, bTreeNode: BTreeNode) {
        if (!bTreeNode.parentEdge || !bTreeNode.parentEmphEdge) return;

        let anim = new S2LerpAnim(this.scene)
            .addUpdateTarget(bTreeNode.parentEmphEdge)
            .bind(bTreeNode.parentEmphEdge.pathTo)
            .setCycleDuration(500)
            .setEasing(ease.inOut);

        bTreeNode.parentEmphEdge.setPathTo(0.0).update();
        animator.addAnimation(anim.commitFinalStates(), 'previous-end', 0);

        anim = new S2LerpAnim(this.scene).setCycleDuration(300).setEasing(ease.inOut);

        this.style.bindEdgeExplored(anim, bTreeNode.parentEdge);
        this.style.setEdgeExplored(bTreeNode.parentEdge);
        animator.addAnimation(anim.commitFinalStates(), 'previous-start', 200);
    }
}

class BTreeNode {
    data: number;
    parent: BTreeNode | null = null;
    left: BTreeNode | null = null;
    right: BTreeNode | null = null;

    node: S2Node;
    parentEdge: S2LineEdge | null = null;
    parentEmphEdge: S2LineEdge | null = null;

    constructor(scene: S2Scene, data: number = 0) {
        this.data = data;
        this.node = scene.addNode();
        this.node.addLine().addContent(data.toString());
        this.node.createCircleBackground();
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

    constructor(
        svgElement: SVGSVGElement,
        userTree: UserTreeNode<number>,
        order: 'in-order' | 'pre-order' | 'post-order',
    ) {
        super(svgElement, camera);
        this.animator = new S2StepAnimator(this);

        this.addFillRect().setColor(MTL.GREY_8);
        this.addWorldGrid().setStrokeColor(MTL.GREY_6);

        // Tree
        this.tree = new BTree(this, userTree);
        this.tree.computeLayout(new S2Vec2(0, 0));

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

    createInOrderAnimation(bTreeNode: BTreeNode | null) {
        if (!bTreeNode) return;
        // Select
        this.tree.animateSelectNode(this.animator, bTreeNode);
        this.animator.makeStep();
        // Left
        this.createInOrderAnimation(bTreeNode.left);
        // Explore
        this.tree.animateExploreNode(this.animator, bTreeNode);
        this.animator.makeStep();
        // Right
        this.createInOrderAnimation(bTreeNode.right);
        // Quit
        this.tree.animateExitParentEdge(this.animator, bTreeNode);
        this.animator.makeStep();
    }

    createPreOrderAnimation(bTreeNode: BTreeNode | null) {
        if (!bTreeNode) return;
        // Select
        this.tree.animateSelectNode(this.animator, bTreeNode);
        this.animator.makeStep();
        // Explore
        this.tree.animateExploreNode(this.animator, bTreeNode);
        this.animator.makeStep();
        // Left
        this.createPreOrderAnimation(bTreeNode.left);
        // Right
        this.createPreOrderAnimation(bTreeNode.right);
        // Quit
        this.tree.animateExitParentEdge(this.animator, bTreeNode);
        this.animator.makeStep();
    }

    createPostOrderAnimation(bTreeNode: BTreeNode | null) {
        if (!bTreeNode) return;
        // Select
        this.tree.animateSelectNode(this.animator, bTreeNode);
        this.animator.makeStep();
        // Left
        this.createPostOrderAnimation(bTreeNode.left);
        // Right
        this.createPostOrderAnimation(bTreeNode.right);
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
