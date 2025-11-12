export interface Dictation {
    userId: string;
    id: string;
    title: string;
    skillName: string;
    numberOfPeople: number | null;
    durationSeconds: number;
    difficult: string;
    createAt: string;
}

export interface DictationSection {
    id: string;
    testId: string;
    title: string;
    orderIndex: number;
    timeLimitSeconds: number;
    metatdata: string;
}

export interface DictationQuestion {
    id: string;
    sectionId: string;
    type: string;
    content: {
        additionalProp1: string;
        additionalProp2: string;
        additionalProp3: string;
    };
    difficult: string;
    isActive: boolean;
    uploadUrl: string;
    key: string;
    script: string;
    createdAt: Date;
}

export type DictationAudio = {
    id: string;
    title: string;
    duration: string;
    url: string;
};

export type Section = {
    id: string;
    title: string;
    audioFiles: DictationAudio[];
};
