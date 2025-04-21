
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://zkriskjhdrhbblkkwvrw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inprcmlza2poZHJoYmJsa2t3dnJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNTczMDYsImV4cCI6MjA2MDgzMzMwNn0.pHX8IYNxfJ-JyapRURSbX-2JI1Q54bePLP4JflCOz8E";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
