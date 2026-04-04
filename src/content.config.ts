import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const recipes = defineCollection({
	loader: glob({
		base: './src/content/recipes',
		pattern: '**/*.md',
	}),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: z
			.union([
				z.string().url(),
				z.string().regex(/^\//, 'Brug absolut URL eller sti fra rod (/)'),
			])
			.optional(),
		heroAlt: z.string().optional(),
		prepMinutes: z.number(),
		cookMinutes: z.number(),
		servings: z.string(),
		calories: z.string().optional(),
		category: z.string(),
		cuisine: z.string().default('Dansk'),
		keywords: z.array(z.string()),
		temperatureC: z.number().optional(),
		intro: z.string().optional(),
		conclusion: z.string().optional(),
		ingredients: z.array(z.object({ text: z.string() })),
		instructions: z.array(z.object({ text: z.string() })),
		tips: z.array(z.string()).optional(),
		faq: z
			.array(z.object({ question: z.string(), answer: z.string() }))
			.optional(),
		featured: z.boolean().optional(),
	}),
});

const airfryerReviews = defineCollection({
	loader: glob({
		base: './src/content/airfryer-reviews',
		pattern: '**/*.md',
	}),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		/** Skal matche præcis `productUrl` i shop-products.json efter sync. */
		shopProductUrl: z.string().url(),
		feedProductId: z.string().optional(),
		pros: z.array(z.string()).min(3),
		cons: z.array(z.string()).min(2),
		/** 1–5 stjerner til schema.org Review (valgfri). */
		rating: z.number().int().min(1).max(5).optional(),
		verdict: z.string().optional(),
		heroImage: z
			.union([
				z.string().url(),
				z.string().regex(/^\//, 'Brug absolut URL eller sti fra rod (/)'),
			])
			.optional(),
		heroAlt: z.string().optional(),
	}),
});

export const collections = { recipes, airfryerReviews };
