import { Flag, Loader2 } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/features/auth";
import {
	blockUser,
	REPORT_REASONS,
	type ReportReason,
	reportUser,
} from "../mutations";

interface ReportDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	reportedUserId: string;
	roomId: string | null;
	/** Called after a successful submit. Useful for e.g. ending the chat. */
	onSubmitted?: () => void;
}

export function ReportDialog({
	open,
	onOpenChange,
	reportedUserId,
	roomId,
	onSubmitted,
}: ReportDialogProps) {
	const { user } = useAuth();
	const notesId = useId();
	const blockCheckboxId = useId();
	const reasonGroupId = useId();
	const [reason, setReason] = useState<ReportReason | null>(null);
	const [notes, setNotes] = useState("");
	const [alsoBlock, setAlsoBlock] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	function resetAndClose() {
		setReason(null);
		setNotes("");
		setAlsoBlock(true);
		setError(null);
		setIsSubmitting(false);
		onOpenChange(false);
	}

	async function handleSubmit() {
		if (!user || !reason) return;
		setIsSubmitting(true);
		setError(null);
		try {
			await reportUser({
				reporterId: user.id,
				reportedId: reportedUserId,
				roomId,
				reason,
				notes,
			});
			if (alsoBlock) {
				await blockUser({ blockerId: user.id, blockedId: reportedUserId });
			}
			onSubmitted?.();
			resetAndClose();
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Something went wrong. Try again.",
			);
			setIsSubmitting(false);
		}
	}

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => !isSubmitting && onOpenChange(next)}
		>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Flag className="h-4 w-4 text-destructive" />
						Report this user
					</DialogTitle>
					<DialogDescription>
						Reports are reviewed by our moderation team. The reported user is
						not notified.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="space-y-2">
						<Label>What happened?</Label>
						<RadioGroup
							value={reason ?? ""}
							onValueChange={(v) => setReason(v as ReportReason)}
							className="gap-2"
						>
							{REPORT_REASONS.map((r) => (
								<div key={r.value} className="flex items-center gap-2">
									<RadioGroupItem
										value={r.value}
										id={`${reasonGroupId}-${r.value}`}
									/>
									<Label
										htmlFor={`${reasonGroupId}-${r.value}`}
										className="text-sm font-normal cursor-pointer"
									>
										{r.label}
									</Label>
								</div>
							))}
						</RadioGroup>
					</div>

					<div className="space-y-2">
						<Label htmlFor={notesId}>
							Additional details{" "}
							<span className="text-muted-foreground">(optional)</span>
						</Label>
						<Textarea
							id={notesId}
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							placeholder="Share any context that might help our team review this report."
							maxLength={1000}
							rows={3}
						/>
						<p className="text-xs text-muted-foreground text-right">
							{notes.length}/1000
						</p>
					</div>

					<div className="flex items-center gap-2">
						<Checkbox
							id={blockCheckboxId}
							checked={alsoBlock}
							onCheckedChange={(v) => setAlsoBlock(v === true)}
						/>
						<Label
							htmlFor={blockCheckboxId}
							className="text-sm font-normal cursor-pointer"
						>
							Also block this user so you never match again
						</Label>
					</div>

					{error && (
						<p className="text-sm text-destructive" role="alert">
							{error}
						</p>
					)}
				</div>

				<DialogFooter>
					<Button
						variant="ghost"
						onClick={resetAndClose}
						disabled={isSubmitting}
					>
						Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={handleSubmit}
						disabled={!reason || isSubmitting}
					>
						{isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
						Submit report
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
