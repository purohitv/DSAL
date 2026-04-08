import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import IDEClient from './IDEClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ClassicIDEPage({ params }: PageProps) {
  const { slug } = await params;

  const lesson = await prisma.lesson.findUnique({
    where: { slug },
    include: {
      steps: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!lesson) {
    notFound();
  }

  return <IDEClient lesson={lesson} />;
}
