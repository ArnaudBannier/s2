import type { S2BaseElement } from '../element/base/s2-element';
import type { S2BaseNode } from '../element/node/s2-base-node';
import { S2Circle } from '../element/s2-circle';
import { S2Rect } from '../element/s2-rect';
import { S2Grid } from '../element/s2-grid';
import { S2RichText } from '../element/text/s2-rich-text';
import { S2Path } from '../element/s2-path';
import { S2FillRect } from '../element/s2-fill-rect';
import { S2Group } from '../element/s2-group';
import { S2BaseScene } from './s2-base-scene';
import { S2Line } from '../element/s2-line';
import { S2ElementData } from '../element/base/s2-base-data';
import { S2PlainNode } from '../element/node/s2-plain-node';
import { S2LineEdge } from '../element/node/s2-line-edge';
import { S2CubicEdge } from '../element/node/s2-cubic-edge';

export class S2Scene extends S2BaseScene {
    constructor(element: SVGSVGElement) {
        super(element);
    }

    addCircle(parent: S2BaseElement = this.svg): S2Circle {
        const child = new S2Circle(this);
        child.setParent(parent);
        return child;
    }

    addRect(parent: S2BaseElement = this.svg): S2Rect {
        const child = new S2Rect(this);
        child.setParent(parent);
        return child;
    }

    addFillRect(parent: S2BaseElement = this.svg): S2FillRect {
        const child = new S2FillRect(this);
        child.setParent(parent);
        return child;
    }

    addGrid(parent: S2BaseElement = this.svg): S2Grid {
        const child = new S2Grid(this);
        child.setParent(parent);
        return child;
    }

    addWorldGrid(parent: S2BaseElement = this.svg): S2Grid {
        const child = new S2Grid(this);
        const data = child.data;
        data.stroke.width.set(1, this.getViewSpace());
        data.geometry.boundA.set(0, 0, this.getViewSpace());
        data.geometry.boundB.set(this.getViewportWidth(), this.getViewportHeight(), this.getViewSpace());
        data.geometry.referencePoint.set(0, 0, this.getWorldSpace());
        data.geometry.steps.set(1, 1, this.getWorldSpace());
        data.geometry.space.set(this.getWorldSpace());
        child.update();
        child.setParent(parent);
        return child;
    }

    addText(parent: S2BaseElement = this.svg): S2RichText {
        const child = new S2RichText(this);
        child.setParent(parent);
        return child;
    }

    addPlainNode(parent: S2BaseElement = this.svg): S2PlainNode {
        const child = new S2PlainNode(this);
        child.setParent(parent);
        return child;
    }

    addPath(parent: S2BaseElement = this.svg): S2Path {
        const child = new S2Path(this);
        child.setParent(parent);
        return child;
    }

    addGroup<Data extends S2ElementData>(data: Data, parent: S2BaseElement = this.svg): S2Group<Data> {
        const child = new S2Group<Data>(this, data);
        child.setParent(parent);
        return child;
    }

    addLine(parent: S2BaseElement = this.svg): S2Line {
        const child = new S2Line(this);
        child.setParent(parent);
        return child;
    }

    addLineEdge(start: S2BaseNode, end: S2BaseNode, parent: S2BaseElement = this.svg): S2LineEdge {
        const child = new S2LineEdge(this, start, end);
        child.setParent(parent);
        return child;
    }

    addCubicEdge(start: S2BaseNode, end: S2BaseNode, parent: S2BaseElement = this.svg): S2CubicEdge {
        const child = new S2CubicEdge(this, start, end);
        child.setParent(parent);
        return child;
    }
}
