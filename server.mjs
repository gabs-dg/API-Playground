import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url)).replace(/[\\/]$/, "");
let port = Number(process.env.PORT ?? 3000);
let hasLoggedStartup = false;
const mimeTypes = {
	".css": "text/css; charset=utf-8",
	".html": "text/html; charset=utf-8",
	".js": "text/javascript; charset=utf-8",
	".json": "application/json; charset=utf-8",
	".png": "image/png",
	".svg": "image/svg+xml",
};

function sendJson(response, status, body) {
	response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
	response.end(JSON.stringify(body));
}

async function proxyRequest(request, response) {
	try {
		const chunks = [];
		for await (const chunk of request) chunks.push(chunk);
		const config = JSON.parse(Buffer.concat(chunks).toString("utf8"));
		const target = new URL(config.url);

		if (!["http:", "https:"].includes(target.protocol)) {
			throw new Error("A URL precisa usar http ou https.");
		}

		for (const [key, value] of Object.entries(config.params ?? {})) {
			if (key) target.searchParams.append(key, String(value));
		}

		const headers = new Headers(config.headers ?? {});
		if (config.auth?.type === "bearer" && config.auth.token) {
			headers.set("Authorization", `Bearer ${config.auth.token}`);
		}
		if (config.auth?.type === "basic") {
			const credentials = Buffer.from(`${config.auth.username ?? ""}:${config.auth.password ?? ""}`).toString("base64");
			headers.set("Authorization", `Basic ${credentials}`);
		}
		if (config.auth?.type === "api-key" && config.auth.name && config.auth.value) {
			headers.set(config.auth.name, config.auth.value);
		}

		const method = String(config.method ?? "GET").toUpperCase();
		const upstream = await fetch(target, {
			method,
			headers,
			body: !["GET", "HEAD"].includes(method) && config.body ? config.body : undefined,
		});
		const contentType = upstream.headers.get("content-type") ?? "";
		const text = await upstream.text();
		let data = text;

		if (text && contentType.includes("json")) {
			try {
				data = JSON.parse(text);
			} catch {
				data = text;
			}
		}

		sendJson(response, 200, {
			status: upstream.status,
			statusText: upstream.statusText,
			ok: upstream.ok,
			data,
		});
	} catch (error) {
		sendJson(response, 400, {
			status: 0,
			statusText: "Proxy Error",
			ok: false,
			data: error instanceof Error ? error.message : "Erro desconhecido no proxy.",
		});
	}
}

async function serveStatic(request, response) {
	const requestedPath = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
	const relativePath = requestedPath === "/" ? "index.html" : requestedPath.slice(1);
	const filePath = normalize(join(root, relativePath));

	if (!filePath.startsWith(root + sep)) {
		response.writeHead(403);
		response.end("Forbidden");
		return;
	}

	try {
		const fileStats = await stat(filePath);
		if (!fileStats.isFile()) throw new Error("Not a file");
		response.writeHead(200, {
			"Content-Type": mimeTypes[extname(filePath)] ?? "application/octet-stream",
			"Cache-Control": "no-store",
		});
		response.end(await readFile(filePath));
	} catch {
		response.writeHead(404);
		response.end("Not found");
	}
}

const server = createServer((request, response) => {
	if (request.method === "POST" && request.url === "/api/proxy") {
		proxyRequest(request, response);
		return;
	}
	serveStatic(request, response);
});

function listen() {
	server.once("error", (error) => {
		if (error.code !== "EADDRINUSE") throw error;
		port += 1;
		listen();
	});
	server.listen(port, () => {
		if (hasLoggedStartup) return;
		hasLoggedStartup = true;
		process.stdout.write(`API Playground disponível em http://localhost:${port}\n`);
	});
}

listen();
