import { defineConfig } from 'vite';

// The server (server/, Java) serves the built site in production; in development Vite serves it and
// proxies the WebSocket and the WebTransport announcement (WebTransport itself goes straight to its UDP port).
const SERVER = `localhost:${process.env.SERVER_PORT ?? 8790}`;
const server = {
  '/ws': { target: `ws://${SERVER}`, ws: true },
  '/wt-info': { target: `http://${SERVER}` },
};

// the server's pages are cross-origin isolated (SharedArrayBuffer for games whose threads wait on each other);
// the development server does the same
const headers = { 'Cross-Origin-Opener-Policy': 'same-origin', 'Cross-Origin-Embedder-Policy': 'require-corp' };

export default defineConfig({
  // the release being built (tools/deploy.sh sets RELEASE_TAG): a player's feedback names it
  define: { __RELEASE__: JSON.stringify(process.env.RELEASE_TAG || 'dev') },
  base: './',
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 2000,
    manifest: true,
    rollupOptions: { input: { main: 'index.html' } },
  },
  server: { port: 5290, proxy: server, headers },
  preview: { proxy: server, headers },
});
