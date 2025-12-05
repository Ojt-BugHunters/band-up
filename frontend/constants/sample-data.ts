import { User } from '@/lib/service/account';
import { BlogReact, Author, ReactType } from '@/lib/service/blog';
import { Comment } from '@/lib/service/comment';
import { WritingTask } from '@/lib/service/test/question';
import { Test, TestHistory } from '@/lib/service/test';
import { LeaderboardUser } from '@/lib/service/room';

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
            id: 'section-1',
            title: 'Task 1',
            questions: 1,
            description: 'Describe graph, chart, or diagram',
        },
        {
            id: 'section-2',
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
            id: 'section-1',
            title: 'Part 1',
            questions: 4,
            description: 'Introduction and interview questions',
        },
        {
            id: 'section-2-3',
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
        author: {
            id: 'u1',
            name: 'Nguyễn Văn A',
            avatar: '/speaking.png',
        },
        reply: [
            {
                id: 'r1',
                content:
                    'Cảm ơn bạn đã quan tâm, mình sẽ viết thêm nhiều chủ đề khác nữa.',
                author: {
                    id: 'u0',
                    name: 'Tác giả',
                    avatar: '/writing.png',
                },
            },
        ],
    },
    {
        id: 'c2',
        content: 'Mình thấy phần giải thích đoạn 3 hơi khó hiểu 😅',
        author: {
            id: 'u2',
            name: 'Trần Thị B',
            avatar: '/writing.png',
        },
        reply: [
            {
                id: 'r2',
                content: 'Cảm ơn bạn góp ý, mình sẽ chỉnh sửa để dễ hiểu hơn!',
                author: {
                    id: 'u0',
                    name: 'Tác giả',
                    avatar: '/dictation.png',
                },
            },
        ],
    },
    {
        id: 'c3',
        content:
            'Phần ví dụ minh họa rất trực quan, mình đã hiểu rõ hơn phần này rồi!',
        author: {
            id: 'u3',
            name: 'Lê Minh C',
        },
        reply: [],
    },
];
export const writingTasks: WritingTask[] = [
    {
        id: 'section-1',
        title: 'Academic Writing Task 1',
        content:
            'The chart below shows the percentage of households in owned and rented accommodation in England and Wales between 1918 and 2011. Summarise the information by selecting and reporting the main features, and make comparisons where relevant',
        imageUrl: '/writing-test-1.jpg',
    },
    {
        id: 'section-2',
        title: 'Academic Writing Task 2',
        content:
            'Some people think that all university students should study whatever they like. Others believe that they should only be allowed to study subjects that will be useful in the future, such as those related to science and technology. Discuss both these views and give your own opinion. Give reasons for your answer and include any relevant examples from your own knowledge or experience.',
    },
];

