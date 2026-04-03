import { prisma } from '@/lib/prisma';
import LibraryClient from './LibraryClient';

export default async function LibraryPage() {
  const lessons = await prisma.lesson.findMany({
    orderBy: { title: 'asc' },
  });

  return <LibraryClient lessons={lessons} />;
}
