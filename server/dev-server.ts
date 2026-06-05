import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { fetchPublishedReleasesFromNotion } from '../api/notion-sync';

const port = Number(process.env.PORT ?? 5173);

async function startServer() {
  const app = express();

  app.get(['/api/releases', '/api/notion-sync'], async (_req, res) => {
    try {
      const releases = await fetchPublishedReleasesFromNotion();
      res.json({ source: 'notion', releases });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sync Notion releases.';
      res.status(500).json({ source: 'notion', releases: [], error: message });
    }
  });

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });

  app.use(vite.middlewares);

  app.listen(port, '0.0.0.0', () => {
    console.log(`Product dashboard running at http://localhost:${port}`);
  });
}

startServer().catch((error) => {
  console.error(error);
  process.exit(1);
});
