# The Flood Archivist

A short terminal-style text adventure. You are the city archivist of Vellmouth,
and the sea is coming up the streets. Decide what to carry out before the
water — and the boat at the pier — leave without you.

## Play

Open `index.html` in a browser, or serve the folder and visit it. No build
step, no dependencies — it's plain HTML/CSS/JS.

```
python3 -m http.server
```

## Deploying to GitHub Pages

This folder is self-contained (`index.html`, `style.css`, `game.js`). To
publish it as its own GitHub Pages site:

1. Create a new repository (e.g. `the-flood-archivist`).
2. Copy the contents of this folder into the repository root.
3. Push to `main`, then enable GitHub Pages for that branch in the
   repository's Settings → Pages.

Alternatively, if you'd rather keep it inside an existing repo, GitHub Pages
can also serve from a subdirectory via a `docs/` folder or a dedicated
`gh-pages` branch — point Pages at whichever path holds these three files.

## Commands

`look`, `go <place>`, `take <item>` / `take all`, `drop <item>`, `inventory`,
`examine <item>`, `read <item>`, `talk <person>`, `status`, `unlock`,
`evacuate`, `wait`, `save`, `load`, `restart`, `help`.
