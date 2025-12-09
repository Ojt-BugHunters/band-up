import type { Pagination } from '@/lib/service';

export const Gender = ['Male', 'Female', 'Other'] as const;

export type Gender = (typeof Gender)[number];

export interface SubscriptionInfo {
    id: string;
    subscriptionType: string;
    description: string | null;
    startDate: string | null;
    endDate: string | null;
    lifeTime: boolean;
    createdAt: string;
}

export interface User {
    id: string;
    role: string;
    email: string;
    phone: string | null;
    name: string | null;
    gender: Gender | null;
    address: string | null;
    birthday: string | null;
    isActive?: boolean;
    active?: boolean;
    subscription?: SubscriptionInfo | null;
    createdAt?: string;
}

export type AvatarPresign = {
    key: string;
    uploadUrl: string;
    cloudfrontUrl: string;
    expiresAt: string;
};

export interface AccountPage extends Pagination<User> {
    number: number;
    size: number;
    totalPages: number;
}

export type AccountPageQuery = {
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: 'ASC' | 'DESC';
};
