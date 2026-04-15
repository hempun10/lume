import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/theme-context";

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();

	function toggle() {
		setTheme(theme === "dark" ? "light" : "dark");
	}

	return (
		<button
			type="button"
			onClick={toggle}
			className="relative flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
			aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
			suppressHydrationWarning
		>
			<Sun className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
			<Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
		</button>
	);
}
