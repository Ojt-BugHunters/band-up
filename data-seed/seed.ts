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

const NUM_ACCOUNTS = Number(process.env.SEED_ACCOUNTS ?? 10);
const NUM_DECKS = Number(process.env.SEED_DECKS ?? 250);

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
    const client = new Client({ connectionString: DATABASE_URL });
    try {
        await client.connect();
        return client;
    } catch (err) {
        console.error('❌ Cannot connect to PostgreSQL:', err);
        process.exit(1);
    }
}

// ==== SEED ACCOUNT ====
async function seedAccounts(client: pkg.ClientBase) {
    console.log('→ Clearing account...');
    await client.query('DELETE FROM public.account;');

    const plainPassword = 'Test@123';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const usedEmails = new Set<string>();
    const rows: any[] = [];

    for (let i = 0; i < NUM_ACCOUNTS; i++) {
        const id = uuidv4();
        const name = faker.person.fullName();
        let email: string;
        do {
            email = faker.internet
                .email({
                    firstName: name.split(' ')[0],
                    lastName: name.split(' ').slice(-1)[0],
                })
                .toLowerCase();
        } while (usedEmails.has(email));
        usedEmails.add(email);

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
            role: i < 2 ? ROLES[0] : ROLES[1],
        });
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

    console.log('✅ Seed account done.');
    return rows.map((r) => r.id);
}

// ==== SEED DECK ====
async function seedDecks(client: pkg.ClientBase, accountIds: string[]) {
    console.log(`→ Clearing deck...`);
    await client.query('DELETE FROM public.deck;');

    const decks: any[] = [];

    for (let i = 0; i < NUM_DECKS; i++) {
        const id = uuidv4();
        const account_id = faker.helpers.arrayElement(accountIds);
        decks.push({
            id,
            created_at: randomCreatedAt(),
            description: faker.lorem.sentence(),
            is_public: faker.datatype.boolean(),
            learner_number: faker.number.int({ min: 0, max: 500 }),
            password: null,
            title: faker.word.words({ count: { min: 2, max: 4 } }),
            account_id,
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

    console.log('✅ Seed deck done.');
    return decks.map((d) => d.id);
}

// ==== SEED CARD ====
async function seedCards(client: pkg.ClientBase, deckIds: string[]) {
    console.log('→ Clearing card...');
    await client.query('DELETE FROM public.card;');

    const cards: any[] = [];

    for (const deckId of deckIds) {
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

    console.log('✅ Seed card done.');
    return cards.map((c) => ({
        id: c.id,
        deck_id: c.deck_id,
    }));
}

// ==== SEED STUDY_PROGRESS ====
async function seedStudyProgress(
    client: pkg.ClientBase,
    accountIds: string[],
    cards: { id: string; deck_id: string }[]
) {
    console.log('→ Clearing study_progress...');
    await client.query('DELETE FROM public.study_progress;');

    const progresses: any[] = [];
    for (const accId of accountIds) {
        const learned = faker.helpers.arrayElements(cards, {
            min: 10,
            max: 40,
        });
        for (const item of learned) {
            progresses.push({
                id: uuidv4(),
                account_id: accId,
                card_id: item.id,
                deck_id: item.deck_id,
            });
        }
    }

    const columns = ['id', 'account_id', 'card_id', 'deck_id'];
    const values: any[] = [];
    const placeholders: string[] = [];

    progresses.forEach((r, idx) => {
        const base = idx * columns.length;
        placeholders.push(
            `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`
        );
        values.push(r.id, r.account_id, r.card_id, r.deck_id);
    });

    await client.query(
        `INSERT INTO public.study_progress (${columns.join(', ')}) VALUES ${placeholders.join(', ')};`,
        values
    );

    console.log('✅ Seed study_progress done.');
}

// ==== MAIN ====
async function main() {
    const client = await connectOrExit();
    console.log('✅ Connected to PostgreSQL');

    try {
        await client.query('BEGIN');

        const accountIds = await seedAccounts(client);
        const deckIds = await seedDecks(client, accountIds);
        const cards = await seedCards(client, deckIds);
        await seedStudyProgress(client, accountIds, cards);

        await client.query('COMMIT');
        console.log('🎉 All seed done (transaction committed).');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error, transaction rolled back:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

main();