export const speakingTestParts = [
    {
        id: 'section-1',
        title: 'Part 1: Introduction and Interview',
        duration: 4 * 60,
        description:
            'The examiner will ask you general questions about yourself and a range of familiar topics.',
        questions: [
            {
                id: 1,
                question: 'What is your full name?',
            },
            {
                id: 2,
                question: 'Can I see your identification please?',
            },
            {
                id: 3,
                question: 'Where are you from?',
            },
            {
                id: 4,
                question: 'Do you work or are you a student?',
            },
            {
                id: 5,
                question: 'What do you like most about your work/studies?',
            },
            {
                id: 6,
                question:
                    "Let's talk about your hometown. What's your hometown like?",
            },
            {
                id: 7,
                question: 'What do you like about your hometown?',
            },
            {
                id: 8,
                question: 'What would you like to change about your hometown?',
            },
            {
                id: 9,
                question:
                    "Let's move on to talk about food. What's your favorite food?",
            },
            {
                id: 10,
                question:
                    'Do you prefer eating at home or in restaurants? Why?',
            },
            {
                id: 11,
                question:
                    'Have your eating habits changed since you were younger?',
            },
            {
                id: 12,
                question:
                    "Do you think it's important to eat healthy food? Why?",
            },
        ],
    },
    {
        id: 'section-2',
        title: 'Part 2: Individual Long Turn',
        duration: 3 * 60,
        description:
            'You will be given a task card with a topic. You have 1 minute to prepare and then speak for 1-2 minutes.',
        questions: [
            {
                id: 13,
                question:
                    'Describe a memorable journey you have taken.\n\nYou should say:\n• Where you went\n• Who you went with\n• What you did there\n• And explain why this journey was memorable for you\n\nYou will have 1 minute to prepare your talk and then you will need to talk for 1-2 minutes.',
            },
        ],
    },
    {
        id: 'section-3',
        title: 'Part 3: Two-way Discussion',
        duration: 4 * 60,
        description:
            'The examiner will ask you further questions connected to the topic in Part 2.',
        questions: [
            {
                id: 14,
                question: 'How has travel changed over the past few decades?',
            },
            {
                id: 15,
                question:
                    'What are the benefits of traveling to different countries?',
            },
            {
                id: 16,
                question:
                    'Do you think virtual reality will replace real travel in the future? Why or why not?',
            },
            {
                id: 17,
                question:
                    'Some people say that traveling is a waste of money. What do you think?',
            },
            {
                id: 18,
                question:
                    'How important is it for young people to travel? Why?',
            },
            {
                id: 19,
                question: 'What impact does tourism have on local communities?',
            },
            {
                id: 20,
                question:
                    'Do you think people will travel more or less in the future? Why?',
            },
            {
                id: 21,
                question: 'How can governments encourage responsible tourism?',
            },
        ],
    },
];
export const user: User = {
    id: '1',
    role: 'Premium Member',
    email: 'namdangcoder@gmail.com',
    phone: '0123456789',
    name: 'Nam Dang',
    gender: 'Male',
    address: '123 street, Viet Nam',
    birthday: new Date(),
    isActive: true,
};

