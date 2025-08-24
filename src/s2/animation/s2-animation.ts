import { type S2BaseElement } from '../element/s2-element';
import { S2OldAttributes, type S2BaseScene } from '../s2-interface';
import { lerp } from '../../math/utils';
import { S2Position, S2Length } from '../math/s2-space';
import { S2Color } from '../s2-globals';

export abstract class S2Animation {
    protected scene: S2BaseScene;
    constructor(scene: S2BaseScene) {
        this.scene = scene;
    }
    abstract update(t: number): void;
}

export class S2ElementAnim extends S2Animation {
    target: S2BaseElement;
    targetParams: S2OldAttributes = new S2OldAttributes();

    position?: [S2Position, S2Position];
    pathFrom?: [number, number];
    pathTo?: [number, number];
    fillColor?: [S2Color, S2Color];
    fillOpacity?: [number, number];
    opacity?: [number, number];
    strokeColor?: [S2Color, S2Color];
    strokeWidth?: [S2Length, S2Length];

    constructor(scene: S2BaseScene, target: S2BaseElement, from: S2OldAttributes, to: S2OldAttributes) {
        super(scene);
        this.target = target;
        if (from.position && to.position) {
            this.position = [from.position.clone(), to.position.clone()];
        }
        if (from.strokeWidth && to.strokeWidth) {
            this.strokeWidth = [from.strokeWidth.clone(), to.strokeWidth.clone()];
        }
        if (from.pathFrom !== undefined && to.pathFrom !== undefined) {
            this.pathFrom = [from.pathFrom, to.pathFrom];
        }
        if (from.pathTo !== undefined && to.pathTo !== undefined) {
            this.pathTo = [from.pathTo, to.pathTo];
        }
        if (from.fillColor && to.fillColor) {
            this.fillColor = [from.fillColor.clone(), to.fillColor.clone()];
        }
        if (from.strokeColor && to.strokeColor) {
            this.strokeColor = [from.strokeColor.clone(), to.strokeColor.clone()];
        }
        if (from.fillOpacity !== undefined && to.fillOpacity !== undefined) {
            this.fillOpacity = [from.fillOpacity, to.fillOpacity];
        }
        if (from.opacity !== undefined && to.opacity !== undefined) {
            this.opacity = [from.opacity, to.opacity];
        }
    }

    update(t: number): void {
        if (this.position) {
            const from = this.position[0];
            const to = this.position[1];
            from.changeSpace(to.space, this.scene.activeCamera);
            this.targetParams.position = new S2Position(
                lerp(from.value.x, to.value.x, t),
                lerp(from.value.y, to.value.y, t),
                to.space,
            );
        }
        if (this.strokeWidth) {
            const from = this.strokeWidth[0];
            const to = this.strokeWidth[1];
            from.changeSpace(to.space, this.scene.activeCamera);
            this.targetParams.strokeWidth = new S2Length(lerp(from.value, to.value, t), to.space);
        }
        if (this.pathFrom) {
            this.targetParams.pathFrom = lerp(this.pathFrom[0], this.pathFrom[1], t);
        }
        if (this.pathTo) {
            this.targetParams.pathTo = lerp(this.pathTo[0], this.pathTo[1], t);
        }
        if (this.fillColor) {
            this.targetParams.fillColor = S2Color.lerp(this.fillColor[0], this.fillColor[1], t);
        }
        if (this.strokeColor) {
            this.targetParams.strokeColor = S2Color.lerp(this.strokeColor[0], this.strokeColor[1], t);
        }
        if (this.opacity) {
            this.targetParams.opacity = lerp(this.opacity[0], this.opacity[1], t);
        }
        if (this.fillOpacity) {
            this.targetParams.fillOpacity = lerp(this.fillOpacity[0], this.fillOpacity[1], t);
        }
        this.target.setParameters(this.targetParams).update();
    }
}
