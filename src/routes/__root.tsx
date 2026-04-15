import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Link,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Button } from "../components/ui/button";
import { TooltipProvider } from "../components/ui/tooltip";
import { AuthProvider } from "../features/auth/context/auth-context";
import { ThemeProvider } from "../features/theme";
import appCss from "../styles.css?url";

interface RouterContext {
	queryClient: QueryClient;
}

/**
 * Inline script injected into <head> to prevent flash of wrong theme (FOUC).
 * Runs before React hydrates — reads localStorage and applies .dark class immediately.
 * Only checks for "dark" — light is the default.
 */
const themeScript = `(function(){try{if(localStorage.getItem("lume-theme")==="dark"){document.documentElement.classList.add("dark")}}catch(e){}})();`;

const SITE_URL = "https://lume.chat";

export const Route = createRootRouteWithContext<RouterContext>()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: "Lume — Meet New People Through Chat & Games" },
			{
				name: "description",
				content:
					"Lume connects you with real people worldwide for spontaneous text chats and multiplayer games. Free, safe, and instant. The modern alternative to Omegle.",
			},
			{ name: "theme-color", content: "#ffffff" },
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: SITE_URL },
			{
				property: "og:title",
				content: "Lume — Meet New People Through Chat & Games",
			},
			{
				property: "og:description",
				content:
					"Lume connects you with real people worldwide for spontaneous text chats and multiplayer games. Free, safe, and instant.",
			},
			{ property: "og:image", content: `${SITE_URL}/og-image.png` },
			{ property: "og:image:type", content: "image/png" },
			{ property: "og:image:width", content: "1200" },
			{ property: "og:image:height", content: "630" },
			{
				property: "og:site_name",
				content: "Lume",
			},
			{ name: "twitter:card", content: "summary_large_image" },
			{
				name: "twitter:title",
				content: "Lume — Meet New People Through Chat & Games",
			},
			{
				name: "twitter:description",
				content:
					"Lume connects you with real people worldwide for spontaneous text chats and multiplayer games. Free, safe, and instant.",
			},
			{ name: "twitter:image", content: `${SITE_URL}/og-image.png` },
		],
		links: [
			{ rel: "preconnect", href: "https://rsms.me" },
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com",
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous",
			},
			{
				rel: "stylesheet",
				href: "https://rsms.me/inter/inter.css",
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap",
			},
			{ rel: "stylesheet", href: appCss },
			{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
			{ rel: "apple-touch-icon", href: "/logo192.svg" },
			{ rel: "manifest", href: "/manifest.json" },
		],
	}),
	shellComponent: RootDocument,
	notFoundComponent: NotFound,
});

function NotFound() {
	return (
		<div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
			<p className="font-mono text-6xl font-medium text-muted-foreground">
				404
			</p>
			<h1 className="text-2xl font-semibold tracking-tight text-foreground">
				Page not found
			</h1>
			<p className="max-w-md text-muted-foreground">
				The page you're looking for doesn't exist or has been moved.
			</p>
			<Button asChild className="mt-2 rounded-xl">
				<Link to="/">Back to home</Link>
			</Button>
		</div>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
				{/* biome-ignore lint/security/noDangerouslySetInnerHtml: static script to prevent theme FOUC */}
				<script dangerouslySetInnerHTML={{ __html: themeScript }} />
			</head>
			<body>
				<ThemeProvider>
					<AuthProvider>
						<TooltipProvider>
							{children}
							<TanStackDevtools
								config={{
									position: "bottom-right",
								}}
								plugins={[
									{
										name: "Tanstack Router",
										render: <TanStackRouterDevtoolsPanel />,
									},
								]}
							/>
							<Scripts />
						</TooltipProvider>
					</AuthProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
