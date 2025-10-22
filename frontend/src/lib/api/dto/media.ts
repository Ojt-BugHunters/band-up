export type MediaResponse = {
    key: string;
    uploadUrl?: string;
    cloudFrontUrl: string;
    expiresAt: string;
};

export interface MediaRequest {
    entityType?: string;
    entityId?: string;
    fileName: string;
    contentType: string;
}
