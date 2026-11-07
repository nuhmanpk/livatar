/** Rasterize an SVG string to a PNG/JPEG/WebP Blob (browser only). */
export async function toImage(svg: string, size = 256, type: 'image/png' | 'image/jpeg' | 'image/webp' = 'image/png'): Promise<Blob> {
  if (typeof document === 'undefined') throw new Error('livatar: toImage() needs a browser (use createAvatar() on the server)')
  const sized = svg.replace(/width="[^"]*" height="[^"]*"/, `width="${size}" height="${size}"`)
  const url = URL.createObjectURL(new Blob([sized], { type: 'image/svg+xml' }))
  try {
    const img = new Image()
    img.decoding = 'async'
    img.src = url
    await img.decode()
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = size
    canvas.getContext('2d')!.drawImage(img, 0, 0, size, size)
    return await new Promise((ok, fail) => canvas.toBlob((b) => (b ? ok(b) : fail(new Error('livatar: export failed'))), type))
  } finally {
    URL.revokeObjectURL(url)
  }
}

/** Trigger a download of an SVG string as .svg, or as .png when the name ends in .png. */
export async function download(svg: string, filename = 'livatar.svg', size = 512): Promise<void> {
  const blob = /\.png$/i.test(filename) ? await toImage(svg, size) : new Blob([svg], { type: 'image/svg+xml' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}
