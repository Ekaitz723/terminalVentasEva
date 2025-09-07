import { createClient } from '@supabase/supabase-js'
import { kv } from '@vercel/kv'

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export { kv }