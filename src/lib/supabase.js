import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://djlrycpxijpxhmypirlo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqbHJ5Y3B4aWpweGhteXBpcmxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNzg0NzksImV4cCI6MjA5NDg1NDQ3OX0.SCd_gQkufw3S2jyF-DekPPzrdUbbzJR86mLSbvChPgc'

export const supabase = createClient(supabaseUrl, supabaseKey)