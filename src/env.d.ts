/// <reference types="astro/client" />

declare module '../../scripts/shop-airfryer-classify.mjs' {
	export function classifyShopProductBase(p: {
		title?: string;
		category?: string;
		brand?: string;
	}): 'airfryer' | 'accessory' | 'other';
	export function isAirfryerShopRelevant(p: {
		title?: string;
		category?: string;
		brand?: string;
	}): boolean;
}

interface ImportMetaEnv {
	readonly PUBLIC_SUPABASE_URL: string;
	readonly PUBLIC_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
