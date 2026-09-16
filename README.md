# London Founder Programmes

A searchable directory of London accelerators, university founder schemes and public pathways. Research currency: August 2026.

The complete programme list is the original repo dataset in `1-programmes-9318b0b6.ts`. The app imports that file directly and does not subset or rewrite it.

## Run locally

```bash
npm install
npm run dev
```

Then open the printed local URL (with the GitHub Pages base path).

```bash
npm run typecheck
npm test
npm run build
```

## What you can do

- Search and filter the directory; state is stored in the URL
- Outcomes tab: alumni evidence actually present in the notes, with UNKNOWN/N/A counts
- Local assistant: deterministic scan of the embedded dataset only (no cloud LLM)
- Compare up to four programmes
- About the data: currency, count, limitations — not automatic freshness
