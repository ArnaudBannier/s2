import './style.css';
import { Vector2 } from './math/vector2.ts';
import { S2Camera } from './s2/math/s2-camera.ts';
import { MTL, MTL_COLORS } from './utils/mtl-colors.ts';
import { S2Scene } from './s2/s2-scene.ts';
import { type S2StyleDecl } from './s2/s2-globals.ts';
import { S2Node } from './s2/element/s2-node.ts';
import { S2LineEdge, type S2EdgeOptions } from './s2/element/s2-edge.ts';
import { S2Group } from './s2/element/s2-group.ts';
import { S2Length } from './s2/s2-space.ts';
import { svg, type DrawableSVGGeometry } from 'animejs';
import { S2Parameters } from './s2/s2-interface.ts';

const viewport = new Vector2(640.0, 360.0);
const camera = new S2Camera(new Vector2(0.0, 0.0), new Vector2(8.0, 4.5), viewport, 1.0);

class BTreeStyle {
    public backBase = new S2Parameters();
    public backExpl = new S2Parameters();
    public edgeBase = new S2Parameters();
    public edgeEmph: S2StyleDecl;
    public edgeSlct = new S2Parameters();
    public edgeExpl: S2StyleDecl;
    public text: S2StyleDecl;
    public edgeOpts: S2EdgeOptions;

    constructor() {
        // Background
        this.backBase.setFillColor(MTL_COLORS.GREY_6).setStrokeColor(MTL_COLORS.GREY_4).setStrokeWidth(4, 'view');
        this.backExpl
            .setFillColor(MTL_COLORS.BLUE_GREY_9)
            .setStrokeColor(MTL_COLORS.LIGHT_BLUE_5)
            .setStrokeWidth(4, 'view');

        // Edge
        this.edgeBase.setStrokeColor(MTL_COLORS.GREY_6).setStrokeWidth(4, 'view').setLineCap('round');
        this.edgeSlct.setStrokeColor(MTL_COLORS.LIGHT_BLUE_6);

        this.edgeEmph = {
            stroke: '#FFFFFF',
            'stroke-width': '6',
            'stroke-linecap': 'round',
        };
        this.edgeExpl = {
            stroke: MTL.GREY_7,
        };
        // Text
        this.text = {
            fill: MTL.WHITE,
            'font-family': 'monospace',
            'font-size': '20px',
        };

        this.edgeOpts = {
            startDistance: new S2Length(0, 'view'),
            endDistance: new S2Length(10, 'view'),
        };
    }
}

interface UserTreeNode<T> {
    data: T;
    left?: UserTreeNode<T>;
    right?: UserTreeNode<T>;
    sepScale?: number;
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

    protected center: Vector2;
    protected extents: Vector2;

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

