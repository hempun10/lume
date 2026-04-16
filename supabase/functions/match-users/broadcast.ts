import type { BroadcastPayload } from "./types.ts";

/**
 * Send a `matched` broadcast to a user's personal realtime channel.
 * Returns true on 2xx from the Realtime REST API.
 */
export async function broadcastMatch(
  supabaseUrl: string,
  serviceRoleKey: string,
  userId: string,
  payload: BroadcastPayload,
): Promise<boolean> {
  try {
    const res = await fetch(`${supabaseUrl}/realtime/v1/api/broadcast`, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            topic: `match:${userId}`,
            event: "matched",
            payload,
          },
        ],
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "<unreadable>");
      console.error(
        `Broadcast to ${userId} failed: status=${res.status} body=${body}`,
      );
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Broadcast to ${userId} failed:`, err);
    return false;
  }
}
