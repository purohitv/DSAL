import { prisma } from '@/lib/prisma';
import LibraryClient from './LibraryClient';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export default async function LibraryPage() {
  const lessons = await prisma.lesson.findMany({
    orderBy: { title: 'asc' },
  });

  const snippets = await prisma.snippet.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          name: true,
          image: true,
        }
      }
    }
  });

  return (
    <Suspense fallback={<div className="min-h-screen bg-background-dark flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
      <LibraryClient lessons={lessons} snippets={snippets} />
    </Suspense>
  );
}
