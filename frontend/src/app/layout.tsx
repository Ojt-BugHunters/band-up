import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from './client-layout';
import { Header } from '@/components/header';

export const metadata: Metadata = {
    title: 'BandUp',
    description: 'BandUp Ielts Learning App',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ClientLayout>
            <Header />
            {children}
        </ClientLayout>
    );
}
