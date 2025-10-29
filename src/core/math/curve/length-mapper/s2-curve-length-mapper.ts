export interface S2CurveLengthMapper {
    getLength(): number;
    getTFromLength(length: number): number;
    getTFromU(u: number): number;
    getUFromT(t: number): number;
    update(): void;
}
