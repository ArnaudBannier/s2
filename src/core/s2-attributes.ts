import { S2Extents, S2Position } from './s2-types';
import { type S2Anchor, type S2LineCap, type S2LineJoin } from './s2-globals';
import { S2Color } from '../core/s2-types';
import { S2Length } from './s2-types';
import type { S2TextAlign, S2VerticalAlign } from './element/s2-text-group';

/*
    Pour une animation :
    - copie de la valeur initiale
    - copie de la valeur finale
    [ ] référence vers la variable à modifier
    [ ] référence vers une fonction "type MyFn = (x: number) => void;" Oui mas il faut faire un fléché...

    Comment créer facilement une animation ?
    -> Il faut sauvegarder les paramètres quelque part...
        [ ] Dans l'objet directement ?
        [x] Dans une animation en construction ?
*/

// Interface clonable
interface Clonable<T> {
    clone(): T;
}

export class S2StrokeAttributes implements Clonable<S2StrokeAttributes> {
    public color: S2Color;
    public width: S2Length;
    public opacity: number;

    constructor() {
        this.color = new S2Color();
        this.width = new S2Length(0, 'view');
        this.opacity = 1;
    }

    clone(): S2StrokeAttributes {
        const attributes = new S2StrokeAttributes();
        attributes.color = this.color.clone();
        attributes.width = this.width.clone();
        attributes.opacity = this.opacity;
        return attributes;
    }

    copy(other: S2StrokeAttributes): void {
        this.color.copy(other.color);
        this.width.copy(other.width);
        this.opacity = other.opacity;
    }
}

export class S2FillAttributes implements Clonable<S2FillAttributes> {
    public color: S2Color;
    public opacity: number;

    constructor() {
        this.color = new S2Color(0xff, 0xff, 0xff);
        this.opacity = 1;
    }

    clone(): S2FillAttributes {
        const attributes = new S2StrokeAttributes();
        attributes.color = this.color.clone();
        attributes.opacity = this.opacity;
        return attributes;
    }

    copy(other: S2FillAttributes): void {
        this.color.copy(this.color);
        this.opacity = other.opacity;
    }
}

export class S2TextAttributes implements Clonable<S2TextAttributes> {
    public fill: S2FillAttributes;
    public stroke: S2StrokeAttributes;
    public opacity: number;

    constructor() {
        this.fill = new S2FillAttributes();
        this.stroke = new S2StrokeAttributes();
        this.opacity = 1;
    }

    clone(): S2TextAttributes {
        const attributes = new S2TextAttributes();
        attributes.fill.copy(this.fill);
        attributes.stroke.copy(this.stroke);
        attributes.opacity = this.opacity;
        return attributes;
    }

    copy(other: S2TextAttributes): void {
        this.fill.copy(other.fill);
        this.stroke.copy(other.stroke);
        this.opacity = other.opacity;
    }
}

class S2NodeAttributes implements Clonable<S2NodeAttributes> {
    readonly minExtents?: S2Extents;
    readonly padding?: S2Extents;
    readonly partSep?: S2Length;
    readonly textFillColor?: S2Color;
    readonly textFillOpacity?: number;
    readonly textOpacity?: number;
    readonly textStrokeColor?: S2Color;
    readonly textStrokeWidth?: S2Length;

    constructor(init: Partial<S2NodeAttributes> = {}) {
        Object.assign(this, init);
    }

    clone(): S2NodeAttributes {
        return new S2NodeAttributes(this);
    }
}

// --- Classe principale en arbre ---
class S2AttributesNew implements Clonable<S2AttributesNew> {
    public stroke?: S2StrokeAttributes;
    public fill?: S2FillAttributes;
    public node?: S2NodeAttributes;

    constructor(init: Partial<S2AttributesNew> = {}) {
        Object.assign(this, init);
    }

    clone(): S2AttributesNew {
        return new S2AttributesNew(this);
    }
}

