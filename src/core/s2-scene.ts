import { S2Camera } from './math/s2-camera';
import { S2SVG } from './element/s2-svg';
import { S2Circle } from './element/s2-circle';
import { S2Rect } from './element/s2-rect';
import { S2Grid } from './element/s2-grid';
import { S2Text } from './element/s2-text';
import { S2Node } from './element/s2-node';
import { S2Style } from './element/s2-style';
import { S2Path } from './element/s2-path';
import { S2Line } from './element/s2-line';
import { S2FillRect } from './element/s2-fill-rect';
import { S2Group } from './element/s2-group';
import { S2CubicEdge, S2LineEdge, type S2CubicEdgeOptions, type S2EdgeOptions } from './element/s2-edge';
import { S2Position } from './s2-types';
import { type S2BaseContainer } from './element/s2-container';
import { S2Element } from './element/s2-element';
import { type S2BaseScene } from './s2-interface';

export class S2Scene implements S2BaseScene {
    readonly svg: S2SVG;
    activeCamera: S2Camera;
    nextId: number;

    constructor(element: SVGSVGElement, camera: S2Camera) {
        this.activeCamera = camera;
        this.svg = new S2SVG(this, element);
        element.innerHTML = '';
        this.svg.update();
        this.nextId = 0;
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

    addGroup<T extends S2Element>(parent: S2BaseContainer = this.svg): S2Group<T> {
        const child = new S2Group<T>(this);
        parent.appendChild(child);
        return child;
    }

    addLine(parent: S2BaseContainer = this.svg): S2Line {
        const child = new S2Line(this);
        parent.appendChild(child);
        return child;
    }

    addLineEdge(
        start: S2Node | S2Position,
        end: S2Node | S2Position,
        options: S2EdgeOptions,
        parent: S2BaseContainer = this.svg,
    ): S2LineEdge {
        const child = new S2LineEdge(this, start, end, options);
        parent.appendChild(child);
        return child;
    }

    addCubicEdge(
        start: S2Node | S2Position,
        end: S2Node | S2Position,
        options: S2CubicEdgeOptions,
        parent: S2BaseContainer = this.svg,
    ): S2CubicEdge {
        const child = new S2CubicEdge(this, start, end, options);
        parent.appendChild(child);
        return child;
    }

    addStyle(): S2Style {
        const child = new S2Style(this);
        this.svg.appendChild(child);
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
