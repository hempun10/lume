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
}

const ThemeContext = createContext<ThemeContextValue>({
	theme: "system",
	setTheme: () => {},
	resolvedTheme: "light",
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
	const [theme, setThemeState] = useState<Theme>(() => {
		if (typeof window === "undefined") return "system";
		return (localStorage.getItem(STORAGE_KEY) as Theme) || "system";
	});

	const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() =>
		resolveTheme(theme),
	);

	function setTheme(newTheme: Theme) {
		setThemeState(newTheme);
		localStorage.setItem(STORAGE_KEY, newTheme);
	}

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
		<ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
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
