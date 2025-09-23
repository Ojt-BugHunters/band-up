import type { Flashcard } from '@/lib/api/dto/flashcards';
import { Comment } from '@/lib/api/dto/comment';
import { Test, TestOverview } from '@/lib/api/dto/test';
import { FlashcardItem } from '@/lib/api/dto/flashcarditem';

export const mockFlashcards: Flashcard[] = [
    {
        id: '1',
        title: 'IELTS Vocabulary - Technology',
        description:
            'Learn essential technology-related vocabulary for IELTS with example sentences and usage tips.',
        author_name: 'John Doe',
        number_learner: 120,
        created_at: '2025-09-18T10:30:00Z',
        is_public: true,
    },
    {
        id: '2',
        title: 'IELTS Reading - Skimming Technique',
        description:
            'Master the skimming technique to quickly identify key ideas in reading passages.',
        author_name: 'Jane Smith',
        number_learner: 95,
        created_at: '2025-09-19T14:00:00Z',
        is_public: true,
    },
    {
        id: '3',
        title: 'IELTS Grammar - Conditionals',
        description:
            'Comprehensive practice on conditional sentences (zero, first, second, and third).',
        author_name: 'Michael Johnson',
        number_learner: 87,
        created_at: '2025-09-20T08:45:00Z',
        is_public: false,
    },
    {
        id: '4',
        title: 'IELTS Speaking - Linking Words',
        description:
            'Enhance fluency and coherence with common linking words and phrases for speaking.',
        author_name: 'Emily Brown',
        number_learner: 110,
        created_at: '2025-09-21T09:15:00Z',
        is_public: true,
    },
    {
        id: '5',
        title: 'IELTS Listening - Instructions',
        description:
            'Practice listening tasks with common IELTS instructions to avoid mistakes.',
        author_name: 'David Lee',
        number_learner: 76,
        created_at: '2025-09-21T17:00:00Z',
        is_public: true,
    },
    {
        id: '6',
        title: 'IELTS Writing - Task 2 Opinion Essay',
        description:
            'Learn to structure opinion essays with thesis statements and supporting ideas.',
        author_name: 'Sophia Wilson',
        number_learner: 132,
        created_at: '2025-09-22T08:00:00Z',
        is_public: false,
    },
    {
        id: '7',
        title: 'IELTS Vocabulary - Environment',
        description:
            'Expand your vocabulary on environmental issues and sustainability topics.',
        author_name: 'Daniel Kim',
        number_learner: 140,
        created_at: '2025-09-22T12:45:00Z',
        is_public: true,
    },
    {
        id: '8',
        title: 'IELTS Grammar - Complex Sentences',
        description:
            'Master relative clauses and other structures to form advanced sentences.',
        author_name: 'Olivia Martinez',
        number_learner: 102,
        created_at: '2025-09-23T09:30:00Z',
        is_public: true,
    },
    {
        id: '9',
        title: 'IELTS Reading - Matching Headings',
        description:
            'Improve your skills in matching headings to paragraphs efficiently.',
        author_name: 'William Chen',
        number_learner: 89,
        created_at: '2025-09-24T07:50:00Z',
        is_public: false,
    },
    {
        id: '10',
        title: 'IELTS Listening - Multiple Choice',
        description:
            'Practice multiple-choice listening tasks and learn to avoid distractors.',
        author_name: 'Isabella Nguyen',
        number_learner: 150,
        created_at: '2025-09-24T11:15:00Z',
        is_public: true,
    },
    {
        id: '11',
        title: 'IELTS Writing - Task 1 Overview',
        description:
            'Learn how to write effective overview statements for IELTS Task 1.',
        author_name: 'James Anderson',
        number_learner: 73,
        created_at: '2025-09-25T09:05:00Z',
        is_public: true,
    },
    {
        id: '12',
        title: 'IELTS Speaking - Part 2 Cue Card',
        description:
            'Practice with cue card prompts and learn useful signposting language.',
        author_name: 'Mia Patel',
        number_learner: 98,
        created_at: '2025-09-25T14:40:00Z',
        is_public: true,
    },
];

