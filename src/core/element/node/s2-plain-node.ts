import { ease } from '../../animation/s2-easing';
import { S2LerpAnimFactory } from '../../animation/s2-lerp-anim';
import type { S2StepAnimator } from '../../animation/s2-step-animator';
import { S2Vec2 } from '../../math/s2-vec2';
import type { S2BaseScene } from '../../scene/s2-base-scene';
import { S2Number } from '../../shared/s2-number';
import { S2Offset } from '../../shared/s2-offset';
import { S2PlainText } from '../text/s2-plain-text';
import { S2BaseNode } from './s2-base-node';

class S2PlainNodeState {
    public readonly text: S2PlainText;
    public readonly offset: S2Offset;
    public readonly opacity: S2Number;

    constructor(scene: S2BaseScene) {
        this.text = new S2PlainText(scene);
        this.offset = new S2Offset(0, 0, scene.getViewSpace());
        this.opacity = new S2Number(1);
    }
}

export class S2PlainNode extends S2BaseNode {
    protected readonly states: S2PlainNodeState[] = [];
    protected stateIndex: number = -1;

    constructor(scene: S2BaseScene) {
        super(scene);
        this.element.dataset.role = 'plain-node';
    }

    getStateCount(): number {
        return this.states.length;
    }

    getState(index: number): S2PlainText {
        return this.states[index].text;
    }

    addState(value: string): number {
        const content = new S2PlainNodeState(this.scene);
        content.offset.setOwner(this);
        content.opacity.setOwner(this);

        content.text.setParent(this);
        content.text.setContent(value);
        content.text.data.layer.set(2);
        content.text.data.position.copyIfUnlocked(this.center);
        content.text.data.font.copyIfUnlocked(this.data.text.font);
        content.text.data.fill.color.copyIfUnlocked(this.data.text.fill.color);
        content.text.data.fill.opacity.copyIfUnlocked(this.data.text.fill.opacity);

        const index = this.states.length;
        this.states.push(content);

        if (this.stateIndex === -1) {
            this.stateIndex = index;
        }
        this.markDirty();
        return index;
    }

    animateChangeState(
        index: number,
        animator: S2StepAnimator,
        options: { label?: string; timeOffset?: number; duration?: number; positionOffset?: S2Offset } = {},
    ): void {
        const label = animator.ensureLabel(options.label);
        const timeOffset = options.timeOffset ?? 0;
        const duration = options.duration ?? 500;

        let delay = 0;
        if (this.stateIndex >= 0 && this.stateIndex < this.states.length) {
            this.animateFadeOut(this.stateIndex, animator, new S2Vec2(10, 0), label, duration, timeOffset);
            delay = 0.5 * duration;
        }

        if (index >= 0 && index < this.states.length) {
            this.animateFadeIn(index, animator, new S2Vec2(-10, 0), label, duration, timeOffset + delay);
        }
        this.stateIndex = index;
    }

    protected animateFadeIn(
        index: number,
        animator: S2StepAnimator,
        shift: S2Vec2,
        label: string,
        duration: number,
        timeOffset: number,
    ): void {
        const content = this.states[index];
        content.opacity.set(0.0);
        const opacityAnim = S2LerpAnimFactory.create(this.scene, content.opacity)
            .setCycleDuration(duration)
            .setEasing(ease.out);
        content.opacity.set(1.0);
        opacityAnim.commitFinalState();

        animator.enableElement(content.text, true, label, timeOffset);
        animator.addAnimation(opacityAnim, label, timeOffset);

        if (S2Vec2.isZeroV(shift) === false) {
            content.offset.setV(shift, this.scene.getViewSpace());
            const shiftAnim = S2LerpAnimFactory.create(this.scene, content.offset)
                .setCycleDuration(duration)
                .setEasing(ease.inOut);
            content.offset.set(0, 0, this.scene.getViewSpace());
            shiftAnim.commitFinalState();
            animator.addAnimation(shiftAnim, label, timeOffset);
        }
    }

