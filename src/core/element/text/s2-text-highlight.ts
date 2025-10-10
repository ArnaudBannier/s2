import { ease } from '../../animation/s2-easing';
import { S2LerpAnimFactory } from '../../animation/s2-lerp-anim';
import type { S2StepAnimator } from '../../animation/s2-step-animator';
import { S2AABB } from '../../math/s2-aabb';
import type { S2BaseScene } from '../../scene/s2-base-scene';
import type { S2Space } from '../../shared/s2-base-type';
import { S2Extents } from '../../shared/s2-extents';
import type { S2Dirtyable } from '../../shared/s2-globals';
import { S2Length } from '../../shared/s2-length';
import { S2Number } from '../../shared/s2-number';
import { S2ElementData, S2FillData, S2StrokeData } from '../base/s2-base-data';
import { S2Element } from '../base/s2-element';
import { S2Rect } from '../s2-rect';
import type { S2TSpan } from './s2-tspan';

export class S2TextHighlightData extends S2ElementData {
    public readonly fill: S2FillData;
    public readonly stroke: S2StrokeData;
    public readonly opacity: S2Number;
    public readonly cornerRadius: S2Length;
    public readonly padding: S2Extents;

    constructor() {
        super();
        this.fill = new S2FillData();
        this.stroke = new S2StrokeData();
        this.opacity = new S2Number(1);
        this.cornerRadius = new S2Length(5, 'view');
        this.padding = new S2Extents(4, 2, 'view');
        this.stroke.opacity.set(1);
        this.fill.opacity.set(1);
    }

    setOwner(owner: S2Dirtyable | null = null): void {
        this.fill.setOwner(owner);
        this.stroke.setOwner(owner);
        this.opacity.setOwner(owner);
        this.cornerRadius.setOwner(owner);
        this.padding.setOwner(owner);
    }

    clearDirty(): void {
        super.clearDirty();
        this.fill.clearDirty();
        this.stroke.clearDirty();
        this.opacity.clearDirty();
        this.cornerRadius.clearDirty();
        this.padding.clearDirty();
    }
}

export class S2TextHighlight extends S2Element<S2TextHighlightData> {
    protected rect: S2Rect;
    protected references: S2TSpan[];

    constructor(scene: S2BaseScene) {
        super(scene, new S2TextHighlightData());
        this.rect = new S2Rect(scene);
        this.references = [];

        this.rect.getSVGElement().role = 'text-highlight';
    }

    addReference(text: S2TSpan): this {
        this.references.push(text);
        this.markDirty();
        return this;
    }

    addReferences(...texts: S2TSpan[]): this {
        this.references.push(...texts);
        this.markDirty();
        return this;
    }

    clearReferences(): this {
        this.references = [];
        return this;
    }

    getSVGElement(): SVGElement {
        return this.rect.getSVGElement();
    }

    animateFadeIn(
        animator: S2StepAnimator,
        options: { label?: string; offset?: number; duration?: number } = {},
    ): this {
        const label = animator.ensureLabel(options.label);
        const offset = options.offset ?? 0;
        const duration = options.duration ?? 500;
        this.data.opacity.set(0.0);
        const opacityAnim = S2LerpAnimFactory.create(this.scene, this.data.opacity)
            .setCycleDuration(duration)
            .setEasing(ease.inOut);
        this.data.opacity.set(1.0);
        opacityAnim.commitFinalState();
        animator.addAnimation(opacityAnim, label, offset);
        animator.enableElement(this, true, label, offset);
        return this;
    }

    animateFadeOut(
        animator: S2StepAnimator,
        options: { label?: string; offset?: number; duration?: number } = {},
    ): this {
        const label = animator.ensureLabel(options.label);
        const offset = options.offset ?? 0;
        const duration = options.duration ?? 500;
        this.data.opacity.set(1.0);
        const opacityAnim = S2LerpAnimFactory.create(this.scene, this.data.opacity)
            .setCycleDuration(duration)
            .setEasing(ease.inOut);
        this.data.opacity.set(0.0);
        opacityAnim.commitFinalState();
        animator.addAnimation(opacityAnim, label, offset);
        animator.enableElement(this, false, label, offset + duration);
        return this;
    }

    update(): void {
        if (!this.isDirty()) return;
        if (this.references.length === 0) return;

        const camera = this.scene.getActiveCamera();
        const space: S2Space = 'view';

        const aabb = new S2AABB().setEmpty();
        for (const ref of this.references) {
            aabb.expandToInclude(ref.getLower(space));
            aabb.expandToInclude(ref.getUpper(space));
        }
        const extents = aabb.getExtents();
        const position = aabb.getCenter();

        const padding = this.data.padding.toSpace(space, camera);
        this.rect.data.position.setV(position, space);
        this.rect.data.extents.set(extents.x + padding.x, extents.y + padding.y, space);
        this.rect.data.anchor.set('center');
        this.rect.data.fill.copyIfUnlocked(this.data.fill);
        this.rect.data.stroke.copyIfUnlocked(this.data.stroke);
        this.rect.data.opacity.copyIfUnlocked(this.data.opacity);
        this.rect.data.cornerRadius.copyIfUnlocked(this.data.cornerRadius);
        this.rect.update();

        this.clearDirty();
    }
}
