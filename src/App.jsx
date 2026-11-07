import { useEffect, useRef, useState } from 'react'
import QRCodeStyling from 'qr-code-styling'
import { QrCode, ClipboardPaste, X, Download, Copy, Share2, RotateCcw, Upload, Trash2, ShieldCheck, Zap, Palette, FileImage } from 'lucide-react'
import { validateURL } from './utils/validateURL'
import { FONTS, buildOptions, downloadPNG, downloadSVG, downloadPDF, copyQR, shareQR } from './utils/qr'

const PRESETS = [['Black', '#000000', '#ffffff'], ['Blue', '#1d4ed8', '#ffffff'], ['Green', '#15803d', '#ffffff'], ['Red', '#dc2626', '#ffffff'], ['Purple', '#7e22ce', '#ffffff']]
const DOTS = [['square', 'Square'], ['rounded', 'Rounded'], ['dots', 'Dots'], ['classy', 'Classy'], ['classy-rounded', 'Classy round'], ['extra-rounded', 'Extra round']]
const EYES = [['square', 'Square'], ['extra-rounded', 'Rounded'], ['dot', 'Circle']]
const SHAPES = [['square', 'Square QR'], ['circle', 'Circle QR']]
const SIZES = [256, 512, 1024, 2048]
const DEF = { fg: '#000000', bg: '#ffffff', dot: 'square', eye: 'square', transparent: false, logo: null, logoSize: 0.3, shape: 'square', round: 0.12, center: 'none', text: '', font: 0, badge: 'circle' }

