import { getSupabase, isSupabaseConfigured } from '../lib/supabase.client';

const TABLE = 'saved_recipes';

function setPressed(btn: HTMLButtonElement, on: boolean) {
	btn.setAttribute('aria-pressed', on ? 'true' : 'false');
	btn.setAttribute('aria-label', on ? 'Fjern gemt opskrift' : 'Gem opskrift');
	btn.classList.toggle('recipe-favorite-btn--saved', on);
}

async function syncSavedState(btn: HTMLButtonElement, supabase: ReturnType<typeof getSupabase>) {
	const recipeSlug = btn.dataset.recipeId;
	if (!recipeSlug) return;

	const {
		data: { session },
	} = await supabase.auth.getSession();
	if (!session?.user) {
		setPressed(btn, false);
		return;
	}

	const { data, error } = await supabase
		.from(TABLE)
		.select('id')
		.eq('user_id', session.user.id)
		.eq('recipe_slug', recipeSlug)
		.maybeSingle();

	if (error) {
		console.warn('saved_recipes læsning:', error.message);
		return;
	}
	setPressed(btn, Boolean(data));
}

function wireButton(btn: HTMLButtonElement, supabase: ReturnType<typeof getSupabase>) {
	if (btn.dataset.favoriteWired === '1') return;
	btn.dataset.favoriteWired = '1';

	void syncSavedState(btn, supabase);

	btn.addEventListener('click', async (e) => {
		e.preventDefault();
		e.stopPropagation();

		const recipeSlug = btn.dataset.recipeId;
		if (!recipeSlug) return;

		const {
			data: { session },
		} = await supabase.auth.getSession();
		if (!session?.user) {
			const next = encodeURIComponent(window.location.pathname + window.location.search);
			window.location.href = `/login?next=${next}`;
			return;
		}

		const userId = session.user.id;
		const pressed = btn.getAttribute('aria-pressed') === 'true';

		if (pressed) {
			const { error } = await supabase
				.from(TABLE)
				.delete()
				.eq('user_id', userId)
				.eq('recipe_slug', recipeSlug);
			if (error) {
				console.warn('Kunne ikke fjerne gemt opskrift:', error.message);
				return;
			}
			setPressed(btn, false);
			return;
		}

		const { error } = await supabase.from(TABLE).insert({
			user_id: userId,
			recipe_slug: recipeSlug,
		});
		if (error) {
			console.warn('Kunne ikke gemme opskrift:', error.message);
			return;
		}
		setPressed(btn, true);
	});
}

let authHooked = false;

export function initRecipeFavorites() {
	if (!isSupabaseConfigured()) return;

	let supabase: ReturnType<typeof getSupabase>;
	try {
		supabase = getSupabase();
	} catch {
		return;
	}

	const buttons = document.querySelectorAll<HTMLButtonElement>('[data-recipe-favorite]');
	if (buttons.length === 0) return;

	for (const btn of buttons) {
		wireButton(btn, supabase);
	}

	if (!authHooked) {
		authHooked = true;
		supabase.auth.onAuthStateChange(() => {
			document.querySelectorAll<HTMLButtonElement>('[data-recipe-favorite]').forEach((b) => {
				void syncSavedState(b, supabase);
			});
		});
	}
}

function run() {
	initRecipeFavorites();
}

if (typeof document !== 'undefined') {
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', run);
	} else {
		run();
	}
}
