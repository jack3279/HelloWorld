import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_ROOT = path.resolve(__dirname, "../assets");
const GAME_INDEX = path.resolve(__dirname, "../public/game/index.html");

const MIME: Record<string, string> = {
  ".svg": "image/svg+xml; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

function serveGameIndex(req: IncomingMessage, res: ServerResponse, next: () => void) {
  const url = req.url?.split("?")[0] ?? "";
  if (url === "/game") {
    res.statusCode = 302;
    res.setHeader("Location", "/game/");
    res.end();
    return;
  }
  if (url !== "/game/") return next();
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  fs.createReadStream(GAME_INDEX).pipe(res);
}

function serveRepoAssets(req: IncomingMessage, res: ServerResponse, next: () => void) {
  const url = req.url?.split("?")[0] ?? "";
  if (!url.startsWith("/repo-assets/")) return next();

  const rel = decodeURIComponent(url.slice("/repo-assets/".length));
  if (!rel || rel.includes("\0") || path.isAbsolute(rel)) {
    res.statusCode = 403;
    res.end();
    return;
  }

  const resolved = path.resolve(ASSETS_ROOT, rel);
  const root = path.resolve(ASSETS_ROOT);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    res.statusCode = 403;
    res.end();
    return;
  }

  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
    res.statusCode = 404;
    res.end("not found");
    return;
  }

  const ext = path.extname(resolved).toLowerCase();
  res.statusCode = 200;
  res.setHeader("Content-Type", MIME[ext] ?? "application/octet-stream");
  res.setHeader("Cache-Control", "public, max-age=30");
  fs.createReadStream(resolved).pipe(res);
}

/** Serve the repo `assets/` folder at `/repo-assets/` for the HTML game demo. */
export function repoAssetsPlugin(): Plugin {
  return {
    name: "repo-assets",
    configureServer(server) {
      server.middlewares.use(serveGameIndex);
      server.middlewares.use(serveRepoAssets);
    },
    configurePreviewServer(server) {
      server.middlewares.use(serveGameIndex);
      server.middlewares.use(serveRepoAssets);
    },
  };
}
