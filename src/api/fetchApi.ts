export type AuthConfig =
	| { type: "none" }
	| { type: "bearer"; token: string }
	| { type: "basic"; username: string; password: string }
	| { type: "api-key"; name: string; value: string };

export interface RequestConfig {
	url: string;
	method: string;
	params: Record<string, string>;
	headers: Record<string, string>;
	body?: string;
	auth: AuthConfig;
}

export interface ApiResult {
	status: number;
	statusText: string;
	ok: boolean;
	data: unknown;
}

export async function fetchApi(config: RequestConfig): Promise<ApiResult> {
	const proxyResponse = await fetch("/api/proxy", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(config),
	});
	const result = (await proxyResponse.json()) as ApiResult;

	if (!proxyResponse.ok) {
		throw new Error(typeof result.data === "string" ? result.data : "Falha no proxy local");
	}

	return result;
}