export const testHistory: TestHistory[] = [
    {
        id: '1',
        skill: 'Listening',
        date: '2025-01-15',
        duration: '30 mins',
        overallScore: 7.5,
        totalQuestions: 40,
        correctAnswers: 32,
        accuracy: 80,
        questions: [
            ...Array.from({ length: 10 }, (_, i) => ({
                questionNumber: i + 1,
                isCorrect: i !== 5, // Question 6 is wrong
                section: 'Section 1',
            })),
            // Section 2 (8/10 correct)
            ...Array.from({ length: 10 }, (_, i) => ({
                questionNumber: i + 11,
                isCorrect: i !== 3 && i !== 7, // Questions 14 and 18 are wrong
                section: 'Section 2',
            })),
            // Section 3 (7/10 correct)
            ...Array.from({ length: 10 }, (_, i) => ({
                questionNumber: i + 21,
                isCorrect: i !== 1 && i !== 4 && i !== 8, // Questions 22, 25, 29 are wrong
                section: 'Section 3',
            })),
            // Section 4 (8/10 correct)
            ...Array.from({ length: 10 }, (_, i) => ({
                questionNumber: i + 31,
                isCorrect: i !== 2 && i !== 6, // Questions 33 and 37 are wrong
                section: 'Section 4',
            })),
        ],
        sectionScores: [
            { section: 'Section 1', score: 9, maxScore: 10 },
            { section: 'Section 2', score: 8, maxScore: 10 },
            { section: 'Section 3', score: 7, maxScore: 10 },
            { section: 'Section 4', score: 8, maxScore: 10 },
        ],
        timeSpent: [
            { section: 'Section 1', minutes: 7 },
            { section: 'Section 2', minutes: 8 },
            { section: 'Section 3', minutes: 8 },
            { section: 'Section 4', minutes: 7 },
        ],
        difficultyBreakdown: [
            { level: 'Easy', correct: 12, total: 13 },
            { level: 'Medium', correct: 14, total: 17 },
            { level: 'Hard', correct: 6, total: 10 },
        ],
    },
    {
        id: '2',
        skill: 'Reading',
        date: '2025-01-10',
        duration: '60 mins',
        overallScore: 8.0,
        totalQuestions: 40,
        correctAnswers: 35,
        accuracy: 87.5,
        questions: [
            // Passage 1 (12/13 correct)
            ...Array.from({ length: 13 }, (_, i) => ({
                questionNumber: i + 1,
                isCorrect: i !== 7, // Question 8 is wrong
                section: 'Passage 1',
            })),
            // Passage 2 (11/13 correct)
            ...Array.from({ length: 13 }, (_, i) => ({
                questionNumber: i + 14,
                isCorrect: i !== 4 && i !== 9, // Questions 18 and 23 are wrong
                section: 'Passage 2',
            })),
            // Passage 3 (12/14 correct)
            ...Array.from({ length: 14 }, (_, i) => ({
                questionNumber: i + 27,
                isCorrect: i !== 2 && i !== 10, // Questions 29 and 37 are wrong
                section: 'Passage 3',
            })),
        ],
        sectionScores: [
            { section: 'Passage 1', score: 12, maxScore: 13 },
            { section: 'Passage 2', score: 11, maxScore: 13 },
            { section: 'Passage 3', score: 12, maxScore: 14 },
        ],
        timeSpent: [
            { section: 'Passage 1', minutes: 18 },
            { section: 'Passage 2', minutes: 20 },
            { section: 'Passage 3', minutes: 22 },
        ],
        difficultyBreakdown: [
            { level: 'Easy', correct: 13, total: 13 },
            { level: 'Medium', correct: 15, total: 17 },
            { level: 'Hard', correct: 7, total: 10 },
        ],
    },
    {
        id: '3',
        skill: 'Writing',
        date: '2025-01-05',
        duration: '60 mins',
        overallScore: 7.0,
        totalQuestions: 2,
        correctAnswers: 2,
        accuracy: 100,
        sectionScores: [
            { section: 'Task Achievement', score: 7, maxScore: 9 },
            { section: 'Coherence & Cohesion', score: 7, maxScore: 9 },
            { section: 'Lexical Resource', score: 7, maxScore: 9 },
            { section: 'Grammar Accuracy', score: 7, maxScore: 9 },
        ],
        timeSpent: [
            { section: 'Task 1', minutes: 20 },
            { section: 'Task 2', minutes: 40 },
        ],
        difficultyBreakdown: [
            { level: 'Task 1', correct: 1, total: 1 },
            { level: 'Task 2', correct: 1, total: 1 },
        ],
    },
    {
        id: '4',
        skill: 'Speaking',
        date: '2024-12-28',
        duration: '15 mins',
        overallScore: 7.5,
        totalQuestions: 3,
        correctAnswers: 3,
        accuracy: 100,
        sectionScores: [
            { section: 'Fluency & Coherence', score: 8, maxScore: 9 },
            { section: 'Lexical Resource', score: 7, maxScore: 9 },
            { section: 'Grammar Range', score: 7, maxScore: 9 },
            { section: 'Pronunciation', score: 8, maxScore: 9 },
        ],
        timeSpent: [
            { section: 'Part 1', minutes: 5 },
            { section: 'Part 2', minutes: 6 },
            { section: 'Part 3', minutes: 4 },
        ],
        difficultyBreakdown: [
            { level: 'Part 1', correct: 1, total: 1 },
            { level: 'Part 2', correct: 1, total: 1 },
            { level: 'Part 3', correct: 1, total: 1 },
        ],
    },
    {
        id: '5',
        skill: 'Listening',
        date: '2024-12-20',
        duration: '30 mins',
        overallScore: 6.5,
        totalQuestions: 40,
        correctAnswers: 28,
        accuracy: 70,
        questions: [
            ...Array.from({ length: 10 }, (_, i) => ({
                questionNumber: i + 1,
                isCorrect: i !== 4 && i !== 8,
                section: 'Section 1',
            })),
            ...Array.from({ length: 10 }, (_, i) => ({
                questionNumber: i + 11,
                isCorrect: i !== 2 && i !== 5 && i !== 9,
                section: 'Section 2',
            })),
            ...Array.from({ length: 10 }, (_, i) => ({
                questionNumber: i + 21,
                isCorrect: i !== 1 && i !== 3 && i !== 6 && i !== 8,
                section: 'Section 3',
            })),
            ...Array.from({ length: 10 }, (_, i) => ({
                questionNumber: i + 31,
                isCorrect: i !== 0 && i !== 4 && i !== 7,
                section: 'Section 4',
            })),
        ],
        sectionScores: [
            { section: 'Section 1', score: 8, maxScore: 10 },
            { section: 'Section 2', score: 7, maxScore: 10 },
            { section: 'Section 3', score: 6, maxScore: 10 },
            { section: 'Section 4', score: 7, maxScore: 10 },
        ],
        timeSpent: [
            { section: 'Section 1', minutes: 7 },
            { section: 'Section 2', minutes: 8 },
            { section: 'Section 3', minutes: 8 },
            { section: 'Section 4', minutes: 7 },
        ],
        difficultyBreakdown: [
            { level: 'Easy', correct: 11, total: 13 },
            { level: 'Medium', correct: 12, total: 17 },
            { level: 'Hard', correct: 5, total: 10 },
        ],
    },
    {
        id: '6',
        skill: 'Reading',
        date: '2024-12-15',
        duration: '20 mins',
        overallScore: 7.5,
        totalQuestions: 13,
        correctAnswers: 11,
        accuracy: 84.6,
        questions: [
            { questionNumber: 1, isCorrect: true, section: 'Passage 1' },
            { questionNumber: 2, isCorrect: true, section: 'Passage 1' },
            { questionNumber: 3, isCorrect: false, section: 'Passage 1' },
            { questionNumber: 4, isCorrect: true, section: 'Passage 1' },
            { questionNumber: 5, isCorrect: true, section: 'Passage 1' },
            { questionNumber: 6, isCorrect: true, section: 'Passage 1' },
            { questionNumber: 7, isCorrect: false, section: 'Passage 1' },
            { questionNumber: 8, isCorrect: true, section: 'Passage 1' },
            { questionNumber: 9, isCorrect: true, section: 'Passage 1' },
            { questionNumber: 10, isCorrect: true, section: 'Passage 1' },
            { questionNumber: 11, isCorrect: true, section: 'Passage 1' },
            { questionNumber: 12, isCorrect: true, section: 'Passage 1' },
            { questionNumber: 13, isCorrect: true, section: 'Passage 1' },
        ],
        sectionScores: [{ section: 'Passage 1', score: 11, maxScore: 13 }],
        timeSpent: [{ section: 'Passage 1', minutes: 20 }],
        difficultyBreakdown: [
            { level: 'Easy', correct: 5, total: 5 },
            { level: 'Medium', correct: 4, total: 5 },
            { level: 'Hard', correct: 2, total: 3 },
        ],
    },
    {
        id: '7',
        skill: 'Reading',
        date: '2024-12-15',
        duration: '20 mins',
        overallScore: 7.5,
        totalQuestions: 13,
        correctAnswers: 11,
        accuracy: 84.6,
        questions: [
            { questionNumber: 1, isCorrect: true, section: 'Passage 1' },
            { questionNumber: 2, isCorrect: true, section: 'Passage 1' },
            { questionNumber: 3, isCorrect: false, section: 'Passage 1' },
            { questionNumber: 4, isCorrect: true, section: 'Passage 1' },
            { questionNumber: 5, isCorrect: true, section: 'Passage 1' },
            { questionNumber: 6, isCorrect: true, section: 'Passage 1' },
            { questionNumber: 7, isCorrect: false, section: 'Passage 1' },
            { questionNumber: 8, isCorrect: true, section: 'Passage 1' },
            { questionNumber: 9, isCorrect: true, section: 'Passage 1' },
            { questionNumber: 10, isCorrect: true, section: 'Passage 1' },
            { questionNumber: 11, isCorrect: true, section: 'Passage 1' },
            { questionNumber: 12, isCorrect: true, section: 'Passage 1' },
            { questionNumber: 13, isCorrect: true, section: 'Passage 1' },
        ],
        sectionScores: [{ section: 'Passage 1', score: 11, maxScore: 13 }],
        timeSpent: [{ section: 'Passage 1', minutes: 20 }],
        difficultyBreakdown: [
            { level: 'Easy', correct: 5, total: 5 },
            { level: 'Medium', correct: 4, total: 5 },
            { level: 'Hard', correct: 2, total: 3 },
        ],
    },
];

