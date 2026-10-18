import { createClient } from '@supabase/supabase-js'

const clean = (v) => (v || '').trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '')

const url = clean(import.meta.env.VITE_SUPABASE_URL)
const key = clean(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)

const urlOk = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url)

if (!urlOk || !key) {
  document.body.innerHTML = `
    <div style="font-family:system-ui;max-width:560px;margin:60px auto;padding:24px;border:1px solid #e4dccf;background:#fff">
      <h2 style="margin:0 0 12px">Configuration problem</h2>
      <p>VITE_SUPABASE_URL: <b>${url || '(empty)'}</b></p>
      <p>VITE_SUPABASE_PUBLISHABLE_KEY: <b>${key ? 'found (' + key.slice(0, 15) + '...)' : '(empty)'}</b></p>
      <p style="color:#b3261e">The URL must look like https://abcdefgh.supabase.co</p>
    </div>`
  throw new Error('Invalid Supabase configuration')
}

export const supabase = createClient(url, key)