// --- Exemple d'utilisation ---
// const rectAttrs = new S2AttributesNew({
//     stroke: new S2StrokeAttributes({ strokeColor: { r: 255, g: 0, b: 0 }, strokeWidth: { value: 2, unit: 'px' } }),
//     fill: new S2FillAttributes({ fillOpacity: 0.5 }),
//     node: new S2NodeAttributes({ padding: { top: 2, right: 2, bottom: 2, left: 2 } }),
// });

// Clonage immuable
//const nextFrameAttrs = rectAttrs.clone();//

//////////////////////////////////////////////////////////////////////////////

export class S2Animatable {
    // Basic animatable
    extents?: S2Extents; // todo
    isActive?: boolean;
    fillColor?: S2Color;
    fillOpacity?: number;
    opacity?: number;
    pathFrom?: number;
    pathTo?: number;
    position?: S2Position;
    radius?: S2Length; // todo
    strokeColor?: S2Color;
    strokeWidth?: S2Length;

    // S2Nodes
    minExtents?: S2Extents; // todo
    textFillColor?: S2Color; // todo
    textFillOpacity?: number; // todo
    textOpacity?: number; // todo
    textStrokeColor?: S2Color; // todo
    textStrokeWidth?: S2Length; // todo

    constructor(init?: Partial<S2Animatable>) {
        Object.assign(this, init);
    }

    clone(): S2Animatable {
        const obj = new S2Animatable();
        Object.assign(obj, this);
        if (this.extents) obj.extents = this.extents.clone();
        if (this.fillColor) obj.fillColor = this.fillColor.clone();
        if (this.minExtents) obj.minExtents = this.minExtents.clone();
        if (this.position) obj.position = this.position.clone();
        if (this.radius) obj.radius = this.radius.clone();
        if (this.strokeColor) obj.strokeColor = this.strokeColor.clone();
        if (this.strokeWidth) obj.strokeWidth = this.strokeWidth.clone();
        if (this.textFillColor) obj.textFillColor = this.textFillColor.clone();
        if (this.textStrokeColor) obj.textStrokeColor = this.textStrokeColor.clone();
        if (this.textStrokeWidth) obj.textStrokeWidth = this.textStrokeWidth.clone();
        return obj;
    }
}

export class S2Attributes {
    // Basic animatable
    extents?: S2Extents; // todo
    isActive?: boolean;
    fillColor?: S2Color;
    fillOpacity?: number;
    opacity?: number;
    position?: S2Position;
    pathFrom?: number;
    pathTo?: number;
    radius?: S2Length; // todo
    strokeColor?: S2Color;
    strokeWidth?: S2Length;

    // Basic non animatable
    lineCap?: S2LineCap;
    lineJoin?: S2LineJoin;
    anchor?: S2Anchor;
    textAlign?: S2TextAlign;
    verticalAlign?: S2VerticalAlign;

    // S2Nodes
    minExtents?: S2Extents; // todo
    padding?: S2Extents;
    partSep?: S2Length;
    textFillColor?: S2Color;
    textFillOpacity?: number;
    textOpacity?: number;
    textStrokeColor?: S2Color;
    textStrokeWidth?: S2Length;

    constructor(init?: Partial<S2Attributes>) {
        Object.assign(this, init);
    }
}

