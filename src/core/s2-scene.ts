import { S2Camera } from './math/s2-camera';
import { S2SVG } from './element/s2-svg';
import { S2Circle } from './element/s2-circle';
import { S2Rect } from './element/s2-rect';
import { S2Grid } from './element/s2-grid';
import { S2Text } from './element/s2-text';
import { S2Node } from './element/s2-node';
import { S2Path } from './element/s2-path';
import { S2FillRect } from './element/s2-fill-rect';
import { S2Group } from './element/s2-group';
import { S2CubicEdge, S2LineEdge } from './element/s2-edge';
import { S2Position } from './s2-types';
import { type S2BaseContainer } from './element/base/s2-container';
import { type S2BaseElement } from './element/base/s2-element';
import { S2BaseScene } from './s2-interface';
import { S2Line } from './element/s2-line';

export class S2Scene extends S2BaseScene {
    constructor(element: SVGSVGElement, camera: S2Camera) {
        super(element, camera);
    }

    addCircle(parent: S2BaseContainer = this.svg): S2Circle {
        const child = new S2Circle(this);
        parent.appendChild(child);
        return child;
    }

    addRect(parent: S2BaseContainer = this.svg): S2Rect {
        const child = new S2Rect(this);
        parent.appendChild(child);
        return child;
    }

    addFillRect(parent: S2BaseContainer = this.svg): S2FillRect {
        const child = new S2FillRect(this);
        parent.appendChild(child);
        return child;
    }

    addGrid(parent: S2BaseContainer = this.svg): S2Grid {
        const child = new S2Grid(this);
        parent.appendChild(child);
        return child;
    }

    addWorldGrid(parent: S2BaseContainer = this.svg): S2Grid {
        const child = new S2Grid(this);
        const viewport = this.getActiveCamera().viewport;
        child
            .setBoundA(0, 0, 'view')
            .setBoundB(viewport.x, viewport.y, 'view')
            .setReferencePoint(0, 0, 'world')
            .setSteps(1, 1, 'world')
            .setStrokeWidth(1, 'view');
        parent.appendChild(child);
        return child;
    }

    addText(parent: S2BaseContainer = this.svg): S2Text {
        const child = new S2Text(this);
        parent.appendChild(child);
        return child;
    }

    addNode(partCount: number = 1, parent: S2BaseContainer = this.svg): S2Node {
        const child = new S2Node(this, partCount);
        parent.appendChild(child);
        return child;
    }

    addPath(parent: S2BaseContainer = this.svg): S2Path {
        const child = new S2Path(this);
        parent.appendChild(child);
        return child;
    }

    addGroup<ChildType extends S2BaseElement>(parent: S2BaseContainer = this.svg): S2Group<ChildType> {
        const child = new S2Group<ChildType>(this);
        parent.appendChild(child);
        return child;
    }

    addLine(parent: S2BaseContainer = this.svg): S2Line {
        const child = new S2Line(this);
        parent.appendChild(child);
        return child;
    }

    addLineEdge(start: S2Node | S2Position, end: S2Node | S2Position, parent: S2BaseContainer = this.svg): S2LineEdge {
        const child = new S2LineEdge(this);
        child.data.start.set(start);
        child.data.end.set(end);
        if (start instanceof S2Node) {
            child.addDependency(start);
        }
        if (end instanceof S2Node) {
            child.addDependency(end);
        }
        parent.appendChild(child);
        return child;
    }

    addCubicEdge(
        start: S2Node | S2Position,
        end: S2Node | S2Position,
        parent: S2BaseContainer = this.svg,
    ): S2CubicEdge {
        const child = new S2CubicEdge(this);
        child.data.start.set(start);
        child.data.end.set(end);
        if (start instanceof S2Node) {
            child.addDependency(start);
        }
        if (end instanceof S2Node) {
            child.addDependency(end);
        }
        parent.appendChild(child);
        return child;
    }

    getSVG(): S2SVG {
        return this.svg;
    }

    update(): this {
        this.svg.update();
        return this;
    }
}
