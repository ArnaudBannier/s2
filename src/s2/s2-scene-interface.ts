import { S2Camera } from './math/s2-camera';
import { S2SVG } from './element/s2-svg';

export interface S2SceneInterface {
    readonly svg: S2SVG;
    activeCamera: S2Camera;
}