export default function App() {
  const [input, setInput] = useState('')
  const [url, setUrl] = useState({ ok: false, value: '', error: '' })
  const [s, setS] = useState(DEF)
  const [size, setSize] = useState(1024)
  const [custom, setCustom] = useState('')
  const [msg, setMsg] = useState('')
  const box = useRef(null); const qr = useRef(null); const fileRef = useRef(null)
  const set = (k, v) => setS(p => ({ ...p, [k]: v }))
  const exportSize = size === 'custom' ? Math.min(4096, Math.max(100, +custom || 1024)) : size
  const opts = { ...s, data: url.value }

  useEffect(() => { const t = setTimeout(() => setUrl(validateURL(input)), 250); return () => clearTimeout(t) }, [input])

  useEffect(() => {
    if (!url.ok) return
    const o = buildOptions(opts, 280)
    if (!qr.current) { qr.current = new QRCodeStyling(o); qr.current.append(box.current) } else qr.current.update(o)
  }, [url, s])

  const flash = (t) => { setMsg(t); setTimeout(() => setMsg(''), 2500) }
  const run = (fn, ok) => async () => { try { await fn(); ok && flash(ok) } catch (e) { flash(e.message || 'Something went wrong.') } }
  const paste = async () => { try { setInput(await navigator.clipboard.readText()) } catch { flash('Clipboard access denied. Paste with Ctrl+V.') } }
  const reset = () => { setInput(''); setS(DEF); setSize(1024); if (fileRef.current) fileRef.current.value = '' }
  const onLogo = (e) => {
    const f = e.target.files[0]; if (!f) return
    if (!/^image\/(png|jpe?g|webp)$/.test(f.type)) return flash('Use PNG, JPG or WebP.')
    const r = new FileReader(); r.onload = () => set('logo', r.result); r.readAsDataURL(f)
  }

  return (<>
    <header className="header"><div className="wrap row between">
      <a className="brand" href="/" style={{ textDecoration: 'none', color: 'inherit' }}><img src="/favicon.svg" alt="QR Generator logo" width="24" height="24" /> QR Generator</a>
      <nav className="nav"><a href="#generator">QR Generator</a><a href="#how">How It Works</a><a href="#faq">FAQ</a></nav>
    </div></header>

    <main className="wrap" id="generator">
      <section className="hero"><h1>Free Online QR Code Generator</h1>
        <p>Turn any website URL into a QR code instantly. Customize, download and share your QR code for free.</p></section>

      <div className="grid">
        <div className="col">
          <div className="card">
            <label className="lbl">Website URL</label>
            <div className="row gap">
              <div className="inputwrap">
                <input value={input} onChange={e => setInput(e.target.value)} placeholder="Paste your website URL here" inputMode="url" autoComplete="off" spellCheck="false" />
                {input && <button className="icon" onClick={() => setInput('')} aria-label="Clear"><X size={16} /></button>}
              </div>
              <button className="btn" onClick={paste}><ClipboardPaste size={16} /> Paste</button>
            </div>
            {input && url.error && <p className="err">{url.error}</p>}
            {url.ok && url.value !== input.trim() && <p className="hint">Using {url.value}</p>}
          </div>

          <div className="card">
            <h3>Colors</h3>
            <div className="chips">{PRESETS.map(([n, f, b]) => <button key={n} className={'chip' + (s.fg === f && s.bg === b ? ' on' : '')} onClick={() => setS(p => ({ ...p, fg: f, bg: b }))}><i style={{ background: f }} />{n}</button>)}</div>
            <div className="row gap wrapx">
              <label className="color">Foreground <input type="color" value={s.fg} onChange={e => set('fg', e.target.value)} /><input className="hex" value={s.fg} onChange={e => /^#[0-9a-f]{0,6}$/i.test(e.target.value) && set('fg', e.target.value)} /></label>
              <label className="color">Background <input type="color" value={s.bg} onChange={e => set('bg', e.target.value)} /><input className="hex" value={s.bg} onChange={e => /^#[0-9a-f]{0,6}$/i.test(e.target.value) && set('bg', e.target.value)} /></label>
            </div>
            <label className="check"><input type="checkbox" checked={s.transparent} onChange={e => set('transparent', e.target.checked)} /> Transparent background (PNG &amp; SVG)</label>
          </div>

          <div className="card">
            <h3>Style</h3>
            <label className="lbl">QR shape</label>
            <div className="chips">{SHAPES.map(([v, n]) => <button key={v} className={'chip' + (s.shape === v ? ' on' : '')} onClick={() => set('shape', v)}>{n}</button>)}</div>
            {s.shape === 'square' && <><label className="lbl">Smooth corners {Math.round(s.round * 100)}%</label>
              <input type="range" min="0" max="0.5" step="0.01" value={s.round} onChange={e => set('round', +e.target.value)} /></>}
            <label className="lbl">Pattern</label>
            <div className="chips">{DOTS.map(([v, n]) => <button key={v} className={'chip' + (s.dot === v ? ' on' : '')} onClick={() => set('dot', v)}>{n}</button>)}</div>
            <label className="lbl">Eye style</label>
            <div className="chips">{EYES.map(([v, n]) => <button key={v} className={'chip' + (s.eye === v ? ' on' : '')} onClick={() => set('eye', v)}>{n}</button>)}</div>
          </div>

          <div className="card">
            <h3>Center</h3>
            <div className="chips">{[['none', 'None'], ['text', 'Name / text'], ['logo', 'Logo']].map(([v, n]) => <button key={v} className={'chip' + (s.center === v ? ' on' : '')} onClick={() => set('center', v)}>{n}</button>)}</div>
            {s.center === 'text' && <>
              <input className="num" style={{ marginTop: 6 }} maxLength={12} value={s.text} onChange={e => set('text', e.target.value)} placeholder="Your name (max 12 letters)" />
              <label className="lbl">Font style</label>
              <div className="chips">{FONTS.map(([n, fam, w], i) => <button key={n} className={'chip' + (s.font === i ? ' on' : '')} style={{ fontFamily: fam, fontWeight: w.includes('700') ? 700 : 400, fontStyle: w.includes('italic') ? 'italic' : 'normal', fontSize: 15 }} onClick={() => set('font', i)}>{n}</button>)}</div>
              <label className="lbl">Badge shape</label>
              <div className="chips">{[['circle', 'Circle'], ['rounded', 'Rounded']].map(([v, n]) => <button key={v} className={'chip' + (s.badge === v ? ' on' : '')} onClick={() => set('badge', v)}>{n}</button>)}</div>
            </>}
            {s.center === 'logo' && <div className="row gap wrapx">
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={onLogo} hidden />
              <button className="btn" onClick={() => fileRef.current.click()}><Upload size={16} /> {s.logo ? 'Replace logo' : 'Upload logo'}</button>
              {s.logo && <button className="btn" onClick={() => { set('logo', null); fileRef.current.value = '' }}><Trash2 size={16} /> Remove</button>}
            </div>}
            {s.center !== 'none' && <><label className="lbl">Center size {Math.round(s.logoSize * 100)}%</label>
              <input type="range" min="0.15" max="0.4" step="0.01" value={s.logoSize} onChange={e => set('logoSize', +e.target.value)} />
              {s.logoSize > 0.3 && <p className="warn">Large center can make the QR harder to scan. Test it before printing.</p>}</>}
          </div>
        </div>

        <div className="col">
          <div className="card sticky">
            <div className={'preview' + (url.ok ? '' : ' empty')}>
              <div ref={box} style={{ display: url.ok ? 'block' : 'none' }} />
              {!url.ok && <div className="ph"><QrCode size={48} /><span>Your QR code will appear here</span></div>}
            </div>
            {url.ok && <p className="urltxt">{url.value}</p>}
            <label className="lbl">Download size</label>
            <div className="chips">{SIZES.map(n => <button key={n} className={'chip' + (size === n ? ' on' : '')} onClick={() => setSize(n)}>{n}px</button>)}
              <button className={'chip' + (size === 'custom' ? ' on' : '')} onClick={() => setSize('custom')}>Custom</button></div>
            {size === 'custom' && <input className="num" type="number" min="100" max="4096" placeholder="100 – 4096 px" value={custom} onChange={e => setCustom(e.target.value)} />}
            <div className="dl">
              <button className="btn primary" disabled={!url.ok} onClick={run(() => downloadPNG(opts, exportSize))}><Download size={16} /> PNG</button>
              <button className="btn primary" disabled={!url.ok} onClick={run(() => downloadSVG(opts, exportSize))}><Download size={16} /> SVG</button>
              <button className="btn primary" disabled={!url.ok} onClick={run(() => downloadPDF(opts, url.value))}><Download size={16} /> PDF</button>
            </div>
            <div className="dl">
              <button className="btn" disabled={!url.ok} onClick={run(() => copyQR(opts), 'QR copied')}><Copy size={16} /> Copy</button>
              <button className="btn" disabled={!url.ok} onClick={run(() => shareQR(opts))}><Share2 size={16} /> Share</button>
              <button className="btn" onClick={reset}><RotateCcw size={16} /> Reset</button>
            </div>
            {msg && <p className="hint center">{msg}</p>}
          </div>
        </div>
      </div>

      <section id="how" className="sec"><h2>How It Works</h2>
        <div className="three">
          <div className="card"><b>1</b><h3>Paste your URL</h3><p>Enter any website link.</p></div>
          <div className="card"><b>2</b><h3>QR is generated</h3><p>It appears instantly, no button needed.</p></div>
          <div className="card"><b>3</b><h3>Download or share</h3><p>Save as PNG, SVG or PDF, then scan with Google Lens or your phone camera.</p></div>
        </div></section>

      <section className="sec"><h2>Features</h2>
        <div className="three">
          <div className="card"><Zap size={20} /><h3>Instant</h3><p>Automatic generation as you type.</p></div>
          <div className="card"><Palette size={20} /><h3>Customizable</h3><p>Colors, patterns, eyes and your own logo.</p></div>
          <div className="card"><FileImage size={20} /><h3>PNG, SVG, PDF</h3><p>High-resolution and print-ready exports.</p></div>
          <div className="card"><QrCode size={20} /><h3>Free &amp; unlimited</h3><p>Make as many QR codes as you want. No sign-up, no watermark, no hidden charges.</p></div>
          <div className="card"><ShieldCheck size={20} /><h3>Private</h3><p>Everything runs in your browser. Nothing is uploaded or stored.</p></div>
        </div></section>

      <section id="faq" className="sec"><h2>FAQ</h2>
        {[['Is it really free and unlimited?', 'Yes. 100% free, unlimited QR codes, no account, no watermark and no hidden charges.'],
          ['Does my QR code expire?', 'No. It contains your original URL directly, so it works as long as that website does.'],
          ['Will it work if this website goes offline?', 'Yes. The QR holds your URL itself and does not redirect through this site.'],
          ['Is my URL uploaded to a server?', 'No. Everything is generated locally in your browser.'],
          ['Do I need an account?', 'No login or registration, and it is free.'],
          ['Can I scan it with Google Lens?', 'Yes. Google Lens, Android and iPhone cameras all read standard QR codes.'],
          ['Can I add my logo?', 'Yes. Upload a PNG, JPG or WebP. Keep it small so the code stays scannable.']]
          .map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</section>
    </main>
    <footer className="footer"><div className="wrap row between"><div className="brand"><img src="/favicon.svg" alt="" width="20" height="20" /> QR Generator</div><span>© {new Date().getFullYear()} QR Generator. Runs entirely in your browser.</span></div></footer>
  </>)
}
