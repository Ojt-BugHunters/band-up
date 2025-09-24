import type { Flashcard } from '@/lib/api/dto/flashcards';
import { Comment } from '@/lib/api/dto/comment';
import { Test, TestOverview } from '@/lib/api/dto/test';
import { Question } from '@/components/question-panel';

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

export const mockPassages: {
    id: string;
    title: string;
    content: string;
    questions: Question[];
}[] = [
    {
        id: 'passage1',
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
                answer: '',
            },
            {
                id: 2,
                type: 'short-answer',
                question:
                    'Name two cities mentioned as examples of early urban planning.',
                answer: '',
            },
            {
                id: 3,
                type: 'true-false',
                question:
                    'The Garden City movement was initiated during the Industrial Revolution.',
                answer: '',
            },
            {
                id: 4,
                type: 'completion',
                question:
                    'Modern urban planning must consider _______ change, technological advancement, and demographic shifts.',
                answer: '',
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
                answer: '',
            },
        ],
    },
    {
        id: 'passage2',
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
                answer: '',
            },
            {
                id: 7,
                type: 'multiple-choice',
                question:
                    'What percentage of marine species do coral reefs support?',
                options: ['10%', '15%', '25%', '50%'],
                answer: '',
            },
            {
                id: 8,
                type: 'short-answer',
                question:
                    'List three threats to marine biodiversity mentioned in the passage.',
                answer: '',
            },
            {
                id: 9,
                type: 'true-false',
                question:
                    'Marine protected areas serve as sanctuaries for marine life recovery.',
                answer: '',
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
                answer: '',
            },
        ],
    },
    {
        id: 'passage3',
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
                answer: '',
            },
            {
                id: 12,
                type: 'completion',
                question:
                    'Traditional pharmaceutical research can take _______ and cost billions of dollars.',
                answer: '',
            },
            {
                id: 13,
                type: 'short-answer',
                question:
                    'Name two specific medical conditions mentioned where AI shows superior performance.',
                answer: '',
            },
            {
                id: 14,
                type: 'true-false',
                question:
                    'Natural language processing can extract information from clinical notes.',
                answer: '',
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
                answer: '',
            },
        ],
    },
];
