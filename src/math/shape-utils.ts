import { Vector2 } from './vector2';

export class ShapeUtils {
    /**
     * Renvoie les points d'intersection entre un rayon et un cercle.
     * @param rayOrigin - Le point de départ du rayon.
     * @param rayDir - Le vecteur direction du rayon.
     * @param center - Le centre du cercle.
     * @param radius - Le rayon du cercle.
     * @returns Tableau des points d'intersection (de taille 0, 1 ou 2).
     */
    intersectRayCircle(rayOrigin: Vector2, rayDir: Vector2, center: Vector2, radius: number): Vector2[] {
        const m = rayOrigin.clone().subV(center);
        const a = rayDir.dot(rayDir);
        const b = 2 * rayDir.dot(m);
        const c = m.dot(m) - radius * radius;

        const discriminant = b * b - 4 * a * c;
        if (discriminant < 0) {
            return [];
        }

        const sqrtDisc = Math.sqrt(discriminant);
        const t1 = (-b - sqrtDisc) / (2 * a);
        const t2 = (-b + sqrtDisc) / (2 * a);

        const points: Vector2[] = [];
        if (t1 >= 0) {
            points.push(rayDir.clone().scale(t1).addV(rayOrigin));
        }
        if (t2 >= 0 && t2 !== t1) {
            points.push(rayDir.clone().scale(t2).addV(rayOrigin));
        }

        return points;
    }

    /**
     * Renvoie les points d'intersection entre une direction (rayon centré à l'origine) et un cercle.
     * @param direction - Le vecteur direction.
     * @param center - Le centre du cercle.
     * @param radius - Le rayon du cercle.
     * @returns Le facteur à appliquer au vecteur direction pour obtenir le point d'intersection le plus éloigné,
     * ou -1 s'il n'y a pas d'intersection.
     */
    static intersectDirectionCircle(direction: Vector2, center: Vector2, radius: number): number {
        const a = direction.dot(direction);
        const b = -2 * direction.dot(center);
        const c = center.dot(center) - radius * radius;

        const discriminant = b * b - 4 * a * c;
        if (discriminant < 0) {
            return -1;
        }

        const sqrtDisc = Math.sqrt(discriminant);
        const t1 = (-b - sqrtDisc) / (2 * a);
        const t2 = (-b + sqrtDisc) / (2 * a);

        return Math.max(t1, t2);
    }

    /**
     * Renvoie le point d'intersection entre une direction et rectangle arrondi centré à l'origine.
     * @param direction - Le vecteur direction.
     * @param rectExtents - L'étendue du rectangle.
     * @param radius - Le rayon du rectangle.
     * @returns Le point d'intersection.
     */
    static intersectDirectionRoundedRectangle(direction: Vector2, rectExtents: Vector2, radius: number): Vector2 {
        const sideBoundX = rectExtents.x - radius + 1e-5;
        const sideBoundY = rectExtents.y - radius + 1e-5;
        if (direction.x > 0) {
            const inter = direction.clone().scale(+rectExtents.x / direction.x);
            if (Math.abs(inter.y) <= sideBoundY) return inter;
        }
        if (direction.x < 0) {
            const inter = direction.clone().scale(-rectExtents.x / direction.x);
            if (Math.abs(inter.y) <= sideBoundY) return inter;
        }
        if (direction.y > 0) {
            const inter = direction.clone().scale(+rectExtents.y / direction.y);
            if (Math.abs(inter.x) <= sideBoundX) return inter;
        }
        if (direction.y < 0) {
            const inter = direction.clone().scale(-rectExtents.y / direction.y);
            if (Math.abs(inter.x) <= sideBoundX) return inter;
        }

        const centerX = rectExtents.x - radius;
        const centerY = rectExtents.y - radius;
        const center = new Vector2();
        if (direction.x > 0 && direction.y > 0) {
            center.set(+centerX, +centerY);
            const t = this.intersectDirectionCircle(direction, center, radius);
            if (t >= 0) return direction.clone().scale(t);
        }
        if (direction.x < 0 && direction.y > 0) {
            center.set(-centerX, +centerY);
            const t = this.intersectDirectionCircle(direction, center, radius);
            if (t >= 0) return direction.clone().scale(t);
        }
        if (direction.x > 0 && direction.y < 0) {
            center.set(+centerX, -centerY);
            const t = this.intersectDirectionCircle(direction, center, radius);
            if (t >= 0) return direction.clone().scale(t);
        }
        if (direction.x < 0 && direction.y < 0) {
            center.set(-centerX, -centerY);
            const t = this.intersectDirectionCircle(direction, center, radius);
            if (t >= 0) return direction.clone().scale(t);
        }
        return new Vector2(0, 0);
    }

    static circleVsCircle(x1: number, y1: number, r1: number, x2: number, y2: number, r2: number): Vector2[] {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const d = Math.hypot(dx, dy);

        if (d > r1 + r2 || d < Math.abs(r1 - r2) || d === 0) {
            return [];
        }

        const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
        const h = Math.sqrt(r1 * r1 - a * a);

        const xm = x1 + (a * dx) / d;
        const ym = y1 + (a * dy) / d;

        const rx = -dy * (h / d);
        const ry = +dx * (h / d);

        return [new Vector2(xm + rx, ym + ry), new Vector2(xm - rx, ym - ry)];
    }

    static getArcCenter(point1: Vector2, point2: Vector2, radius: number, flip: boolean = false): Vector2 {
        const v = point2.clone().subV(point1);
        const lengthSq = v.lengthSq();
        const h = Math.sqrt(radius * radius - lengthSq / 4.0);
        const perp = v
            .clone()
            .perp(flip)
            .scale(h / Math.sqrt(lengthSq));
        return point1.clone().addV(v.scale(0.5)).addV(perp);
    }

    static getClosestPoint(reference: Vector2, points: Vector2[]): Vector2 {
        if (points.length <= 0) return new Vector2(0, 0);

        let closestIndex = 0;
        let minDistSq = reference.distanceSq(points[0]);
        for (let i = 1; i < points.length; i++) {
            const distSq = reference.distanceSq(points[i]);
            if (distSq < minDistSq) {
                minDistSq = distSq;
                closestIndex = i;
            }
        }
        return points[closestIndex].clone();
    }
}
