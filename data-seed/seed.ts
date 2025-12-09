// seed.all.ts
import pkg from 'pg';
import { faker } from '@faker-js/faker';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

const { Client } = pkg;

// ==== CONFIG (giữ nguyên của bạn) ====
const DATABASE_URL =
    process.env.DATABASE_URL ||
    'postgres://postgres:123456@localhost:5432/band_up';

const NUM_ACCOUNTS = Number(process.env.SEED_ACCOUNTS ?? 20);
const NUM_DECKS = Number(process.env.SEED_DECKS ?? 300);

// ==== BLOG CONFIG (thêm) ====
const NUM_BLOG_POSTS = Number(process.env.SEED_BLOGS ?? 100);
const BLOG_IMAGES = [
    'avatars/9604f861-b17a-4a06-b9c1-c2f9b7210632/avatar-f545be8a-b67c-4d24-98f0-b055fd423f95-Screenshot_30-Oct_17-08-26_12211.png',
    'avatars/9604f861-b17a-4a06-b9c1-c2f9b7210632/avatar-11e90c16-7cf1-4cf3-b780-74670d16631f-Screenshot_07-Nov_14-51-31_25697.png',
    'avatars/9604f861-b17a-4a06-b9c1-c2f9b7210632/avatar-2f8f971d-6371-4341-ab30-3251f7f8c020-Screenshot_03-Nov_15-18-04_13823.png',
    'avatars/9604f861-b17a-4a06-b9c1-c2f9b7210632/avatar-38757d62-bac0-4e43-80a4-2e089d952681-aws-fcj.jpg',
    'avatars/9604f861-b17a-4a06-b9c1-c2f9b7210632/avatar-8ae97e6b-4042-40a7-a45f-70f1d38238dd-Screenshot_04-Oct_09-23-26_32219.png',
    'avatars/9604f861-b17a-4a06-b9c1-c2f9b7210632/avatar-9b482f07-f49d-4fc9-8a0a-f33dfb3ad02c-Screenshot_01-Dec_09-10-55_6416.png',
    'avatars/9604f861-b17a-4a06-b9c1-c2f9b7210632/avatar-f4aab50f-a0c9-457b-afc3-7253a6ebddd6-Screenshot_01-Nov_20-33-03_2254.png',
    'avatars/9604f861-b17a-4a06-b9c1-c2f9b7210632/avatar-f545be8a-b67c-4d24-98f0-b055fd423f95-Screenshot_30-Oct_17-08-26_12211.png',
];

// Hàm lấy ảnh ngẫu nhiên
export const getRandomBlogImage = () => {
    const randomIndex = Math.floor(Math.random() * BLOG_IMAGES.length);
    return BLOG_IMAGES[randomIndex];
};

// Nếu muốn dùng biến constant như cũ (Random 1 lần khi file được load)
export const FIXED_TITLE_IMG = getRandomBlogImage();

const DEFAULT_TAGS = [
    'IELTS',
    'IELTS Listening',
    'IELTS Reading',
    'IELTS Writing',
    'IELTS Speaking',
    'Vocabulary',
    'Grammar',
    'Band 7+',
    'Test Strategy',
    'Mock Test',
    'Study Plan',
    'Pronunciation',
    'Collocations',
    'Academic',
    'General Training',
];

// Cho phép override cột join qua ENV, nếu không có sẽ tự dò
const ENV_JOIN_TABLE = process.env.JOIN_TABLE; // ví dụ: blog_post_tags
const ENV_JOIN_TAGS_COLUMN = process.env.JOIN_TAGS_COLUMN; // ví dụ: tags_id | tag_id

const ROLES = ['Admin', 'Member'] as const;
const GENDERS = ['Male', 'Female'] as const;

// ==== UTIL (giữ nguyên của bạn) ====
function randomBirthday(): string {
    const years = faker.number.int({ min: 18, max: 45 });
    return dayjs()
        .subtract(years, 'year')
        .subtract(faker.number.int({ min: 0, max: 364 }), 'day')
        .format('YYYY-MM-DD');
}
function randomCreatedAt(): Date {
    const days = faker.number.int({ min: 0, max: 365 });
    return dayjs()
        .subtract(days, 'day')
        .subtract(faker.number.int({ min: 0, max: 86400 }), 'second')
        .toDate();
}

