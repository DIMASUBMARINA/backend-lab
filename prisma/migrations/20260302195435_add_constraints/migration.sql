ALTER TABLE posts ADD CONSTRAINT check_published_at
  CHECK (status != 'PUBLISHED' OR published_at IS NOT NULL);

ALTER TABLE comments ADD CONSTRAINT check_comment_self_ref
  CHECK (parent_id != id);

CREATE UNIQUE INDEX one_pending_per_user_post
  ON comments (post_id, user_id)
  WHERE status = 'PENDING' AND deleted_at IS NULL;