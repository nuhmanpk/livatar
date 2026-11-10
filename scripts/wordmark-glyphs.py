"""One-off: extract the outlines of the word "livatar" from a bold sans font into scripts/wordmark-path.json,
so assets/wordmark.svg looks identical everywhere (an SVG that depends on a viewer's fonts would not).
  python3 scripts/wordmark-glyphs.py Inter-ExtraBold.ttf   (Inter: SIL Open Font License)
Needs fontTools (pip install fonttools). Run `node scripts/wordmark-art.mjs` afterwards."""
import json, sys
from fontTools.ttLib import TTFont, TTCollection
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

path = sys.argv[1]  # an OFL font: we use Inter ExtraBold (https://fonts.google.com/specimen/Inter)
want = (sys.argv[2] if len(sys.argv) > 2 else '').lower()
fonts = TTCollection(path).fonts if path.endswith('.ttc') else [TTFont(path)]
font = next((f for f in fonts if want in (f['name'].getDebugName(6) or '').lower() or want in (f['name'].getDebugName(4) or '').lower()), fonts[0])
gs, cmap, upem = font.getGlyphSet(), font.getBestCmap(), font['head'].unitsPerEm
text, track = 'livatar', -0.05 * upem
x, parts = 0.0, []
for ch in text:
    name = cmap[ord(ch)]
    if ch == 'i':  # dotless i, the face goes where the dot would be
        name = cmap.get(0x131, name)
    pen = SVGPathPen(gs)
    gs[name].draw(TransformPen(pen, (1, 0, 0, -1, x, 0)))  # y flipped for SVG
    parts.append({'ch': ch, 'd': pen.getCommands(), 'x': x})
    x += gs[name].width + track
asc = font['OS/2'].sCapHeight if hasattr(font['OS/2'], 'sCapHeight') else int(upem * 0.7)
json.dump({'upem': upem, 'width': x - track, 'ascender': int(upem * 0.76), 'descender': 0, 'glyphs': parts, 'font': font['name'].getDebugName(4)}, open('scripts/wordmark-path.json', 'w'))
print('wrote scripts/wordmark-path.json from', font['name'].getDebugName(4), 'width', round(x - track), 'upem', upem)
