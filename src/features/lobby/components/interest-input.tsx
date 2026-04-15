import { X } from "lucide-react";
import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { INTEREST_OPTIONS } from "@/features/onboarding/schema";

interface InterestInputProps {
	interests: string[];
	onChange: (interests: string[]) => void;
	maxInterests?: number;
}

export function InterestInput({
	interests,
	onChange,
	maxInterests = 5,
}: InterestInputProps) {
	const [inputValue, setInputValue] = useState("");
	const [showSuggestions, setShowSuggestions] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const availableSuggestions = INTEREST_OPTIONS.filter(
		(opt) =>
			!interests.includes(opt) &&
			opt.toLowerCase().includes(inputValue.toLowerCase()),
	);

	function addInterest(interest: string) {
		if (interests.length >= maxInterests) return;
		if (interests.includes(interest)) return;
		onChange([...interests, interest]);
		setInputValue("");
		setShowSuggestions(false);
		inputRef.current?.focus();
	}

	function removeInterest(interest: string) {
		onChange(interests.filter((i) => i !== interest));
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === "Enter" && inputValue.trim()) {
			e.preventDefault();
			addInterest(inputValue.trim());
		}
		if (e.key === "Backspace" && !inputValue && interests.length > 0) {
			removeInterest(interests[interests.length - 1]);
		}
	}

	return (
		<div className="space-y-2">
			<div className="flex flex-wrap gap-1.5">
				{interests.map((interest) => (
					<Badge
						key={interest}
						variant="secondary"
						className="gap-1 pr-1 text-xs"
					>
						{interest}
						<button
							type="button"
							onClick={() => removeInterest(interest)}
							className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10"
						>
							<X className="h-3 w-3" />
							<span className="sr-only">Remove {interest}</span>
						</button>
					</Badge>
				))}
			</div>

			{interests.length < maxInterests && (
				<div className="relative">
					<input
						ref={inputRef}
						type="text"
						value={inputValue}
						onChange={(e) => {
							setInputValue(e.target.value);
							setShowSuggestions(true);
						}}
						onFocus={() => setShowSuggestions(true)}
						onBlur={() => {
							// Delay to allow click on suggestion
							setTimeout(() => setShowSuggestions(false), 150);
						}}
						onKeyDown={handleKeyDown}
						placeholder={
							interests.length === 0
								? "Add interests to find better matches..."
								: "Add more..."
						}
						className="h-8 w-full rounded-md border border-input bg-transparent px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
					/>

					{showSuggestions && availableSuggestions.length > 0 && (
						<div className="absolute z-10 mt-1 max-h-32 w-full overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-md">
							{availableSuggestions.slice(0, 6).map((suggestion) => (
								<button
									key={suggestion}
									type="button"
									onMouseDown={(e) => e.preventDefault()}
									onClick={() => addInterest(suggestion)}
									className="w-full rounded-sm px-2 py-1.5 text-left text-sm text-popover-foreground hover:bg-accent"
								>
									{suggestion}
								</button>
							))}
						</div>
					)}
				</div>
			)}

			<p className="text-xs text-muted-foreground">
				{interests.length}/{maxInterests} interests
				{interests.length === 0 && " — optional, skip for random matching"}
			</p>
		</div>
	);
}
