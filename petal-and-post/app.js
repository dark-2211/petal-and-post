'use strict';

const products = [
  { id: 'rose', name: 'The Sunday Rose', category: 'bouquets', label: 'Bouquet', price: 4250, rating: 4.9, reviews: 36, badge: 'Best seller', photo: 'rose', alt: 'Blush garden roses wrapped in pink paper', keywords: 'pink birthday rose' },
  { id: 'green', name: 'Soft Morning', category: 'bouquets', label: 'Bouquet', price: 3850, rating: 4.8, reviews: 24, photo: 'green', alt: 'Ivory lisianthus and green foliage in cream wrapping', keywords: 'white green lisianthus thank you' },
  { id: 'amber', name: 'Amber Hour', category: 'arrangements', label: 'Arrangement', price: 5600, rating: 4.9, reviews: 18, badge: 'Seasonal', photo: 'amber', alt: 'Orange ranunculus and burgundy dahlias in glass', keywords: 'orange ranunculus dahlia vase autumn' },
  { id: 'gift', name: 'The Little Pick-Me-Up', category: 'gifts', label: 'Gift box', price: 3200, rating: 4.7, reviews: 21, photo: 'gift', alt: 'Open gift box with a candle, chocolates and pink ribbon', keywords: 'candle chocolate gift box birthday' },
  { id: 'red', name: 'Love Letter', category: 'bouquets', label: 'Bouquet', price: 4900, rating: 4.9, reviews: 29, photo: 'red', alt: 'Deep red roses wrapped in kraft paper', keywords: 'red rose anniversary romance' },
  { id: 'studio', name: 'The Studio Bouquet', category: 'arrangements', label: 'Arrangement', price: 5950, rating: 5.0, reviews: 12, photo: 'hero', alt: 'Peach roses and burgundy dahlias in an off-white ceramic vase', keywords: 'pink peach rose ranunculus dahlia vase' }
];

const prices = new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 });
const price = value => prices.format(value);
const findProduct = id => products.find(product => product.id === id);
const select = selector => document.querySelector(selector);
const grid = select('#products');
const search = select('#search');
const sort = select('#sort');
const shop = select('#shop');
const dialog = select('#bag');
const bagButton = select('#open-bag');
const bagItems = select('#bag-items');
const storageKey = 'petal-post-bag-v1';
let category = 'all';
let toastTimeout;

function readBag() {
  try {
    const data = JSON.parse(localStorage.getItem(storageKey) || '{}');
    return Object.fromEntries(products.flatMap(({ id }) =>
      Number.isInteger(data?.[id]) && data[id] > 0 ? [[id, Math.min(data[id], 99)]] : []
    ));
  } catch {
    return {};
  }
}
const bag = readBag();

function renderProducts() {
  const terms = search.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const visible = products.filter(product => {
    const matchesCategory = category === 'all'
      || (category === 'flowers' ? product.category !== 'gifts' : category === product.category);
    const searchable = [product.name, product.category, product.label, product.keywords].join(' ').toLowerCase();
    return matchesCategory && terms.every(term => searchable.includes(term));
  });

  if (sort.value === 'low') visible.sort((a, b) => a.price - b.price);
  if (sort.value === 'high') visible.sort((a, b) => b.price - a.price);
  if (sort.value === 'rating') visible.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);

  // Markup is built only from the fixed catalog. Search text is never inserted as HTML.
  grid.innerHTML = visible.map(product => `
    <article class="card">
      <div class="card-photo">
        <img src="assets/${product.photo}.webp" alt="${product.alt}" loading="lazy">
        ${product.badge ? `<span class="tag">${product.badge}</span>` : ''}
      </div>
      <div class="card-meta">
        <span>${product.label}</span>
        <span class="rating"><span class="sr-only">Rated </span><b aria-hidden="true">★</b> ${product.rating.toFixed(1)}<span class="sr-only"> out of 5, </span> (${product.reviews}<span class="sr-only"> reviews</span>)</span>
      </div>
      <h3>${product.name}</h3>
      <div class="card-buy">
        <p class="price">${price(product.price)}</p>
        <button class="add" type="button" data-add="${product.id}" aria-label="Add ${product.name} to bag">Add <span aria-hidden="true">+</span></button>
      </div>
    </article>`).join('');
  select('#result-count').textContent = `${visible.length} ${visible.length === 1 ? 'item' : 'items'}`;
  select('#no-results').hidden = visible.length > 0;
  document.querySelectorAll('.chips button').forEach(button =>
    button.setAttribute('aria-pressed', String(button.dataset.category === category))
  );
}