/*Animation attributes
color,
dash,
dash phase,
draw,
fill,
fill opacity,
line width,
opacity,
path,
position,
rotate,
scale,
shift,
stage,
stroke opacity,
text,
view,
visible,
xscale,
xshift,
xskew,
xslant,
yscale,
yshift,
yskew,
yslant,
Animation attributes (basic layer)
dash,
draw,
draw opacity,
fill,
fill opacity,
line width,
motion,
opacity,
path,
rotate,
scale,
skew x,
skew y,
stage,
translate,
view,
visible,
xskew,
yskew,
Animation attributes (system layer)
dash,
fillcolor,
fillopacity,
linewidth,
motion,
opacity,
path,
rotate,
scale,
skewx,
skewy,
strokecolor,
strokeopacity,
translate,
viewbox,
visibility,

/*
The following ⟨attributes⟩ are permissible (actually, the attribute names do not include a colon, but since they will almost always be used with the colon syntax, it makes it easier to identify them):
• :dash phase
• :dash pattern
• :dash
• :draw opacity
• :draw
• :fill opacity
• :fill
• :line width
• :opacity
• :position
• :path
• :rotate
• :scale
• :stage
• :text opacity
• :text
• :translate
• :view
• :visible
• :xscale
• :xshift
• :xskew
• :xslant
• :yscale
• :yshift
• :yskew
• :yslant
These attributes are detailed in the following sections, but here is a quick overview of those that do not have a TikZ key of the same name (and which thus do not just animate the attribute set using this key):
• :shift allows you to add an animated shifting of the canvas, just like TikZ’s shift key. However, in conjunction with the along key, you can also specify the shifting along a path rather than via a timeline of coordinates.
• :position works similar to :shift, only the coordinates are not relative movements (no “shifts”), but refer to “absolute positions” in the picture.
• :path allows you to animate a path (it will morph). The “values” are now paths themselves.
• :view allows you to animate the view box of a view.
• :visible decides whether an object is visible at all.
• :stage is identical to :visible, but when the object is not animated, it will be hidden by default.*/

/*y category
SVG attributes b
Generic attributes
Core attributes

id
class
style
lang
tabindex
xml:lang
xml:space
Conditional processing attributes

requiredExtensions
requiredFeatures
systemLanguage
XLink attributes
xlink:hrefDeprecated
xlink:type
xlink:role
xlink:arcrole
xlink:title
xlink:show
xlink:actuate
Presentation attributes
Note: All SVG presentation attributes can be used as CSS properties.

alignment-baseline
baseline-shift
clip
clip-path
clip-rule
color
color-interpolation
color-interpolation-filters
cursor
cx
cy
d
direction
display
dominant-baseline
fill
fill-opacity
fill-rule
filter
flood-color
flood-opacity
font-family
font-size
font-size-adjust
font-stretch
font-style
font-variant
font-weight
glyph-orientation-horizontal
glyph-orientation-vertical
height
image-rendering
letter-spacing
lighting-color
marker-end
marker-mid
marker-start
mask
mask-type
opacity
overflow
pointer-events
r
rx
ry
shape-rendering
stop-color
stop-opacity
stroke
stroke-dasharray
stroke-dashoffset
stroke-linecap
stroke-linejoin
stroke-miterlimit
stroke-opacity
stroke-width
text-anchor
text-decoration
text-rendering
transform
transform-origin
unicode-bidi
vector-effect
visibility
width
word-spacing
writing-mode
x
y
Filters attributes
Filter primitive attributes
height, result, width, x, y

Transfer function attributes
type, tableValues, slope, intercept, amplitude, exponent, offset

Animation attributes
Animation target element attributes
href
Animation attribute target attributes
attributeType, attributeName

Animation timing attributes
begin, dur, end, min, max, restart, repeatCount, repeatDur, fill

Animation value attributes
calcMode, values, keyTimes, keySplines, from, to, by

Animation addition attributes
additive, accumulate

Event attributes
onabort
onactivate
onbegin
oncancel
oncanplay
oncanplaythrough
onchange
onclick
onclose
oncuechange
ondblclick
ondrag
ondragend
ondragenter
ondragleave
ondragover
ondragstart
ondrop
ondurationchange
onemptied
onend
onended
onerror
onerror
onfocus
onfocusin
onfocusout
oninput
oninvalid
onkeydown
onkeypress
onkeyup
onload
onloadeddata
onloadedmetadata
onloadstart
onmousedown
onmouseenter
onmouseleave
onmousemove
onmouseout
onmouseover
onmouseup
onmousewheel
onpause
onplay
onplaying
onprogress
onratechange
onrepeat
onreset
onresize
onresize
onscroll
onscroll
onseeked
onseeking
onselect
onshow
onstalled
onsubmit
onsuspend
ontimeupdate
ontoggle
onunload
onvolumechange
onwaiting
*/
