# Release assembly (maintainers)

```bash
npm run build
node packaging/assemble.mjs
cd release && zip -r -X APIForge-X-v1.0.0.zip APIForge-X
```

Screenshots live in `packaging/Assets/`. Buyer-facing package README is `PACKAGE-README.md`.
