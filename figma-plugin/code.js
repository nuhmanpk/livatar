// livatar for Figma: insert avatars (editable vector SVG) from the plugin UI.
figma.showUI(__html__, { width: 340, height: 520, themeColors: true })

figma.ui.onmessage = (msg) => {
  if (msg.type === 'insert') {
    const { items, size, gap } = msg
    const cols = Math.min(items.length, Math.max(1, Math.round(Math.sqrt(items.length))))
    const c = figma.viewport.center
    const nodes = items.map((it, i) => {
      const n = figma.createNodeFromSvg(it.svg)
      n.name = `livatar/${it.name}`
      n.resize(size, size)
      n.x = c.x + (i % cols) * (size + gap) - (cols * (size + gap)) / 2
      n.y = c.y + Math.floor(i / cols) * (size + gap) - 100
      figma.currentPage.appendChild(n)
      return n
    })
    figma.currentPage.selection = nodes
    figma.viewport.scrollAndZoomIntoView(nodes)
    figma.notify(`Inserted ${nodes.length} livatar${nodes.length === 1 ? '' : 's'}`)
  }
  if (msg.type === 'close') figma.closePlugin()
}
