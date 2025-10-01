import { SpeakingSection } from './../src/lib/api/dto/question';
import type { Flashcard } from '@/lib/api/dto/flashcards';
import { Comment } from '@/lib/api/dto/comment';
import { Test, TestHistory, TestOverview } from '@/lib/api/dto/test';
import { ListeningSection, Passage, WritingTask } from '@/lib/api/dto/question';
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
        example:
            'AI is revolutionizing industries such as healthcare and finance.',
    },
    {
        id: '1-2',
        flashcard_id: '1',
        front: 'Cybersecurity',
        back: 'An ninh mạng – bảo vệ hệ thống khỏi các mối đe dọa số.',
        example:
            'Cybersecurity has become a critical issue for modern businesses.',
    },
    {
        id: '1-3',
        flashcard_id: '1',
        front: 'Cloud Computing',
        back: 'Điện toán đám mây – lưu trữ và xử lý dữ liệu qua internet.',
        example:
            'Many companies use cloud computing to reduce infrastructure costs.',
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
        example:
            'Blockchain is the underlying technology behind cryptocurrencies.',
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

export const mockPassages: Passage[] = [
    {
        id: 'section-1',
        title: 'The History of Urban Planning',
        content: `Urban planning has evolved significantly over the centuries, transforming from simple village layouts to complex metropolitan designs. The earliest forms of urban planning can be traced back to ancient civilizations such as the Indus Valley, where cities like Harappa and Mohenjo-daro demonstrated sophisticated drainage systems and grid-like street patterns.

During the Industrial Revolution, rapid urbanization created numerous challenges. Cities became overcrowded, leading to poor living conditions and health problems. This period marked the beginning of modern urban planning as a professional discipline. Visionaries like Baron Haussmann in Paris and Daniel Burnham in Chicago pioneered comprehensive city planning approaches.

The 20th century brought new theories and methodologies to urban planning. The Garden City movement, initiated by Ebenezer Howard, proposed self-contained communities surrounded by greenbelts. This concept influenced suburban development worldwide and established the importance of balancing urban growth with environmental considerations.

Contemporary urban planning faces unique challenges including climate change, technological advancement, and demographic shifts. Smart city initiatives now integrate digital technologies to improve infrastructure efficiency and quality of life. Sustainable development principles guide modern planners in creating environmentally responsible urban environments.

The future of urban planning lies in adaptive strategies that can respond to changing social, economic, and environmental conditions. Planners must consider factors such as population growth, resource scarcity, and the need for resilient infrastructure that can withstand natural disasters and other disruptions.`,
        questions: [
            {
                id: 1,
                type: 'multiple-choice',
                question:
                    'According to the passage, the earliest forms of urban planning can be traced back to:',
                options: [
                    'Ancient Greece',
                    'The Roman Empire',
                    'The Indus Valley',
                    'Medieval Europe',
                ],
                image: '/loginimg.jpg',
            },
            {
                id: 2,
                type: 'short-answer',
                question:
                    'Name two cities mentioned as examples of early urban planning.',
            },
            {
                id: 3,
                type: 'true-false',
                question:
                    'The Garden City movement was initiated during the Industrial Revolution.',
            },
            {
                id: 4,
                type: 'completion',
                question:
                    'Modern urban planning must consider _______ change, technological advancement, and demographic shifts.',
            },
            {
                id: 5,
                type: 'multiple-choice',
                question:
                    'What does the passage suggest about future urban planning?',
                options: [
                    'It should focus only on technology',
                    'It must be adaptive to changing conditions',
                    'It should ignore environmental factors',
                    'It requires no professional training',
                ],
            },
        ],
    },
    {
        id: 'section-2',
        title: 'Marine Biodiversity and Conservation',
        content: `The world's oceans harbor an extraordinary diversity of life forms, from microscopic plankton to massive whales. Marine biodiversity encompasses all living organisms in saltwater environments, including coastal areas, open oceans, and deep-sea habitats. This biological richness is essential for maintaining healthy ocean ecosystems and supporting human livelihoods.

Coral reefs represent one of the most biodiverse marine ecosystems on Earth. Often called the "rainforests of the sea," these structures support approximately 25% of all marine species despite covering less than 1% of the ocean floor. The Great Barrier Reef alone hosts over 1,500 species of fish and 400 types of coral.

However, marine biodiversity faces unprecedented threats from human activities. Overfishing has depleted fish populations worldwide, with some species experiencing population declines of over 90%. Pollution, particularly plastic waste and chemical runoff, contaminates marine habitats and affects food chains. Climate change causes ocean acidification and rising temperatures, leading to coral bleaching events.

Conservation efforts are crucial for protecting marine biodiversity. Marine protected areas (MPAs) serve as sanctuaries where marine life can recover and thrive. International agreements like the Convention on Biological Diversity establish frameworks for conservation action. Additionally, sustainable fishing practices and pollution reduction measures help preserve marine ecosystems.

Recent technological advances offer new opportunities for marine conservation. Satellite monitoring systems track illegal fishing activities, while underwater drones survey remote ocean areas. Genetic techniques help scientists understand species relationships and identify conservation priorities. These tools enable more effective protection strategies for marine biodiversity.`,
        questions: [
            {
                id: 6,
                type: 'completion',
                question:
                    'Coral reefs are often called the "_______ of the sea."',
            },
            {
                id: 7,
                type: 'multiple-choice',
                question:
                    'What percentage of marine species do coral reefs support?',
                options: ['10%', '15%', '25%', '50%'],
            },
            {
                id: 8,
                type: 'short-answer',
                question:
                    'List three threats to marine biodiversity mentioned in the passage.',
            },
            {
                id: 9,
                type: 'true-false',
                question:
                    'Marine protected areas serve as sanctuaries for marine life recovery.',
            },
            {
                id: 10,
                type: 'multiple-choice',
                question:
                    'Which technology is mentioned for tracking illegal fishing?',
                options: [
                    'Underwater drones',
                    'Genetic techniques',
                    'Satellite monitoring',
                    'Sonar systems',
                ],
            },
        ],
    },
    {
        id: 'section-3',
        title: 'Artificial Intelligence in Healthcare',
        content: `Artificial Intelligence (AI) is revolutionizing healthcare by enhancing diagnostic accuracy, streamlining treatment processes, and improving patient outcomes. Machine learning algorithms can analyze vast amounts of medical data to identify patterns that might escape human observation, leading to earlier disease detection and more personalized treatment approaches.

Medical imaging represents one of the most successful applications of AI in healthcare. Deep learning models can interpret X-rays, MRIs, and CT scans with remarkable precision, sometimes surpassing human radiologists in detecting certain conditions. For instance, AI systems have demonstrated superior performance in identifying diabetic retinopathy from retinal photographs and detecting skin cancer from dermatological images.

Drug discovery and development benefit significantly from AI technologies. Traditional pharmaceutical research can take decades and cost billions of dollars. AI accelerates this process by predicting molecular behavior, identifying potential drug compounds, and optimizing clinical trial designs. Companies like DeepMind have used AI to predict protein structures, advancing our understanding of biological processes.

Electronic health records (EHRs) generate enormous amounts of patient data that AI can analyze to improve care quality. Natural language processing techniques extract meaningful information from clinical notes, while predictive models identify patients at risk of complications. This enables healthcare providers to intervene proactively and prevent adverse outcomes.

Despite these advances, AI implementation in healthcare faces several challenges. Data privacy concerns, regulatory requirements, and the need for clinical validation slow adoption. Additionally, ensuring AI systems are unbiased and transparent remains crucial for maintaining trust between healthcare providers and patients. The future success of AI in healthcare depends on addressing these challenges while continuing to innovate.`,
        questions: [
            {
                id: 11,
                type: 'multiple-choice',
                question:
                    'According to the passage, AI in medical imaging can:',
                options: [
                    'Replace all radiologists',
                    'Sometimes surpass human radiologists',
                    'Only work with X-rays',
                    'Reduce imaging costs',
                ],
            },
            {
                id: 12,
                type: 'completion',
                question:
                    'Traditional pharmaceutical research can take _______ and cost billions of dollars.',
            },
            {
                id: 13,
                type: 'short-answer',
                question:
                    'Name two specific medical conditions mentioned where AI shows superior performance.',
            },
            {
                id: 14,
                type: 'true-false',
                question:
                    'Natural language processing can extract information from clinical notes.',
            },
            {
                id: 15,
                type: 'multiple-choice',
                question:
                    'What is mentioned as a challenge for AI implementation in healthcare?',
                options: [
                    'Lack of data',
                    'High costs only',
                    'Data privacy concerns',
                    'Limited technology',
                ],
            },
        ],
    },
];

export const mockListeningSections: ListeningSection[] = [
    {
        id: 'section-1',
        title: 'Section 1: Everyday Social Conversation',
        audioUrl: '/audio/example.mp3',
        duration: 300,
        questions: [
            {
                id: 1,
                type: 'completion',
                question: 'The caller wants to book a table for _____ people.',
                image: '/listening-image.jpg',
            },
            {
                id: 2,
                type: 'multiple-choice',
                question: 'What time does the restaurant close on Sundays?',
                options: ['8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'],
            },
            {
                id: 3,
                type: 'completion',
                question: 'The restaurant is located on _____ Street.',
            },
            {
                id: 4,
                type: 'completion',
                question: 'What is the phone number for reservations?',
            },
        ],
    },
    {
        id: 'section-2',
        title: 'Section 2: Monologue on General Interest',
        audioUrl: '/audio/example.mp3',
        duration: 360,
        questions: [
            {
                id: 5,
                type: 'multiple-choice',
                question: 'The main purpose of the talk is to:',
                options: [
                    'Introduce new museum exhibits',
                    'Explain museum opening hours',
                    'Describe the museum layout',
                    'Announce special events',
                ],
            },
            {
                id: 6,
                type: 'completion',
                question: 'The museum was built in _____.',
            },
            {
                id: 7,
                type: 'true-false',
                question: 'Photography is allowed in all areas of the museum.',
            },
            {
                id: 8,
                type: 'completion',
                question: 'Match the floor with its main attraction:',
                options: [
                    'Ground Floor - Gift Shop',
                    'First Floor - Ancient History',
                    'Second Floor - Modern Art',
                ],
            },
        ],
    },
    {
        id: 'section-3',
        title: 'Section 3: Academic Discussion',
        audioUrl: '/audio/example.mp3',
        duration: 420,
        questions: [
            {
                id: 9,
                type: 'multiple-choice',
                question: 'What is the main topic of the discussion?',
                options: [
                    'Climate change research',
                    'Renewable energy sources',
                    'Environmental policies',
                    'Sustainable development',
                ],
            },
            {
                id: 10,
                type: 'completion',
                question: 'The research project will last for _____ months.',
            },
            {
                id: 11,
                type: 'completion',
                question:
                    'Which country will they visit for their field study?',
            },
            {
                id: 12,
                type: 'true-false',
                question:
                    'The students need to submit their proposal by next Friday.',
            },
        ],
    },
    {
        id: 'section-4',
        title: 'Section 4: Academic Lecture',
        audioUrl: '/audio/example.mp3',
        duration: 480,
        questions: [
            {
                id: 13,
                type: 'completion',
                question:
                    'The lecture focuses on the impact of _____ on marine ecosystems.',
            },
            {
                id: 14,
                type: 'multiple-choice',
                question:
                    'According to the lecturer, what is the primary cause of coral bleaching?',
                options: [
                    'Ocean pollution',
                    'Rising water temperatures',
                    'Overfishing',
                    'Coastal development',
                ],
            },
            {
                id: 15,
                type: 'completion',
                question:
                    'What percentage of coral reefs have been affected globally?',
            },
            {
                id: 16,
                type: 'completion',
                question:
                    'The Great Barrier Reef has lost approximately _____% of its coral cover.',
            },
        ],
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

export const speakingTestParts: SpeakingSection[] = [
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
            // Section 1 (9/10 correct)
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
];
