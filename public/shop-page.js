/**
 * Shop: søgning + filtre. Klassifikation skal matche scripts/shop-airfryer-classify.mjs
 */
(function () {
	const AIRFRYER_CONTEXT = new RegExp(
		[
			'air[- ]?fry(?:er)?',
			'\\bairfryers?\\b',
			'varmluftsfriture',
			'varmluft\\s+friture',
			'varmluftsovn',
			'airovn',
			'airoven',
			'hot[- ]air',
			'dual[- ]?zone',
			'\\b(?:easy|xl|xxl)[- ]fry',
			'(?:crisp|crisper).{0,16}(?:fry|frit)',
			'fry.{0,12}(?:crisp|crisper)',
			'foodi',
			'\\bvortex\\b',
			'\\bcosori\\b',
			'actifry',
			'philips.{0,40}(?:air[- ]?fry|airfry|essential|hd9\\d)',
			'tefal.{0,35}(?:easy[- ]?fry|fry|actifry|ultimate)',
			'moulinex.{0,35}(?:easy|fry|uno)',
			'instant\\s+pot.{0,25}vortex',
			'ninja.{0,30}(?:air|foodi|fry|grill|speedi|dual|max|crisp)',
			'gourmia',
			'emerio.{0,20}(?:aaf|fry|air)',
			'russell\\s+hobbs.{0,30}(?:cyclofry|satisfry|air[- ]?fry)',
			'kenwood.{0,25}(?:hfp|air[- ]?fry)',
		].join('|'),
		'i',
	);

	const AIR_SIGNAL = new RegExp(
		[
			'\\bair[- ]?fry(?:er)?s?\\b',
			'\\bairfry',
			'\\bvarmluft',
			'hot[- ]air',
			'\\bairovn\\b',
			'\\bfoodi\\b',
			'\\bvortex\\b',
			'dual[- ]?zone',
		].join('|'),
		'i',
	);

	function excludeFromAirfryerShop(hay) {
		if (/\b(fedtfriture|oliefriture)\b/i.test(hay)) return true;
		if (/\bdeep[- ]fat\b/i.test(hay)) return true;
		if (
			/\b(?:(?:mini|mini[- ])?frituregryde|friture gryde|fritös|friteuse)\b/i.test(hay) &&
			!AIR_SIGNAL.test(hay)
		) {
			return true;
		}
		if (
			/\b(bageovn|stegeovn|induktionsovn|indbygningsovn|pyrolyse|komfur|induktionskomfur)\b/i.test(
				hay,
			) &&
			!AIR_SIGNAL.test(hay)
		) {
			return true;
		}
		if (/\bvarmluftsovn\b/i.test(hay) && !AIR_SIGNAL.test(hay)) return true;
		if (/\bel[- ]?ovn\b/i.test(hay) && !AIR_SIGNAL.test(hay)) return true;
		return false;
	}

	const MAIN_UNIT = new RegExp(
		[
			'\\bair[- ]?fry(?:er)?s?\\b',
			'\\bvarmluftsfriture\\b',
			'hot[- ]air',
			'\\bairovn\\b',
			'foodi',
			'vortex',
			'philips.{0,40}(?:air[- ]?fry|airfry|hd9\\d)',
			'ninja.{0,30}(?:air|foodi|dual|max|crisp|grill)',
			'tefal.{0,35}(?:easy|actifry)',
			'\\bcosori\\b',
			'instant.{0,20}vortex',
			'actifry',
			'\\b(?:easy|xl|xxl)[- ]fry',
		].join('|'),
		'i',
	);

	function strongAccessoryIntent(hay) {
		return /\b(pergament|bagepapir|parchment|reservedel|erstatning|erstatnings|replacement|tilbehørspakke|kurv\s+til|rist\s+til|indsats\s+til|original\s*(?:kurv|del))\b/i.test(
			hay,
		);
	}

	function tilbehorMedDel(hay) {
		return (
			/\btilbeh[oø]r\b/i.test(hay) &&
			/(kurv|indsats|pergament|bagepapir|rist|liner|basket|dobbeltkurv|snackkurv|grillrist|måtte|spyd|papir)/i.test(
				hay,
			)
		);
	}

	const ACCESSORY_MARKER = new RegExp(
		[
			'\\btilbeh[oø]r\\b',
			'pergament',
			'bagepapir',
			'silikone',
			'silicone(?:\\s|$)',
			'\\bindsats\\b',
			'dampindsats',
			'grillrist',
			'\\bkurvrist\\b',
			'(?:^|[^\\p{L}\\p{N}])kurv(?:[^\\p{L}\\p{N}]|$)',
			'kurv\\s+til',
			'\\bbasket\\b',
			'\\bliner\\b',
			'\\bmåtte\\b',
			'silikone[- ]?måtte',
			'bage[- ]?måtte',
			'non[- ]?stick(?:\\s+(?:mat|måtte))?',
			'parchment',
			'spyd',
			'dobbeltkurv',
			'multi[- ]kurv',
			'snackkurv',
			'divider',
			'separator',
			'reservedel',
			'papirkurve',
			'\\bforme\\s+til\\b',
			'oliesprayer',
			'til\\s+(?:din\\s+)?air[- ]?fry',
			'for\\s+air[- ]?fryer',
			'mods?tning',
			'trådkurv',
			'netkurv',
		].join('|'),
		'iu',
	);

	function shelfHay(p) {
		return `${p.title || ''} ${p.category || ''} ${p.brand || ''}`.trim();
	}

	function shelfOf(p) {
		const hay = shelfHay(p);
		if (!hay) return 'other';
		if (!AIRFRYER_CONTEXT.test(hay)) return 'other';
		if (excludeFromAirfryerShop(hay)) return 'other';
		if (tilbehorMedDel(hay)) return 'accessory';
		if (MAIN_UNIT.test(hay) && !strongAccessoryIntent(hay)) return 'airfryer';
		if (ACCESSORY_MARKER.test(hay)) return 'accessory';
		return 'airfryer';
	}

	function esc(s) {
		return String(s)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/"/g, '&quot;');
	}

	function formatDk(n) {
		if (n == null || typeof n !== 'number') return '';
		try {
			return new Intl.NumberFormat('da-DK', {
				style: 'currency',
				currency: 'DKK',
				maximumFractionDigits: 0,
			}).format(n);
		} catch {
			return String(n);
		}
	}

	function cardHtml(p) {
		const img = p.imageUrl
			? `<div class="recipe-card-image"><img src="${esc(p.imageUrl)}" alt="${esc(p.title)}" width="640" height="400" loading="lazy" decoding="async" /></div>`
			: `<div class="recipe-card-image recipe-card-image--placeholder"><div class="recipe-placeholder-inner"><span class="recipe-placeholder-label">Intet billede</span></div></div>`;
		const brand = p.brand
			? `<div class="recipe-card-badges"><span class="recipe-card-badge">${esc(p.brand)}</span></div>`
			: '';
		const priceStr = formatDk(p.price);
		const onSale = p.price != null && p.listPrice != null && p.listPrice > p.price;
		const meta = priceStr
			? `${onSale ? `Tilbud ${priceStr}` : priceStr}${p.category ? ` · ${esc(p.category)}` : ''}`
			: 'Pris hos forhandler';
		const butik = (p.retailer || '').trim();
		const cta = butik ? `Se hos ${esc(butik)}` : 'Se hos butikken';
		return `<a class="recipe-card" href="${esc(p.productUrl)}" target="_blank" rel="sponsored noopener noreferrer">${img}<div class="recipe-card-body">${brand}<h3>${esc(p.title)}</h3><div class="recipe-meta-row"><span>${meta}</span></div><p>${cta}</p></div></a>`;
	}

	const root = document.querySelector('[data-shop-page]');
	if (!root) return;

	const input = root.querySelector('#shop-search-input');
	const results = root.querySelector('#shop-search-results');
	const hint = root.querySelector('[data-shop-hint]');
	const chips = root.querySelectorAll('[data-shop-scope]');
	const filtersWrap = root.querySelector('[data-shop-filters]');
	const priceMinEl = root.querySelector('#shop-price-min');
	const priceMaxEl = root.querySelector('#shop-price-max');
	const capMinEl = root.querySelector('#shop-cap-min');
	const capMaxEl = root.querySelector('#shop-cap-max');
	const colorEl = root.querySelector('#shop-color-filter');
	const brandBoxes = root.querySelector('#shop-brand-boxes');
	const resetBtn = root.querySelector('#shop-filter-reset');

	if (!(input instanceof HTMLInputElement) || !(results instanceof HTMLElement)) return;

	let products = [];
	let scope = 'all';
	let t = 0;
	let brandSet = new Set();

	function setScope(next) {
		scope = next;
		for (const b of chips) {
			if (!(b instanceof HTMLButtonElement)) continue;
			const s = b.getAttribute('data-shop-scope') || '';
			const active = s === scope;
			b.classList.toggle('shop-chip--active', active);
			b.setAttribute('aria-pressed', active ? 'true' : 'false');
		}
		render();
	}

	function matchesScope(p) {
		if (scope === 'all') return true;
		const s = shelfOf(p);
		if (scope === 'airfryer') return s === 'airfryer';
		if (scope === 'accessory') return s === 'accessory';
		return true;
	}

	function numOrNull(el) {
		if (!(el instanceof HTMLInputElement) || !el.value.trim()) return null;
		const n = Number.parseFloat(el.value.replace(',', '.'));
		return Number.isFinite(n) ? n : null;
	}

	function activeBrands() {
		const s = new Set();
		if (!brandBoxes) return s;
		for (const lab of brandBoxes.querySelectorAll('input[type="checkbox"]')) {
			if (lab instanceof HTMLInputElement && lab.checked && lab.value) s.add(lab.value);
		}
		return s;
	}

	function filtersActive() {
		const brands = activeBrands();
		return (
			numOrNull(/** @type {HTMLInputElement} */ (priceMinEl)) != null ||
			numOrNull(/** @type {HTMLInputElement} */ (priceMaxEl)) != null ||
			numOrNull(/** @type {HTMLInputElement} */ (capMinEl)) != null ||
			numOrNull(/** @type {HTMLInputElement} */ (capMaxEl)) != null ||
			(colorEl instanceof HTMLInputElement && colorEl.value.trim() !== '') ||
			brands.size > 0
		);
	}

	function productMatchesFilters(p) {
		const pMin = numOrNull(/** @type {HTMLInputElement} */ (priceMinEl));
		const pMax = numOrNull(/** @type {HTMLInputElement} */ (priceMaxEl));
		const cMin = numOrNull(/** @type {HTMLInputElement} */ (capMinEl));
		const cMax = numOrNull(/** @type {HTMLInputElement} */ (capMaxEl));
		const brands = activeBrands();

		if (brands.size > 0) {
			const b = (p.brand || '').trim();
			if (!b || !brands.has(b)) return false;
		}
		if (pMin != null && (p.price == null || p.price < pMin)) return false;
		if (pMax != null && (p.price == null || p.price > pMax)) return false;
		const cap = typeof p.capacityLiters === 'number' ? p.capacityLiters : null;
		if (cMin != null && (cap == null || cap < cMin)) return false;
		if (cMax != null && (cap == null || cap > cMax)) return false;
		if (colorEl instanceof HTMLInputElement && colorEl.value.trim()) {
			const needle = colorEl.value.trim().toLowerCase();
			const col = (p.color || '').toLowerCase();
			const t = `${p.title} ${col}`.toLowerCase();
			if (!t.includes(needle)) return false;
		}
		return true;
	}

	function textMatch(p, q) {
		if (!q) return true;
		const hay = `${p.title || ''} ${p.brand || ''} ${p.category || ''}`.toLowerCase();
		return hay.includes(q);
	}

	function buildBrandFilters() {
		if (!brandBoxes) return;
		brandBoxes.innerHTML = '';
		const names = [...brandSet].sort((a, b) => a.localeCompare(b, 'da', { sensitivity: 'base' }));
		for (const name of names) {
			const id = `shop-brand-${hashId(name)}`;
			const lab = document.createElement('label');
			lab.className = 'shop-brand-label';
			const cb = document.createElement('input');
			cb.type = 'checkbox';
			cb.value = name;
			cb.id = id;
			lab.appendChild(cb);
			lab.appendChild(document.createTextNode(' ' + name));
			brandBoxes.appendChild(lab);
		}
	}

	function hashId(s) {
		let h = 0;
		for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
		return Math.abs(h).toString(36);
	}

	function render() {
		const q = input.value.trim().toLowerCase();
		if (!products.length) {
			results.innerHTML = '';
			results.hidden = true;
			return;
		}

		const showGrid = q.length > 0 || filtersActive();

		const filtered = products.filter(
			(p) => matchesScope(p) && productMatchesFilters(p) && textMatch(p, q),
		);

		if (!showGrid) {
			results.innerHTML = '';
			results.hidden = true;
			if (hint instanceof HTMLElement) hint.hidden = false;
			return;
		}

		if (hint instanceof HTMLElement) hint.hidden = true;
		results.hidden = false;

		if (filtered.length === 0) {
			results.innerHTML =
				'<p class="shop-no-results">Ingen produkter matchede filtre eller søgning. Prøv at nulstille eller søge bredere.</p>';
			return;
		}
		results.innerHTML = filtered.slice(0, 80).map(cardHtml).join('');
	}

	for (const b of chips) {
		b.addEventListener('click', () => {
			const s = b.getAttribute('data-shop-scope') || 'all';
			setScope(s);
		});
	}

	input.addEventListener('input', () => {
		window.clearTimeout(t);
		t = window.setTimeout(render, 200);
	});

	for (const el of [priceMinEl, priceMaxEl, capMinEl, capMaxEl, colorEl]) {
		if (el instanceof HTMLInputElement) el.addEventListener('input', render);
	}
	if (resetBtn instanceof HTMLButtonElement) {
		resetBtn.addEventListener('click', () => {
			for (const el of [priceMinEl, priceMaxEl, capMinEl, capMaxEl, colorEl]) {
				if (el instanceof HTMLInputElement) el.value = '';
			}
			if (brandBoxes) {
				for (const cb of brandBoxes.querySelectorAll('input[type="checkbox"]')) {
					if (cb instanceof HTMLInputElement) cb.checked = false;
				}
			}
			render();
		});
	}
	if (brandBoxes) {
		brandBoxes.addEventListener('change', () => render());
	}

	fetch('/data/shop-products.json')
		.then((r) => r.json())
		.then((data) => {
			products = Array.isArray(data.products) ? data.products : [];
			brandSet = new Set();
			for (const p of products) {
				const b = (p.brand || '').trim();
				if (b) brandSet.add(b);
			}
			buildBrandFilters();
			if (filtersWrap instanceof HTMLElement && products.length > 0) filtersWrap.hidden = false;
			render();
		})
		.catch(() => {
			products = [];
		});
})();
