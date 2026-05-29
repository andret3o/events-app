-- =========================================================================
-- 1. CLEANUP & PREPARATION
-- =========================================================================
TRUNCATE TABLE events RESTART IDENTITY CASCADE;
TRUNCATE TABLE users RESTART IDENTITY CASCADE;

-- Ensure we have dummy users to assign events to.
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
    -- COMMUNITY USERS
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
-- 2. STATIC EVENT INSERTS
-- =========================================================================
-- Coordinates use PostGIS ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)

INSERT INTO events (
    title, description, category, type, image_url, location_string,
    coordinates, start_time, end_time, user_id, created_at, updated_at
)
VALUES
    (
        'GOLDEN ERA @ Club Hollywood',
        $$Vanarahvas teadis rääkida: kui peol puhast kulda ei mängita, siis pole mõtet pidu tehagi...

                Golden Era toob kokku aegumatu muusika ja legendaarsed hitid, mis viivad sind tagasi kõige parematesse aegadesse. Tead küll - Eminem, Avicii, Rihanna, Drake, Taylor Swift, Bruno Mars ja kõik need lood, mida terve rahvas kaasa laulab. 🔥

                ————————————————————

                 👇 MEELELAHUTUST PAKUVAD👇

                 🛼 G5 DJ-s (Kaarel & Sass)
                 🛼 OU SNAP (Andy Cane & Friends)

                 🏓 BEERPONG
                 🥊 BOXING MACHINE

                 ————————————————————

                 FB list sulgub kell 22:00
                 Uksed 23:00
                 Vanusepiirang 18+$$,
        'NIGHTLIFE',
        'VENUE',
        'https://res.cloudinary.com/dqck13qsw/image/upload/v1780060170/avatar899c9ee25eeadae942e47f65fc5b420d_amgpwm.jpg',
        'Club Hollywood',
        ST_SetSRID(ST_MakePoint(24.74551, 59.43515), 4326), -- Note: PostGIS uses Longitude then Latitude (X, Y)
        CURRENT_TIMESTAMP + INTERVAL '4 hours',
        CURRENT_TIMESTAMP + INTERVAL '8 hours',
        99901,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'BASS & BARS: Hip-Hop',
        $$Reedene võnkesagedus on ametlikult paika pandud. Toome teieni kõige mahlasemad hip-hop biidid, uue kooli räpi ja parimad r&b klassikud. Lavale astuvad kohalikud tipud ja DJ-d, kes ei jäta kedagi külmaks.

        ————————————————————
        👇 BIITE VEERETAVAD 👇
        🎤 DJ PHILLY & DJ MVP
        🎤 SPECIAL LIVE: Villemdrillem
        ————————————————————
        Uksed: 23:00
        Vanusepiirang: 18+
        Pilet FB listiga soodsam kuni 00:00!$$,
        'NIGHTLIFE',
        'VENUE',
        'https://res.cloudinary.com/dqck13qsw/image/upload/v1780060392/360_F_120282465_htIcYKYiSb98hIrhL6X6ilI0z8vn19LY_d5ojfo.jpg',
        'Klubi D3',
        ST_SetSRID(ST_MakePoint(24.74012, 59.43981), 4326),
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP + INTERVAL '4 hours',
        99902,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'Stand-Up Comedy Night',
        $$Keskisand ja naljahambad kokku! Neljapäeva õhtu on naeruteraapia päralt. Laval astuvad üles nii juba tuntud koomikud kui ka uued tulijad, kes katsetavad oma värskeimat materjali. Tule ja naera end ribadeks!

        ————————————————————
        🎤 Õhtujuht: Sander Õigus
        🎤 Laval: 4 erinevat open-mic koomikut
        ————————————————————
        Uksed: 19:00
        Show algus: 20:00
        Vanusepiirang: 16+ (soovitav)$$,
        'SOCIAL',
        'VENUE',
        'https://res.cloudinary.com/dqck13qsw/image/upload/v1780060581/stand-up-comedy-performance-stockcake.jpg_yoivie.webp',
        'Heldeke',
        ST_SetSRID(ST_MakePoint(24.73356, 59.44421), 4326),
        CURRENT_TIMESTAMP + INTERVAL '3 hours',
        CURRENT_TIMESTAMP + INTERVAL '6 hours',
        99903,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'INDIE WAVE: Live & Dance',
        $$Kutsume kõiki alternatiivmuusika sõpru! Paavli Kultuurivabriku lavale astuvad kohaliku skene kõige põnevamad indie-rock koosseisud. Pärast kontserti jätkub pidu varajaste hommikutundideni parimate sünteka- ja indierütmide saatel.

        ————————————————————
        👇 LIVE ALATES 21:00 👇
        🎸 The Boondocks (Live)
        🎸 Neon Letters (Live)
        🎧 Afterparty: DJ Girti Suur$$,
        'MUSIC',
        'VENUE',
        'https://res.cloudinary.com/dqck13qsw/image/upload/v1780060832/live-band-performance-stockcake.jpg_xejzfu.webp',
        'Paavli Kultuurivabrik',
        ST_SetSRID(ST_MakePoint(24.71712, 59.45234), 4326),
        CURRENT_TIMESTAMP + INTERVAL '4 hours',
        CURRENT_TIMESTAMP + INTERVAL '9 hours',
        99903,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'TECHNO CORE: Midnight Rave',
        $$Klubi Halli uksed avanevad, et tuua teieni pealinna kõige sügavamad bassid ja tumedam techno. Öö, kus valgus ja heli sulanduvad üheks pikaks rännakuks. Kui otsid tõelist klubikultuuri ja kompromissitut rütmi, siis see on sinu sihtkoht.

        ————————————————————
        👇 LINE-UP 👇
        🎧 DJ Merimell
        🎧 Artur Lääts
        🎧 Hypnotic Pulse (Live)
        ————————————————————
        Uksed: 23:00
        Vanusepiirang: 18+
        Näoga muusika poole ja tantsupõrandale!$$,
        'NIGHTLIFE',
        'VENUE',
        NULL,
        'Klubi HALL',
        ST_SetSRID(ST_MakePoint(24.74311, 59.45102), 4326),
        CURRENT_TIMESTAMP + INTERVAL '5 hours',
        CURRENT_TIMESTAMP + INTERVAL '11 hours',
        99904,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),

    -- 2. MUSIC (Jazz / Lounge)
    (
        'Jazz & Wine Evening',
        $$Mõnus ja hubane õhtu Philly Joe's Jazziklubis. Lavale astuvad andekad kohalikud muusikud ja külalisartistid, kes loovad täiusliku atmosfääri lõõgastumiseks. Naudi kvaliteetset elavat muusikat, head seltskonda ja hoolikalt valitud veine.

        ————————————————————
        🎤 Esineb: Kvartett "Focal Point"
        🎹 Klaveril: Erki Pärnoja erikava
        ————————————————————
        Uksed: 19:00
        Kontserdi algus: 20:00
        Laudade broneerimine soovitav.$$,
        'MUSIC',
        'VENUE',
        NULL,
        'Philly Joe''s Jazz Club',
        ST_SetSRID(ST_MakePoint(24.74912, 59.43654), 4326),
        CURRENT_TIMESTAMP + INTERVAL '2 hours',
        CURRENT_TIMESTAMP + INTERVAL '5 hours',
        99905,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),

    -- 3. TECH (Networking / Talks)
    (
        'Tallinn Tech Founders Meetup',
        $$Kas sul on lennukas idufirma idee või otsid hoopis oma meeskonda kaasasutajat? Tech Founders Meetup toob kokku Tallinna tehnoloogiamaastiku helgemad pead, investorid ja arendajad. Kuulame edulugusid, arutleme tulevikutrendide üle ja võrgustume vabas õhkkonnas.

        ————————————————————
        🎤 Paneeldiskussioon: Kuidas kaasata esimest investeeringut?
        🍕 Pärast ametlikku osa pitsa, jook ja vaba mikrofon pitchimiseks!
        ————————————————————
        Algus: 18:30
        Keel: Inglise$$,
        'TECH',
        'VENUE',
        'https://res.cloudinary.com/dqck13qsw/image/upload/v1780062968/Blog-Tech-Events_kzzno0.jpg',
        'Lift99 Telliskivi',
        ST_SetSRID(ST_MakePoint(24.72911, 59.44023), 4326),
        CURRENT_TIMESTAMP + INTERVAL '1 hour',
        CURRENT_TIMESTAMP + INTERVAL '4 hours',
        99906,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),

    -- 4. SPORT (Tournament / Social)
    (
        'Kalamaja Ping-Pong Open',
        $$On aeg reketid tolmust puhtaks pühkida! Korraldame meeleoluka ja sõbraliku lauatennise turniiri kõigile huvilistele. Oodatud on nii täiesti algajad kui ka need, kes suudavad palli tunde laual hoida. Parimatele auhinnad kohalikelt kohvikutelt!

        ————————————————————
        🏓 Registreerimine kohapeal kuni 12:45
        🏆 Eraldi arvestus harrastajatele ja edasijõudnutele
        ————————————————————
        Algus: 13:00
        Võta kaasa oma reket või laena meilt!$$,
        'SPORT',
        'VENUE',
        'https://res.cloudinary.com/dqck13qsw/image/upload/v1780063048/overview_xwqixi.jpg',
        'Põhjala Tehas',
        ST_SetSRID(ST_MakePoint(24.67322, 59.46211), 4326),
        CURRENT_TIMESTAMP + INTERVAL '18 hours',
        CURRENT_TIMESTAMP + INTERVAL '23 hours',
        99908,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),

    -- 5. SOCIAL (Board games / Pub)
    (
        'Board Game & Craft Beer Night',
        $$Tule üksi või sõpradega ja veeda õhtu strateegiliste lauamängude seltsis. Meie riiulitest leiad laia valiku mänge alates klassikalisest "Catanist" kuni keerukamate strateegiamängudeni. Kohapeal aitavad mängujuhid reeglid kiiresti selgeks teha.

        ————————————————————
        🎲 Tasuta sissepääs ja lauamängude kasutus
        🍻 Baaris lai valik kohalikku käsitööõlut ja snäkke
        ————————————————————
        Uksed ja mängude valimine alates 18:00$$,
        'SOCIAL',
        'VENUE',
        'https://res.cloudinary.com/dqck13qsw/image/upload/v1780063097/images_budmpz.jpg',
        'Pööbel',
        ST_SetSRID(ST_MakePoint(24.73812, 59.43612), 4326),
        CURRENT_TIMESTAMP + INTERVAL '2 hours',
        CURRENT_TIMESTAMP + INTERVAL '6 hours',
        99909,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),

    -- 6. EDUCATIONAL (Workshop / Masterclass)
    (
        'Sourdough leiva küpsetamise meistriklass',
        $$Õpi valmistama täiuslikku, krõbeda koorikuga ja seest pehmet juuretise leiba! Selles praktilises töötubades käime läbi kogu protsessi alates juuretise toitmisest kuni õige küpsetustehnikani. Iga osaleja saab koju kaasa oma esimese pätsi ja elava juuretise.

        ————————————————————
        🍞 Juhendab meisterpagar
        ☕ Hinnas sisaldub kohv, tee ja värskete küpsetiste degusteerimine
        ————————————————————
        Kestus: 3 tundi
        Kohtade arv on piiratud!$$,
        'EDUCATIONAL',
        'VENUE',
        NULL,
        'Fotografiska Tallinn (Koolitusklass)',
        ST_SetSRID(ST_MakePoint(24.73012, 59.43912), 4326),
        CURRENT_TIMESTAMP + INTERVAL '15 hours',
        CURRENT_TIMESTAMP + INTERVAL '18 hours',
        99910,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),

    -- 7. ART (Exhibition / Opening)
    (
        'Abstraktse Kunsti Näituse Avamine: "Värvide Kaja"',
        $$Kutsume teid osa saama uue ja põneva kaasaegse kunsti näituse pidulikust avamisest. Ekspositsioon toob kokku suured lõuendid, julged värvikombinatsioonid ja dünaamilised vormid, mis panevad vaataja fantaasia tööle.

        ————————————————————
        🥂 Tervitusjook esimesele 50 külalisele
        🎨 Kohapeal vestlus autoritega ja elav ambient-muusika
        ————————————————————
        Avamine: 19:00
        Sissepääs kõigile tasuta!$$,
        'ART',
        'VENUE',
        'https://res.cloudinary.com/dqck13qsw/image/upload/v1780063470/kaupokalda-visit-estonia-fotografiska-telliskivi_cs0prl.jpg',
        'Telliskivi Loomelinnak (Roheline Saal)',
        ST_SetSRID(ST_MakePoint(24.72854, 59.44102), 4326),
        CURRENT_TIMESTAMP + INTERVAL '3 hours',
        CURRENT_TIMESTAMP + INTERVAL '6 hours',
        99909,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),

    -- 8. OTHER (Flea Market / Community)
    (
        'Uuskasutus ja Vintage Turg',
        $$Tule tee unikaalseid leide või anna oma vanadele asjadele uus elu! Telliskivi kirbuturul on esindatud parimad vintage-riiete müüjad, vinüülplaadid, antiik, käsitöö ja kohalik disain. Tule veeda mõnus päev perega ja toeta ringmajandust.

        ————————————————————
        ☕ Avatud on pop-up kohvikud ja tänavatoiduautod
        🎶 Meeleolu loob taustamuusikaga vinüüli-DJ
        ————————————————————
        Avatud: 10:00 - 16:00
        Sissepääs külastajatele tasuta.$$,
        'OTHER',
        'VENUE',
        'https://res.cloudinary.com/dqck13qsw/image/upload/v1780063527/web-site-part-2_e0pqdc.jpg',
        'Telliskivi Loomelinnak',
        ST_SetSRID(ST_MakePoint(24.72901, 59.43988), 4326),
        CURRENT_TIMESTAMP + INTERVAL '12 hours',
        CURRENT_TIMESTAMP + INTERVAL '18 hours',
        99908,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),

    -- 9. NIGHTLIFE (Latino / Dance)
    (
        'Noche Latina: Salsa & Bachata Party',
        $$Kuumad rütmid keset Tallinnat! Toome sinuni parima valiku salsat, bachatat ja kizombat. Pole oluline, kas oled tantsinud aastaid või teed oma esimesi samme – meie tantsupõrandale mahuvad kõik. Enne pidu toimub kiire algajate lühikoolitus!

        ————————————————————
        💃 21:00 - Tasuta Salsa kiirkursus algajatele
        🎧 DJ Luis (Kuuba) & DJ Marco
        ————————————————————
        Uksed: 21:00
        Pidu kuni hommikuni!$$,
        'NIGHTLIFE',
        'VENUE',
        'https://res.cloudinary.com/dqck13qsw/image/upload/v1780063764/saturday-salsa-038-bachata-party-by-billies-studio-25438-01_btl5qn.webp',
        'Cathouse Concert Hall',
        ST_SetSRID(ST_MakePoint(24.76712, 59.43711), 4326),
        CURRENT_TIMESTAMP + INTERVAL '5 hours',
        CURRENT_TIMESTAMP + INTERVAL '10 hours',
        99907,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),

    -- 10. MUSIC (Rock / Metal)
    (
        'ROCK ATTACK: Heavy Riffs Night',
        $$Klubi Tapper täitub karmi ja puhta energiaga. Lavale astuvad kohaliku underground skene kõige vihasemad rocki ja metali koosseisud. Tule ja naudi elavat esitust, valjusid kitarrisoolosid ja tõelist moshpiti atmosfääri.

        ————————————————————
        👇 LAVAL 👇
        🎸 Dead Frequencies
        🎸 Iron Wings (Albumi esitlus)
        🎸 StoneCold
        ————————————————————
        Uksed: 19:30
        Esimene bänd laval: 20:30
        Vanusepiirang: 18+$$,
        'MUSIC',
        'VENUE',
        NULL,
        'Rockiklubi Tapper',
        ST_SetSRID(ST_MakePoint(24.78912, 59.42611), 4326),
        CURRENT_TIMESTAMP + INTERVAL '3 hours',
        CURRENT_TIMESTAMP + INTERVAL '8 hours',
        99906,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),

    -- 11. TECH (Workshop / AI)
    (
        'AI & No-Code Praktiline Tuba',
        $$Kuidas panna tehisintellekt enda kasuks tööle ilma rida koodi kirjutamata? Selles praktilises seminaris vaatame läbi parimad tööriistad (ChatGPT, Midjourney, Make, Notion), mis aitavad su igapäevaseid ülesandeid automatiseerida ja produktiivsust tõsta.

        ————————————————————
        💻 Vajalik kaasa võtta oma sülearvuti!
        ☕ Kohvipausid ja võrgustumine on hinna sees.
        ————————————————————
        Kestus: 4 tundi
        Töökeel: Eesti ja Inglise mixed$$,
        'TECH',
        'VENUE',
        NULL,
        'Palo Alto Club',
        ST_SetSRID(ST_MakePoint(24.72712, 59.44081), 4326),
        CURRENT_TIMESTAMP + INTERVAL '14 hours',
        CURRENT_TIMESTAMP + INTERVAL '18 hours',
        99905,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),

    -- 12. SPORT (Run / Community)
    (
        'Tallinn Sunset Run & Social',
        $$Tule naudi suvist päikeseloojangut liikumises! Korraldame ühise jooksu mööda kaunist Reidi tee rannapromenaadi. Tempot hoiame sellisena, et kõik saaksid samal ajal juttu rääkida. Pärast jooksu koguneme koos kohvikusse muljetama ja jooke nautima.

        ————————————————————
        🏃‍♂️ Distants: ca 6-7 km (rahulik tempo)
        🎒 Asjad saab jätta hoiule stardipunkti autosse
        ————————————————————
        Kogunemine: 19:15 Russalka mälestussamba juures
        Osalemine tasuta!$$,
        'SPORT',
        'VENUE',
        NULL,
        'Reidi Tee Promenaad',
        ST_SetSRID(ST_MakePoint(24.77421, 59.44391), 4326),
        CURRENT_TIMESTAMP + INTERVAL '2 hours',
        CURRENT_TIMESTAMP + INTERVAL '4 hours',
        99904,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),

    -- 13. SOCIAL (Pub Quiz)
    (
        'Suur Tallinna Mälumänguõhtu',
        $$Pane oma meeskond kokku ja tule pane oma teadmised proovile pealinna kõige meeleolukamal mälumängul. Küsimusi on seinast seina: popkultuurist, ajaloost, teadusest ja veidratest faktidest. Parimatele tiimidele väärt auhinnad baari poolt!

        ————————————————————
        👥 Tiimi suurus: 2 kuni 6 liiget
        🧠 Küsimusi koostab ja õhtut juhib staažikas mälumängur
        ————————————————————
        Mängu algus: 19:30
        Tule varem, et kohad sisse võtta!$$,
        'SOCIAL',
        'VENUE',
        NULL,
        'St. Patrick''s Foorum',
        ST_SetSRID(ST_MakePoint(24.75712, 59.43822), 4326),
        CURRENT_TIMESTAMP + INTERVAL '3 hours',
        CURRENT_TIMESTAMP + INTERVAL '6 hours',
        99903,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),

    -- 14. EDUCATIONAL (Lecture / History)
    (
        'Salajane Tallinn: Vanalinna Varjatud Lood',
        $$Põnev loeng ja sellele järgnev lühike jalutuskäik neile, kes soovivad teada saada, milliseid saladusi varjavad Tallinna vanalinna sajanditevanused müürid. Räägime kummituslugudest, keskaegsetest tavadest ja peidetud käikudest, millest tavaturist mööda kõnnib.

        ————————————————————
        Lecturer: Kohalik ajaloolane ja giid
        ☕ Hinnas sisaldub soe tee või hõõgvein kohapeal
        ————————————————————
        Kohtade arv piiratud hubase ruumi tõttu!$$,
        'EDUCATIONAL',
        'VENUE',
        NULL,
        'Kiek in de Kök kindlustustemuuseum',
        ST_SetSRID(ST_MakePoint(24.74121, 59.43451), 4326),
        CURRENT_TIMESTAMP + INTERVAL '20 hours',
        CURRENT_TIMESTAMP + INTERVAL '23 hours',
        99902,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),

    -- 15. ART (Cinema / Screening)
    (
        'Vanalinna Kinoklassika: Autorifilmi Õhtu',
        $$Kino Sõprus toob ekraanile tõelise kinokunsti pärli. See on õhtu kõigile filmi- ja esteetikaarmastajatele. Enne seanssi teeb filmikriitik lühikese sissejuhatuse, avades teose tagamaid ja selle mõju maailma kultuurile.

        ————————————————————
        🎬 Film linastub originaalkeeles, eestikeelsete subtiitritega
        🍿 Baaris saadaval spetsiaalsed filmiõhtu joogid ja snäkid
        ————————————————————
        Seansi algus: 21:00
        Tule naudi tõelist kinohõngu!$$,
        'ART',
        'VENUE',
        NULL,
        'Kino Sõprus',
        ST_SetSRID(ST_MakePoint(24.74481, 59.43592), 4326),
        CURRENT_TIMESTAMP + INTERVAL '4 hours',
        CURRENT_TIMESTAMP + INTERVAL '7 hours',
        99901,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),

    -- 16. OTHER (Wellness / Meditation)
    (
        'Pühapäeva Hommiku Jooga & Helikausi Meditatsioon',
        $$Võta aeg maha ja alusta oma päeva täieliku lõõgastusega. Alustame pehme vinyasa jooga praktikaga, mis äratab keha, ning lõpetame sügava meditatsiooniga Tiibeti helikausside saatel, mis aitab vabaneda stressist ja koguda uut energiat.

        ————————————————————
        🧘‍♂️ Sobib nii algajatele kui ka edasijõudnutele
        🍵 Pärast praktikat pakume sooja taimeteed ja puuvilju
        ————————————————————
        Võta kaasa oma matt (vajadusel saab laenata kohapealt).$$,
        'OTHER',
        'VENUE',
        NULL,
        'Taiji Klubi',
        ST_SetSRID(ST_MakePoint(24.73911, 59.44112), 4326),
        CURRENT_TIMESTAMP + INTERVAL '16 hours',
        CURRENT_TIMESTAMP + INTERVAL '18 hours',
        99901,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),

    -- 17. NIGHTLIFE (Hip-Hop / R&B)
    (
        'URBAN VIBES: Old School vs New School',
        $$Klubi Studio kahel korrusel läheb lahti tõeline linna rütmide lahing. Ühel korrusel valitsevad 90ndate ja 2000ndate hip-hop ja R&B klassikud, teisel korrusel aga kõige värskemad trap-biidid ja tuleviku hirmud. Vali oma lemmik või liigu kahe maailma vahel!

        ————————————————————
        🎧 1. KORRUS (Old School): DJ Critikal
        🎧 2. KORRUS (New School): DJ Bad J
        ————————————————————
        Uksed: 23:00
        Vanusepiirang: 18+$$,
        'NIGHTLIFE',
        'VENUE',
        NULL,
        'Klubi Studio',
        ST_SetSRID(ST_MakePoint(24.74612, 59.43712), 4326),
        CURRENT_TIMESTAMP + INTERVAL '6 hours',
        CURRENT_TIMESTAMP + INTERVAL '11 hours',
        99902,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),

    -- 18. MUSIC (Classical / Acoustic)
    (
        'Kandlevalguse Kontsert: Akustilised Meloodiad',
        $$Erakordne ja atmosfäärne õhtu keskaegse Tallinna südames. Sajad küünlad valgustavad ajaloolist saali, luues maagilise fooni kaunile akustilisele muusikale. Kõlavad tšello ja kitarri arranžeeringud tuntud paladest.

        ————————————————————
        🎻 Esinevad: Tallinna Muusikaakadeemia tippsolistid
        🎼 Kavas: Arvo Pärt, Ludovico Einaudi ja klassikalised palad
        ————————————————————
        Kontserdi kestus: 1 tund ja 15 minutit (ilma vaheajata)
        Uksed suletakse kontserdi alguses!$$,
        'MUSIC',
        'VENUE',
        NULL,
        'Mustpeade Maja',
        ST_SetSRID(ST_MakePoint(24.74688, 59.43891), 4326),
        CURRENT_TIMESTAMP + INTERVAL '3 hours',
        CURRENT_TIMESTAMP + INTERVAL '5 hours',
        99903,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),

    -- 19. TECH (Demo Day)
    (
        'Tallinn Startup Demo Day',
        $$Tule ja saa osa regiooni põnevaimate uute idufirmade esitlustest. Lavale astuvad meeskonnad, kes on valmis muutma maailma oma uudsete tehnoloogiatega rohetehnoloogia, finantsi ja tehisintellekti vallas. Suurepärane võimalus investoritele ja talendiotsijatele.

        ————————————————————
        🚀 10 meeskonda, 3-minutilised pitchid + žürii küsimused
        🥂 Võrgustumine ja kokteilid pärast võitjate kuulutamist
        ————————————————————
        Algus: 16:00
        Osalemine eelregistreerimisega.$$,
        'TECH',
        'VENUE',
        NULL,
        'Mektory Innovation Centre',
        ST_SetSRID(ST_MakePoint(24.67112, 59.39511), 4326),
        CURRENT_TIMESTAMP + INTERVAL '22 hours',
        CURRENT_TIMESTAMP + INTERVAL '26 hours',
        99904,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),

    -- 20. SPORT (Bouldering / Social)
    (
        'Ronimisministeeriumi Ronimisõhtu & Sotsiaalne Jam',
        $$Tule pane oma osavus ja jõud proovile vabas ja toetavas õhkkonnas. Ronimisõhtu toob kokku nii kogenud ronijad kui ka need, kes tahavad seda ala esmakordselt proovida. Kohapeal on instruktorid, kes aitavad radade lugemisel ja tehnikaga.

        ————————————————————
        🧗‍♂️ Spetsiaalsed uued rajad (boulderid) just selleks õhtuks
        🍕 Pärast ronimist koosviibimine, jutuajamine ja pitsa
        ————————————————————
        Sissepääs tavapiletiga, juhendamine tasuta!$$,
        'SPORT',
        'VENUE',
        NULL,
        'Ronimisministeerium',
        ST_SetSRID(ST_MakePoint(24.71212, 59.43112), 4326),
        CURRENT_TIMESTAMP + INTERVAL '4 hours',
        CURRENT_TIMESTAMP + INTERVAL '8 hours',
        99905,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),

    -- 21. SOCIAL (Language Exchange)
    (
        'Tallinn Language Exchange Cafe',
        $$Tahad praktiseerida uut keelt, aidata teistel õppida oma emakeelt või lihtsalt kohtuda põnevate inimestega üle kogu maailma? Meie keelekohvik toob kokku kohalikud ja expatid vabas ja sõbralikus keskkonnas. Lauad on jagatud keelte kaupa (EE, EN, ES, DE, FR jne).

        ————————————————————
        ☕ Vali oma keelelauad ja liigu vabalt ringi
        🎉 Sissepääs on tasuta, telli baarist midagi head ja naudi seltskonda!
        ————————————————————
        Algus: 19:00$$,
        'SOCIAL',
        'VENUE',
        NULL,
        'Kivi Paber Käärid',
        ST_SetSRID(ST_MakePoint(24.72692, 59.43954), 4326),
        CURRENT_TIMESTAMP + INTERVAL '2 hours',
        CURRENT_TIMESTAMP + INTERVAL '5 hours',
        99905,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );
