import type { S2Color } from './s2-color';

export class ColorScale {
    public colors: S2Color[] = [];

    getInto(color: S2Color, t: number): void {
        if (this.colors.length === 0) {
            color.setBlack();
            return;
        }
        const scaledT = t * (this.colors.length - 1);
        const index0 = Math.floor(scaledT);
        const index1 = Math.min(index0 + 1, this.colors.length - 1);
        const localT = scaledT - index0;
        color.lerp(this.colors[index0], this.colors[index1], localT);
    }
}
