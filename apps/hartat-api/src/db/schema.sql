DROP TABLE IF EXISTS categories;
CREATE TABLE categories(
    id              INTEGER         PRIMARY KEY,
    name            TEXT            NOT NULL
);

DROP TABLE IF EXISTS images;
CREATE TABLE images(
    id              INTEGER         PRIMARY KEY,
    uuid            TEXT            NOT NULL            UNIQUE,
    name            TEXT            NOT NULL,
    extension       TEXT            NOT NULL,
    uploaded_at     DATETIME        NOT NULL            DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS posts;
CREATE TABLE posts(
    id              INTEGER         PRIMARY KEY,
    title           TEXT            NOT NULL,
    content         TEXT            NOT NULL,
    created_at      DATETIME        NOT NULL            DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL            DEFAULT CURRENT_TIMESTAMP,

    category_id     INTEGER,
    image_id        INTEGER,

    CONSTRAINT fk_post_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_post_image
        FOREIGN KEY (image_id)
        REFERENCES images(id)
        ON DELETE SET NULL
);

DROP TABLE IF EXISTS events;
CREATE TABLE events(
    id              INTEGER         PRIMARY KEY,
    title           TEXT            NOT NULL,
    description     TEXT            NOT NULL,
    url             TEXT,
    date_start      DATETIME        NOT NULL        DEFAULT CURRENT_TIMESTAMP,
    date_end        DATETIME        NOT NULL        DEFAULT CURRENT_TIMESTAMP,

    image_id        INTEGER,

    CONSTRAINT fk_event_image
        FOREIGN KEY (image_id)
        REFERENCES images(id)
        ON DELETE SET NULL
)