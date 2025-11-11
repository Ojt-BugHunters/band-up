export type MediaResponse = {
    key: string;
    uploadUrl?: string;
    cloudFrontUrl: string;
    expiresAt: string;
};

export interface SaveFileVars {
    key: string;
}