export const mockAccountBlogs = [
    {
        id: 1,
        title: 'How to reach 9.0 IELTS!?',
        description: 'The sharing of roadmap to reach master IELTS',
        date: 'Dec 10, 2023',
    },
    {
        id: 2,
        title: 'IELTS Speaking Part 1 Tips',
        description: 'Answer naturally and confidently with these tricks',
        date: 'Dec 15, 2023',
    },
    {
        id: 3,
        title: 'IELTS Writing Task 2 Structures',
        description: 'Common templates to organize your essays',
        date: 'Dec 20, 2023',
    },
    {
        id: 4,
        title: 'Improve IELTS Listening',
        description: 'Techniques to catch every keyword and detail',
        date: 'Dec 25, 2023',
    },
    {
        id: 5,
        title: 'Reading True/False/Not Given',
        description: 'Step-by-step strategy to avoid traps',
        date: 'Jan 2, 2024',
    },
    {
        id: 6,
        title: 'Vocabulary for IELTS 8.0+',
        description: 'Must-know academic words for high scores',
        date: 'Jan 8, 2024',
    },
    {
        id: 7,
        title: 'Time Management in IELTS',
        description: 'How to use your 2 hours 45 minutes wisely',
        date: 'Jan 12, 2024',
    },
    {
        id: 8,
        title: 'Common IELTS Mistakes',
        description: 'Avoid these errors to save your score',
        date: 'Jan 20, 2024',
    },
    {
        id: 9,
        title: 'Speaking Fluency Hacks',
        description: 'How to speak smoothly without hesitation',
        date: 'Jan 25, 2024',
    },
    {
        id: 10,
        title: 'Task 1 Writing Visuals',
        description: 'How to describe graphs and charts effectively',
        date: 'Feb 1, 2024',
    },
    {
        id: 11,
        title: 'IELTS Grammar Essentials',
        description: 'Focus on accuracy and complex structures',
        date: 'Feb 10, 2024',
    },
    {
        id: 12,
        title: 'How to Self-Study IELTS',
        description: 'Plan your journey without expensive classes',
        date: 'Feb 20, 2024',
    },
];

