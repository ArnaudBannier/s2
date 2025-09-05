import { S2Camera } from './math/s2-camera';
import { NewS2SVG } from './element/s2-svg';

export interface S2BaseScene {
    readonly svg: NewS2SVG;
    activeCamera: S2Camera;
    nextId: number;
    getNextElementId(): number;
    getNextUpdateId(): number;
}