async function connectOrExit() {
    const client = new Client({
        connectionString: DATABASE_URL,
        connectionTimeoutMillis: 3000,
    });
    client.on('error', (e) => console.error('PG client error:', e));
    try {
        await client.connect();
        return client;
    } catch (err) {
        console.error('❌ Cannot connect to PostgreSQL:', err);
        process.exit(1);
    }
}

// ===== Helpers: introspection để tránh lỗi schema khác nhau =====
async function tableExists(client: pkg.ClientBase, table: string) {
    const { rows } = await client.query<{ exists: boolean }>(
        `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=$1) AS exists;`,
        [table]
    );
    return rows[0]?.exists === true;
}
async function columnExists(
    client: pkg.ClientBase,
    table: string,
    column: string
) {
    const { rows } = await client.query<{ exists: boolean }>(
        `SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 AND column_name=$2) AS exists;`,
        [table, column]
    );
    return rows[0]?.exists === true;
}
async function getColumnMaxLen(
    client: pkg.ClientBase,
    table: string,
    column: string
): Promise<number | null> {
    const { rows } = await client.query<{
        character_maximum_length: number | null;
    }>(
        `SELECT character_maximum_length
     FROM information_schema.columns
     WHERE table_schema='public' AND table_name=$1 AND column_name=$2;`,
        [table, column]
    );
    const len = rows[0]?.character_maximum_length;
    return typeof len === 'number' ? len : null;
}
async function safeFitToColumn(
    client: pkg.ClientBase,
    table: string,
    column: string,
    value: string
) {
    const maxLen = await getColumnMaxLen(client, table, column);
    if (maxLen && value.length > maxLen) {
        return value.slice(0, Math.max(0, maxLen - 3)) + '...';
    }
    return value;
}

type JoinResolution = { table: string; column: string } | null;
async function resolveJoinTableAndColumn(
    client: pkg.ClientBase
): Promise<JoinResolution> {
    // Nếu đã set ENV thì ưu tiên dùng
    if (ENV_JOIN_TABLE && ENV_JOIN_TAGS_COLUMN) {
        const okTable = await tableExists(client, ENV_JOIN_TABLE);
        const okCol =
            okTable &&
            (await columnExists(client, ENV_JOIN_TABLE, ENV_JOIN_TAGS_COLUMN));
        if (okCol)
            return { table: ENV_JOIN_TABLE, column: ENV_JOIN_TAGS_COLUMN };
    }

    // Thử các tổ hợp phổ biến của Hibernate
    const candidates: Array<{ table: string; column: string }> = [
        { table: 'blog_post_tags', column: 'tags_id' },
        { table: 'blog_post_tags', column: 'tag_id' },
        { table: 'blog_post_tag', column: 'tags_id' },
        { table: 'blog_post_tag', column: 'tag_id' },
    ];

    for (const c of candidates) {
        const okT = await tableExists(client, c.table);
        if (!okT) continue;
        const okC = await columnExists(client, c.table, c.column);
        if (okC) return c;
    }
    return null;
}

// ==== LOAD EXISTING (giữ nguyên của bạn) ====
async function loadExistingAccounts(client: pkg.ClientBase) {
    const { rows } = await client.query<{ id: string; email: string }>(
        `SELECT id, email FROM public.account;`
    );
    const emails = new Set(rows.map((r) => r.email.toLowerCase()));
    const ids = rows.map((r) => r.id);
    return { existingEmails: emails, existingAccountIds: ids };
}
async function loadExistingDeckIds(client: pkg.ClientBase) {
    const { rows } = await client.query<{ id: string }>(
        `SELECT id FROM public.deck;`
    );
    return rows.map((r) => r.id);
}

