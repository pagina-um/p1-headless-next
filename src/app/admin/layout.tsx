import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Panel - News Grid',
  description: 'Admin panel for managing the news grid layout',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}