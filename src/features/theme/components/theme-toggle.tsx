import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "../context/theme-context";

export function ThemeToggle() {
	const { theme, setTheme, mounted } = useTheme();

	function cycle() {
		if (theme === "light") setTheme("dark");
		else if (theme === "dark") setTheme("system");
		else setTheme("light");
	}

	// Render a fixed placeholder until mounted to avoid hydration mismatch.
	// Both server and client will render Monitor (system) on the first pass.
	const displayTheme = mounted ? theme : "system";

	return (
		<button
			type="button"
			onClick={cycle}
			className="flex items-center justify-center rounded-xl p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
			aria-label={`Current theme: ${displayTheme}. Click to switch.`}
			title={`Theme: ${displayTheme}`}
		>
			{displayTheme === "light" && <Sun className="h-4 w-4" />}
			{displayTheme === "dark" && <Moon className="h-4 w-4" />}
			{displayTheme === "system" && <Monitor className="h-4 w-4" />}
		</button>
	);
}
