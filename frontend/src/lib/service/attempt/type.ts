export type CreateAttemptResponse = {
    id: string;
    userId: string;
    testId: string;
    startAt: string;
    submitAt: string | null;
    status: string;
    score: number | null;
    overallBand: number | null;
    attemptSections: string[];
};

export type CreateAttemptSectionResponse = {
    id: string;
    attemptId: string;
    sectionId: string;
    startAt: string;
    status: string;
};

export type ScoredAnswer = {
    id: string;
    attemptSectionId: string;
    questionId: string;
    answerContent: string;
    correctAnswer: string;
    createAt: string;
    correct: boolean;
};

export type BandScoreResponse = {
    testId: string;
    totalScore: number;
    bandScore: number;
    responses: ScoredAnswer[];
};

export type SubmitAnswerParams = {
    attemptId: string;
    answerArray: {
        questionNumber: number;
        answerContent: string;
    }[];
};

export type AttemptSection = {
    id: string;
    attemptId: string;
    sectionId: string;
    startAt: string;
    status: string;
};

export type Attempt = {
    id: string;
    userId: string;
    testId: string;
    startAt: string;
    submitAt: string | null;
    status: string;
    score: number | null;
    overallBand: number | null;
    attemptSections: AttemptSection[];
};

export type AttemptTest = {
    id: string;
    userId: string;
    title: string;
    skillName: string;
    numberOfPeople: number;
    durationSeconds: number;
    difficult: string;
    createAt: string;
};

export type AttemptHistoryItem = {
    attempt: Attempt;
    test: AttemptTest;
};

export type AttemptAnswer = {
    questionNumber: number;
    answerContent: string;
    correctAnswer: string;
    correct: boolean;
    answerId: string;
};

export type Section = {
    title: string;
    orderIndex: number;
    timeLimitSeconds: number;
    metadata: string;
    cloudfrontUrl: string | null;
    answers: AttemptAnswer[];
    sectionId: string;
};

export type AttemptSections = {
    attemptSectionId: string;
    sections: Section[];
};

export type AttemptDetail = {
    attemptId: string;
    testId: string;
    testTitle: string;
    testSkillName: string;
    attemptSections: AttemptSections[];
};
