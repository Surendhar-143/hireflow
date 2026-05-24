import { createClient } from '@supabase/supabase-js'
import { config } from '../config'
import { logger } from '../utils/logger'

const supabaseUrl = config.SUPABASE_URL || 'https://placeholder-project.supabase.co'
const supabaseKey = config.SUPABASE_ANON_KEY || 'placeholder-anon-key-string'

if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
  logger.warn('Supabase URL or Key is missing in environment. Using placeholder client for verification.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
export default supabase
