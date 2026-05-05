import type { EmailProvider } from "passmark";

const DEFAULT_MAILPIT_URL = "http://127.0.0.1:54324";
const SIX_DIGIT = /\b(\d{6})\b/;

interface MailpitMessageSummary {
	ID: string;
	From: { Address: string; Name?: string };
	To: { Address: string; Name?: string }[];
	Subject: string;
	Created: string;
}

interface MailpitMessageDetail {
	ID: string;
	Subject: string;
	Text: string;
	HTML: string;
}

interface MailpitMessagesList {
	messages: MailpitMessageSummary[];
}

/**
 * Email provider for Passmark backed by Supabase's local Mailpit (the inbox
 * embedded in `supabase start`). Polls Mailpit's JSON API for the latest
 * message addressed to `recipient`, then returns the requested value.
 *
 * For prompts containing "code" / "otp" / "verification" we extract a 6-digit
 * sequence from the email body. Otherwise we return the full text body and
 * let Passmark's AI extractor narrow it down.
 *
 * Pass `Mailpit-URL=http://...` (or set `MAILPIT_URL`) to point at a remote
 * Mailpit; defaults to the Supabase CLI default port 54324.
 */
export function mailpitProvider(opts?: {
	baseUrl?: string;
	timeoutMs?: number;
	pollIntervalMs?: number;
}): EmailProvider {
	const baseUrl =
		opts?.baseUrl ?? process.env.MAILPIT_URL ?? DEFAULT_MAILPIT_URL;
	const timeoutMs = opts?.timeoutMs ?? 15_000;
	const pollIntervalMs = opts?.pollIntervalMs ?? 500;

	return {
		// Mailpit catches mail for ANY domain — Supabase Auth uses the user's
		// real email, so this is informational only and not used by us when we
		// pass an explicit recipient via {{email.<key>:<prompt>:<recipient>}}.
		domain: "example.com",
		extractContent: async ({ email, prompt }) => {
			const message = await waitForLatestMessage({
				baseUrl,
				recipient: email,
				timeoutMs,
				pollIntervalMs,
			});

			const wantsOtp = /code|otp|verification|token/i.test(prompt);
			if (wantsOtp) {
				const match = SIX_DIGIT.exec(message.Text) ?? SIX_DIGIT.exec(message.HTML);
				if (match) return match[1];
			}

			// Fall back to the full text body — caller's prompt is descriptive
			// enough for Passmark's AI extractor to pick the right value.
			return message.Text || message.HTML;
		},
	};
}

async function waitForLatestMessage(args: {
	baseUrl: string;
	recipient: string;
	timeoutMs: number;
	pollIntervalMs: number;
}): Promise<MailpitMessageDetail> {
	const { baseUrl, recipient, timeoutMs, pollIntervalMs } = args;
	const deadline = Date.now() + timeoutMs;
	const recipientLower = recipient.toLowerCase();

	let lastError: unknown;
	while (Date.now() < deadline) {
		try {
			const list = await fetchJson<MailpitMessagesList>(
				`${baseUrl}/api/v1/messages?limit=50`,
			);
			const match = list.messages.find((m) =>
				m.To.some((t) => t.Address.toLowerCase() === recipientLower),
			);
			if (match) {
				return await fetchJson<MailpitMessageDetail>(
					`${baseUrl}/api/v1/message/${match.ID}`,
				);
			}
		} catch (err) {
			lastError = err;
		}
		await new Promise((r) => setTimeout(r, pollIntervalMs));
	}

	throw new Error(
		`mailpitProvider: no message for "${recipient}" within ${timeoutMs}ms` +
			(lastError ? ` (last error: ${(lastError as Error).message})` : ""),
	);
}

async function fetchJson<T>(url: string): Promise<T> {
	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(`mailpitProvider: ${res.status} ${res.statusText} for ${url}`);
	}
	return (await res.json()) as T;
}
