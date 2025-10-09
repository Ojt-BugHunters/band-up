import { buildParams, fetchWrapper, throwIfError } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export const useForgetPassword = () => {
    const router = useRouter();
    const mutation = useMutation({
        mutationFn: async (email: string) => {
            const encodeEmail = new URLSearchParams({ email }).toString();
            const response = await fetchWrapper(
                `/auth/account/forget?${encodeEmail}`,
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                    },
                },
            );
            await throwIfError(response);
        },
        onError: (error) => {
            toast.error(error.message);
        },
        onSuccess: (email) => {
            toast.success('We have sent a verification code to your email.');
            const qs = buildParams({ email }).toString();
            router.push(`/auth/forget-password?${qs}`);
        },
    });
    return mutation;
};
