import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { SignupSuccessProps } from "../types";

export function SignupSuccess({ email, onBackToLogin }: SignupSuccessProps) {
	return (
		<div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-2xl">Check your email</CardTitle>
					<CardDescription>
						We've sent a confirmation link to <strong>{email}</strong>.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Alert>
						<AlertDescription>
							Click the link in your email to activate your account.
							{import.meta.env.DEV && (
								<>
									{" "}
									Local dev: check Mailpit at{" "}
									<a
										href="http://127.0.0.1:54324"
										target="_blank"
										rel="noreferrer"
										className="underline font-medium"
									>
										http://127.0.0.1:54324
									</a>
								</>
							)}
						</AlertDescription>
					</Alert>
				</CardContent>
				<CardFooter>
					<button
						type="button"
						onClick={onBackToLogin}
						className="text-sm text-muted-foreground hover:underline"
					>
						Back to login
					</button>
				</CardFooter>
			</Card>
		</div>
	);
}
