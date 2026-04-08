import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import SnippetClient from './SnippetClient';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

export default async function SnippetPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const currentUser = session?.user as any;

  const snippet = await prisma.snippet.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        }
      }
    }
  });

  if (!snippet) {
    notFound();
  }

  return <SnippetClient snippet={snippet} currentUser={currentUser} />;
}
