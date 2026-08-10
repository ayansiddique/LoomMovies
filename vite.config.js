import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import handler from './api/get-hindi-stream.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-middleware',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url && req.url.startsWith('/api/get-hindi-stream')) {
            try {
              const mockReq = {
                url: req.url,
                headers: req.headers
              };
              const mockRes = {
                setHeader(name, value) {
                  res.setHeader(name, value);
                },
                status(code) {
                  res.statusCode = code;
                  return this;
                },
                writeHead(code, headers) {
                  res.writeHead(code, headers);
                  return this;
                },
                json(data) {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                },
                end(data) {
                  res.end(data);
                }
              };
              await handler(mockReq, mockRes);
            } catch (error) {
              console.error("Vite API Middleware Error:", error);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: error.message }));
            }
            return;
          }
          next();
        });
      }
    }
  ],
})
