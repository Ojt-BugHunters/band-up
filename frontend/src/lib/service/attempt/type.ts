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
