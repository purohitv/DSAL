import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/");
  }

  // Auto-promote the specific user to ADMIN for testing purposes
  let user = await prisma.user.findUnique({
    where: { email: session.user.email as string },
  });

  if (user && user.email === "purohitvikram206@gmail.com" && user.role !== "ADMIN") {
    user = await prisma.user.update({
      where: { email: user.email },
      data: { role: "ADMIN" },
    });
  }

  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard"); // Redirect non-admins to their dashboard
  }

  // Fetch platform stats
  const totalUsers = await prisma.user.count();
  const totalLectures = await prisma.lecture.count();
  const totalSnippets = await prisma.snippet.count();
  const totalCompletions = await prisma.userProgress.count({ where: { completed: true } });

  // Fetch all modules and lectures for management
  const modules = await prisma.module.findMany({
    include: {
      lectures: {
        orderBy: { order: 'asc' },
        include: {
          quiz: {
            orderBy: { order: 'asc' }
          }
        }
      }
    },
    orderBy: { order: 'asc' }
  });

  const stats = {
    totalUsers,
    totalLectures,
    totalSnippets,
    totalCompletions,
  };

  return <AdminClient user={user} stats={stats} initialModules={modules} />;
}
