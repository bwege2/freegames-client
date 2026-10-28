import { defineConfig } from 'vite';

// The server (server/, Java) serves the built site in production; in development Vite serves it and
// proxies the WebSocket and the WebTransport announcement (WebTransport itself goes straight to its UDP port).
const SERVER = `localhost:${process.env.SERVER_PORT ?? 8790}`;
const server = {
  '/ws': { target: `ws://${SERVER}`, ws: true },
  '/wt-info': { target: `http://${SERVER}` },
};

export default defineConfig({
  base: './',
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 2000,
    rollupOptions: { input: { main: 'index.html' } },
  },
  server: { port: 5290, proxy: server },
  preview: { proxy: server },
});
