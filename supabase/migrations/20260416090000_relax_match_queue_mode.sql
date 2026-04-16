-- Migration: Relax match_queue.mode for UX redesign
-- Mode-based matching is removed. All users go into a single pool.
-- Keep the column for backward compatibility, but set a default so clients
-- don't need to provide it.

ALTER TABLE match_queue ALTER COLUMN mode SET DEFAULT 'text';
