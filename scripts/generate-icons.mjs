// Generates the PWA raster icons (PNG) used by the web app manifest and iOS.
//
// We have no image-conversion tooling in the build environment, so this script
// rasterises a simple, on-brand icon (purple background + white "+" mark, echoing
// the addition game) directly to PNG using only Node's built-in `zlib`.
//
// Run with:  node scripts/generate-icons.mjs
// Outputs:   public/icon-192.png, public/icon-512.png, public/apple-touch-icon.png
import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const PUBLIC_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')

// Brand colours (kept in sync with src/index.css --primary / #fff).
const PURPLE = [124, 58, 237, 255]
const WHITE = [255, 255, 255, 255]

const crcTable = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const body = Buffer.concat([typeBuf, data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body), 0)
  return Buffer.concat([len, body, crc])
}

function encodePng(size, pixels) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // colour type: RGBA
  // 10,11,12 = compression / filter / interlace = 0

  // Raw scanlines, each prefixed with filter byte 0.
  const raw = Buffer.alloc(size * (size * 4 + 1))
  for (let y = 0; y < size; y++) {
    const rowStart = y * (size * 4 + 1)
    raw[rowStart] = 0
    for (let x = 0; x < size; x++) {
      const p = (y * size + x) * 4
      const o = rowStart + 1 + x * 4
      raw[o] = pixels[p]
      raw[o + 1] = pixels[p + 1]
      raw[o + 2] = pixels[p + 2]
      raw[o + 3] = pixels[p + 3]
    }
  }

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// Draw a maskable icon: fully-bleed purple background with a white plus centred
// inside the safe zone (keeps the mark clear of platform-applied masking).
function drawIcon(size) {
  const px = new Uint8ClampedArray(size * size * 4)
  const set = (x, y, [r, g, b, a]) => {
    const i = (y * size + x) * 4
    px[i] = r
    px[i + 1] = g
    px[i + 2] = b
    px[i + 3] = a
  }

  // Background.
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) set(x, y, PURPLE)
  }

  // Plus mark: arm thickness ~16% of size, total span ~44% (inside the
  // ~80% maskable safe zone).
  const c = size / 2
  const arm = size * 0.08 // half-thickness
  const reach = size * 0.22 // half-length
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - c
      const dy = y - c
      const inHorizontal = Math.abs(dx) <= reach && Math.abs(dy) <= arm
      const inVertical = Math.abs(dy) <= reach && Math.abs(dx) <= arm
      if (inHorizontal || inVertical) set(x, y, WHITE)
    }
  }

  return px
}

for (const size of [192, 512]) {
  const png = encodePng(size, drawIcon(size))
  writeFileSync(join(PUBLIC_DIR, `icon-${size}.png`), png)
  console.log(`wrote icon-${size}.png (${png.length} bytes)`)
}

// iOS home-screen icon (no transparency / masking; 180px is the modern size).
const apple = encodePng(180, drawIcon(180))
writeFileSync(join(PUBLIC_DIR, 'apple-touch-icon.png'), apple)
console.log(`wrote apple-touch-icon.png (${apple.length} bytes)`)
