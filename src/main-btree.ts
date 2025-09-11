import './style.css';
import { S2Vec2 } from './core/math/s2-vec2.ts';
import { S2Camera } from './core/math/s2-camera.ts';
import { MTL } from './utils/mtl-colors.ts';
import { S2Scene } from './core/s2-scene.ts';
import { S2Node, S2NodeData } from './core/element/s2-node.ts';
import { S2EdgeData, S2LineEdge } from './core/element/s2-edge.ts';
import { S2Group } from './core/element/s2-group.ts';
import { S2StepAnimator } from './animation/s2-step-animator.ts';
import { S2LerpAnim } from './animation/s2-lerp-anim.ts';
import { easeInOut } from './animation/s2-easing.ts';
import { S2MathUtils } from './core/math/s2-utils.ts';

const viewport = new S2Vec2(640.0, 360.0);
const camera = new S2Camera(new S2Vec2(0.0, 0.0), new S2Vec2(8.0, 4.5), viewport, 1.0);

class BTreeStyle {
    // Background
    public backBase = new S2NodeData();
    public backSlct = new S2NodeData();
    public backExpl = new S2NodeData();

    // Edge
    public edgeBase = new S2EdgeData();
    public edgeEmph = new S2EdgeData();
    public edgeSlct = new S2EdgeData();
    public edgeExpl = new S2EdgeData();

    constructor() {
        this.backBase.background.fill.color.copy(MTL.GREY_6);
        this.backBase.background.stroke.color.copy(MTL.GREY_4);
        this.backBase.background.stroke.width.set(4, 'view');
        this.backBase.text.fill.color.copy(MTL.WHITE);
        this.backBase.text.horizontalAlign.set('center');
        this.backBase.text.verticalAlign.set('middle');
        this.backBase.padding.set(0, 0, 'view');
        this.backBase.minExtents.set(0.5, 0, 'world');

        this.backSlct.background.fill.color.copy(MTL.GREY_8);
        this.backSlct.background.stroke.color.copy(MTL.LIGHT_BLUE_6);
        this.backSlct.background.stroke.width.set(4, 'view');
        this.backSlct.text.fill.color.copy(MTL.WHITE);

        this.backExpl.background.fill.color.copy(MTL.LIGHT_BLUE_7);
        this.backExpl.background.stroke.color.copy(MTL.LIGHT_BLUE_3);
        this.backExpl.background.stroke.width.set(6, 'view');
        this.backExpl.text.fill.color.copy(MTL.WHITE);

        this.edgeBase.stroke.color.copy(MTL.GREY_6);
        this.edgeBase.stroke.width.set(4, 'view');
        this.edgeBase.stroke.lineCap.set('round');
        this.edgeBase.startDistance.set(0, 'view');
        this.edgeBase.endDistance.set(10, 'view');

        this.edgeEmph.stroke.color.copy(MTL.WHITE);
        this.edgeEmph.stroke.width.set(6, 'view');
        this.edgeEmph.stroke.lineCap.set('round');
        this.edgeEmph.startDistance.set(0, 'view');
        this.edgeEmph.endDistance.set(10, 'view');

        this.edgeExpl.stroke.color.copy(MTL.GREY_7);
        this.edgeExpl.stroke.width.set(4, 'view');
        this.edgeExpl.stroke.lineCap.set('round');
        this.edgeExpl.startDistance.set(0, 'view');
        this.edgeExpl.endDistance.set(10, 'view');
    }
    // Text
    // public text: S2SVGAttributes = {
    //     fill: MTL_HEX.WHITE,
    //     'font-family': 'monospace',
    //     'font-size': '20px',
    // };
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
    nodeRadius: number = 0.5;
    height: number;

    protected center: S2Vec2;
    protected extents: S2Vec2;

