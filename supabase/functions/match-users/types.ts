export interface QueueEntry {
  id: string;
  user_id: string;
  interests: string[];
  status: string;
  created_at: string;
}

export interface ProfileData {
  id: string;
  gender: string | null;
  date_of_birth: string | null;
  region: string | null;
}

export interface EnrichedEntry extends QueueEntry {
  profile: ProfileData | null;
}

export interface MatchPair {
  userA: EnrichedEntry;
  userB: EnrichedEntry;
  score: number;
}

export interface BroadcastPayload {
  room_id: string;
  partner_id: string;
}

export interface RunMetrics {
  queueDepth: number;
  pairsMade: number;
  pairsSkipped: number;
  expiredCount: number;
  retryCount: number;
  durationMs: number;
}
