import { S2Camera } from './math/s2-camera';
import { NewS2SVG } from './element/s2-svg';
import { NewS2Circle } from './element/s2-circle';
import { NewS2Rect } from './element/s2-rect';
import { NewS2Grid } from './element/s2-grid';
import { NewS2Text } from './element/s2-text';
import { NewS2Node, S2Node } from './element/s2-node';
import { NewS2Path } from './element/s2-path';
import { NewS2FillRect } from './element/s2-fill-rect';
import { NewS2Group } from './element/s2-group';
import { NewS2CubicEdge, NewS2LineEdge } from './element/s2-edge';
import { S2Position } from './s2-types';
import { type NewS2BaseContainer } from './element/s2-container';
import { type S2BaseElement } from './element/s2-element';
import { type S2BaseScene } from './s2-interface';
import { NewS2Line } from './element/s2-line';

export class S2Scene implements S2BaseScene {
    readonly svg: NewS2SVG;
    activeCamera: S2Camera;
    nextId: number;
    private nextUpdateId: number = 0;

    getNextElementId(): number {
        return this.nextId++;
    }

    getNextUpdateId(): number {
        return this.nextUpdateId++;
    }

    constructor(element: SVGSVGElement, camera: S2Camera) {
        this.activeCamera = camera;
        this.svg = new NewS2SVG(this, element);
        element.innerHTML = '';
        this.svg.update();
        this.nextId = 0;
    }

    addCircle(parent: NewS2BaseContainer = this.svg): NewS2Circle {
        const child = new NewS2Circle(this);
        parent.appendChild(child);
        return child;
    }

    addRect(parent: NewS2BaseContainer = this.svg): NewS2Rect {
        const child = new NewS2Rect(this);
        parent.appendChild(child);
        return child;
    }

    addFillRect(parent: NewS2BaseContainer = this.svg): NewS2FillRect {
        const child = new NewS2FillRect(this);
        parent.appendChild(child);
        return child;
    }

    addGrid(parent: NewS2BaseContainer = this.svg): NewS2Grid {
        const child = new NewS2Grid(this);
        parent.appendChild(child);
        return child;
    }

    addText(parent: NewS2BaseContainer = this.svg): NewS2Text {
        const child = new NewS2Text(this);
        parent.appendChild(child);
        return child;
    }

    addNode(partCount: number = 1, parent: NewS2BaseContainer = this.svg): NewS2Node {
        const child = new NewS2Node(this, partCount);
        parent.appendChild(child);
        return child;
    }

    addPath(parent: NewS2BaseContainer = this.svg): NewS2Path {
        const child = new NewS2Path(this);
        parent.appendChild(child);
        return child;
    }

    addGroup<ChildType extends S2BaseElement>(parent: NewS2BaseContainer = this.svg): NewS2Group<ChildType> {
        const child = new NewS2Group<ChildType>(this);
        parent.appendChild(child);
        return child;
    }

    addLine(parent: NewS2BaseContainer = this.svg): NewS2Line {
        const child = new NewS2Line(this);
        parent.appendChild(child);
        return child;
    }

    addLineEdge(
        start: S2Node | S2Position,
        end: S2Node | S2Position,
        parent: NewS2BaseContainer = this.svg,
    ): NewS2LineEdge {
        const child = new NewS2LineEdge(this);
        child.data.start = start;
        child.data.end = end;
        parent.appendChild(child);
        return child;
    }

    addCubicEdge(
        start: S2Node | S2Position,
        end: S2Node | S2Position,
        parent: NewS2BaseContainer = this.svg,
    ): NewS2CubicEdge {
        const child = new NewS2CubicEdge(this);
        child.data.start = start;
        child.data.end = end;
        parent.appendChild(child);
        return child;
    }

    getSVG(): NewS2SVG {
        return this.svg;
    }

    update(): this {
        this.svg.update();
        return this;
    }
}
