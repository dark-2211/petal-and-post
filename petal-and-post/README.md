# Petal & Post

A responsive floral and gift boutique storefront built with plain HTML, CSS, and JavaScript.

## Open it

1. Extract the entire ZIP.
2. Open `index.html` in a modern browser. Keep `styles.css`, `app.js`, and the `assets` folder next to it.
3. Search by flower or gift name, switch categories, sort the results, and add products to the bag.

No packages, API keys, or internet connection are required. If your browser blocks local storage for files opened directly, the bag still works for the current visit. To test reload persistence reliably, run `python -m http.server 8000` inside the extracted folder and visit http://localhost:8000.

## What to edit

- `index.html` — landmark structure, navigation, hero, shop controls, and bag dialog.
- `styles.css` — page styling, responsive product grid, Flexbox for smaller groups, and focus states.
- `app.js` — sample catalog, category and search filtering, sorting, and cart quantities.
- `assets/` — bundled WebP floral and gift imagery.

Prices and ratings are sample data. The bag is client-side only. No order, payment, or shipping service is connected.

CSS Grid reference: [A Complete Guide to CSS Grid](https://css-tricks.com/snippets/css/complete-guide-grid/).
