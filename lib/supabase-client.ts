// Client-side Supabase client
// This file should only be imported by client components ('use client')

import { createBrowserSupabaseClient } from './supabase';

export function createClient() {
  return createBrowserSupabaseClient();
}