/**
 * Flere [data-site-search] på samme side (header + forsiden). Én init pr. root.
 */
(function () {
	function normalize(s) {
		return String(s)
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '');
	}

	function escapeHtml(str) {
		return String(str)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;');
	}

	function initSiteSearch(root) {
		if (!(root instanceof HTMLElement)) return;
		if (root.getAttribute('data-site-search-inited') === '1') return;
		root.setAttribute('data-site-search-inited', '1');

		const input = root.querySelector('[data-site-search-q]');
		const panel = root.querySelector('[data-site-search-panel]');
		if (!(input instanceof HTMLInputElement) || !(panel instanceof HTMLElement)) return;

		let index = [];
		let loaded = false;

		async function loadIndex() {
			if (loaded) return;
			try {
				const res = await fetch('/search-index.json');
				if (!res.ok) throw new Error(String(res.status));
				index = await res.json();
				loaded = true;
			} catch {
				index = [];
				loaded = true;
			}
		}

		function matches(item, q) {
			const nq = normalize(q);
			if (!nq) return false;
			if (normalize(item.title).includes(nq)) return true;
			if (normalize(item.description).includes(nq)) return true;
			if (normalize(item.category).includes(nq)) return true;
			if (Array.isArray(item.keywords)) {
				for (const k of item.keywords) {
					if (normalize(k).includes(nq)) return true;
				}
			}
			return false;
		}

		function renderResults(q) {
			const trimmed = q.trim();
			if (trimmed.length < 2) {
				panel.hidden = true;
				panel.innerHTML = '';
				input.setAttribute('aria-expanded', 'false');
				return;
			}
			const hits = index.filter((item) => matches(item, trimmed)).slice(0, 8);
			if (hits.length === 0) {
				panel.hidden = false;
				panel.innerHTML =
					'<p class="site-search-empty" role="presentation">Ingen resultater fundet.</p>';
				input.setAttribute('aria-expanded', 'true');
				return;
			}
			const links = hits
				.map((item) => {
					const href =
						item.kind === 'review' ? `/anmeldelser/${item.slug}` : `/opskrifter/${item.slug}`;
					return `<a role="option" class="site-search-hit" href="${href}">${escapeHtml(item.title)}<span class="site-search-hit-meta">${escapeHtml(item.category)}</span></a>`;
				})
				.join('');
			panel.innerHTML = links;
			panel.hidden = false;
			input.setAttribute('aria-expanded', 'true');
		}

		let t;
		input.addEventListener('focus', () => {
			loadIndex().then(() => renderResults(input.value));
		});
		input.addEventListener('input', () => {
			clearTimeout(t);
			t = setTimeout(() => {
				loadIndex().then(() => renderResults(input.value));
			}, 120);
		});

		document.addEventListener('click', (e) => {
			if (e.target instanceof Node && !root.contains(e.target)) {
				panel.hidden = true;
				input.setAttribute('aria-expanded', 'false');
			}
		});

		input.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') {
				panel.hidden = true;
				input.setAttribute('aria-expanded', 'false');
				input.blur();
			}
		});
	}

	function scan() {
		document.querySelectorAll('[data-site-search]').forEach((el) => initSiteSearch(el));
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', scan);
	} else {
		scan();
	}
})();
