import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	resolvedTheme: "light" | "dark";
	/** `false` during SSR and until the first client-side effect runs. */
	mounted: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
	theme: "system",
	setTheme: () => {},
	resolvedTheme: "light",
	mounted: false,
});

const STORAGE_KEY = "lume-theme";

function getSystemTheme(): "light" | "dark" {
	if (typeof window === "undefined") return "light";
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

function resolveTheme(theme: Theme): "light" | "dark" {
	if (theme === "system") return getSystemTheme();
	return theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
	// Always start with "system" so server and client produce identical HTML.
	// The real stored preference is read in the mount effect below.
	const [theme, setThemeState] = useState<Theme>("system");
	const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
	const [mounted, setMounted] = useState(false);

	function setTheme(newTheme: Theme) {
		setThemeState(newTheme);
		localStorage.setItem(STORAGE_KEY, newTheme);
	}

	// Read the stored theme on mount (client-only) to avoid hydration mismatch
	useEffect(() => {
		const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
		if (stored) {
			setThemeState(stored);
		}
		setMounted(true);
	}, []);

	// Apply .dark class to <html> and update resolved theme
	useEffect(() => {
		const root = document.documentElement;
		const resolved = resolveTheme(theme);
		setResolvedTheme(resolved);

		if (resolved === "dark") {
			root.classList.add("dark");
		} else {
			root.classList.remove("dark");
		}

		// Update theme-color meta tag
		const meta = document.querySelector('meta[name="theme-color"]');
		if (meta) {
			meta.setAttribute("content", resolved === "dark" ? "#0a0a0a" : "#ffffff");
		}
	}, [theme]);

	// Listen for system theme changes when in "system" mode
	useEffect(() => {
		if (theme !== "system") return;

		const mql = window.matchMedia("(prefers-color-scheme: dark)");
		function handler() {
			const resolved = resolveTheme("system");
			setResolvedTheme(resolved);
			const root = document.documentElement;
			if (resolved === "dark") {
				root.classList.add("dark");
			} else {
				root.classList.remove("dark");
			}

			const meta = document.querySelector('meta[name="theme-color"]');
			if (meta) {
				meta.setAttribute(
					"content",
					resolved === "dark" ? "#0a0a0a" : "#ffffff",
				);
			}
		}

		mql.addEventListener("change", handler);
		return () => mql.removeEventListener("change", handler);
	}, [theme]);

	return (
		<ThemeContext.Provider value={{ theme, setTheme, resolvedTheme, mounted }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
}
