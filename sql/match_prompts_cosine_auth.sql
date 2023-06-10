create or replace function match_prompts_cosine_auth (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  auth_user_id uuid
)
returns table (
  id bigint,
  prompt text,
  completion text,
  similarity float
)
language sql stable
as $$
  select
    cache_entries.id,
    cache_entries.prompt,
    cache_entries.completion,
    1 - (cache_entries.prompt_embedding <=> query_embedding) as similarity
  from cache_entries
  where 1 - (cache_entries.prompt_embedding <=> query_embedding) > match_threshold and cache_entries.user_id = auth_user_id
  order by similarity desc
  limit match_count;
$$;