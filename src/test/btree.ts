import './style.css';
import { S2Vec2 } from '../core/math/s2-vec2.ts';
import { S2Camera } from '../core/math/s2-camera.ts';
import { MTL } from '../utils/mtl-colors.ts';
import { S2Scene } from '../core/s2-scene.ts';
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
import { S2RichText } from '../core/element/text/s2-rich-text.ts';
import type { S2Rect } from '../core/element/s2-rect.ts';
import { S2PlainText } from '../core/element/text/s2-plain-text.ts';
import { S2TypePriority } from '../core/s2-types.ts';

const viewport = new S2Vec2(720.0, 360.0).scale(1.5);
const camera = new S2Camera(new S2Vec2(0.0, 0.0), new S2Vec2(9.0, 4.5), viewport, 1.0);

const inOrderAlgorithm =
    '**kw:fonction** **fn:parcoursInfixe**(**var:n**: **type:Noeud**):\n' +
    '  **kw:si** **var:n**.**var:gauche** existe **kw:alors**\n' +
    '    **fn:parcoursInfixe**(**var:n**.**var:gauche**)\n' +
    '  **fn:traiter**(**var:n**)\n' +
    '  **kw:si** **var:n**.**var:droit** existe **kw:alors**\n' +
    '    **fn:parcoursInfixe**(**var:n**.**var:droit**)';

const preOrderAlgorithm =
    '**kw:fonction** **fn:parcoursPrefixe**(**var:n**: **type:Noeud**):\n' +
    '  **fn:traiter**(**var:n**)\n' +
    '  **kw:si** **var:n**.**var:gauche** existe **kw:alors**\n' +
    '    **fn:parcoursPrefixe**(**var:n**.**var:gauche**)\n' +
    '  **kw:si** **var:n**.**var:droit** existe **kw:alors**\n' +
    '    **fn:parcoursPrefixe**(**var:n**.**var:droit**)';

const postOrderAlgorithm =
    '**kw:fonction** **fn:parcoursSuffixe**(**var:n**: **type:Noeud**):\n' +
    '  **kw:si** **var:n**.**var:gauche** existe **kw:alors**\n' +
    '    **fn:parcoursSuffixe**(**var:n**.**var:gauche**)\n' +
    '  **kw:si** **var:n**.**var:droit** existe **kw:alors**\n' +
    '    **fn:parcoursSuffixe**(**var:n**.**var:droit**)\n' +
    '  **fn:traiter**(**var:n**)';

class BTreeStyle {
    public scene: S2Scene;
    public font: S2FontData;

    constructor(scene: S2Scene) {
        this.scene = scene;
        this.font = new S2FontData();
        this.font.family.set('monospace');
        this.font.size.set(20, 'view');
        this.font.relativeLineHeight.set(1.3);
    }

    setNodeDefault(node: S2PlainNode): void {
        const data = node.data;
        data.background.fill.color.copy(MTL.GREY_6);
        data.background.stroke.color.copy(MTL.GREY_4);
        data.background.stroke.width.set(4, 'view');
        data.text.fill.color.copy(MTL.WHITE);
        data.text.horizontalAlign.set('center');
        data.text.verticalAlign.set('middle');
        data.text.font.copy(this.font);
        data.text.font.weight.set(700);
        data.padding.set(0, 0, 'view');
        data.minExtents.set(0.4, 0.35, 'world');
        data.background.cornerRadius.set(10, 'view');
        data.layer.set(2);
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
            .setEdgeEndDistance(10, 'view')
            .setLayer(0);
    }