export const authors: Author[] = [
    { id: 'a1', name: 'Nam Dang', avatar: 'https://i.pravatar.cc/80?img=1' },
    { id: 'a2', name: 'Linh Nguyen', avatar: 'https://i.pravatar.cc/80?img=2' },
    { id: 'a3', name: 'Minh Tran', avatar: 'https://i.pravatar.cc/80?img=3' },
    { id: 'a4', name: 'An Pham', avatar: 'https://i.pravatar.cc/80?img=4' },
    { id: 'a5', name: 'Khanh Le', avatar: 'https://i.pravatar.cc/80?img=5' },
    { id: 'a6', name: 'Hoa Do', avatar: 'https://i.pravatar.cc/80?img=6' },
    { id: 'a7', name: 'Quang Bui', avatar: 'https://i.pravatar.cc/80?img=7' },
    { id: 'a8', name: 'Lan Phan', avatar: 'https://i.pravatar.cc/80?img=8' },
    { id: 'a9', name: 'Duc Hoang', avatar: 'https://i.pravatar.cc/80?img=9' },
    { id: 'a10', name: 'My Vu', avatar: 'https://i.pravatar.cc/80?img=10' },
    {
        id: 'a11',
        name: 'Tien Nguyen',
        avatar: 'https://i.pravatar.cc/80?img=11',
    },
    { id: 'a12', name: 'Thu Ha', avatar: 'https://i.pravatar.cc/80?img=12' },
];

