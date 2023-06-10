create table
  public.cache_entries (
    id integer not null default nextval('cache_entries_id_seq'::regclass),
    prompt text not null,
    completion text null,
    prompt_embedding public.vector null,
    user_id uuid not null,
    constraint cache_entries_pkey primary key (id)
  ) tablespace pg_default;