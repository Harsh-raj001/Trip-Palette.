// In-browser palette extraction: draw the image on a small canvas, bucket
// the pixels, then greedily pick the most-populated buckets that are far
// enough apart to feel like a palette rather than four shades of one color.
// Images must be loaded with crossOrigin="anonymous" or getImageData throws.

const dist = (a, b) => Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2)
const hex = c => '#' + c.map(v => v.toString(16).padStart(2, '0')).join('')

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous' // must be set BEFORE src
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

export function extractPalette(img, n = 4) {
  const size = 120
  const c = document.createElement('canvas')
  c.width = size; c.height = size
  const ctx = c.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0, size, size)
  const d = ctx.getImageData(0, 0, size, size).data

  const buckets = new Map()
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 200) continue
    const r = d[i], g = d[i + 1], b = d[i + 2]
    const key = ((r >> 5) << 6) | ((g >> 5) << 3) | (b >> 5)
    const k = buckets.get(key) || { r: 0, g: 0, b: 0, n: 0 }
    k.r += r; k.g += g; k.b += b; k.n++
    buckets.set(key, k)
  }

  const ranked = [...buckets.values()]
    .sort((a, b) => b.n - a.n)
    .map(k => [Math.round(k.r / k.n), Math.round(k.g / k.n), Math.round(k.b / k.n)])

  const picked = []
  for (const col of ranked) {
    if (picked.every(p => dist(p, col) > 60)) picked.push(col)
    if (picked.length === n) break
  }
  for (const col of ranked) {
    if (picked.length === n) break
    if (!picked.some(p => dist(p, col) < 25)) picked.push(col)
  }
  return picked.slice(0, n).map(hex)
}

export function rgbFromHex(h) {
  return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]
}

export function hslFromHex(h) {
  let [r, g, b] = rgbFromHex(h).map(v => v / 255)
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let hh = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) hh = ((g - b) / d + (g < b ? 6 : 0)) * 60
    else if (max === g) hh = ((b - r) / d + 2) * 60
    else hh = ((r - g) / d + 4) * 60
  }
  return [hh, s, l]
}
