export type SubscriptionType = 'PREMIUM' | 'BASIC' | 'PRO';

export interface CreatePaymentLinkPayload {
    subscriptionType: SubscriptionType;
    isLifeTime: boolean;
}

export interface PayOSPaymentLinkResponse {
    checkoutUrl?: string;
    orderCode?: number;
    [key: string]: unknown;
}
