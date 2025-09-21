import { Test } from '@/lib/api/dto/test';

export const mockTests: Test[] = [
    {
        id: 1,
        title: 'IELTS Academic Reading Practice Test 1',
        created_at: '2024-01-15T10:30:00Z',
        skill: 'Reading',
        comments: 12,
        duration: 60,
    },
    {
        id: 2,
        title: 'IELTS General Writing Task 1 & 2',
        created_at: '2024-01-14T14:20:00Z',
        skill: 'Writing',
        comments: 5,
        duration: 60,
    },
    {
        id: 3,
        title: 'IELTS Listening Mock Test - Academic',
        created_at: '2024-01-13T09:15:00Z',
        skill: 'Listening',
        comments: 8,
        duration: 30,
    },
    {
        id: 4,
        title: 'IELTS Speaking Part 1, 2 & 3 Practice',
        created_at: '2024-01-12T16:45:00Z',
        skill: 'Speaking',
        comments: 15,
        duration: 15,
    },
    {
        id: 5,
        title: 'IELTS Academic Writing Task 1 - Graphs',
        created_at: '2024-01-11T11:00:00Z',
        skill: 'Writing',
        comments: 3,
        duration: 20,
    },
    {
        id: 6,
        title: 'IELTS Reading - True/False/Not Given Focus',
        created_at: '2024-01-10T13:30:00Z',
        skill: 'Reading',
        comments: 10,
        duration: 45,
    },
];
