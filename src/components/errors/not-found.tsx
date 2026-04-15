import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotFoundProps {
	title?: string;
	message?: string;
}

export function NotFound({
	title = "Page not found",
	message = "The page you're looking for doesn't exist or has been moved.",
}: NotFoundProps) {
	return (
		<div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-4">
			<div className="text-center space-y-4 max-w-md">
				<FileQuestion className="mx-auto size-12 text-muted-foreground" />
				<h1 className="text-2xl font-bold">{title}</h1>
				<p className="text-muted-foreground">{message}</p>
				<Button asChild>
					<a href="/">Go home</a>
				</Button>
			</div>
		</div>
	);
}
