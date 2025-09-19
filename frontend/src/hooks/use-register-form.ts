'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import z from 'zod';

const passwordSchema = z
  .string()
  .nonempty({ message: 'Password must not be empty' })
  .min(6, { message: 'Password must be at least 6 characters' })
  .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
  .regex(/[0-9]/, { message: 'Password must contain at least one number' })
  .regex(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character' });

export const schema = z
  .object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: passwordSchema,
    confirmPassword: z
      .string()
      .nonempty({ message: 'Password must not be empty' })
      .min(6, { message: 'Password must be at least 6 characters' }),    
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export const useRegisterForm = () => {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof schema>> = (data) => {
    console.log('Submitting register form', data);
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
  };
};