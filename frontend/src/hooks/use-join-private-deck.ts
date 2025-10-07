import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import z from 'zod';

export const schema = z.object({
    password: z.string().min(1, 'Password is required'),
});

export const useJoinPrivateDeck = () => {
    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            password: '',
        },
    });

    return form;
};
