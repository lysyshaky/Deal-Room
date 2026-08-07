import "dotenv/config";
import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes";

const dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const app = express();
  // Generous limit: accepted proposals post the signature as a PNG data URL.
  app.use(express.json({ limit: "5mb" }));

  registerRoutes(app);

  const server = http.createServer(app);

  if (process.env.NODE_ENV === "production") {
    const publicDir = path.resolve(dirname, "..", "dist", "public");
    app.use(express.static(publicDir));
    app.get("*", (_req, res) => res.sendFile(path.join(publicDir, "index.html")));
  } else {
    // Dev: Vite serves the client in middleware mode on the same port (Replit-friendly).
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: { server } },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  const port = Number(process.env.PORT) || 5000;
  server.listen(port, "0.0.0.0", () => {
    console.log(`Deal Room running at http://0.0.0.0:${port}`);
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      console.log("Supabase env vars missing — the app will show the setup screen. See README.");
    }
  });
}

main();