// ==== SEED ACCOUNT (ADD-ONLY, SKIP hoang@gmail.com) (giữ nguyên) ====
async function seedAccountsAddOnly(
    client: pkg.ClientBase,
    existingEmails: Set<string>
) {
    console.log('→ Adding accounts (no delete)…');

    const plainPassword = 'Test@123';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const rows: any[] = [];
    const usedInBatch = new Set<string>();

    for (let i = 0; i < NUM_ACCOUNTS; i++) {
        const id = uuidv4();
        const name = faker.person.fullName();

        // tạo email không trùng với DB hiện có và batch hiện tại
        let email: string;
        let tries = 0;
        do {
            email = faker.internet
                .email({
                    firstName: name.split(' ')[0],
                    lastName: name.split(' ').slice(-1)[0],
                })
                .toLowerCase();
            tries++;
            if (tries > 10) email = `${uuidv4()}@example.com`; // fallback
        } while (
            existingEmails.has(email) ||
            usedInBatch.has(email) ||
            email === 'hoang@gmail.com' // không chèn user này
        );
        usedInBatch.add(email);

        rows.push({
            id,
            address: faker.location.streetAddress(),
            birthday: randomBirthday(),
            created_at: randomCreatedAt(),
            email,
            gender: faker.helpers.arrayElement(GENDERS),
            is_active: true,
            name,
            password: hashedPassword,
            phone: '09' + faker.string.numeric(8),
            role: ROLES[1], // Member
        });
    }

    if (rows.length === 0) {
        console.log('⚠️ No new accounts to insert.');
        return [];
    }

    const columns = [
        'id',
        'address',
        'birthday',
        'created_at',
        'email',
        'gender',
        'is_active',
        'name',
        'password',
        'phone',
        'role',
    ];

    const values: any[] = [];
    const placeholders: string[] = [];

    rows.forEach((r, idx) => {
        const base = idx * columns.length;
        placeholders.push(
            `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10}, $${base + 11})`
        );
        values.push(
            r.id,
            r.address,
            r.birthday,
            r.created_at,
            r.email,
            r.gender,
            r.is_active,
            r.name,
            r.password,
            r.phone,
            r.role
        );
    });

    await client.query(
        `INSERT INTO public.account (${columns.join(', ')}) VALUES ${placeholders.join(', ')};`,
        values
    );

    console.log(`✅ Inserted ${rows.length} new accounts.`);
    return rows.map((r) => r.id);
}

// ==== SEED DECK (ADD-ONLY) (giữ nguyên) ====
async function seedDecksAddOnly(
    client: pkg.ClientBase,
    allAccountIds: string[]
) {
    console.log(`→ Adding ${NUM_DECKS} decks…`);

    const decks: any[] = [];
    for (let i = 0; i < NUM_DECKS; i++) {
        decks.push({
            id: uuidv4(),
            created_at: randomCreatedAt(),
            description: faker.lorem.sentence(),
            is_public: faker.datatype.boolean(),
            learner_number: faker.number.int({ min: 0, max: 500 }),
            password: null,
            title: faker.word.words({ count: { min: 2, max: 4 } }),
            account_id: faker.helpers.arrayElement(allAccountIds),
        });
    }

    const columns = [
        'id',
        'created_at',
        'description',
        'is_public',
        'learner_number',
        'password',
        'title',
        'account_id',
    ];

    const values: any[] = [];
    const placeholders: string[] = [];

    decks.forEach((r, idx) => {
        const base = idx * columns.length;
        placeholders.push(
            `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8})`
        );
        values.push(
            r.id,
            r.created_at,
            r.description,
            r.is_public,
            r.learner_number,
            r.password,
            r.title,
            r.account_id
        );
    });

    await client.query(
        `INSERT INTO public.deck (${columns.join(', ')}) VALUES ${placeholders.join(', ')};`,
        values
    );

    console.log(`✅ Inserted ${decks.length} decks.`);
    return decks.map((d) => d.id);
}