    constructor(scene: S2Scene, style: BTreeStyle, userTree: UserTreeNode<number>) {
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
        this.nodeGroup.appendChild(node.s2Node);
        node.s2Node.data.copy(this.style.backBase);

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

    private createNodeLines(node: BTreeNode | null, parent: BTreeNode | null) {
        if (node === null) return;
        if (parent) {
            node.parentEdge = this.scene.addLineEdge(parent.s2Node, node.s2Node, this.edgeGroup).update();
            console.log(node.parentEdge);
            node.parentEmphEdge = this.scene
                .addLineEdge(parent.s2Node, node.s2Node, this.edgeGroup)
                .setPathFrom(0)
                .setPathTo(0);

            node.parentEdge.data.copy(this.style.edgeBase);
            node.parentEmphEdge.data.copy(this.style.edgeEmph);
        }
        this.createNodeLines(node.left, node);
        this.createNodeLines(node.right, node);
    }

    computeLayout(center: S2Vec2) {
        this.center.copy(center);
        this.extents.x = (this.nodeGroup.getChildCount() - 1) * this.baseSep;
        this.extents.y = this.height * this.levelDistance;
        this.extents.scale(0.5);
        this.computeLayoutRec(this.root, 0, 0);
    }

    private computeLayoutRec(node: BTreeNode | null, index: number, depth: number): number {
        if (node === null) return index;
        index = this.computeLayoutRec(node.left, index, depth + 1);
        node.s2Node.setPosition(
            this.center.x - this.extents.x + index * this.baseSep,
            this.center.y + this.extents.y - depth * this.levelDistance,
            'world',
        );
        index++;
        index = this.computeLayoutRec(node.right, index, depth + 1);
        return index;
    }

    update(): this {
        this.nodeGroup.update();
        this.edgeGroup.update();
        return this;
    }

    animateSelectNode(animator: S2StepAnimator, node: BTreeNode) {
        let anim: S2LerpAnim | null = null;
        if (node.parentEmphEdge) {
            anim = new S2LerpAnim(this.scene)
                .addUpdateTarget(node.parentEmphEdge)
                .bind(node.parentEmphEdge.pathTo)
                .setCycleDuration(500)
                .setEasing(easeInOut);

            node.parentEmphEdge.setPathTo(1.0).update();
            animator.addAnimation(anim.commitFinalStates());
        }

        anim = new S2LerpAnim(this.scene)
            .addUpdateTarget(node.s2Node)
            .bind(node.s2Node.data.background.fill.color)
            .bind(node.s2Node.data.background.stroke.color)
            .setCycleDuration(300)
            .setEasing(easeInOut);

        node.s2Node.data.background.fill.color.copy(this.style.backSlct.background.fill.color);
        node.s2Node.data.background.stroke.color.copy(this.style.backSlct.background.stroke.color);
        animator.addAnimation(anim.commitFinalStates(), 'previous-start', node.parentEdge ? 100 : 0);

        if (node.left && node.left.parentEdge) {
            anim = new S2LerpAnim(this.scene)
                .addUpdateTarget(node.left.parentEdge)
                .bind(node.left.parentEdge.data.stroke.color)
                .setCycleDuration(300)
                .setEasing(easeInOut);

            node.left.parentEdge.setStrokeColor(this.style.edgeSlct.stroke.color);
            animator.addAnimation(anim.commitFinalStates(), 'previous-start', 0);
        }
        if (node.right && node.right.parentEdge) {
            anim = new S2LerpAnim(this.scene)
                .addUpdateTarget(node.right.parentEdge)
                .bind(node.right.parentEdge.data.stroke.color)
                .setCycleDuration(300)
                .setEasing(easeInOut);

            node.right.parentEdge.setStrokeColor(this.style.edgeSlct.stroke.color);
            animator.addAnimation(anim.commitFinalStates(), 'previous-start', 0);
        }
    }

    animateExploreNode(animator: S2StepAnimator, node: BTreeNode) {
        let anim = new S2LerpAnim(this.scene)
            .addUpdateTarget(node.s2Node)
            .bind(node.s2Node.data.background.fill.color)
            .bind(node.s2Node.data.background.stroke.color)
            .setCycleDuration(300)
            .setEasing(easeInOut);

        node.s2Node.data.background.fill.color.copy(this.style.backExpl.background.fill.color);
        node.s2Node.data.background.stroke.color.copy(this.style.backExpl.background.stroke.color);
        animator.addAnimation(anim.commitFinalStates(), 'previous-end', 300);
    }

    animateExitParentEdge(animator: S2StepAnimator, node: BTreeNode) {
        if (!node.parentEdge || !node.parentEmphEdge) return;

        let anim = new S2LerpAnim(this.scene)
            .addUpdateTarget(node.parentEmphEdge)
            .bind(node.parentEmphEdge.pathTo)
            .setCycleDuration(500)
            .setEasing(easeInOut);

        node.parentEmphEdge.setPathTo(0.0).update();
        animator.addAnimation(anim.commitFinalStates(), 'previous-start', 0);

        anim = new S2LerpAnim(this.scene)
            .addUpdateTarget(node.parentEdge)
            .bind(node.parentEdge.data.stroke.color)
            .setCycleDuration(300)
            .setEasing(easeInOut);

        node.parentEdge.setStrokeColor(this.style.edgeExpl.stroke.color);
        animator.addAnimation(anim.commitFinalStates(), 'previous-start', 200);
    }
}

class BTreeNode {
    data: number;
    parent: BTreeNode | null = null;
    left: BTreeNode | null = null;
    right: BTreeNode | null = null;

