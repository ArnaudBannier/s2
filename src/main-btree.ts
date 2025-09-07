import './style.css';
import { S2Vec2 } from './core/math/s2-vec2.ts';
import { S2Camera } from './core/math/s2-camera.ts';
import { MTL, MTL_COLORS } from './utils/mtl-colors.ts';
import { S2Scene } from './core/s2-scene.ts';
import { type S2SVGAttributes } from './core/s2-globals.ts';
import { S2Node } from './core/element/s2-node.ts';
import { S2LineEdge, type S2EdgeOptions } from './core/element/s2-edge.ts';
import { S2Group } from './core/element/s2-group.ts';
import { S2Length } from './core/s2-types.ts';
import { S2Attributes } from './core/s2-attributes.ts';
import { S2AnimatedScene } from './animation/s2-animated-scene.ts';
import type { S2Animator } from './animation/s2-animator.ts';

const viewport = new S2Vec2(640.0, 360.0);
const camera = new S2Camera(new S2Vec2(0.0, 0.0), new S2Vec2(8.0, 4.5), viewport, 1.0);

class BTreeStyle {
    // Background
    public backBase = new S2Attributes({
        fillColor: MTL_COLORS.GREY_6,
        strokeColor: MTL_COLORS.GREY_4,
        strokeWidth: new S2Length(4, 'view'),
    });
    public backSlct = new S2Attributes({
        fillColor: MTL_COLORS.GREY_8,
        strokeColor: MTL_COLORS.LIGHT_BLUE_6,
        strokeWidth: new S2Length(4, 'view'),
        textFillColor: MTL_COLORS.WHITE,
    });
    public backExpl = new S2Attributes({
        fillColor: MTL_COLORS.LIGHT_BLUE_7,
        strokeColor: MTL_COLORS.LIGHT_BLUE_3,
        strokeWidth: new S2Length(6, 'view'),
        textFillColor: MTL_COLORS.WHITE,
    });

    // Edge
    public edgeBase = new S2Attributes({
        strokeColor: MTL_COLORS.GREY_6,
        strokeWidth: new S2Length(4, 'view'),
        lineCap: 'round',
    });
    public edgeEmph = new S2Attributes({
        strokeColor: MTL_COLORS.WHITE,
        strokeWidth: new S2Length(6, 'view'),
        lineCap: 'round',
    });
    public edgeSlct = new S2Attributes({
        strokeColor: MTL_COLORS.LIGHT_BLUE_6,
    });
    public edgeExpl = new S2Attributes({
        strokeColor: MTL_COLORS.GREY_7,
    });
    public edgeOpts: S2EdgeOptions = {
        startDistance: new S2Length(0, 'view'),
        endDistance: new S2Length(10, 'view'),
    };

    // Text
    public text: S2SVGAttributes = {
        fill: MTL.WHITE,
        'font-family': 'monospace',
        'font-size': '20px',
    };
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
        this.edgeGroup = scene.addGroup<S2LineEdge>();
        this.nodeGroup = scene.addGroup<S2Node>();

        this.edgeGroup.addClass('btree-edges');
        this.nodeGroup.addClass('btree-nodes');

        this.height = 0;
        this.root = this.createNodes(userTree);
        this.createNodeLines(this.root, null);

        this.center = new S2Vec2();
        this.extents = new S2Vec2();
    }

    private createNodes(userTree: UserTreeNode<number>, depth: number = 0): BTreeNode {
        const node = new BTreeNode(this.scene, userTree.data);
        this.height = Math.max(this.height, depth);
        this.nodeGroup.appendChild(node.s2Node);
        node.s2Node.setAttributes(this.style.backBase);
        node.s2Node.setTextStyle(this.style.text);

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
            node.parentEdge = this.scene
                .addLineEdge(parent.s2Node, node.s2Node, this.style.edgeOpts, this.edgeGroup)
                .setAttributes(this.style.edgeBase);

            node.parentEmphEdge = this.scene
                .addLineEdge(parent.s2Node, node.s2Node, this.style.edgeOpts, this.edgeGroup)
                .setAttributes(this.style.edgeEmph)
                .setPathRange(0, 0);
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
        this.nodeGroup.updateImpl();
        this.edgeGroup.updateImpl();
        return this;
    }

    animateSelectNode(animator: S2Animator, node: BTreeNode) {
        if (node.parentEmphEdge) {
            node.parentEmphEdge.setPathRange(0, 1);
            animator.animate(node.parentEmphEdge, { duration: 500, easing: 'inOutQuad' }, '+=0');
        }
        node.s2Node.setAttributes(this.style.backSlct);
        animator.animate(node.s2Node, { duration: 300, easing: 'inOut' }, node.parentEdge ? '<-=200' : '+=0');

        if (node.left && node.left.parentEdge) {
            node.left.parentEdge.setAttributes(this.style.edgeSlct);
            animator.animate(node.left.parentEdge, { duration: 300, easing: 'inOut' }, '<<');
        }
        if (node.right && node.right.parentEdge) {
            node.right.parentEdge.setAttributes(this.style.edgeSlct);
            animator.animate(node.right.parentEdge, { duration: 300, easing: 'inOut' }, '<<');
        }
    }

    animateExploreNode(animator: S2Animator, node: BTreeNode) {
        node.s2Node.setAttributes(this.style.backExpl);
        animator.animate(node.s2Node, { duration: 300, easing: 'inOut' }, '+=0');
    }

    animateExitParentEdge(animator: S2Animator, node: BTreeNode) {
        if (!node.parentEdge || !node.parentEmphEdge) return;
        node.parentEmphEdge.setPathRange(0, 0);
        node.parentEdge.setAttributes(this.style.edgeExpl);
        animator.animate(node.parentEmphEdge, { duration: 500, easing: 'inOutQuad' }, '+=0');
        animator.animate(node.parentEdge, { duration: 300, easing: 'inOut' }, '<-=200');
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
        this.s2Node.setTextAlign('center').setTextVerticalAlign('middle');
        this.s2Node.setLineHeight(20, 16);
        this.s2Node.setMinExtents(0.5, 0, 'world').setPadding(0, 0, 'world');
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

class SceneFigure extends S2AnimatedScene {
    public tree: BTree;

    constructor(
        svgElement: SVGSVGElement,
        userTree: UserTreeNode<number>,
        order: 'in-order' | 'pre-order' | 'post-order',
    ) {
        super(svgElement, camera);
        this.addFillRect().setFillColor(MTL_COLORS.GREY_8);
        //this.addGrid().setExtents(8, 5).setSteps(1, 1).setStrokeWidth(2, 'view').setStrokeColor(MTL_COLORS.GREY_7);

        // Tree
        const treeStyle = new BTreeStyle();
        this.tree = new BTree(this, treeStyle, userTree);
        this.tree.computeLayout(new S2Vec2(0, 0));
        this.tree.update();

        this.update();

        this.saveTree(this.tree.root);
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
        this.animator.finalize();
    }

    saveTree(node: BTreeNode | null): void {
        if (!node) return;
        this.animator.saveState(node.s2Node);
        if (node.parentEdge) this.animator.saveState(node.parentEdge);
        if (node.parentEmphEdge) this.animator.saveState(node.parentEmphEdge);
        this.saveTree(node.left);
        this.saveTree(node.right);
    }

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
