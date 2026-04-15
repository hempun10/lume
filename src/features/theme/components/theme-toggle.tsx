import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "../context/theme-context";

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();

	function cycle() {
		if (theme === "light") setTheme("dark");
		else if (theme === "dark") setTheme("system");
		else setTheme("light");
	}

	return (
		<button
			type="button"
			onClick={cycle}
			className="flex items-center justify-center rounded-xl p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
			aria-label={`Current theme: ${theme}. Click to switch.`}
			title={`Theme: ${theme}`}
		>
			{theme === "light" && <Sun className="h-4 w-4" />}
			{theme === "dark" && <Moon className="h-4 w-4" />}
			{theme === "system" && <Monitor className="h-4 w-4" />}
		</button>
	);
}
