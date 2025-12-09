import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchWrapper, throwIfError, type ApiError } from '@/lib/service';
import type {
    CreatePaymentLinkPayload,
    PayOSPaymentLinkResponse,
} from './type';

export const useCreatePaymentLink = () => {
    return useMutation({
        mutationFn: async (payload: CreatePaymentLinkPayload) => {
            const params = new URLSearchParams({
                subscriptionType: payload.subscriptionType,
                isLifeTime: String(payload.isLifeTime),
            });

            const response = await fetchWrapper(`/payment/url?${params}`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                },
            });

            if (response.status === 401) {
                throw new Error('Please log in to continue with the payment.');
            }

            await throwIfError(response);
            return (await response.json()) as PayOSPaymentLinkResponse;
        },
        onError: (error) => {
            const message =
                (error as ApiError)?.message ??
                'Unable to start the payment process';
            toast.error(message);
        },
    });
};
