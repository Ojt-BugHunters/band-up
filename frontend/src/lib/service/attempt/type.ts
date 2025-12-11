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

export interface WritingSubmission {
    attemptSectionId: string;
    questionId: string;
    content: string;
    taskTitle: string;
}

export interface SubmitResponse {
    id: string;
    attemptSectionId: string;
    questionId: string;
    answerContent: string;
    correct: boolean;
}

export interface QuotedExample {
    quote: string;
    issue: string;
    suggestion: string;
}

export interface CriteriaDetail {
    band: number;
    feedback: string;
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
}
export interface FeedbackContent {
    overall: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    task_achievement: CriteriaDetail;
    coherence: CriteriaDetail;
    lexical: CriteriaDetail;
    grammar: CriteriaDetail;
    quoted_examples: QuotedExample[];
}
export interface WritingEvaluationResult {
    feedback: FeedbackContent;
    overall_band: number;
    task_achievement_band: number;
    coherence_band: number;
    lexical_band: number;
    grammar_band: number;
    word_count: number;
    evaluated_at: number;
}
export interface EvaluateWritingPayload {
    section_id: string;
    user_id: string;
    essay_content: string;
    task_type: string;
    prompt: string;
    word_count: number;
}

export interface WritingQuestionResponse {
    id: string;
    content: {
        type: string;
        taskNumber: number;
        instruction: string;
        minWords: number;
        question: string;
    };
}
export interface WritingAnswerResponse {
    id: string;
    questionId: string;
    answerContent: string;
}
export interface WritingAnswerResponse {
    id: string;
    questionId: string;
    answerContent: string;
}
export interface WritingQuestionContent {
    taskNumber: number;
    instruction: string;
    minWords: number;
    question: string;
    type: string;
}

export interface WritingQuestionResponse {
    id: string;
    content: WritingQuestionContent;
}

export interface EvaluatePayload {
    section_id: string;
    user_id: string;
    essay_content: string;
    task_type: 'TASK_1' | 'TASK_2';
    prompt: string;
    word_count: number;
}
export interface ProcessedFeedback {
    overall_band: number;
    task_achievement_band: number;
    coherence_band: number;
    lexical_band: number;
    grammar_band: number;
    word_count: number;
    evaluated_at: number;
    feedback: {
        overall: string;
        strengths: string[];
        weaknesses: string[];
        recommendations: string[];
        task_achievement: CriteriaDetail;
        coherence: CriteriaDetail;
        lexical: CriteriaDetail;
        grammar: CriteriaDetail;
        quoted_examples: QuotedExample[];
    };
}

export interface CriteriaDetail {
    band: number;
    feedback: string;
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
}

export interface QuotedExample {
    quote: string;
    issue: string;
    suggestion: string;
}

export interface EvaluationPayload {
    section_id: string;
    user_id: string;
    essay_content: string;
    task_type: string;
    prompt: string;
    word_count: number;
}

export interface GetSpeakingUrlPayload {
    attemptSectionId: string;
    audioName: string;
}

export type FeedbackDetail = {
    band: number;
    feedback: string;
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
};

export type SpeakingFeedback = {
    overall: string;
    fluency: FeedbackDetail;
    lexical: FeedbackDetail;
    grammar: FeedbackDetail;
    pronunciation: FeedbackDetail;
};

export type TokenUsage = {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
};

export type SpeakingEvaluationResponse = {
    session_id: string;
    transcript: string;
    duration: number;
    word_count: number;
    overall_band: number;
    fluency_band: number;
    lexical_band: number;
    grammar_band: number;
    pronunciation_band: number;
    feedback: SpeakingFeedback;
    confidence_score: number;
    model_used: string;
    model_version: string;
    fallback_occurred: boolean;
    estimated_cost: number;
    token_usage: TokenUsage;
    latency_ms: number;
    evaluated_at: number;
};

export type GradingPayload = {
    answerId: string;
    session_id: string;
    user_id: string;
    audio_url: string;
    task_type: string;
    prompt: string;
    duration_seconds: number;
};
