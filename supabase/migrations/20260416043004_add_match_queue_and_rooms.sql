-- Match queue: holds users waiting to be matched
CREATE TABLE match_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mode text NOT NULL CHECK (mode IN ('text', 'games')),
  interests text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'matched', 'cancelled', 'expired')),
  matched_with uuid REFERENCES auth.users(id),
  room_id uuid,
  notified boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Partial unique index: only one waiting entry per user at a time
CREATE UNIQUE INDEX match_queue_user_waiting_idx ON match_queue (user_id) WHERE status = 'waiting';

-- Index for Edge Function queries
CREATE INDEX match_queue_status_created_idx ON match_queue (status, created_at) WHERE status = 'waiting';

-- Rooms: shared by chat and game sessions
CREATE TABLE rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('chat', 'game')),
  game_type text,
  user_a uuid NOT NULL REFERENCES auth.users(id),
  user_b uuid NOT NULL REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended')),
  game_state jsonb,
  current_turn uuid,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz
);

-- Index for looking up active rooms by user
CREATE INDEX rooms_user_a_status_idx ON rooms (user_a, status);
CREATE INDEX rooms_user_b_status_idx ON rooms (user_b, status);

-- Auto-update updated_at on match_queue
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER match_queue_updated_at
  BEFORE UPDATE ON match_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE match_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Users can insert their own queue entries
CREATE POLICY "users_insert_own_queue" ON match_queue
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their own queue entries
CREATE POLICY "users_select_own_queue" ON match_queue
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own queue entries (cancel)
CREATE POLICY "users_update_own_queue" ON match_queue
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can view rooms they're in
CREATE POLICY "users_select_own_rooms" ON rooms
  FOR SELECT USING (auth.uid() = user_a OR auth.uid() = user_b);

-- Users can update rooms they're in (to end them)
CREATE POLICY "users_update_own_rooms" ON rooms
  FOR UPDATE USING (auth.uid() = user_a OR auth.uid() = user_b);

-- Enable realtime for match_queue and rooms tables
ALTER PUBLICATION supabase_realtime ADD TABLE match_queue;
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
