import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorPageProps {
	title?: string;
	message?: string;
	onRetry?: () => void;
}

export function ErrorPage({
	title = "Something went wrong",
	message = "An unexpected error occurred. Please try again.",
	onRetry,
}: ErrorPageProps) {
	return (
		<div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-4">
			<div className="text-center space-y-4 max-w-md">
				<AlertTriangle className="mx-auto size-12 text-destructive" />
				<h1 className="text-2xl font-bold">{title}</h1>
				<p className="text-muted-foreground">{message}</p>
				<div className="flex justify-center gap-3">
					{onRetry && (
						<Button onClick={onRetry} variant="outline">
							Try again
						</Button>
					)}
					<Button asChild>
						<a href="/">Go home</a>
					</Button>
				</div>
			</div>
		</div>
	);
}
