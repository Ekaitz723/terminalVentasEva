import { createClient } from '@supabase/supabase-js'
import { kv } from '@vercel/kv'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

export { kv }