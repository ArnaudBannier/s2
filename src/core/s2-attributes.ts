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

//////////////////////////////////////////////////////////////////////////////

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
