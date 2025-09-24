import type { Flashcard } from '@/lib/api/dto/flashcards';
import { Comment } from '@/lib/api/dto/comment';
import { Test, TestOverview } from '@/lib/api/dto/test';

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

export const mockTests: TestOverview[] = [
    {
        id: '1',
        title: 'Cambridge 10 - Test 1 - Reading',
        created_at: '2024-01-15T10:30:00Z',
        skill: 'Reading',
        number_participant: 30,
        comments: 12,
        duration: 60,
    },
    {
        id: '2',
        title: 'Cambridge 10 - Test 2 - Writing',
        created_at: '2024-01-14T14:20:00Z',
        skill: 'Writing',
        number_participant: 70,
        comments: 5,
        duration: 60,
    },
    {
        id: '3',
        title: 'Cambridge 10 - Test 3 - Listening',
        created_at: '2024-01-13T09:15:00Z',
        skill: 'Listening',
        number_participant: 26,
        comments: 8,
        duration: 30,
    },
    {
        id: '4',
        title: 'Cambridge 10 - Test 4 - Speaking',
        created_at: '2024-01-12T16:45:00Z',
        skill: 'Speaking',
        number_participant: 39,
        comments: 15,
        duration: 15,
    },
];

export const listeningTest: Test = {
    id: 'listening-test-001',
    title: 'Cambridge 10 - Test 3 - Listening',
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

export const readingTest: Test = {
    id: 'reading-test-001',
    title: 'Cambridge 12 - Test 5 - Reading',
    duration: 60,
    skill: 'Reading',
    number_sections: 3,
    number_questions: 40,
    number_participant: 987,
    section: [
        {
            id: 'section-1',
            title: 'Passage 1',
            questions: 13,
            description: 'Reading passage on everyday topic',
        },
        {
            id: 'section-2',
            title: 'Passage 2',
            questions: 13,
            description: 'Reading passage on social science',
        },
        {
            id: 'section-3',
            title: 'Passage 3',
            questions: 14,
            description: 'Reading passage on academic or scientific subject',
        },
    ],
};

export const writingTest: Test = {
    id: 'writing-test-001',
    title: 'Cambridge 11 - Writing Task 1 & 2',
    duration: 60,
    skill: 'Writing',
    number_sections: 2,
    number_questions: 2,
    number_participant: 654,
    section: [
        {
            id: 'task-1',
            title: 'Task 1',
            questions: 1,
            description: 'Describe graph, chart, or diagram',
        },
        {
            id: 'task-2',
            title: 'Task 2',
            questions: 1,
            description: 'Essay on academic or general topic',
        },
    ],
};

export const speakingTest: Test = {
    id: 'speaking-test-001',
    title: 'IELTS Speaking Mock Test - Part 1 & Part 2-3',
    duration: 15,
    skill: 'Speaking',
    number_sections: 2,
    number_questions: 10,
    number_participant: 432,
    section: [
        {
            id: 'part-1',
            title: 'Part 1',
            questions: 4,
            description: 'Introduction and interview questions',
        },
        {
            id: 'part-2-3',
            title: 'Part 2 & 3',
            questions: 6,
            description: 'Cue card long turn followed by discussion questions',
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
