DROP TABLE IF EXISTS posts;
CREATE TABLE posts(
    id              INTEGER         PRIMARY KEY,
    title           TEXT            NOT NULL,
    content         TEXT            NOT NULL,
    created_at      DATE            NOT NULL            DEFAULT CURRENT_TIMESTAMP,
    edited_at       DATE            NOT NULL            DEFAULT CURRENT_TIMESTAMP
)