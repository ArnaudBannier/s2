import { S2Camera } from './math/s2-camera';
import { S2SVG } from './element/s2-svg';

export interface S2BaseScene {
    readonly svg: S2SVG;
    getActiveCamera(): S2Camera;
    getNextElementId(): number;
    getNextUpdateId(): number;
}
