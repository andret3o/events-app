-- =========================================================================
-- 1. CLEANUP & PREPARATION
-- =========================================================================
TRUNCATE TABLE events RESTART IDENTITY CASCADE;
TRUNCATE TABLE events, users RESTART IDENTITY CASCADE;

-- Ensure we have dummy users to assign events to.
-- Updated roles: 'VENUE' for certified accounts, 'USER' for community members.
INSERT INTO users (user_id, name, username, email, password, role, enabled)
VALUES 
    (99901, 'Club Hollywood', 'hollywood', 'info@hollywood.ee', 'hash', 'VENUE', true),
    (99902, 'Fotografiska Tallinn', 'fotografiska', 'hello@fotografiska.ee', 'hash', 'VENUE', true),
    (99903, 'Kivi Paber Käärid', 'kpk', 'kpk@telliskivi.ee', 'hash', 'VENUE', true),
    (99904, 'Noblessner Foundry', 'noblessner', 'events@noblessner.ee', 'hash', 'VENUE', true),
    (99905, 'Purtse Tap Room', 'purtse', 'tallinn@purtse.ee', 'hash', 'VENUE', true),
    (99906, 'Alexela Kontserdimaja', 'alexela', 'booking@alexela.ee', 'hash', 'VENUE', true),
    (99907, 'Sveta Baar Clone', 'sveta', 'party@sveta.ee', 'hash', 'VENUE', true),
    (99908, 'Paavli Kultuurivabrik', 'paavli', 'paavli@culture.ee', 'hash', 'VENUE', true),
    (99909, 'Tallinn Tech Hub', 'taltechhub', 'tech@taltech.ee', 'hash', 'VENUE', true),
    (99910, 'MyFitness Rävala', 'myfitness', 'ravala@myfitness.ee', 'hash', 'VENUE', true),
    -- COMMUNITY USERS (Role adjusted from 'COMMUNITY' to 'USER')
    (99911, 'Mari Tamm', 'mari_tamm', 'mari@proge.ee', 'hash', 'USER', true),
    (99912, 'Jaan Kross', 'jaank', 'jaan@kross.ee', 'hash', 'USER', true),
    (99913, 'Kristjan Järvi', 'kristjan_j', 'kristjan@music.ee', 'hash', 'USER', true),
    (99914, 'Liis Lepik', 'liis_lepik', 'liis@lepik.ee', 'hash', 'USER', true),
    (99915, 'Kevin Saare', 'kevins', 'kevin@saare.ee', 'hash', 'USER', true),
    (99916, 'Elena Petrova', 'elena_p', 'elena@petrova.ee', 'hash', 'USER', true),
    (99917, 'Markus Meri', 'markus_m', 'markus@meri.ee', 'hash', 'USER', true),
    (99918, 'Anette Puu', 'anette_p', 'anette@puu.ee', 'hash', 'USER', true),
    (99919, 'Oliver Kasak', 'oliver_k', 'oliver@kasak.ee', 'hash', 'USER', true),
    (99920, 'Sandra Meri', 'sandra_m', 'sandra@meri.ee', 'hash', 'USER', true)
ON CONFLICT (username) DO NOTHING;

-- =========================================================================
-- 2. DYNAMIC EVENT GENERATION (140 Events, 20 per day for 7 days)
-- =========================================================================
INSERT INTO events (
    title, description, category, type, location_string, 
    coordinates, start_time, end_time, user_id, created_at, updated_at
)
WITH day_series AS (
    SELECT d FROM generate_series(0, 6) AS d
),
event_series AS (
    SELECT e FROM generate_series(1, 20) AS e
),
grid AS (
    SELECT 
        d.d AS day_offset, 
        e.e AS event_index,
        floor(random() * 10 + 1)::int AS rand_idx
    FROM day_series d
    CROSS JOIN event_series e
),
tallinn_locations AS (
    VALUES 
        ('Telliskivi Loomelinnak', 59.4394, 24.7262),
        ('Vanalinn (Old Town)', 59.4372, 24.7453),
        ('Noblessner Marina', 59.4532, 24.7385),
        ('Kadriorg Park', 59.4382, 24.7878),
        ('Rotermanni Kvartal', 59.4399, 24.7571),
        ('Kalamaja Park', 59.4491, 24.7332),
        ('Ülemiste City', 59.4222, 24.8032),
        ('Pirita Promenade', 59.4682, 24.8115),
        ('Mustamäe Elamuste Keskus', 59.4035, 24.6641),
        ('Tondi Maneež', 59.4011, 24.7123)
),
indexed_locations AS (
    SELECT column1 AS loc_name, column2 AS lat, column3 AS lon, row_number() OVER () as idx 
    FROM tallinn_locations
),
categories AS (
    SELECT unnest(ARRAY['NIGHTLIFE', 'MUSIC', 'TECH', 'SPORT', 'SOCIAL', 'EDUCATIONAL', 'ART', 'OTHER']) AS cat_name
),
indexed_categories AS (
    SELECT cat_name, row_number() OVER () as idx FROM categories
)
SELECT 
    -- Title & Description
    coalesce(c.cat_name, 'EVENT') || ' Gathering #' || (g.day_offset * 20 + g.event_index) AS title,
    'An exciting ' || lower(coalesce(c.cat_name, 'community')) || ' event happening live in Tallinn. Join us for an unforgettable experience!' AS description,
    
    -- Category
    coalesce(c.cat_name, 'OTHER') AS category,
    
    -- Fixed: EventType mapping based on the 60/40 rule
    -- First 12 events per day (60%) are 'VENUE', remaining 8 events (40%) are 'COMMUNITY'
    CASE WHEN g.event_index <= 12 THEN 'VENUE' ELSE 'COMMUNITY' END AS type,
    
    l.loc_name AS location_string,
    ST_SetSRID(
        ST_MakePoint(
            l.lon + (random() - 0.5) * 0.005, 
            l.lat + (random() - 0.5) * 0.005
        ), 
        4326
    ) AS coordinates,
    (CURRENT_DATE + (g.day_offset || ' day')::interval + '8 hours'::interval + (g.event_index * '45 minutes'::interval))::timestamptz AS start_time,
    (CURRENT_DATE + (g.day_offset || ' day')::interval + '8 hours'::interval + (g.event_index * '45 minutes'::interval) + '2.5 hours'::interval)::timestamptz AS end_time,
    
    CASE 
        WHEN g.event_index <= 12 THEN 99900 + g.rand_idx      -- Assigns to 'VENUE' role users
        ELSE 99910 + g.rand_idx                               -- Assigns to 'USER' role users
    END AS user_id,
    
    CURRENT_TIMESTAMP AS created_at,
    CURRENT_TIMESTAMP AS updated_at
FROM grid g
LEFT JOIN indexed_locations l ON l.idx = ((g.day_offset * 20 + g.event_index) % 10) + 1
LEFT JOIN indexed_categories c ON c.idx = ((g.day_offset * 20 + g.event_index) % 8) + 1;