    protected animateFadeOut(
        index: number,
        animator: S2StepAnimator,
        shift: S2Vec2,
        label: string,
        duration: number,
        timeOffset: number,
    ): void {
        const content = this.states[index];
        content.opacity.set(1.0);
        const opacityAnim = S2LerpAnimFactory.create(this.scene, content.opacity)
            .setCycleDuration(duration)
            .setEasing(ease.out);
        content.opacity.set(0.0);
        opacityAnim.commitFinalState();
        animator.addAnimation(opacityAnim, label, timeOffset);
        if (S2Vec2.isZeroV(shift) === false) {
            content.offset.set(0, 0, this.scene.getViewSpace());
            const shiftAnim = S2LerpAnimFactory.create(this.scene, content.offset)
                .setCycleDuration(duration)
                .setEasing(ease.inOut);
            content.offset.setV(shift, this.scene.getViewSpace());
            shiftAnim.commitFinalState();
            animator.addAnimation(shiftAnim, label, timeOffset);
        }
        animator.enableElement(content.text, false, label, timeOffset + duration);
    }

    update(): void {
        if (this.skipUpdate()) return;

        this.updateSVGChildren();
        const space = this.data.space.get();

        // Update text styles (for correct measurement)
        for (const content of this.states) {
            const opacity = content.opacity.get() * this.data.text.opacity.get();
            content.text.data.opacity.set(opacity);
            content.text.data.font.copyIfUnlocked(this.data.text.font);
            content.text.data.fill.copyIfUnlocked(this.data.text.fill);
            content.text.data.stroke.copyIfUnlocked(this.data.text.stroke);

            content.text.update();
        }

        // Update extents
        this.extents.space = space;
        const nodeExtents = this.extents.value;
        const currTextExtents = this.scene.acquireVec2();
        const textExtents = this.scene.acquireVec2();
        const nodePadding = this.scene.acquireVec2();
        const contentExtents = this.scene.acquireVec2();

        textExtents.set(0, 0);
        for (const content of this.states) {
            content.text.getExtentsInto(currTextExtents, space);
            textExtents.maxV(currTextExtents);
        }
        this.data.padding.getInto(nodePadding, space);
        this.data.minExtents.getInto(nodeExtents, space);
        nodeExtents.max(textExtents.x + nodePadding.x, textExtents.y + nodePadding.y);
        contentExtents.copy(nodeExtents).subV(nodePadding);

        // Update center and SDF
        this.center.space = space;
        const nodeCenter = this.center.value;
        this.data.position.getInto(nodeCenter, space);
        this.data.anchor.getCenterIntoV(nodeCenter, nodeCenter, nodeExtents);
        this.defaultSDF.update(nodeCenter, Math.max(nodeExtents.x, nodeExtents.y));

        // Update text position
        const sign = space.isDirectSpace() ? 1 : -1;
        const font = this.data.text.font;
        const ascenderHeight = font.relativeAscenderHeight.get() * font.size.get(space);
        const vAlign = sign * this.data.text.verticalAlign.get();
        const hAlign = this.data.text.horizontalAlign.get();

        const textPosition = this.scene.acquireVec2();
        const textOffset = this.scene.acquireVec2();
        textPosition.set(
            nodeCenter.x + hAlign * (contentExtents.x - textExtents.x),
            nodeCenter.y + vAlign * (contentExtents.y - textExtents.y) - (sign * ascenderHeight) / 2,
        );
        for (const content of this.states) {
            content.offset.getInto(textOffset, space);
            content.text.data.textAnchor.set(0);
            content.text.data.position.set(textPosition.x + textOffset.x, textPosition.y + textOffset.y, space);
            content.text.update();
        }

        this.scene.releaseVec2(textExtents);
        this.scene.releaseVec2(nodePadding);
        this.scene.releaseVec2(contentExtents);
        this.scene.releaseVec2(currTextExtents);
        this.scene.releaseVec2(textPosition);
        this.scene.releaseVec2(textOffset);
        this.updateBackground();
        this.updateEdges();
        this.clearDirty();
    }
}