    s2Node: S2Node;
    parentEdge: S2LineEdge | null = null;
    parentEmphEdge: S2LineEdge | null = null;

    constructor(scene: S2Scene, data: number = 0) {
        this.data = data;
        this.s2Node = scene.addNode();
        this.s2Node.addLine().addContent(data.toString());
        this.s2Node.createCircleBackground();
    }

    setLeft(node: BTreeNode) {
        this.left = node;
        node.parent = this;
    }

    setRight(node: BTreeNode) {
        this.right = node;
        node.parent = this;
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
        const treeStyle = new BTreeStyle();
        this.tree = new BTree(this, treeStyle, userTree);
        this.tree.computeLayout(new S2Vec2(0, 0));
        this.tree.update();

        this.update();

        //this.saveTree(this.tree.root);
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

    // saveTree(node: BTreeNode | null): void {
    //     if (!node) return;
    //     this.animator.saveState(node.s2Node);
    //     if (node.parentEdge) this.animator.saveState(node.parentEdge);
    //     if (node.parentEmphEdge) this.animator.saveState(node.parentEmphEdge);
    //     this.saveTree(node.left);
    //     this.saveTree(node.right);
    // }

    createInOrderAnimation(node: BTreeNode | null) {
        if (!node) return;
        // Select
        this.tree.animateSelectNode(this.animator, node);
        this.animator.makeStep();
        // Left
        this.createInOrderAnimation(node.left);
        // Explore
        this.tree.animateExploreNode(this.animator, node);
        this.animator.makeStep();
        // Right
        this.createInOrderAnimation(node.right);
        // Quit
        this.tree.animateExitParentEdge(this.animator, node);
        this.animator.makeStep();
    }

    createPreOrderAnimation(node: BTreeNode | null) {
        if (!node) return;
        // Select
        this.tree.animateSelectNode(this.animator, node);
        this.animator.makeStep();
        // Explore
        this.tree.animateExploreNode(this.animator, node);
        this.animator.makeStep();
        // Left
        this.createPreOrderAnimation(node.left);
        // Right
        this.createPreOrderAnimation(node.right);
        // Quit
        this.tree.animateExitParentEdge(this.animator, node);
        this.animator.makeStep();
    }

    createPostOrderAnimation(node: BTreeNode | null) {
        if (!node) return;
        // Select
        this.tree.animateSelectNode(this.animator, node);
        this.animator.makeStep();
        // Left
        this.createPostOrderAnimation(node.left);
        // Right
        this.createPostOrderAnimation(node.right);
        // Explore
        this.tree.animateExploreNode(this.animator, node);
        this.animator.makeStep();
        // Quit
        this.tree.animateExitParentEdge(this.animator, node);
        this.animator.makeStep();
    }

    updateCamera(): void {
        this.update();
        this.tree.update();
    }
}

const appDiv = document.querySelector<HTMLDivElement>('#app');
if (appDiv) {
    appDiv.innerHTML = `
        <div>
            <h1>Parcours d'un arbre binaire</h1>
            <svg xmlns="http://www.w3.org/2000/svg" id="test-svg" class="responsive-svg" preserveAspectRatio="xMidYMid meet"></svg>
            <div class="figure-nav">
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

if (svgElement) {
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