export const flashcardItemsForSet1: FlashcardItem[] = [
    {
        id: '1-1',
        flashcard_id: '1',
        front: 'Artificial Intelligence (AI)',
        back: 'Trí tuệ nhân tạo – công nghệ mô phỏng trí tuệ con người.',
        example: 'AI is revolutionizing industries such as healthcare and finance.',
    },
    {
        id: '1-2',
        flashcard_id: '1',
        front: 'Cybersecurity',
        back: 'An ninh mạng – bảo vệ hệ thống khỏi các mối đe dọa số.',
        example: 'Cybersecurity has become a critical issue for modern businesses.',
    },
    {
        id: '1-3',
        flashcard_id: '1',
        front: 'Cloud Computing',
        back: 'Điện toán đám mây – lưu trữ và xử lý dữ liệu qua internet.',
        example: 'Many companies use cloud computing to reduce infrastructure costs.',
    },
    {
        id: '1-4',
        flashcard_id: '1',
        front: 'Big Data',
        back: 'Dữ liệu lớn – tập hợp khối lượng dữ liệu khổng lồ cần phân tích.',
        example: 'Big Data helps organizations understand customer behavior.',
    },
    {
        id: '1-5',
        flashcard_id: '1',
        front: 'Blockchain',
        back: 'Chuỗi khối – công nghệ lưu trữ dữ liệu phân tán, bảo mật.',
        example: 'Blockchain is the underlying technology behind cryptocurrencies.',
    },
];

export const mockTests: TestOverview[] = [
    {
        id: '1',
        title: 'IELTS Academic Reading Practice Test 1',
        created_at: '2024-01-15T10:30:00Z',
        skill: 'Reading',
        number_participant: 30,
        comments: 12,
        duration: 60,
    },
    {
        id: '2',
        title: 'IELTS General Writing Task 1 & 2',
        created_at: '2024-01-14T14:20:00Z',
        skill: 'Writing',
        number_participant: 70,
        comments: 5,
        duration: 60,
    },
    {
        id: '3',
        title: 'IELTS Listening Mock Test - Academic',
        created_at: '2024-01-13T09:15:00Z',
        skill: 'Listening',
        number_participant: 26,
        comments: 8,
        duration: 30,
    },
    {
        id: '4',
        title: 'IELTS Speaking Part 1, 2 & 3 Practice',
        created_at: '2024-01-12T16:45:00Z',
        skill: 'Speaking',
        number_participant: 39,
        comments: 15,
        duration: 15,
    },
    {
        id: '5',
        title: 'IELTS Academic Writing Task 1 - Graphs',
        created_at: '2024-01-11T11:00:00Z',
        skill: 'Writing',
        number_participant: 40,
        comments: 3,
        duration: 20,
    },
    {
        id: '6',
        title: 'IELTS Reading - True/False/Not Given Focus',
        created_at: '2024-01-10T13:30:00Z',
        skill: 'Reading',
        number_participant: 120,
        comments: 10,
        duration: 45,
    },
    ...Array.from({ length: 14 }).map((_, idx) => ({
        id: 'idx + 7',
        title: `Extra Mock Test ${idx + 7}`,
        created_at: '2024-01-09T10:00:00Z',
        skill: ['Reading', 'Writing', 'Listening', 'Speaking'][idx % 4],
        number_participant: Math.floor(Math.random() * 150),
        comments: Math.floor(Math.random() * 20),
        duration: [15, 30, 45, 60][idx % 4],
    })),
];

export const testData: Test = {
    id: 'listening-test-001',
    title: 'IELTS Listening Practice Test 1',
    duration: 30,
    skill: 'Listening',
    number_sections: 4,
    number_questions: 40,
    number_participant: 1247,
    section: [
        {
            id: 'section-1',
            title: 'Section 1',
            questions: 10,
            description: 'Conversation in everyday social context',
        },
        {
            id: 'section-2',
            title: 'Section 2',
            questions: 10,
            description: 'Monologue in everyday social context',
        },
        {
            id: 'section-3',
            title: 'Section 3',
            questions: 10,
            description: 'Conversation in educational context',
        },
        {
            id: 'section-4',
            title: 'Section 4',
            questions: 10,
            description: 'Monologue on academic subject',
        },
    ],
};

export const comments: Comment[] = [
    {
        id: 'c1',
        content: 'Bài viết này thực sự rất hữu ích. Cảm ơn tác giả!',
        author_name: 'Nguyễn Văn A',
        reply: [
            {
                id: 'r1',
                content:
                    'Cảm ơn bạn đã quan tâm, mình sẽ viết thêm nhiều chủ đề khác nữa.',
                author_name: 'Tác giả',
            },
        ],
    },
    {
        id: 'c2',
        content: 'Mình thấy phần giải thích đoạn 3 hơi khó hiểu 😅',
        author_name: 'Trần Thị B',
        reply: [
            {
                id: 'r2',
                content: 'Cảm ơn bạn góp ý, mình sẽ chỉnh sửa để dễ hiểu hơn!',
                author_name: 'Tác giả',
            },
        ],
    },
];