    setEdgeEmphasized(edge: S2LineEdge): void {
        S2DataSetter.setTargets(edge.data)
            .setStrokeColor(MTL.WHITE)
            .setStrokeWidth(5, 'view')
            .setStrokeLineCap('round')
            .setEdgeStartDistance(0, 'view')
            .setEdgeEndDistance(11, 'view')
            .setLayer(1);

        const arrowTip = edge.createArrowTip();
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
    protected mainGroup: S2Group<S2ElementData>;
    protected bTreeNodes: BTreeNode[];

    levelDistance: number = 1.5;
    baseSep: number = 0.6;
    height: number;
    size: number;

    protected center: S2Vec2;
    protected extents: S2Vec2;
    public maxNodeExtents: S2Vec2 = new S2Vec2();

    constructor(scene: S2Scene, userTree: UserTreeNode<number>, style: BTreeStyle = new BTreeStyle(scene)) {
        this.scene = scene;
        this.style = style;
        this.center = new S2Vec2();
        this.extents = new S2Vec2();
        this.bTreeNodes = [];
        this.mainGroup = scene.addGroup(new S2ElementData());

        this.height = 0;
        this.size = 0;
        this.root = this.createNodes(userTree);
        this.createNodeLines(this.root, null);

        //this.computeLayout(new S2Vec2(0, 0));
    }

    private createNodes(userTree: UserTreeNode<number>, depth: number = 0): BTreeNode {
        const bTreeNode = new BTreeNode(this.scene, userTree.data);
        this.height = Math.max(this.height, depth + 1);
        bTreeNode.node.setParent(this.mainGroup);
        this.style.setNodeDefault(bTreeNode.node);

        if (userTree.left) {
            const child = this.createNodes(userTree.left, depth + 1);
            bTreeNode.setLeft(child);
        }
        if (userTree.right) {
            const child = this.createNodes(userTree.right, depth + 1);
            bTreeNode.setRight(child);
        }
        this.size++;
        this.bTreeNodes.push(bTreeNode);
        return bTreeNode;
    }

    private createNodeLines(bTreeNode: BTreeNode | null, parent: BTreeNode | null) {
        if (bTreeNode === null) return;
        if (parent) {
            bTreeNode.parentEdge = this.scene.addLineEdge(parent.node, bTreeNode.node, this.mainGroup);
            bTreeNode.parentEmphEdge = this.scene.addLineEdge(parent.node, bTreeNode.node, this.mainGroup);

            this.style.setEdgeBase(bTreeNode.parentEdge);
            this.style.setEdgeEmphasized(bTreeNode.parentEmphEdge);
        }

        this.createNodeLines(bTreeNode.left, bTreeNode);
        this.createNodeLines(bTreeNode.right, bTreeNode);
    }

    getExtents(): S2Vec2 {
        return this.extents;
    }

    computeExtents(): S2Vec2 {
        this.extents.x = (this.size - 1) * this.baseSep;
        this.extents.y = (this.height - 1) * this.levelDistance;
        this.extents.scale(0.5);
        this.maxNodeExtents.set(0, 0);
        for (const bTreeNode of this.bTreeNodes) {
            const nodeExtents = bTreeNode.node.getExtents('world');
            this.maxNodeExtents.maxV(nodeExtents);
        }
        this.extents.addV(this.maxNodeExtents);
        return this.extents;
    }

    computeLayout(center: S2Vec2) {
        this.center.copy(center);
        this.computeExtents();
        this.computeLayoutRec(this.root, 0, 0);
    }

    private computeLayoutRec(bTreeNode: BTreeNode | null, index: number, depth: number): number {
        if (bTreeNode === null) return index;
        index = this.computeLayoutRec(bTreeNode.left, index, depth + 1);
        console.log('maxNodeExt', this.maxNodeExtents);
        bTreeNode.node.data.position.set(
            this.center.x - this.extents.x + this.maxNodeExtents.x + index * this.baseSep,
            this.center.y + this.extents.y - this.maxNodeExtents.y - depth * this.levelDistance,
            'world',
        );
        index++;
        index = this.computeLayoutRec(bTreeNode.right, index, depth + 1);
        return index;
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

        const anim = this.style.createExploreEdgeAnim(bTreeNode.parentEdge);
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
    protected codeNW: S2Vec2 = new S2Vec2(-8, 4);
    protected codePositions: S2Vec2[] = [];
    protected outputText: S2RichText;
    protected outputBackground: S2Rect;
    protected outputTitle: S2PlainText;

    setDefaultFont(data: S2FontData): void {
        data.family.set('monospace');
        data.size.set(16, 'view');
        data.relativeLineHeight.set(1.3);
    }

    setCodeStyle(code: S2Code): void {
        const font = new S2FontData();
        font.family.set('monospace');
        font.size.set(16, 'view');
        font.relativeLineHeight.set(1.3);

        this.setDefaultFont(code.data.text.font);
        code.data.text.fill.color.copy(MTL.WHITE);
        code.data.padding.set(20, 10, 'view');
        code.data.minExtents.set(3.5, 1, 'world');
        code.data.background.fill.color.copy(MTL.GREY_9);
        code.data.background.stroke.color.copy(MTL.GREY_7);
        code.data.background.stroke.width.set(2, 'view');
        code.data.background.cornerRadius.set(10, 'view');
        code.data.currentLine.opacity.set(1);
        code.data.currentLine.fill.color.copy(MTL.BLACK);
        code.data.currentLine.fill.opacity.set(0.5);
        code.data.currentLine.stroke.color.copy(MTL.WHITE);
        code.data.currentLine.stroke.width.set(1, 'view');
        code.data.currentLine.stroke.opacity.set(0.2);
        code.data.currentLine.padding.set(-0.5, 2, 'view');
        code.data.currentLine.index.set(0);
    }

    setOutputTextStyle(text: S2RichText): void {
        this.setDefaultFont(text.data.font);
        text.data.fill.color.copy(MTL.WHITE);
    }

    setOutputBackgroundStyle(rect: S2Rect): void {
        S2DataSetter.setTargets(rect.data)
            .setFillColor(MTL.GREY_9)
            .setStrokeColor(MTL.GREY_7)
            .setStrokeWidth(2, 'view')
            .setCornerRadius(10, 'view');
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
        // S2DataSetter.setTargets(grid.data).setStrokeColor(MTL.GREY_6);

        this.outputBackground = this.addRect();
        this.outputTitle = new S2PlainText(this);
        this.outputTitle.setParent(this.getSVG());
        this.outputTitle.setContent('Noeuds explorés :');
        this.outputTitle.data.fill.color.copy(MTL.ORANGE_2);
        this.setDefaultFont(this.outputTitle.data.font);
        this.outputText = new S2RichText(this);
        this.outputText.setParent(this.getSVG());

        this.setOutputTextStyle(this.outputText);
        this.setOutputBackgroundStyle(this.outputBackground);
        this.update();

        // Tree
        this.tree = new BTree(this, userTree);

        let algorithm = '';
        switch (order) {
            case 'in-order':
                algorithm = inOrderAlgorithm;
                break;
            case 'pre-order':
                algorithm = preOrderAlgorithm;
                break;
            case 'post-order':
                algorithm = postOrderAlgorithm;
                break;
        }

        for (let i = 0; i < this.tree.height; i++) {
            const code = new S2Code(this);
            code.setParent(this.getSVG());
            this.codeStack.push(code);

            this.setCodeStyle(code);
            code.setContent(tokenizeAlgorithm(algorithm));
            code.data.anchor.set('north-west');
        }
        this.update();
        this.tree.computeExtents();

        const treeExtents = this.tree.getExtents();
        const codeExtents = this.codeStack[0].getExtents('world');
        const width = 2 * treeExtents.x + 2 * codeExtents.x + 1.5;
        const height = 2 * Math.max(treeExtents.y, codeExtents.y);
        const treeCenter = new S2Vec2(width / 2 - treeExtents.x, 0);
        const codeNW = new S2Vec2(-width / 2, height / 2);

        this.tree.computeLayout(treeCenter);
        for (let i = 0; i < this.codeStack.length; i++) {
            const position = new S2Vec2(codeNW.x + 0.2 * i, codeNW.y - 0.2 * i);
            this.codePositions.push(position);
            const code = this.codeStack[i];
            code.data.position.setV(position, 'world');
        }

        const outputPadding = this.getActiveCamera().viewToWorldLength(20);
        const fontHeight = this.getActiveCamera().viewToWorldLength(21);
        const fontAscender = this.getActiveCamera().viewToWorldLength(16);
        const outputHeight = 2 * fontHeight + 1 * outputPadding;
        const outputNW = new S2Vec2(codeNW.x, -codeNW.y + outputHeight);
        this.outputBackground.data.position.setV(outputNW, 'world');
        this.outputBackground.data.extents.set(3.5, outputHeight / 2, 'world');
        this.outputBackground.data.anchor.set('north-west');
        this.outputTitle.data.position.set(
            outputNW.x + outputPadding,
            outputNW.y - fontAscender - 0.5 * outputPadding,
            'world',
        );
        this.outputText.data.position.set(
            outputNW.x + outputPadding,
            outputNW.y - fontAscender - fontHeight - 0.5 * outputPadding,
            'world',
        );
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
        this.update();
    }

    animateCodeFadeIn(depth: number) {
        if (depth < 0 || depth >= this.codeStack.length) return;
        const code = this.codeStack[depth];
        code.data.currentLine.index.set(0);

        if (depth === 0) return;

        const position = this.codePositions[depth];
        code.data.currentLine.index.set(0);
        code.data.opacity.set(0);
        code.data.position.set(position.x + 0.5, position.y, 'world');

        const animPos = S2LerpAnimFactory.create(this, code.data.position);
        const animOpacity = S2LerpAnimFactory.create(this, code.data.opacity);
        const animIndex = S2LerpAnimFactory.create(this, code.data.currentLine.index);

        code.data.currentLine.index.set(0);
        code.data.opacity.set(1);
        code.data.position.setV(position, 'world');

        for (const anim of [animPos, animOpacity, animIndex]) {
            anim.setCycleDuration(500).setEasing(ease.out).commitFinalState();
        }

        this.animator.addAnimation(animPos, 'previous-end', 0);
        this.animator.addAnimation(animOpacity, 'previous-start', 0);
        this.animator.addAnimation(animIndex, 'previous-start', 0);
    }

    animateCodeFadeOut(depth: number) {
        if (depth < 0 || depth >= this.codeStack.length) return;
        const code = this.codeStack[depth];
        code.data.currentLine.index.set(0);

        if (depth === 0) return;

        const animPos = S2LerpAnimFactory.create(this, code.data.position);
        const animOpacity = S2LerpAnimFactory.create(this, code.data.opacity);

        const position = this.codePositions[depth];
        code.data.opacity.set(0);
        code.data.position.set(position.x + 0.5, position.y, 'world');

        for (const anim of [animPos, animOpacity]) {
            anim.setCycleDuration(500).setEasing(ease.out).commitFinalState();
        }

        this.animator.addAnimation(animPos, 'previous-end', 0);
        this.animator.addAnimation(animOpacity, 'previous-start', 0);
    }

    animateCodeLineIndex(depth: number, lineIndex: number) {
        if (depth < 0 || depth >= this.codeStack.length) return;
        const code = this.codeStack[depth];

        const lerpAnim = S2LerpAnimFactory.create(this, code.data.currentLine.index)
            .setCycleDuration(500)
            .setEasing(ease.inOut);
        code.data.currentLine.index.set(lineIndex);
        this.animator.addAnimation(lerpAnim.commitFinalState(), 'previous-end', 0);
    }

    animateWriteOutput(text: string) {
        if (this.outputText.getTSpanCount() > 0) {
            const lastTSpan = this.outputText.getTSpan(this.outputText.getTSpanCount() - 1);
            const anim = S2LerpAnimFactory.create(this, lastTSpan.data.fill.color)
                .setCycleDuration(500)
                .setEasing(ease.inOut);
            lastTSpan.data.fill.color.hardCopy(MTL.GREY_4);
            this.animator.addAnimation(anim.commitFinalState(), 'previous-start', 0);
        }

        const tspan = this.outputText.addTSpan(text);
        tspan.data.opacity.set(0);
        tspan.data.fill.color.hardCopy(MTL.WHITE);
        tspan.data.fill.color.setPriority(S2TypePriority.Important);

        const lerpAnim = S2LerpAnimFactory.create(this, tspan.data.opacity).setCycleDuration(500).setEasing(ease.inOut);
        tspan.data.opacity.set(1);
        this.animator.addAnimation(lerpAnim.commitFinalState(), 'previous-start', 200);
    }

    createInOrderAnimation(bTreeNode: BTreeNode | null, depth: number = 0) {
        if (!bTreeNode) return;

        // Select
        this.tree.animateSelectNode(this.animator, bTreeNode);
        this.animateCodeFadeIn(depth);
        this.animator.makeStep();

        // Left
        this.animateCodeLineIndex(depth, 1);
        this.animator.makeStep();

        if (bTreeNode.left) {
            this.animateCodeLineIndex(depth, 2);
            this.animator.makeStep();

            this.createInOrderAnimation(bTreeNode.left, depth + 1);
        }

        // Explore
        this.animateCodeLineIndex(depth, 3);
        this.animator.makeStep();
        this.tree.animateExploreNode(this.animator, bTreeNode);
        this.animateWriteOutput(bTreeNode.data.toString() + ', ');
        this.animator.makeStep();

        // Right
        this.animateCodeLineIndex(depth, 4);
        this.animator.makeStep();
        if (bTreeNode.right) {
            this.animateCodeLineIndex(depth, 5);
            this.animator.makeStep();

            this.createInOrderAnimation(bTreeNode.right, depth + 1);
        }

        // Quit
        this.tree.animateExitParentEdge(this.animator, bTreeNode);
        this.animateCodeFadeOut(depth);
        this.animator.makeStep();
    }

    createPreOrderAnimation(bTreeNode: BTreeNode | null, depth: number = 0) {
        if (!bTreeNode) return;

        // Select
        this.tree.animateSelectNode(this.animator, bTreeNode);
        this.animateCodeFadeIn(depth);
        this.animator.makeStep();
        this.animator.makeStep();

        // Explore
        this.animateCodeLineIndex(depth, 1);
        this.animator.makeStep();
        this.tree.animateExploreNode(this.animator, bTreeNode);
        this.animateWriteOutput(bTreeNode.data.toString() + ', ');
        this.animator.makeStep();

        // Left
        this.animateCodeLineIndex(depth, 2);
        this.animator.makeStep();

        if (bTreeNode.left) {
            this.animateCodeLineIndex(depth, 3);
            this.animator.makeStep();

            this.createPreOrderAnimation(bTreeNode.left, depth + 1);
        }

        // Right
        this.animateCodeLineIndex(depth, 4);
        this.animator.makeStep();
        if (bTreeNode.right) {
            this.animateCodeLineIndex(depth, 5);
            this.animator.makeStep();

            this.createPreOrderAnimation(bTreeNode.right, depth + 1);
        }

        // Quit
        this.tree.animateExitParentEdge(this.animator, bTreeNode);
        this.animateCodeFadeOut(depth);
        this.animator.makeStep();
    }

    createPostOrderAnimation(bTreeNode: BTreeNode | null, depth: number = 0) {
        if (!bTreeNode) return;

        // Select
        this.tree.animateSelectNode(this.animator, bTreeNode);
        this.animateCodeFadeIn(depth);
        this.animator.makeStep();
        this.animator.makeStep();

        // Left
        this.animateCodeLineIndex(depth, 1);
        this.animator.makeStep();

        if (bTreeNode.left) {
            this.animateCodeLineIndex(depth, 2);
            this.animator.makeStep();

            this.createPostOrderAnimation(bTreeNode.left, depth + 1);
        }

        // Right
        this.animateCodeLineIndex(depth, 3);
        this.animator.makeStep();
        if (bTreeNode.right) {
            this.animateCodeLineIndex(depth, 4);
            this.animator.makeStep();

            this.createPostOrderAnimation(bTreeNode.right, depth + 1);
        }

        // Explore
        this.animateCodeLineIndex(depth, 5);
        this.animator.makeStep();
        this.tree.animateExploreNode(this.animator, bTreeNode);
        this.animateWriteOutput(bTreeNode.data.toString() + ', ');
        this.animator.makeStep();

        // Quit
        this.tree.animateExitParentEdge(this.animator, bTreeNode);
        this.animateCodeFadeOut(depth);
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
        slider.value = '0';
    });
    document.querySelector<HTMLButtonElement>('#prev-button')?.addEventListener('click', () => {
        index = S2MathUtils.clamp(index - 1, 0, scene.animator.getStepCount() - 1);
        scene.animator.resetStep(index);
        scene.update();
        const stepStart = scene.animator.getStepStartTime(index);
        const ratio = stepStart / scene.animator.getMasterDuration();
        slider.value = (ratio * 100).toString();
        //scene.animator.playStep(index);
    });
    document.querySelector<HTMLButtonElement>('#next-button')?.addEventListener('click', () => {
        index = S2MathUtils.clamp(index + 1, 0, scene.animator.getStepCount() - 1);
        scene.animator.playStep(index);
        const stepStart = scene.animator.getStepStartTime(index);
        const ratio = stepStart / scene.animator.getMasterDuration();
        slider.value = (ratio * 100).toString();
    });
    document.querySelector<HTMLButtonElement>('#play-button')?.addEventListener('click', () => {
        scene.animator.playStep(index);
    });
    document.querySelector<HTMLButtonElement>('#full-button')?.addEventListener('click', () => {
        scene.animator.playMaster();
        slider.value = '0';
    });

    slider.addEventListener('input', () => {
        const ratio = slider.valueAsNumber / 100;
        const elapsed = ratio * scene.animator.getMasterDuration();
        scene.animator.stop();
        scene.animator.setMasterElapsed(elapsed);
        index = scene.animator.getStepIndexFromElapsed(elapsed);
        scene.getSVG().update();
    });

    const selectElement = document.getElementById('order-select') as HTMLSelectElement;

    selectElement.addEventListener('change', (event) => {
        const target = event.target as HTMLSelectElement;
        scene.animator.stop();
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
        index = -1;
        scene.animator.stop();
        scene.animator.reset();
    });
}
