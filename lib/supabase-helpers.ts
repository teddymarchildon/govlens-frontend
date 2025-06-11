/**
 * Supabase client helpers for Next.js App Router
 * 
 * Use these helpers to ensure you're using the correct client for your context:
 * - createClient() - Smart default that works in most cases
 * - createBrowserSupabaseClient() - Explicitly for browser/client components
 * - createServerSupabaseClient() - Explicitly for server components/routes
 */

import { createBrowserSupabaseClient } from './supabase'
import { createServerSupabaseClient } from './supabase-server'

/**
 * Smart client creator that works in both server and client contexts
 * For client components and browser code
 */
export function createClient() {
  // This will only be imported in client components due to 'use client'
  return createBrowserSupabaseClient()
}

// Re-export for explicit usage
export { createBrowserSupabaseClient, createServerSupabaseClient }