// ==== SEED CARD (ADD-ONLY) (giữ nguyên) ====
async function seedCardsAddOnly(
    client: pkg.ClientBase,
    deckIdsJustCreated: string[]
) {
    console.log('→ Adding cards (20–35 per new deck)…');

    const cards: any[] = [];
    for (const deckId of deckIdsJustCreated) {
        const numCards = faker.number.int({ min: 20, max: 35 });
        for (let i = 0; i < numCards; i++) {
            cards.push({
                id: uuidv4(),
                front: faker.word.words({ count: { min: 1, max: 3 } }),
                back: faker.lorem.sentence(),
                deck_id: deckId,
            });
        }
    }

    if (cards.length === 0) {
        console.log('⚠️ No cards to insert.');
        return [];
    }

    const columns = ['id', 'front', 'back', 'deck_id'];
    const values: any[] = [];
    const placeholders: string[] = [];

    cards.forEach((r, idx) => {
        const base = idx * columns.length;
        placeholders.push(
            `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`
        );
        values.push(r.id, r.front, r.back, r.deck_id);
    });

    await client.query(
        `INSERT INTO public.card (${columns.join(', ')}) VALUES ${placeholders.join(', ')};`,
        values
    );

    console.log(`✅ Inserted ${cards.length} cards.`);
    return Array.from(new Set(cards.map((c) => c.deck_id)));
}

// ==== SEED STUDY_PROGRESS (ADD-ONLY, BY DECK) (giữ nguyên) ====
async function seedStudyProgressAddOnly(
    client: pkg.ClientBase,
    allAccountIds: string[],
    allDeckIds: string[]
) {
    console.log('→ Adding study_progress (by deck)…');

    const progresses: Array<{
        id: string;
        account_id: string;
        deck_id: string;
    }> = [];
    const batchDedup = new Set<string>(); // key = account_id|deck_id

    for (const accId of allAccountIds) {
        const learnedDecks = faker.helpers.arrayElements(allDeckIds, {
            min: Math.min(1, allDeckIds.length),
            max: Math.min(8, allDeckIds.length),
        });
        for (const deckId of learnedDecks) {
            const k = `${accId}|${deckId}`;
            if (batchDedup.has(k)) continue;
            batchDedup.add(k);
            progresses.push({
                id: uuidv4(),
                account_id: accId,
                deck_id: deckId,
            });
        }
    }

    if (progresses.length === 0) {
        console.log('⚠️ No study_progress to insert.');
        return;
    }

    const columns = ['id', 'account_id', 'deck_id'];
    const values: any[] = [];
    const placeholders: string[] = [];

    progresses.forEach((r, idx) => {
        const base = idx * columns.length;
        placeholders.push(`($${base + 1}, $${base + 2}, $${base + 3})`);
        values.push(r.id, r.account_id, r.deck_id);
    });

    await client.query(
        `INSERT INTO public.study_progress (${columns.join(', ')}) VALUES ${placeholders.join(', ')};`,
        values
    );

    console.log(`✅ Inserted ${progresses.length} study_progress rows.`);
}

// =======================================================
// ================ BLOG POSTS SEED (THÊM) ===============
// =======================================================

function buildIeltsHtml(topic: string): string {
    const p = (n: number) =>
        Array.from(
            { length: n },
            () =>
                `<p>${faker.lorem.sentences({ min: 2, max: 5 })} ${faker.lorem.sentences({ min: 2, max: 5 })}</p>`
        ).join('\n');

    const tips = Array.from(
        { length: faker.number.int({ min: 4, max: 7 }) },
        () =>
            `<li>${faker.lorem.sentence()} — ví dụ: ${faker.lorem.sentence()}</li>`
    ).join('\n');

    const sampleQAs = Array.from(
        { length: faker.number.int({ min: 2, max: 4 }) },
        () => {
            const q = faker.lorem.sentence();
            const a = faker.lorem.paragraphs({ min: 1, max: 2 }, '<br/>');
            return `<div class="qa"><strong>Question:</strong> ${q}<br/><strong>Answer:</strong> ${a}</div>`;
        }
    ).join('\n');

    return `
<article>
  <h1>${topic}: Tips & Strategies for a Higher IELTS Band</h1>
  <p><em>Chủ đề: ${topic}. Bài viết tập trung mẹo thi, quản lý thời gian và mẫu trả lời thực chiến.</em></p>
  ${p(2)}
  <h2>Key Tips</h2>
  <ul>${tips}</ul>
  ${p(1)}
  <h2>Sample Answers</h2>
  ${sampleQAs}
  <h2>Mini Practice</h2>
  <ol>
    <li>${faker.lorem.sentence()}?</li>
    <li>${faker.lorem.sentence()}?</li>
    <li>${faker.lorem.sentence()}?</li>
  </ol>
  ${p(2)}
  <blockquote>Gợi ý: luyện tập mỗi ngày 25–45 phút theo đúng format đề để tăng sức bền khi vào phòng thi.</blockquote>
  <h3>Further Reading</h3>
  <p>${faker.lorem.paragraph()}</p>
</article>`.trim();
}

