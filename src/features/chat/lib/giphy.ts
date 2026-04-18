/**
 * Minimal Giphy v1 API client.
 *
 * We hit the trending and search endpoints and extract a single
 * rendering variant (`fixed_width`) which keeps payloads small and
 * dimensions predictable for chat bubbles. Keys are read from Vite env;
 * if the key is missing we fail gracefully (returns empty results) so
 * the picker shows an explanatory message instead of crashing.
 */
import type { GifAttachment } from "../types";

const GIPHY_ENDPOINT = "https://api.giphy.com/v1/gifs";

interface GiphyImageVariant {
	url: string;
	width: string;
	height: string;
}

interface GiphyGif {
	id: string;
	title: string;
	images: {
		fixed_width: GiphyImageVariant;
		fixed_width_small?: GiphyImageVariant;
		original: GiphyImageVariant;
	};
}

interface GiphyResponse {
	data: GiphyGif[];
}

export interface GifResult extends GifAttachment {
	id: string;
	previewUrl: string;
}

function getApiKey(): string | undefined {
	return (import.meta.env.VITE_GIPHY_API_KEY as string | undefined)?.trim();
}

export function isGiphyConfigured(): boolean {
	return Boolean(getApiKey());
}

function mapGif(g: GiphyGif): GifResult {
	const preview = g.images.fixed_width_small ?? g.images.fixed_width;
	return {
		id: g.id,
		url: g.images.fixed_width.url,
		previewUrl: preview.url,
		width: Number.parseInt(g.images.fixed_width.width, 10) || 200,
		height: Number.parseInt(g.images.fixed_width.height, 10) || 200,
		title: g.title || undefined,
	};
}

async function fetchFromGiphy(
	path: "trending" | "search",
	params: Record<string, string>,
	signal?: AbortSignal,
): Promise<GifResult[]> {
	const key = getApiKey();
	if (!key) return [];

	const url = new URL(`${GIPHY_ENDPOINT}/${path}`);
	url.searchParams.set("api_key", key);
	url.searchParams.set("limit", "24");
	url.searchParams.set("rating", "pg-13");
	url.searchParams.set("bundle", "messaging_non_clips");
	for (const [k, v] of Object.entries(params)) {
		url.searchParams.set(k, v);
	}

	const res = await fetch(url.toString(), { signal });
	if (!res.ok) {
		throw new Error(`Giphy ${path} failed: ${res.status}`);
	}
	const json = (await res.json()) as GiphyResponse;
	return json.data.map(mapGif);
}

export function fetchTrending(signal?: AbortSignal): Promise<GifResult[]> {
	return fetchFromGiphy("trending", {}, signal);
}

export function searchGifs(
	query: string,
	signal?: AbortSignal,
): Promise<GifResult[]> {
	const trimmed = query.trim();
	if (!trimmed) return fetchTrending(signal);
	return fetchFromGiphy("search", { q: trimmed }, signal);
}
