import { Loader2, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
	fetchTrending,
	type GifResult,
	isGiphyConfigured,
	searchGifs,
} from "../lib/giphy";

interface GifPickerProps {
	onSelect: (gif: GifResult) => void;
}

/**
 * Popover body for picking a GIF. Opens on trending results and
 * debounces the search field so we don't hammer Giphy while the user
 * is still typing. Fetches are aborted on unmount / new query to avoid
 * stale-result flicker.
 */
export function GifPicker({ onSelect }: GifPickerProps) {
	const configured = isGiphyConfigured();
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<GifResult[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	useEffect(() => {
		if (!configured) {
			setLoading(false);
			return;
		}

		const controller = new AbortController();
		const debounce = window.setTimeout(
			() => {
				setLoading(true);
				setError(null);
				const task = query.trim()
					? searchGifs(query, controller.signal)
					: fetchTrending(controller.signal);
				task
					.then((data) => setResults(data))
					.catch((err: unknown) => {
						if ((err as { name?: string }).name === "AbortError") return;
						setError("Couldn't load GIFs. Try again.");
					})
					.finally(() => setLoading(false));
			},
			query ? 300 : 0,
		);

		return () => {
			controller.abort();
			window.clearTimeout(debounce);
		};
	}, [query, configured]);

	if (!configured) {
		return (
			<div className="flex h-[320px] w-[320px] items-center justify-center p-4 text-center text-xs text-muted-foreground">
				GIFs are disabled — set{" "}
				<code className="mx-1 rounded bg-muted px-1 py-0.5 font-mono">
					VITE_GIPHY_API_KEY
				</code>{" "}
				in your env to enable.
			</div>
		);
	}

	return (
		<div className="flex h-[360px] w-[320px] flex-col">
			<div className="relative border-b border-border/60 p-2">
				<Search className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
				<input
					ref={inputRef}
					type="search"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Search GIFs…"
					className="w-full rounded-md border border-input bg-transparent py-1.5 pl-7 pr-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
				/>
			</div>
			<div className="min-h-0 flex-1 overflow-y-auto p-1.5">
				{loading ? (
					<div className="flex h-full items-center justify-center text-muted-foreground">
						<Loader2 className="h-4 w-4 animate-spin" />
					</div>
				) : error ? (
					<div className="flex h-full items-center justify-center px-4 text-center text-xs text-muted-foreground">
						{error}
					</div>
				) : results.length === 0 ? (
					<div className="flex h-full items-center justify-center px-4 text-center text-xs text-muted-foreground">
						No GIFs found.
					</div>
				) : (
					<div className="columns-2 gap-1.5 [column-fill:_balance]">
						{results.map((gif) => (
							<button
								key={gif.id}
								type="button"
								onClick={() => onSelect(gif)}
								className="mb-1.5 block w-full overflow-hidden rounded-md border border-transparent bg-muted transition-colors hover:border-primary/60 focus-visible:border-primary focus-visible:outline-none"
								aria-label={gif.title ?? "Select GIF"}
							>
								<img
									src={gif.previewUrl}
									alt={gif.title ?? ""}
									width={gif.width}
									height={gif.height}
									loading="lazy"
									className="h-auto w-full"
								/>
							</button>
						))}
					</div>
				)}
			</div>
			<div className="border-t border-border/60 px-3 py-1.5 text-right">
				<span className="text-[10px] uppercase tracking-wide text-muted-foreground">
					Powered by GIPHY
				</span>
			</div>
		</div>
	);
}
