import QRCodeStyling from 'qr-code-styling'
import { jsPDF } from 'jspdf'

export const FONTS = [
  ['Classic', 'Georgia, "Times New Roman", serif', '700'],
  ['Modern', '"Helvetica Neue", Arial, sans-serif', '700'],
  ['Bold', 'Impact, "Arial Black", sans-serif', '400'],
  ['Script', '"Brush Script MT", "Segoe Script", "Snell Roundhand", cursive', 'italic 700'],
  ['Mono', '"Courier New", monospace', '700'],
  ['Elegant', 'Palatino, "Palatino Linotype", "Book Antiqua", serif', 'italic 700']
]

// Draws centered text on a round / rounded badge and returns a PNG data URL (used as the QR center image).
export const textImage = (text, fontIdx, color, bg, badge) => {
  const S = 400, c = document.createElement('canvas'); c.width = c.height = S
  const x = c.getContext('2d'); x.fillStyle = bg
  if (badge === 'circle') { x.beginPath(); x.arc(S / 2, S / 2, S / 2, 0, Math.PI * 2); x.fill() }
  else { const r = 70; x.beginPath(); x.moveTo(r, 0); x.arcTo(S, 0, S, S, r); x.arcTo(S, S, 0, S, r); x.arcTo(0, S, 0, 0, r); x.arcTo(0, 0, S, 0, r); x.closePath(); x.fill() }
  const [, fam, w] = FONTS[fontIdx] || FONTS[0]
  const max = badge === 'circle' ? 270 : 320
  let size = 200
  do { x.font = `${w} ${size}px ${fam}`; size -= 6 } while (x.measureText(text).width > max && size > 20)
  x.fillStyle = color; x.textAlign = 'center'; x.textBaseline = 'middle'
  x.fillText(text, S / 2, S / 2 + size * 0.05)
  return c.toDataURL('image/png')
}

export const centerImage = (o) =>
  o.center === 'text' && o.text.trim() ? textImage(o.text.trim(), o.font, o.bg, o.fg, o.badge)
  : o.center === 'logo' && o.logo ? o.logo : undefined

export const buildOptions = (o, size) => {
  const image = centerImage(o)
  return {
  width: size, height: size, type: 'canvas', shape: o.shape, data: o.data, margin: Math.round(size * 0.04),
  qrOptions: { errorCorrectionLevel: image ? 'H' : 'M' },
  dotsOptions: { color: o.fg, type: o.dot },
  backgroundOptions: { color: o.transparent ? 'rgba(0,0,0,0)' : o.bg, round: o.shape === 'circle' ? 0 : o.round },
  cornersSquareOptions: { type: o.eye, color: o.fg },
  cornersDotOptions: { type: o.eye === 'dot' ? 'dot' : 'square', color: o.fg },
  image,
  imageOptions: { crossOrigin: 'anonymous', margin: 4, imageSize: o.logoSize }
}}

const raw = async (o, size, ext) => new QRCodeStyling(buildOptions(o, size)).getRawData(ext)

export const save = (blob, name) => {
  const a = document.createElement('a'); const url = URL.createObjectURL(blob)
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
export const downloadPNG = async (o, size) => save(await raw(o, size, 'png'), `qr-code-${size}.png`)
export const downloadSVG = async (o, size) => save(await raw(o, size, 'svg'), 'qr-code.svg')
export const downloadPDF = async (o, url) => {
  const blob = await raw({ ...o, transparent: false }, 1024, 'png')
  const data = await new Promise(r => { const f = new FileReader(); f.onload = () => r(f.result); f.readAsDataURL(blob) })
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
  pdf.setFontSize(20); pdf.text('Scan the QR code', 105, 30, { align: 'center' })
  pdf.addImage(data, 'PNG', 35, 45, 140, 140)
  pdf.setFontSize(10); pdf.text(pdf.splitTextToSize(url, 170), 105, 200, { align: 'center' })
  pdf.save('qr-code.pdf')
}
export const copyQR = async (o) => {
  const blob = await raw({ ...o, transparent: false }, 768, 'png')
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
}
export const shareQR = async (o) => {
  const blob = await raw({ ...o, transparent: false }, 768, 'png')
  const file = new File([blob], 'qr-code.png', { type: 'image/png' })
  if (navigator.canShare && navigator.canShare({ files: [file] })) await navigator.share({ files: [file], title: 'QR Code' })
  else throw new Error('Sharing is not supported on this device.')
}
