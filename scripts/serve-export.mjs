// Local production-export server for browser verification, including Vercel headers.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
const root = resolve("out");
const { headers } = JSON.parse(await readFile("vercel.json", "utf8"));
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".ttf": "font/ttf",
  ".woff2": "font/woff2",
};
createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    const file = resolve(root, "." + pathname);
    if (file !== root && !file.startsWith(root + sep)) {
      res.writeHead(403).end();
      return;
    }
    let chosen;
    for (const candidate of [
      file,
      file + ".html",
      resolve(file, "index.html"),
    ]) {
      try {
        if ((await stat(candidate)).isFile()) {
          chosen = candidate;
          break;
        }
      } catch {}
    }
    const status = chosen ? 200 : 404;
    chosen ??= resolve(root, "404.html");
    for (const header of headers[0].headers)
      res.setHeader(header.key, header.value);
    res.setHeader(
      "Content-Type",
      types[extname(chosen)] ?? "application/octet-stream",
    );
    res.setHeader("Cache-Control", "no-store");
    res.writeHead(status);
    res.end(req.method === "HEAD" ? undefined : await readFile(chosen));
  } catch {
    res.writeHead(500).end();
  }
}).listen(3100, "127.0.0.1", () =>
  console.log("Production export on http://localhost:3100"),
);