export const A = {
    nam: authors[0],
    linh: authors[1],
    minh: authors[2],
    an: authors[3],
    khanh: authors[4],
    hoa: authors[5],
    quang: authors[6],
    lan: authors[7],
    duc: authors[8],
    my: authors[9],
    tien: authors[10],
    ha: authors[11],
};

const pick = <T>(arr: T[], count: number) =>
    arr.slice(0, Math.max(0, Math.min(count, arr.length)));

const reactTypes: ReactType[] = ['like', 'love', 'wow', 'haha', 'sad', 'angry'];

export function makeReacts(postId: string, count = 5): BlogReact[] {
    const chosenAuthors = pick(
        [...authors].sort(() => Math.random() - 0.5),
        count,
    );
    return chosenAuthors.map((u, i) => ({
        id: `${postId}-r${i + 1}`,
        reactAuthor: u,
        reactType: reactTypes[(i + postId.length) % reactTypes.length],
    }));
}
// for room
export const mockLeaderboardData: LeaderboardUser[] = [
    {
        rank: 1,
        username: 'Selva Ri',
        avatar: 'SR',
        studyTime: '4h 30m',
        rankChange: null,
    },
    {
        rank: 2,
        username: 'Mithun Nandhakumar',
        avatar: 'MN',
        studyTime: '4h 10m',
        rankChange: null,
    },
    {
        rank: 3,
        username: 'Moni',
        avatar: 'M',
        studyTime: '4h 10m',
        rankChange: 'up',
    },
    {
        rank: 4,
        username: 'Minh Tiến',
        avatar: 'MT',
        studyTime: '3h 50m',
        rankChange: 'up',
        country: '🇻🇳',
        status: 'Ho Chi Minh City',
    },
    {
        rank: 5,
        username: 'Amaya',
        avatar: 'A',
        studyTime: '3h 21m',
        rankChange: null,
        status: 'preparing for university entering exam',
    },
    {
        rank: 6,
        username: 'Ms.Peachblossom',
        avatar: 'M',
        studyTime: '3h 20m',
        rankChange: null,
    },
    {
        rank: 7,
        username: 'Smith Truong',
        avatar: 'ST',
        studyTime: '3h 20m',
        rankChange: null,
        country: '🇻🇳',
    },
    {
        rank: 8,
        username: 'DangDuy Nguyen',
        avatar: 'DN',
        studyTime: '3h 0m',
        rankChange: null,
    },
    {
        rank: 9,
        username: 'Mai Dang Huy',
        avatar: 'MDH',
        studyTime: '3h 0m',
        rankChange: 'down',
        country: '🇻🇳',
    },
    {
        rank: 10,
        username: 'Nguyễn Khánh',
        avatar: 'NK',
        studyTime: '2h 55m',
        rankChange: null,
    },
    {
        rank: 11,
        username: 'Opstry',
        avatar: 'O',
        studyTime: '2h 47m',
        rankChange: 'down',
    },
];

export const mockAnalyticsData = [
    { time: '12AM', minutes: 0 },
    { time: '4AM', minutes: 0 },
    { time: '8AM', minutes: 45 },
    { time: '12PM', minutes: 120 },
    { time: '4PM', minutes: 180 },
    { time: '8PM', minutes: 90 },
];

export const mockStats = {
    totalSessions: 0,
    focusedTime: '0m',
    bestSessions: 0,
    tasksCompleted: 0,
    focusScore: 0,
};
