// seed.ts
import pkg from 'pg';
import { faker } from '@faker-js/faker';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

const { Client } = pkg;

// ==== CONFIG ====
const DATABASE_URL =
    process.env.DATABASE_URL ||
    'postgres://postgres:123456@localhost:5432/band_up';

const NUM_ACCOUNTS = Number(process.env.SEED_ACCOUNTS ?? 20); // số account muốn thêm (không tính các account đã có)
const NUM_DECKS = Number(process.env.SEED_DECKS ?? 300);

const ROLES = ['Admin', 'Member'] as const;
const GENDERS = ['Male', 'Female'] as const;

// ==== UTIL ====
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

// ==== LOAD EXISTING (for prod) ====
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

// ==== SEED ACCOUNT (ADD-ONLY, SKIP hoang@gmail.com) ====
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

// ==== SEED DECK (ADD-ONLY) ====
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

// ==== SEED CARD (ADD-ONLY) ====
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

// ==== SEED STUDY_PROGRESS (ADD-ONLY, BY DECK) ====
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

// ==== MAIN ====
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
        await seedStudyProgressAddOnly(client, allAccountIds, allDeckIds);

        await client.query('COMMIT');
        console.log('🎉 Seed add-only done (transaction committed).');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error, transaction rolled back:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

main();
