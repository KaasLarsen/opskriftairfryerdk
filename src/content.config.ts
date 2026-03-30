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
		heroImage: z.union([
			z.string().url(),
			z.string().regex(/^\//, 'Brug absolut URL eller sti fra rod (/)'),
		]),
		heroAlt: z.string(),
		prepMinutes: z.number(),
		cookMinutes: z.number(),
		servings: z.string(),
		calories: z.string().optional(),
		category: z.string(),
		cuisine: z.string().default('Dansk'),
		keywords: z.array(z.string()),
		temperatureC: z.number().optional(),
		ingredients: z.array(z.object({ text: z.string() })),
		instructions: z.array(z.object({ text: z.string() })),
		tips: z.array(z.string()).optional(),
		faq: z
			.array(z.object({ question: z.string(), answer: z.string() }))
			.optional(),
		featured: z.boolean().optional(),
	}),
});

export const collections = { recipes };
