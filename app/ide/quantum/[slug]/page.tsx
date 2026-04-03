import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import IDEClient from '../../classic/[slug]/IDEClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function QuantumIDEPage({ params }: PageProps) {
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
