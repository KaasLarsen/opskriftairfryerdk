import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = true;

type SearchItem = {
	slug: string;
	title: string;
	description: string;
	category: string;
	keywords: string[];
	kind: 'recipe' | 'review';
};

export const GET: APIRoute = async () => {
	const [recipes, reviews] = await Promise.all([
		getCollection('recipes'),
		getCollection('airfryerReviews'),
	]);

	const recipeItems: SearchItem[] = recipes.map((r) => ({
		slug: r.id,
		title: r.data.title,
		description: r.data.description,
		category: r.data.category,
		keywords: r.data.keywords,
		kind: 'recipe',
	}));

	const reviewItems: SearchItem[] = reviews.map((r) => ({
		slug: r.id,
		title: r.data.title,
		description: r.data.description,
		category: 'Anmeldelse',
		keywords: [] as string[],
		kind: 'review',
	}));

	const body = [...recipeItems, ...reviewItems];

	return new Response(JSON.stringify(body), {
		headers: {
			'Content-Type': 'application/json; charset=utf-8',
			'Cache-Control': 'public, max-age=3600',
		},
	});
};
