// Returns { ok, value, error }. value is the exact string that gets encoded.
export function validateURL(input) {
  let v = (input || '').trim()
  if (!v) return { ok: false, value: '', error: '' }
  if (/\s/.test(v)) return { ok: false, value: '', error: 'URL cannot contain spaces.' }
  if (/^(javascript|data|vbscript|file):/i.test(v)) return { ok: false, value: '', error: 'Only http and https URLs are allowed.' }
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(v)) {
    if (/^[a-z][a-z0-9+.-]*:/i.test(v) && !/^[^/]+:\d+/.test(v)) return { ok: false, value: '', error: 'Only http and https URLs are allowed.' }
    v = 'https://' + v
  }
  try {
    const u = new URL(v)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return { ok: false, value: '', error: 'Only http and https URLs are allowed.' }
    if (!u.hostname.includes('.') && u.hostname !== 'localhost') return { ok: false, value: '', error: 'Enter a valid domain, e.g. example.com' }
    if (/\.$/.test(u.hostname) || u.hostname.length < 3) return { ok: false, value: '', error: 'Enter a valid domain, e.g. example.com' }
    return { ok: true, value: v, error: '' }
  } catch { return { ok: false, value: '', error: 'This is not a valid URL.' } }
}