function buildRandomTitle(topic: string): string {
    const prefixes = [
        'Ultimate Guide to',
        'Complete Strategy for',
        'How to Master',
        'Roadmap for',
        'Step-by-Step Tips for',
        'Boost Your Band with',
    ];
    const suffixes = [
        ' (Band 7+)',
        ' in 30 Days',
        ' — Proven Techniques',
        ' for Busy Learners',
        ' with Real Examples',
    ];
    return `${faker.helpers.arrayElement(prefixes)} ${topic}${faker.helpers.arrayElement(suffixes)}`;
}

async function ensureTagsAndGetIds(client: pkg.ClientBase, tagNames: string[]) {
    const { rows: existing } = await client.query<{ id: string; name: string }>(
        `SELECT id, name FROM public.tag WHERE name = ANY($1);`,
        [tagNames]
    );
    const byName = new Map(existing.map((r) => [r.name, r.id]));

    const missing = tagNames.filter((n) => !byName.has(n));
    if (missing.length > 0) {
        const values: any[] = [];
        const placeholders: string[] = [];
        missing.forEach((name, idx) => {
            const base = idx * 2;
            placeholders.push(`($${base + 1}, $${base + 2})`);
            values.push(uuidv4(), name);
        });
        await client.query(
            `INSERT INTO public.tag (id, name) VALUES ${placeholders.join(', ')};`,
            values
        );
        const { rows: created } = await client.query<{
            id: string;
            name: string;
        }>(`SELECT id, name FROM public.tag WHERE name = ANY($1);`, [missing]);
        created.forEach((r) => byName.set(r.name, r.id));
    }

    return byName; // Map<tagName, tagId>
}

