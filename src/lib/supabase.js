import { createClient } from '@supabase/supabase-js'
import { IS_DEMO } from './demo'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Only create real client if credentials exist
export const supabase = IS_DEMO
  ? null
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })

export { IS_DEMO }
