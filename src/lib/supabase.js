import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Missing Supabase environment variables. Please check your .env file.")
}

export const supabase = createClient(
    supabaseUrl || 'https://gcqgtqksbuymrtvaagjn.supabase.co',
    supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjcWd0cWtzYnV5bXJ0dmFhZ2puIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1OTgwNjAsImV4cCI6MjA5OTE3NDA2MH0.bRxCYI1URtIr_fNrnWAW_LiB-QWExlZt4fOzOMqPcgI'
)