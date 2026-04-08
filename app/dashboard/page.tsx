import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/");
  }

  const sessionUser = session.user as any;

  const user = await prisma.user.findUnique({
    where: { email: sessionUser.email }
  });

  if (!user) {
    redirect("/");
  }

  // Fetch recent snippets
  const snippets = await prisma.snippet.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Fetch progress
  const completedCount = await prisma.userProgress.count({
    where: { userId: user.id, completed: true },
  });

  const totalLectures = await prisma.lecture.count();

  // Fetch modules with progress for detailed view
  const modules = await prisma.module.findMany({
    include: {
      lectures: {
        include: {
          progress: {
            where: { userId: user.id, completed: true }
          }
        },
        orderBy: { order: 'asc' }
      }
    },
    orderBy: { order: 'asc' }
  });

  const stats = {
    totalSnippets: await prisma.snippet.count({ where: { userId: user.id } }),
    completedLectures: completedCount,
    totalLectures: totalLectures,
  };

  return <DashboardClient user={user} snippets={snippets} stats={stats} modules={modules} />;
}
