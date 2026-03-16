import { S2Timer } from './s2-timer';
import type { S2BaseScene } from '../scene/s2-base-scene';
import type { S2Playable } from './s2-playable';

export class S2AnimationManager {
    protected static _instance: S2AnimationManager | null = null;
    protected timer: S2Timer;
    protected activeAnimations: Set<S2Playable> = new Set();
    protected sceneToUpdate: Set<S2BaseScene> = new Set();
    protected isAwake: boolean = false;

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
        const instance = S2AnimationManager.getInstance();
        instance.activeAnimations.add(animation);
        instance.wakeUp();
    }

    static removeAnimation(animation: S2Playable): void {
        const instance = S2AnimationManager.getInstance();
        instance.activeAnimations.delete(animation);
    }

    static requestUpdate(scene: S2BaseScene): void {
        const instance = S2AnimationManager.getInstance();
        instance.sceneToUpdate.add(scene);
        instance.wakeUp();
    }

    addAnimation(animation: S2Playable): this {
        this.activeAnimations.add(animation);
        this.wakeUp();
        return this;
    }

    removeAnimation(animation: S2Playable): this {
        this.activeAnimations.delete(animation);
        return this;
    }

    wakeUp(): void {
        if (this.isAwake) return;
        this.isAwake = true;
        requestAnimationFrame(this.onUpdate);
    }

    private onFirstFrame = (timestamp: number): void => {
        this.timer.start(timestamp);
    };

    private onUpdate = (timestamp: number): void => {
        this.timer.update(timestamp);
        const delta = this.timer.getDelta();

        console.log(`Active animations: ${this.activeAnimations.size}, scenes to update: ${this.sceneToUpdate.size}`);

        for (const anim of this.activeAnimations) {
            anim.update(delta);
        }

        for (const scene of this.sceneToUpdate) {
            scene.update();
        }

        this.sceneToUpdate.clear();

        if (this.activeAnimations.size > 0) {
            requestAnimationFrame(this.onUpdate);
            this.isAwake = true;
        } else {
            this.isAwake = false;
        }
    };
}
