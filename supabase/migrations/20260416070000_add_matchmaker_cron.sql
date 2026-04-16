-- Enable pg_cron and pg_net extensions for automated matchmaking
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

-- Grant usage so cron jobs can use pg_net
grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

-- Schedule the match-users Edge Function to run every 2 seconds.
-- Uses pg_net to make an async HTTP POST to the Edge Function.
--
-- URL: In local dev we use host.docker.internal:54321 (host-mapped Kong port)
-- because pg_net's libcurl cannot resolve Docker container hostnames.
-- In hosted Supabase, replace with the project's Edge Function URL.
--
-- Auth: In hosted Supabase, current_setting('app.settings.service_role_key') is
-- available automatically. For local dev we fall back to the local secret key.
do $$
declare
  _key text := coalesce(
    nullif(current_setting('app.settings.service_role_key', true), ''),
    'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz'  -- local dev fallback
  );
begin
  perform cron.schedule(
    'invoke-match-users',
    '2 seconds',
    format(
      'select net.http_post(
        url    := ''http://host.docker.internal:54321/functions/v1/match-users'',
        body   := ''{}''::jsonb,
        headers := jsonb_build_object(
          ''Content-Type'', ''application/json'',
          ''apikey'', %L,
          ''Authorization'', ''Bearer '' || %L
        )
      )',
      _key, _key
    )
  );
end
$$;
