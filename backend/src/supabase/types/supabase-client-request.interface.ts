import { type SupabaseClient } from '@supabase/supabase-js';
import { Request } from 'express';

export interface SupabaseClientRequest extends Request {
  supabase?: SupabaseClient;
}