async function seedBlogPostsAddOnly(
    client: pkg.ClientBase,
    allAccountIds: string[]
) {
    console.log(`→ Adding ~${NUM_BLOG_POSTS} IELTS blog posts…`);

    // ===== 0) Kiểm tra bảng blog_post tồn tại
    const hasBlogPost = await tableExists(client, 'blog_post');
    if (!hasBlogPost) {
        throw new Error(
            "Table 'public.blog_post' không tồn tại. Hãy tạo bảng theo entity BlogPost trước khi seed."
        );
    }

    // 1) tags
    const tagMap = await ensureTagsAndGetIds(client, DEFAULT_TAGS);
    const tagIds = Array.from(tagMap.values());

    // 2) build blog rows
    type BlogRow = {
        id: string;
        title: string;
        account_id: string;
        title_img: string;
        content: string;
        number_of_reader: number;
        published_date: Date;
        updated_date: Date;
    };

    const posts: BlogRow[] = [];
    const joinRows: Array<{ blog_post_id: string; tag_id: string }> = [];

    for (let i = 0; i < NUM_BLOG_POSTS; i++) {
        const topic = faker.helpers.arrayElement(
            DEFAULT_TAGS.filter((t) => t.startsWith('IELTS'))
        );
        const id = uuidv4();
        const createdAt = randomCreatedAt();
        const authorId = faker.helpers.arrayElement(allAccountIds);

        posts.push({
            id,
            title: buildRandomTitle(topic),
            account_id: authorId,
            title_img: FIXED_TITLE_IMG,
            content: buildIeltsHtml(topic),
            number_of_reader: faker.number.int({ min: 0, max: 25000 }),
            published_date: createdAt,
            updated_date: createdAt,
        });

        const chosen = faker.helpers.arrayElements(tagIds, { min: 2, max: 4 });
        chosen.forEach((tagId) =>
            joinRows.push({ blog_post_id: id, tag_id: tagId })
        );
    }

    // 2.1) Safe fit cho các cột varchar có thể đang bị giới hạn length
    // title
    for (const p of posts) {
        p.title = await safeFitToColumn(client, 'blog_post', 'title', p.title);
        // content có thể là varchar(255) nếu schema chưa chỉnh -> cắt bớt để tránh lỗi
        p.content = await safeFitToColumn(
            client,
            'blog_post',
            'content',
            p.content
        );
        // title_img thường 255 nên cũng cắt an toàn
        p.title_img = await safeFitToColumn(
            client,
            'blog_post',
            'title_img',
            p.title_img
        );
    }

    // 3) insert blog_post
    const cols = [
        'id',
        'title',
        'account_id',
        'title_img',
        'content',
        'number_of_reader',
        'published_date',
        'updated_date',
    ];

    {
        const values: any[] = [];
        const placeholders: string[] = [];
        posts.forEach((r, idx) => {
            const base = idx * cols.length;
            placeholders.push(
                `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8})`
            );
            values.push(
                r.id,
                r.title,
                r.account_id,
                r.title_img,
                r.content,
                r.number_of_reader,
                r.published_date,
                r.updated_date
            );
        });

        await client.query(
            `INSERT INTO public.blog_post (${cols.join(', ')}) VALUES ${placeholders.join(', ')};`,
            values
        );
    }

    // 4) insert join table (tự dò tên bảng & cột)
    const joinResolved = await resolveJoinTableAndColumn(client);
    if (!joinResolved) {
        console.warn(
            '⚠️ Không tìm thấy bảng nối ManyToMany (blog_post_tags/blog_post_tag). Bỏ qua bước gán tag.'
        );
    } else {
        const values: any[] = [];
        const placeholders: string[] = [];
        joinRows.forEach((r, idx) => {
            const base = idx * 2;
            placeholders.push(`($${base + 1}, $${base + 2})`);
            values.push(r.blog_post_id, r.tag_id);
        });

        await client.query(
            `INSERT INTO public.${joinResolved.table} (blog_post_id, ${joinResolved.column}) VALUES ${placeholders.join(', ')};`,
            values
        );
    }

    console.log(
        `✅ Inserted ${posts.length} blog posts${joinResolved ? ` & ${joinRows.length} tag links` : ''}.`
    );
    return posts.map((p) => p.id);
}

// ==== MAIN (gộp) ====
async function main() {
    const client = await connectOrExit();
    console.log('✅ Connected to PostgreSQL (prod add-only)');

    try {
        await client.query('BEGIN');

        // 1) Lấy sẵn tài khoản & email đang có
        const { existingEmails, existingAccountIds } =
            await loadExistingAccounts(client);

        // 2) Thêm accounts mới (ngoại trừ hoang@gmail.com)
        const newAccountIds = await seedAccountsAddOnly(client, existingEmails);

        // 3) Toàn bộ account để dùng cho deck: account cũ + account vừa thêm
        const allAccountIds = [...existingAccountIds, ...newAccountIds];

        // 4) Thêm deck mới (gán vào all accounts)
        const newDeckIds = await seedDecksAddOnly(client, allAccountIds);

        // 5) Thêm cards cho các deck mới
        const deckIdsWithCards = await seedCardsAddOnly(client, newDeckIds);

        // 6) Lấy toàn bộ deck id (cũ + mới) để tạo study_progress
        const existingDeckIds = await loadExistingDeckIds(client);
        const allDeckIds = Array.from(
            new Set([...existingDeckIds, ...deckIdsWithCards])
        );

        // 7) Thêm study_progress (add-only)
        //await seedStudyProgressAddOnly(client, allAccountIds, allDeckIds);

        // 8) Thêm blog posts IELTS (~100 bài) — ADD-ONLY
        await seedBlogPostsAddOnly(client, allAccountIds);

        await client.query('COMMIT');
        console.log('🎉 Seed add-only done (transaction committed).');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error, transaction rolled back:', err);
        console.error(
            'ℹ️ Gợi ý: Nếu lỗi liên quan đến bảng nối Tag, thử đặt ENV JOIN_TABLE/JOIN_TAGS_COLUMN.'
        );
        process.exit(1);
    } finally {
        await client.end();
    }
}

main();
