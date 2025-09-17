'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import z from 'zod';

export const schema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().nonempty({
    message: 'Password must not be empty',
  }),
});

export const useLoginForm = () => {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof schema>> = (data) => {
    console.log('Submitting login form', data);
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
  };
};
