import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = true;

export const GET: APIRoute = async () => {
	const recipes = await getCollection('recipes');
	const body = recipes.map((r) => ({
		slug: r.id,
		title: r.data.title,
		description: r.data.description,
		category: r.data.category,
		keywords: r.data.keywords,
	}));

	return new Response(JSON.stringify(body), {
		headers: {
			'Content-Type': 'application/json; charset=utf-8',
			'Cache-Control': 'public, max-age=3600',
		},
	});
};
