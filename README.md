# Notion connection replacement files

Replace these files in your local project:

- `api/notion-sync.ts`
- `vite.config.mts`
- `src/App.tsx`
- `.env.example` optional

## .env.local

Create or update `.env.local` in the project root:

```env
NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Use `NOTION_DATABASE_ID` first. Do not include `NOTION_DATA_SOURCE_ID` unless you know you have a Notion Data Source ID.

## Restart

After replacing files and saving `.env.local`, restart the dev server:

```bash
Ctrl+C
npm run dev
```

## What changed

- Fixed the env loading issue caused by reading `process.env` too early.
- Supports raw Notion IDs or full Notion URLs.
- Tries the Notion database endpoint if a database ID was accidentally entered as a data source ID.
- Stops defaulting blank Sequencing values into `3`.
- Only records with explicit `Sequencing` values of `1`, `2`, or `3` appear in the release timeline.
- If Notion connects but no sequenced records are found, the app no longer falls back to sample data.
