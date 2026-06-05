import { defineConfig, loadEnv, type ViteDevServer, type PreviewServer } from 'vite';
import react from '@vitejs/plugin-react';
import { fetchPublishedReleasesFromNotion } from './api/notion-sync';

function installReleasesRoute(server: ViteDevServer | PreviewServer) {
  server.middlewares.use('/api/releases', async (req, res) => {
    if (req.method !== 'GET') {
      res.statusCode = 405;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }

    try {
      const releases = await fetchPublishedReleasesFromNotion();
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ source: 'notion', releases }));
    } catch (error) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        source: 'notion',
        releases: [],
        error: error instanceof Error ? error.message : 'Unable to fetch Notion releases.'
      }));
    }
  });
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Make server-only env variables available to the Vite middleware.
  // Keep existing process.env values if the user starts Vite with `node --env-file`.
  process.env.NOTION_TOKEN = process.env.NOTION_TOKEN ?? env.NOTION_TOKEN;
  process.env.NOTION_DATA_SOURCE_ID = process.env.NOTION_DATA_SOURCE_ID ?? env.NOTION_DATA_SOURCE_ID;
  process.env.NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID ?? env.NOTION_DATABASE_ID;
  process.env.NOTION_VERSION = process.env.NOTION_VERSION ?? env.NOTION_VERSION ?? '2022-06-28';

  return {
    plugins: [
      react(),
      {
        name: 'release-comms-api',
        configureServer(server) {
          installReleasesRoute(server);
        },
        configurePreviewServer(server) {
          installReleasesRoute(server);
        }
      }
    ]
  };
});
