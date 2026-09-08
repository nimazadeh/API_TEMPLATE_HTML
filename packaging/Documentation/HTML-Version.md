# HTML production package

`HTML-Version/` is the output of `vite build` with `base: './'`.

## Guarantees

- No Node, npm, or Vite on the server
- CSS, JS, and fonts are inside `assets/`
- Script and stylesheet URLs are relative
- Demo data is bundled; no API keys or secrets are required

## Do not

- Delete or rename hashed files in `assets/`
- Mix files from an old build with a new one
- Expect PHP includes or a backend

## Updating after source changes

From `Source-Version`:

```bash
npm install
npm run build
```

Replace `HTML-Version/` with the contents of `dist/`.
