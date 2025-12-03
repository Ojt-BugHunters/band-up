export const Gender = ['Male', 'Female'];

export type Gender = (typeof Gender)[number];
export interface User {
    id: string;
    role: string;
    email: string;
    phone: string;
    name: string;
    gender: Gender;
    address: string;
    birthday: Date;
    isActive: boolean;
}
export type AvatarPresign = {
    key: string;
    uploadUrl: string;
    cloudfrontUrl: string;
    expiresAt: string;
};
