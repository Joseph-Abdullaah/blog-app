-- Trigram search (docs/06-DATABASE-SCHEMA.md §4). Prisma doesn't model these, so they live in raw SQL.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS blog_title_trgm_idx       ON "blog"  USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS blog_description_trgm_idx ON "blog"  USING gin (description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS topic_name_trgm_idx       ON "topic" USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS user_username_trgm_idx    ON "user"  USING gin (username gin_trgm_ops);
CREATE INDEX IF NOT EXISTS user_name_trgm_idx        ON "user"  USING gin (name gin_trgm_ops);
