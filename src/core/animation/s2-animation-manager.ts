import { S2Timer } from './s2-timer';
import type { S2BaseScene } from '../scene/s2-base-scene';
import type { S2Playable } from './s2-playable';

export class S2AnimationManager {
    protected static _instance: S2AnimationManager | null = null;
    protected timer: S2Timer;
    protected activeAnimations: Set<S2Playable> = new Set();
    protected sceneToUpdate: Set<S2BaseScene> = new Set();

    private constructor() {
        this.timer = new S2Timer();
    }

    static getInstance(): S2AnimationManager {
        if (!S2AnimationManager._instance) {
            const animManager = new S2AnimationManager();
            requestAnimationFrame(animManager.onFirstFrame);
            requestAnimationFrame(animManager.onUpdate);
            S2AnimationManager._instance = animManager;
        }

        return S2AnimationManager._instance;
    }

    static addAnimation(animation: S2Playable): void {
        S2AnimationManager.getInstance().activeAnimations.add(animation);
    }

    static removeAnimation(animation: S2Playable): void {
        S2AnimationManager.getInstance().activeAnimations.delete(animation);
    }

    static requestUpdate(scene: S2BaseScene): void {
        S2AnimationManager.getInstance().sceneToUpdate.add(scene);
    }

    addAnimation(animation: S2Playable): this {
        this.activeAnimations.add(animation);
        return this;
    }

    removeAnimation(animation: S2Playable): this {
        this.activeAnimations.delete(animation);
        return this;
    }

    wakeUp(): this {
        requestAnimationFrame(this.onUpdate);
        return this;
    }

    private onFirstFrame = (timestamp: number): void => {
        this.timer.start(timestamp);
    };

    private onUpdate = (timestamp: number): void => {
        this.timer.update(timestamp);
        const delta = this.timer.getDelta();

        for (const anim of this.activeAnimations) {
            anim.update(delta);
        }

        for (const scene of this.sceneToUpdate) {
            scene.update();
        }

        this.sceneToUpdate.clear();
        requestAnimationFrame(this.onUpdate);
    };
}