        this.center = new Vector2();
        this.extents = new Vector2();
    }

    private createNodes(userTree: UserTreeNode<number>, depth: number = 0): BTreeNode {
        const node = new BTreeNode(this.scene, userTree.data);

        this.height = Math.max(this.height, depth);

        this.nodeGroup.appendChild(node.s2Node);
        node.s2Node.setBackgroundStyle(this.style.backBase);
        node.s2Node.setTextStyle(this.style.text);
        if (userTree.sepScale) {
            node.sepScale = userTree.sepScale;
        }

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
                .setStyleDecl(this.style.edgeBase);

            node.parentEmphEdge = this.scene
                .addLineEdge(parent.s2Node, node.s2Node, this.style.edgeOpts, this.edgeGroup)
                .setStyleDecl(this.style.edgeEmph);
            node.parentDrawableEdge = svg.createDrawable(node.parentEmphEdge.getElement());
        }
        this.createNodeLines(node.left, node);
        this.createNodeLines(node.right, node);
    }

    computeLayout(center: Vector2) {
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

    animateSelectNode(scheduler: AnimationScheduler, node: BTreeNode) {
        const s2node = node.s2Node;
        const background = s2node.getBackgroundCircle();
        const text = s2node.getTextGroup();
        if (!background || !text) return;

        let animPosition = '+=0';
        if (node.parentDrawableEdge.length > 0) {
            scheduler.addAnimation(node.parentDrawableEdge, {
                draw: '0 1',
                ease: 'inOutQuad',
                duration: 500,
            });
            animPosition = '<-=200';
        }

        scheduler.addAnimation(
            background.getElement(),
            {
                ...scheduler.getTween(this.style.backBase, this.style.backSlct),
                duration: 300,
                easing: 'inOut',
            },
            animPosition,
        );

        if (node.left && node.left.parentEdge) {
            scheduler.addAnimation(
                node.left.parentEdge.getElement(),
                {
                    ...scheduler.getTween(this.style.edgeBase, this.style.edgeSlct),
                    duration: 300,
                    easing: 'inOut',
                },
                '<<',
            );
        }
        if (node.right && node.right.parentEdge) {
            scheduler.addAnimation(
                node.right.parentEdge.getElement(),
                {
                    ...scheduler.getTween(this.style.edgeBase, this.style.edgeSlct),
                    duration: 300,
                    easing: 'inOut',
                },
                '<<',
            );
        }
    }

    animateExploreNode(scheduler: AnimationScheduler, node: BTreeNode) {
        const s2node = node.s2Node;
        const background = s2node.getBackgroundCircle();
        const text = s2node.getTextGroup();
        if (!background || !text) return;

        scheduler.addAnimation(background.getElement(), {
            ...scheduler.getTween(this.style.backSlct, this.style.backExpl),
            duration: 300,
            easing: 'inOut',
        });
    }

    animateExitParentEdge(scheduler: AnimationScheduler, node: BTreeNode) {
        if (node.parentDrawableEdge.length <= 0 || !node.parentEdge) return;
        scheduler.addAnimation(node.parentDrawableEdge, {
            draw: '0 0',
            ease: 'inOutQuad',
            duration: 500,
        });
        scheduler.addAnimation(
            node.parentEdge.getElement(),
            {
                ...scheduler.getTween(this.style.edgeSlct, this.style.edgeExpl),
                duration: 300,
                easing: 'inOut',
            },
            '<-=200',
        );
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
    parentDrawableEdge: DrawableSVGGeometry[] = [];
    sepScale: number = 1.0;

    constructor(scene: S2Scene, data: number = 0) {
        this.data = data;
        this.s2Node = scene.addNode();
        this.s2Node.setTextAlign('center').setTextVerticalAlign('middle');
        this.s2Node.setLineHeight(20, 16);
        this.s2Node.setMinExtents(0.5, 0, 'world').setPadding(0, 0, 'world');
        this.s2Node.addLine().addContent(data.toString());
        this.s2Node.createCircleBackground();
        //this.s2Node.setMinExtents(0, 0).setPadding(0, 0).createRectBackground();
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

const animScheduler = new AnimationScheduler();

class SceneFigure extends S2Scene {
    public tree: BTree;

    constructor(svgElement: SVGSVGElement, userTree: UserTreeNode<number>) {
        super(svgElement, camera);

        // Background
        this.addRect()
            .setPosition(0, 0, 'view')
            .setExtents(viewport.x / 2, viewport.y / 2, 'view')
            .setAnchor('north west')
            .setAttribute('fill', MTL.GREY_8);

        // Grid
        //this.addGrid().setExtents(8, 5).setSteps(1, 1).setStrokeWidth(2, 'view').setAttribute('stroke', MTL.GREY_7);

        // Tree
        this.tree = new BTree(this, new BTreeStyle(), userTree);
        this.tree.computeLayout(new Vector2(0, 0));
        this.tree.update();

        this.update();
    }

    createInOrderAnimation(scheduler: AnimationScheduler, node: BTreeNode | null) {
        if (!node) return;
        // Select
        this.tree.animateSelectNode(scheduler, node);
        scheduler.addStep();
        // Left
        this.createInOrderAnimation(scheduler, node.left);
        // Explore
        this.tree.animateExploreNode(scheduler, node);
        scheduler.addStep();
        // Right
        this.createInOrderAnimation(scheduler, node.right);
        // Quit
        this.tree.animateExitParentEdge(scheduler, node);
        scheduler.addStep();
    }

    createPreOrderAnimation(scheduler: AnimationScheduler, node: BTreeNode | null) {
        if (!node) return;
        // Select
        this.tree.animateSelectNode(scheduler, node);
        scheduler.addStep();
        // Explore
        this.tree.animateExploreNode(scheduler, node);
        scheduler.addStep();
        // Left
        this.createPreOrderAnimation(scheduler, node.left);
        // Right
        this.createPreOrderAnimation(scheduler, node.right);
        // Quit
        this.tree.animateExitParentEdge(scheduler, node);
        scheduler.addStep();
    }

    createPostOrderAnimation(scheduler: AnimationScheduler, node: BTreeNode | null) {
        if (!node) return;
        // Select
        this.tree.animateSelectNode(scheduler, node);
        scheduler.addStep();
        // Left
        this.createPostOrderAnimation(scheduler, node.left);
        // Right
        this.createPostOrderAnimation(scheduler, node.right);
        // Explore
        this.tree.animateExploreNode(scheduler, node);
        scheduler.addStep();
        // Quit
        this.tree.animateExitParentEdge(scheduler, node);
        scheduler.addStep();
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
            <h1>My first SVG</h1>
            <svg xmlns="http://www.w3.org/2000/svg" id=test-svg></svg>
            <div>Zoom : <input type="range" id="slider-zoom" min="1" max="20" value="10"></div>
            <div>
                <button id="reverse-button">Retour</button>
                <button id="animate-button">Avancer</button>
                <button id="timeline-button">Full</button>
            </div>
        </div>
    `;
}
const svgElement = appDiv?.querySelector<SVGSVGElement>('#test-svg');
const sliderZoom = document.querySelector<HTMLInputElement>('#slider-zoom');

if (svgElement && sliderZoom) {
    const userTree = {
        data: 0,
        sepScale: 3,
        left: {
            data: 1,
            left: { data: 3, right: { data: 7 } },
            right: { data: 4, left: { data: 8 } },
        },
        right: {
            data: 2,
            sepScale: 2,
            left: { data: 5, left: { data: 9 }, right: { data: 10 } },
            right: { data: 6, left: { data: 11 } },
        },
    };
    const scene = new SceneFigure(svgElement, userTree);
    scene.createInOrderAnimation(animScheduler, scene.tree.root);
    //scene.createPreOrderAnimation(animScheduler, scene.tree.root);
    //scene.createPostOrderAnimation(animScheduler, scene.tree.root);
    //void scene;

    sliderZoom?.addEventListener('input', () => {
        camera.viewScale = sliderZoom.valueAsNumber / 10;
        scene.updateCamera();
    });
}

document.querySelector<HTMLButtonElement>('#animate-button')?.addEventListener('click', () => {
    animScheduler.playForward();
});
document.querySelector<HTMLButtonElement>('#reverse-button')?.addEventListener('click', () => {
    animScheduler.playBackward();
});
document.querySelector<HTMLButtonElement>('#timeline-button')?.addEventListener('click', () => {
    animScheduler.playFullTimeline();
});
