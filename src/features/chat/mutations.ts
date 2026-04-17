import { supabase } from "@/lib/supabase/client";

export const REPORT_REASONS = [
	{ value: "harassment", label: "Harassment or bullying" },
	{ value: "nudity", label: "Nudity or sexual content" },
	{ value: "spam", label: "Spam or scam" },
	{ value: "underage", label: "Underage user" },
	{ value: "hate_speech", label: "Hate speech" },
	{ value: "self_harm", label: "Self-harm or suicide" },
	{ value: "other", label: "Other" },
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number]["value"];

/**
 * File a report against a user. `notes` is optional free-text (max 1000 chars,
 * enforced by the DB check constraint). Moderators review these off-platform;
 * we do not take automated action on multiple reports.
 */
export async function reportUser({
	reporterId,
	reportedId,
	roomId,
	reason,
	notes,
}: {
	reporterId: string;
	reportedId: string;
	roomId: string | null;
	reason: ReportReason;
	notes?: string;
}) {
	const { error } = await supabase.from("reports").insert({
		reporter_id: reporterId,
		reported_id: reportedId,
		room_id: roomId,
		reason,
		notes: notes?.trim() || null,
	});
	if (error) throw error;
}

/**
 * Block a user. This is a one-way action in the DB, but the matchmaker treats
 * blocks as symmetric — if either side blocks, they never match again and
 * neither knows they've been blocked.
 */
export async function blockUser({
	blockerId,
	blockedId,
}: {
	blockerId: string;
	blockedId: string;
}) {
	const { error } = await supabase
		.from("blocks")
		.insert({ blocker_id: blockerId, blocked_id: blockedId });
	// Ignore unique-violation (already blocked) — idempotent from UI's POV.
	if (error && error.code !== "23505") throw error;
}

/** Remove a block. Safe to call even if the row doesn't exist. */
export async function unblockUser({
	blockerId,
	blockedId,
}: {
	blockerId: string;
	blockedId: string;
}) {
	const { error } = await supabase
		.from("blocks")
		.delete()
		.eq("blocker_id", blockerId)
		.eq("blocked_id", blockedId);
	if (error) throw error;
}
