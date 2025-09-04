import { S2Timer } from './s2-timer';
import { S2AnimationNEW } from './s2-animation';

// export class S2AnimationManager {
//     protected static _instance: S2AnimationManager | null = null;
//     protected timer: S2Timer;
//     protected animStates: S2AnimState[] = [];

//     private constructor() {
//         this.timer = new S2Timer();
//     }

//     private firstFrame(timestamp: number): void {
//         this.timer.start(timestamp);
//     }

//     static getInstance(): S2AnimationManager {
//         if (!S2AnimationManager._instance) {
//             const animManager = new S2AnimationManager();
//             console.log(animManager.timer);
//             requestAnimationFrame(animManager.firstFrame.bind(animManager));
//             requestAnimationFrame(animManager.update.bind(animManager));
//             S2AnimationManager._instance = animManager;
//         }

//         return S2AnimationManager._instance;
//     }

//     protected update(timestamp: number): void {
//         this.timer.update(timestamp);
//         const delta = this.timer.getDelta();

//         for (const anim of this.animations) {
//             anim.update(delta);
//         }
//         requestAnimationFrame(this.update.bind(this));
//     }

//     addAnimation(animation: S2AnimationNEW): this {
//         this.animStates.set(animation, new S2AnimState(animation));
//         return this;
//     }
// }