function renderBag() {
  const entries = Object.entries(bag);
  const count = entries.reduce((sum, [, quantity]) => sum + quantity, 0);
  const subtotal = entries.reduce((sum, [id, quantity]) => sum + findProduct(id).price * quantity, 0);
  select('#bag-count').textContent = count;
  bagButton.setAttribute('aria-label', `Open bag, ${count} ${count === 1 ? 'item' : 'items'}`);
  select('#subtotal').textContent = price(subtotal);
  select('#bag-empty').hidden = entries.length > 0;
  select('#bag-summary').hidden = entries.length === 0;
  bagItems.innerHTML = entries.map(([id, quantity]) => {
    const p = findProduct(id);
    return `<li class="bag-row" data-id="${id}">
      <img src="assets/${p.photo}.webp" alt="">
      <div><h3>${p.name}</h3>
        <div class="qty">
          <button type="button" data-action="minus" aria-label="Decrease quantity of ${p.name}">−</button>
          <span aria-label="Quantity ${quantity}">${quantity}</span>
          <button type="button" data-action="plus" aria-label="Increase quantity of ${p.name}" ${quantity >= 99 ? 'disabled' : ''}>+</button>
          <button type="button" class="remove" data-action="remove" aria-label="Remove ${p.name}">Remove</button>
        </div>
      </div>
      <strong class="price">${price(p.price * quantity)}</strong>
    </li>`;
  }).join('');
}

function setQuantity(id, quantity) {
  if (quantity < 1) delete bag[id];
  else bag[id] = Math.min(quantity, 99);
  try {
    localStorage.setItem(storageKey, JSON.stringify(bag));
  } catch {
    // The bag still works for this visit if storage is disabled.
  }
  renderBag();
}

function notify(message) {
  const status = select('#announcement');
  status.textContent = message;
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => { status.textContent = ''; }, 2400);
}

grid.addEventListener('click', event => {
  const button = event.target.closest('[data-add]');
  if (!button) return;
  const id = button.dataset.add;
  if (bag[id] >= 99) return notify('Your bag already has 99 of this item.');
  setQuantity(id, (bag[id] || 0) + 1);
  notify(`${findProduct(id).name} added to your bag.`);
});

bagItems.addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const id = button.closest('.bag-row').dataset.id;
  const action = button.dataset.action;
  const index = Array.from(bagItems.children).findIndex(row => row.dataset.id === id);
  setQuantity(id, action === 'remove' ? 0 : bag[id] + (action === 'plus' ? 1 : -1));
  // Repainting the rows replaces their buttons. Keep keyboard focus inside the bag.
  const row = [...bagItems.children].find(item => item.dataset.id === id);
  const next = row?.querySelector(`[data-action="${action}"]:enabled`) ||
    row?.querySelector('button') || bagItems.children[Math.min(index, bagItems.children.length - 1)]?.querySelector('button');
  (next || select('#continue')).focus();
});

document.querySelectorAll('[data-category]').forEach(control => control.addEventListener('click', () => {
  category = control.dataset.category;
  if (control.matches('a')) search.value = '';
  renderProducts();
}));
search.addEventListener('input', () => {
  category = 'all';
  renderProducts();
});
select('.search').addEventListener('submit', event => {
  event.preventDefault();
  shop.scrollIntoView();
});
sort.addEventListener('change', renderProducts);
select('#reset-filters').addEventListener('click', () => {
  search.value = '';
  category = 'all';
  sort.value = 'featured';
  renderProducts();
  select('.chips button').focus();
});

bagButton.addEventListener('click', () => dialog.showModal());
select('#close-bag').addEventListener('click', () => dialog.close());
select('#continue').addEventListener('click', () => {
  dialog.close();
  shop.scrollIntoView();
});
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right) dialog.close();
});
dialog.addEventListener('close', () => bagButton.focus({ preventScroll: true }));

renderProducts();
renderBag();
