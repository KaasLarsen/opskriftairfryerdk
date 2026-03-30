import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let browserClient: SupabaseClient | null = null;

/** Browser-klient med session i localStorage (statisk site). */
export function getSupabase(): SupabaseClient {
	if (browserClient) return browserClient;

	const url = import.meta.env.PUBLIC_SUPABASE_URL;
	const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

	if (!url?.trim() || !anonKey?.trim()) {
		throw new Error(
			'Manglende PUBLIC_SUPABASE_URL eller PUBLIC_SUPABASE_ANON_KEY. Tjek .env og genstart dev-server.',
		);
	}

	browserClient = createClient(url, anonKey, {
		auth: {
			persistSession: true,
			autoRefreshToken: true,
			detectSessionInUrl: true,
			flowType: 'pkce',
		},
	});

	return browserClient;
}

export function isSupabaseConfigured(): boolean {
	const url = import.meta.env.PUBLIC_SUPABASE_URL;
	const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
	return Boolean(url?.trim() && anonKey?.trim());
}
